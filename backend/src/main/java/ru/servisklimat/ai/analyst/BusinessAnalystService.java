package ru.servisklimat.ai.analyst;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;
import ru.servisklimat.domain.repository.WorkOrderRepository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Stub business analyst service.
 * In production would use LangChain4j + SQL tool + chart generation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class BusinessAnalystService {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd.MM.yyyy");

    private static final List<WorkOrderStatus> ACTIVE_STATUSES = Arrays.asList(
            WorkOrderStatus.NEW,
            WorkOrderStatus.ASSIGNED,
            WorkOrderStatus.EN_ROUTE,
            WorkOrderStatus.ON_SITE,
            WorkOrderStatus.IN_PROGRESS,
            WorkOrderStatus.AWAITING_PARTS,
            WorkOrderStatus.READY_TO_RESUME
    );

    private final WorkOrderRepository workOrderRepository;

    /**
     * Generates a daily summary of work order statistics.
     *
     * @return formatted summary string
     */
    @Transactional(readOnly = true)
    public String generateDailySummary() {
        String today = DATE_FMT.format(LocalDate.now(MOSCOW));

        long total = workOrderRepository.count();
        long active = workOrderRepository.findByStatusIn(ACTIVE_STATUSES,
                org.springframework.data.domain.PageRequest.of(0, Integer.MAX_VALUE)).getTotalElements();
        long completed = workOrderRepository.countByStatus(WorkOrderStatus.COMPLETED);
        long slaViolated = workOrderRepository.countBySlaViolatedTrue();

        return String.format(
                "Сводка за %s: Всего нарядов: %d, Активных: %d, Завершено: %d, Нарушений SLA: %d",
                today, total, active, completed, slaViolated);
    }

    /**
     * Returns an efficiency score for an engineer in the given period.
     * Stub — real implementation would aggregate from EngineerDayLog and WorkOrders.
     *
     * @param engineerId engineer UUID
     * @param from       period start
     * @param to         period end
     * @return score out of 10
     */
    public double getEfficiencyScore(UUID engineerId, LocalDate from, LocalDate to) {
        log.debug("Efficiency score stub for engineer={}, from={}, to={}", engineerId, from, to);
        // Stub: returns fixed score — real impl would compute from orders, SLA compliance, ratings
        return 7.5;
    }
}
