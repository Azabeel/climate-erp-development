package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import ru.servisklimat.domain.model.*;
import ru.servisklimat.domain.repository.WorkOrderRepository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Pure unit tests for CostCalculationService.
 *
 * Key test scenario from CLAUDE.md §3:
 *   revenue=5000, materials=800, zip=600, labor=1200, fuel=150, overhead=500(10%)
 *   margin = 5000 - (800+600+1200+150+500) = 1750, margin% = 35%
 *
 * Sprint 07 implements materials_cost and revenue only; other costs are stubs returning ZERO.
 * Test 4 therefore uses the pure calculateMargin/calculateMarginPercent methods directly,
 * since labor/fuel/overhead stubs return ZERO in this sprint.
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CostCalculationServiceTest {

    @Mock
    private WorkOrderRepository workOrderRepository;

    private CostCalculationService service;

    @BeforeEach
    void setUp() {
        service = new CostCalculationService(workOrderRepository);
        // stub: save returns the passed order (identity) — used by tests that call calculateAndUpdate
        when(workOrderRepository.save(any(WorkOrder.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    // ─── Helper builders ─────────────────────────────────────────────────────

    private WorkOrderServiceLine serviceLine(BigDecimal price, int quantity) {
        // Build a minimal service line — we don't need the Service entity for cost calc
        return WorkOrderServiceLine.builder()
                .price(price)
                .quantity(quantity)
                .calculatedDurationMinutes(60)
                .build();
    }

    private WorkOrderMaterial material(BigDecimal qty, BigDecimal unitPrice) {
        return WorkOrderMaterial.builder()
                .qty(qty)
                .unitPrice(unitPrice)
                .build();
    }

    private WorkOrder emptyOrder() {
        return WorkOrder.builder()
                .number("WO-2026-000001")
                .build();
    }

    // ─── Tests ───────────────────────────────────────────────────────────────

    /**
     * Test 1: empty work order — all values should be ZERO.
     */
    @Test
    @DisplayName("Empty work order → revenue=0, cost=0, margin=0, marginPercent=0")
    void emptyWorkOrder_allZero() {
        WorkOrder order = emptyOrder();

        WorkOrder result = service.calculateAndUpdate(order);

        assertThat(result.getRevenue()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getCostPrice()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getMargin()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getMarginPercent()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    /**
     * Test 2: 2 service lines (price=1000 qty=1, price=500 qty=2) → revenue=2000
     * No materials → costPrice=0, margin=2000, marginPercent=100%
     */
    @Test
    @DisplayName("Two service lines, no materials → revenue=2000, margin=2000 (100%)")
    void twoServiceLines_noMaterials() {
        WorkOrder order = emptyOrder();
        order.setServices(new ArrayList<>(List.of(
                serviceLine(new BigDecimal("1000"), 1),
                serviceLine(new BigDecimal("500"), 2)
        )));

        WorkOrder result = service.calculateAndUpdate(order);

        assertThat(result.getRevenue()).isEqualByComparingTo(new BigDecimal("2000.00"));
        assertThat(result.getCostPrice()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getMargin()).isEqualByComparingTo(new BigDecimal("2000.00"));
        assertThat(result.getMarginPercent()).isEqualByComparingTo(new BigDecimal("100.00"));
    }

    /**
     * Test 3: services + materials — Sprint 07 scope (labor/fuel/overhead stubs = 0).
     * Revenue from services: 5000
     * Materials cost: SUM(5 × 100 + 3 × 100) = 500 + 300 = 800
     * costPrice = 800 (+ 0 stubs)
     * margin = 5000 - 800 = 4200
     * marginPercent = 4200 / 5000 * 100 = 84.00%
     */
    @Test
    @DisplayName("Services + materials → revenue=5000, materialsCost=800, margin=4200 (84%)")
    void servicesAndMaterials() {
        WorkOrder order = emptyOrder();
        order.setServices(new ArrayList<>(List.of(
                serviceLine(new BigDecimal("2500"), 2)   // 2500 × 2 = 5000
        )));
        order.setMaterials(new ArrayList<>(List.of(
                material(new BigDecimal("5"), new BigDecimal("100")),  // 500
                material(new BigDecimal("3"), new BigDecimal("100"))   // 300
        )));

        WorkOrder result = service.calculateAndUpdate(order);

        assertThat(result.getRevenue()).isEqualByComparingTo(new BigDecimal("5000.00"));
        assertThat(result.getCostPrice()).isEqualByComparingTo(new BigDecimal("800.00"));
        assertThat(result.getMargin()).isEqualByComparingTo(new BigDecimal("4200.00"));
        assertThat(result.getMarginPercent()).isEqualByComparingTo(new BigDecimal("84.00"));
    }

    /**
     * Test 4: Validates CLAUDE.md margin example.
     * margin = revenue - costPrice = 5000 - 3250 = 1750, marginPercent = 35%
     *
     * We set costPrice directly and revenue via service lines, since labor/fuel/overhead
     * stubs return ZERO in Sprint 07 (to be completed in Sprint 08).
     * Here we verify the core margin/marginPercent arithmetic.
     */
    @Test
    @DisplayName("CLAUDE.md example: revenue=5000, costPrice=3250 → margin=1750, marginPercent=35%")
    void claudeMdMarginExample() {
        BigDecimal revenue = new BigDecimal("5000.00");
        BigDecimal costPrice = new BigDecimal("3250.00");

        BigDecimal margin = service.calculateMargin(revenue, costPrice);
        BigDecimal marginPercent = service.calculateMarginPercent(revenue, costPrice);

        assertThat(margin).isEqualByComparingTo(new BigDecimal("1750.00"));
        assertThat(marginPercent).isEqualByComparingTo(new BigDecimal("35.00"));
    }

    /**
     * Test 5: Zero revenue → marginPercent=0 (no ArithmeticException).
     */
    @Test
    @DisplayName("Zero revenue → marginPercent=0, no division by zero")
    void zeroRevenue_noArithmeticException() {
        BigDecimal revenue = BigDecimal.ZERO;
        BigDecimal costPrice = new BigDecimal("500.00");

        BigDecimal marginPercent = service.calculateMarginPercent(revenue, costPrice);

        assertThat(marginPercent).isEqualByComparingTo(BigDecimal.ZERO);
    }

    /**
     * Additional: calculateMaterialsCost skips materials with null price/qty.
     */
    @Test
    @DisplayName("Materials with null price are skipped in cost calculation")
    void materialsWithNullPrice_skipped() {
        WorkOrder order = emptyOrder();
        order.setMaterials(new ArrayList<>(List.of(
                material(new BigDecimal("2"), new BigDecimal("500")), // 1000
                WorkOrderMaterial.builder().qty(new BigDecimal("3")).unitPrice(null).build() // skipped
        )));

        BigDecimal cost = service.calculateMaterialsCost(order);

        assertThat(cost).isEqualByComparingTo(new BigDecimal("1000.00"));
    }
}
