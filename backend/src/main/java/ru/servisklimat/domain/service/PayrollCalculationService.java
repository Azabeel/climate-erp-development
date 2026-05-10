package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.Engineer;
import ru.servisklimat.domain.model.EngineerDayLog;
import ru.servisklimat.domain.model.PayrollItem;
import ru.servisklimat.domain.repository.EngineerDayLogRepository;
import ru.servisklimat.domain.repository.EngineerRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

/**
 * Calculates payroll for engineers based on day logs.
 *
 * <p>Formula:
 * <ul>
 *   <li>pieceRateEarnings = totalRevenue * PIECE_RATE_PERCENT (default 15%)</li>
 *   <li>gsmCompensation = totalDistanceKm * GSM_RATE_PER_KM (default 12 RUB/km)</li>
 *   <li>totalGross = pieceRateEarnings + gsmCompensation + bonuses - deductions</li>
 * </ul>
 */
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class PayrollCalculationService {

    private static final BigDecimal PIECE_RATE_PERCENT = new BigDecimal("0.15");
    private static final BigDecimal DEFAULT_GSM_RATE_PER_KM = new BigDecimal("12.00");

    private final EngineerDayLogRepository dayLogRepository;
    private final EngineerRepository engineerRepository;

    /**
     * Calculates payroll for an engineer over a given period.
     * Returns an unsaved PayrollItem — the caller is responsible for persisting.
     *
     * @param engineerId  the engineer's UUID
     * @param periodStart start date (inclusive)
     * @param periodEnd   end date (inclusive)
     * @return PayrollItem with calculated earnings (not persisted)
     */
    public PayrollItem calculateForEngineer(UUID engineerId, LocalDate periodStart, LocalDate periodEnd) {
        Engineer engineer = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new IllegalArgumentException("Engineer not found: " + engineerId));

        List<EngineerDayLog> dayLogs = dayLogRepository.findByEngineerIdAndDateBetween(
                engineerId, periodStart, periodEnd);

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal totalDistanceKm = BigDecimal.ZERO;

        for (EngineerDayLog log : dayLogs) {
            if (log.getTotalRevenue() != null) {
                totalRevenue = totalRevenue.add(log.getTotalRevenue());
            }
            if (log.getTotalDistanceKm() != null) {
                totalDistanceKm = totalDistanceKm.add(log.getTotalDistanceKm());
            }
        }

        // Use engineer's fuel rate if configured, otherwise default
        BigDecimal gsmRate = (engineer.getFuelRatePerKm() != null
                && engineer.getFuelRatePerKm().compareTo(BigDecimal.ZERO) > 0)
                ? engineer.getFuelRatePerKm()
                : DEFAULT_GSM_RATE_PER_KM;

        BigDecimal pieceRateEarnings = totalRevenue
                .multiply(PIECE_RATE_PERCENT)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal gsmCompensation = totalDistanceKm
                .multiply(gsmRate)
                .setScale(2, RoundingMode.HALF_UP);

        BigDecimal totalGross = pieceRateEarnings
                .add(gsmCompensation)
                .setScale(2, RoundingMode.HALF_UP);

        return PayrollItem.builder()
                .engineer(engineer)
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .pieceRateEarnings(pieceRateEarnings)
                .gsmCompensation(gsmCompensation)
                .bonuses(BigDecimal.ZERO)
                .deductions(BigDecimal.ZERO)
                .totalGross(totalGross)
                .build();
    }
}
