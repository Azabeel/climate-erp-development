package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class MarkupCalculationServiceTest {

    private MarkupCalculationService service;

    @BeforeEach
    void setUp() {
        service = new MarkupCalculationService();
    }

    /**
     * Test 1 — Mode 1: markupPercent given.
     * purchasePrice=1500, markupPercent=30 → salePrice=1950, markupAmount=450
     */
    @Test
    @DisplayName("Mode 1: markup percent 30% on 1500 → salePrice=1950, amount=450")
    void calculateByPercent() {
        MarkupCalculationService.MarkupResult result =
                service.calculate(new BigDecimal("1500"), new BigDecimal("30"), null);

        assertThat(result.salePrice()).isEqualByComparingTo(new BigDecimal("1950.00"));
        assertThat(result.markupAmount()).isEqualByComparingTo(new BigDecimal("450.00"));
        assertThat(result.markupPercent()).isEqualByComparingTo(new BigDecimal("30.00"));
    }

    /**
     * Test 2 — Mode 2: markupAmount given.
     * purchasePrice=1500, markupAmount=450 → salePrice=1950, markupPercent=30%
     */
    @Test
    @DisplayName("Mode 2: markup amount 450 on 1500 → salePrice=1950, percent=30%")
    void calculateByAmount() {
        MarkupCalculationService.MarkupResult result =
                service.calculate(new BigDecimal("1500"), null, new BigDecimal("450"));

        assertThat(result.salePrice()).isEqualByComparingTo(new BigDecimal("1950.00"));
        assertThat(result.markupPercent()).isEqualByComparingTo(new BigDecimal("30.00"));
        assertThat(result.markupAmount()).isEqualByComparingTo(new BigDecimal("450.00"));
    }

    /**
     * Test 3 — Mode 3: neither given, use default 30%.
     * purchasePrice=1500 → salePrice=1950
     */
    @Test
    @DisplayName("Mode 3: no markup provided, default 30% → salePrice=1950")
    void calculateWithDefault() {
        MarkupCalculationService.MarkupResult result =
                service.calculate(new BigDecimal("1500"), null, null);

        assertThat(result.salePrice()).isEqualByComparingTo(new BigDecimal("1950.00"));
        assertThat(result.markupPercent()).isEqualByComparingTo(new BigDecimal("30.00"));
        assertThat(result.markupAmount()).isEqualByComparingTo(new BigDecimal("450.00"));
    }

    /**
     * Test 4 — Edge case: purchasePrice=0 should not throw ArithmeticException.
     * Mode 2 with amount — percent becomes 0 when price is 0.
     */
    @Test
    @DisplayName("Edge case: purchasePrice=0 with markupAmount — no division by zero")
    void calculateByAmount_zeroPurchasePrice() {
        MarkupCalculationService.MarkupResult result =
                service.calculate(BigDecimal.ZERO, null, new BigDecimal("100"));

        assertThat(result.salePrice()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(result.markupPercent()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.markupAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
    }

    /**
     * Test 5 — calculateWithDefault explicit default percent.
     */
    @Test
    @DisplayName("calculateWithDefault: explicit default 50% → salePrice=3000")
    void calculateWithExplicitDefault() {
        MarkupCalculationService.MarkupResult result =
                service.calculateWithDefault(new BigDecimal("2000"), null, null, new BigDecimal("50"));

        assertThat(result.salePrice()).isEqualByComparingTo(new BigDecimal("3000.00"));
        assertThat(result.markupPercent()).isEqualByComparingTo(new BigDecimal("50.00"));
        assertThat(result.markupAmount()).isEqualByComparingTo(new BigDecimal("1000.00"));
    }

    /**
     * Test 6 — markupPercent takes priority over markupAmount when both given.
     */
    @Test
    @DisplayName("When both markupPercent and markupAmount given, markupPercent wins")
    void markupPercentPriorityOverAmount() {
        // percent=20% on 1000 → salePrice=1200
        MarkupCalculationService.MarkupResult result =
                service.calculate(new BigDecimal("1000"), new BigDecimal("20"), new BigDecimal("500"));

        assertThat(result.salePrice()).isEqualByComparingTo(new BigDecimal("1200.00"));
        assertThat(result.markupPercent()).isEqualByComparingTo(new BigDecimal("20.00"));
    }
}
