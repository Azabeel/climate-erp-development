package ru.servisklimat.domain.service;

import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.ClientHealthScore;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Calculates client health score 0–100.
 * Penalties: no recent orders (-20 if >6m, -40 if >12m), low rating (-10 if <4.0, -20 if <3.0),
 *            open complaints (-15 each, max -30).
 * Bonuses:   active contract (+10), many orders last 12m (+10 if >=5).
 */
@Component
public class ClientHealthCalculator {

    public int calculate(ClientHealthScore score) {
        int result = 100;

        // Penalty: no recent orders
        if (score.getLastOrderDate() != null) {
            long monthsSince = java.time.temporal.ChronoUnit.MONTHS
                    .between(score.getLastOrderDate(), LocalDate.now());
            if (monthsSince > 12) {
                result -= 40;
            } else if (monthsSince > 6) {
                result -= 20;
            }
        } else {
            result -= 40;
        }

        // Penalty: low rating
        if (score.getAvgRating() != null) {
            BigDecimal rating = score.getAvgRating();
            if (rating.compareTo(new BigDecimal("3.0")) < 0) {
                result -= 20;
            } else if (rating.compareTo(new BigDecimal("4.0")) < 0) {
                result -= 10;
            }
        }

        // Penalty: open complaints (max -30)
        int complaintPenalty = Math.min(score.getOpenComplaints() * 15, 30);
        result -= complaintPenalty;

        // Bonus: active contract
        if (score.isContractActive()) {
            result += 10;
        }

        // Bonus: frequent orders
        if (score.getOrdersLast12m() >= 5) {
            result += 10;
        }

        return Math.max(0, Math.min(100, result));
    }
}
