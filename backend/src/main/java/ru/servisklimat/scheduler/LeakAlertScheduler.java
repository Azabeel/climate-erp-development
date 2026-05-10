package ru.servisklimat.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.RefrigerantLog;
import ru.servisklimat.domain.model.enums.RefrigerantOperation;
import ru.servisklimat.domain.repository.RefrigerantLogRepository;
import ru.servisklimat.domain.service.RefrigerantLeakCalculator;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class LeakAlertScheduler {

    private final RefrigerantLogRepository refrigerantLogRepository;
    private final RefrigerantLeakCalculator leakCalculator;

    /**
     * Каждый день в 8:00 проверяет все активные единицы оборудования
     * на превышение показателя утечки хладагента за последние 12 месяцев.
     */
    @Scheduled(cron = "0 0 8 * * *")
    public void checkLeakRates() {
        log.info("Starting refrigerant leak rate check");

        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Europe/Moscow"));
        ZonedDateTime yearAgo = now.minusMonths(12);

        // Collect all equipment IDs that have refrigerant log entries
        List<RefrigerantLog> allLogs = refrigerantLogRepository.findAll();
        Map<UUID, List<RefrigerantLog>> byEquipment = allLogs.stream()
                .filter(l -> l.getEquipmentId() != null)
                .collect(Collectors.groupingBy(RefrigerantLog::getEquipmentId));

        for (UUID equipmentId : byEquipment.keySet()) {
            try {
                // Find the max initial weight among cylinders used for this equipment
                List<RefrigerantLog> equipLogs = byEquipment.get(equipmentId);
                if (equipLogs.isEmpty()) {
                    continue;
                }

                // Use sum of CHARGE+TOP_UP over the year as chargedKg
                // Use a default full charge of 2.5 kg for MVP; in production this
                // should come from the equipment entity's refrigerant_charge field
                BigDecimal fullChargeKg = new BigDecimal("2.5");

                BigDecimal leakRate = leakCalculator.calculateLeakRate(
                        equipmentId, fullChargeKg, yearAgo, now);

                if (leakCalculator.exceedsThreshold(leakRate)) {
                    log.warn("REFRIGERANT LEAK ALERT: Equipment {} has leak rate {}% (threshold 30%)",
                            equipmentId, leakRate);
                }
            } catch (Exception e) {
                log.error("Error checking leak rate for equipment {}: {}", equipmentId, e.getMessage());
            }
        }

        log.info("Refrigerant leak rate check completed for {} equipment units", byEquipment.size());
    }
}
