package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.enums.RefrigerantOperation;
import ru.servisklimat.domain.repository.RefrigerantLogRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RefrigerantLeakCalculator {

    private static final BigDecimal LEAK_THRESHOLD_PERCENT = new BigDecimal("30");
    private static final int SCALE = 2;

    private final RefrigerantLogRepository refrigerantLogRepository;

    /**
     * Показатель утечки = (заправлено за период / fullChargeKg) * 100%
     * Учитываются операции CHARGE и TOP_UP (заправка хладагента).
     */
    public BigDecimal calculateLeakRate(UUID equipmentId, BigDecimal fullChargeKg,
                                        ZonedDateTime periodStart, ZonedDateTime periodEnd) {
        if (fullChargeKg == null || fullChargeKg.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("fullChargeKg must be positive");
        }

        List<RefrigerantOperation> chargeTypes = List.of(
                RefrigerantOperation.CHARGE,
                RefrigerantOperation.TOP_UP
        );

        BigDecimal chargedKg = refrigerantLogRepository.sumAmountByEquipmentAndTypesBetween(
                equipmentId, chargeTypes, periodStart, periodEnd);

        if (chargedKg == null) {
            chargedKg = BigDecimal.ZERO;
        }

        return chargedKg
                .divide(fullChargeKg, SCALE, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(SCALE, RoundingMode.HALF_UP);
    }

    /**
     * Превышает ли показатель утечки порог (30%).
     * Граничное значение (ровно 30%) НЕ считается превышением.
     */
    public boolean exceedsThreshold(BigDecimal leakRatePercent) {
        return leakRatePercent.compareTo(LEAK_THRESHOLD_PERCENT) > 0;
    }
}
