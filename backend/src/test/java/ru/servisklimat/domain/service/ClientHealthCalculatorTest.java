package ru.servisklimat.domain.service;

import org.junit.jupiter.api.Test;
import ru.servisklimat.domain.model.ClientHealthScore;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class ClientHealthCalculatorTest {

    private final ClientHealthCalculator calculator = new ClientHealthCalculator();

    @Test
    void healthyClientScores100() {
        ClientHealthScore score = ClientHealthScore.builder()
                .lastOrderDate(LocalDate.now().minusDays(10))
                .ordersLast12m(6)
                .avgRating(new BigDecimal("4.8"))
                .openComplaints(0)
                .contractActive(true)
                .build();
        int result = calculator.calculate(score);
        // 100 + 10 (contract) + 10 (orders >=5) = 120, clamped to 100
        assertThat(result).isEqualTo(100);
    }

    @Test
    void noOrdersInYear() {
        ClientHealthScore score = ClientHealthScore.builder()
                .lastOrderDate(LocalDate.now().minusMonths(13))
                .ordersLast12m(0)
                .openComplaints(0)
                .contractActive(false)
                .build();
        // 100 - 40 (>12m) = 60
        assertThat(calculator.calculate(score)).isEqualTo(60);
    }

    @Test
    void noOrdersAtAll() {
        ClientHealthScore score = ClientHealthScore.builder()
                .lastOrderDate(null)
                .ordersLast12m(0)
                .openComplaints(0)
                .contractActive(false)
                .build();
        // 100 - 40 (no date) = 60
        assertThat(calculator.calculate(score)).isEqualTo(60);
    }

    @Test
    void lowRatingAndComplaints() {
        ClientHealthScore score = ClientHealthScore.builder()
                .lastOrderDate(LocalDate.now().minusDays(30))
                .avgRating(new BigDecimal("2.5"))
                .openComplaints(3)
                .contractActive(false)
                .build();
        // 100 - 20 (rating <3) - 30 (3*15, max) = 50
        assertThat(calculator.calculate(score)).isEqualTo(50);
    }

    @Test
    void scoreClampedToZero() {
        ClientHealthScore score = ClientHealthScore.builder()
                .lastOrderDate(null)
                .avgRating(new BigDecimal("2.0"))
                .openComplaints(10)
                .contractActive(false)
                .build();
        // 100 - 40 - 20 - 30 = 10, not negative
        assertThat(calculator.calculate(score)).isGreaterThanOrEqualTo(0);
    }
}
