package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.WorkOrderMaterial;
import ru.servisklimat.domain.model.WorkOrderServiceLine;
import ru.servisklimat.domain.repository.WorkOrderRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Calculates cost price and margin for a WorkOrder.
 *
 * Full cost formula (CLAUDE.md §3 «Себестоимость наряда»):
 *   costPrice = materials_cost + refrigerant_cost + zip_cost + labor_cost + fuel_cost + overhead
 *
 * Sprint 07 implements:
 *   - materials_cost  = SUM(qty × unitPrice) from workOrder.getMaterials()
 *   - revenue         = SUM(price × quantity) from workOrder.getServices()
 *   - labor_cost      = stub → BigDecimal.ZERO  (Sprint 08)
 *   - fuel_cost       = stub → BigDecimal.ZERO  (Sprint 08)
 *   - refrigerant_cost= stub → BigDecimal.ZERO  (Sprint 05 extension)
 *   - zip_cost        = stub → BigDecimal.ZERO  (Sprint 06 extension)
 *   - overhead        = stub → BigDecimal.ZERO  (Sprint 07/08 extension)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CostCalculationService {

    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private final WorkOrderRepository workOrderRepository;

    // ─── Public calculation methods ──────────────────────────────────────────

    /**
     * Calculates the total revenue for a work order by summing all service lines.
     * revenue = SUM(serviceLine.price × serviceLine.quantity)
     */
    public BigDecimal calculateServiceRevenue(WorkOrder order) {
        if (order.getServices() == null || order.getServices().isEmpty()) {
            return BigDecimal.ZERO;
        }
        return order.getServices().stream()
                .filter(line -> line.getPrice() != null)
                .map(line -> line.getPrice()
                        .multiply(new BigDecimal(line.getQuantity()))
                        .setScale(SCALE, ROUNDING))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Calculates the materials cost for a work order.
     * materials_cost = SUM(material.qty × material.unitPrice)
     */
    public BigDecimal calculateMaterialsCost(WorkOrder order) {
        if (order.getMaterials() == null || order.getMaterials().isEmpty()) {
            return BigDecimal.ZERO;
        }
        return order.getMaterials().stream()
                .filter(m -> m.getQty() != null && m.getUnitPrice() != null)
                .map(m -> m.getQty()
                        .multiply(m.getUnitPrice())
                        .setScale(SCALE, ROUNDING))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    /**
     * Stub: labor cost — to be implemented in Sprint 08 (HR module).
     */
    public BigDecimal calculateLaborCost(WorkOrder order) {
        return BigDecimal.ZERO;
    }

    /**
     * Stub: fuel cost — to be implemented in Sprint 08 (GPS track analysis).
     */
    public BigDecimal calculateFuelCost(WorkOrder order) {
        return BigDecimal.ZERO;
    }

    /**
     * Stub: refrigerant cost — to be implemented via RefrigerantLog in Sprint 05 extension.
     */
    public BigDecimal calculateRefrigerantCost(WorkOrder order) {
        return BigDecimal.ZERO;
    }

    /**
     * Stub: ZIP (spare parts) cost from PurchaseRequestItems — Sprint 06 extension.
     */
    public BigDecimal calculateZipCost(WorkOrder order) {
        return BigDecimal.ZERO;
    }

    /**
     * Stub: overhead — defaults.overhead-percent from system settings, Sprint 07/08 extension.
     */
    public BigDecimal calculateOverhead(BigDecimal revenue) {
        return BigDecimal.ZERO;
    }

    /**
     * Calculates margin: revenue - costPrice.
     */
    public BigDecimal calculateMargin(BigDecimal revenue, BigDecimal costPrice) {
        return revenue.subtract(costPrice).setScale(SCALE, ROUNDING);
    }

    /**
     * Calculates margin percent: margin / revenue * 100.
     * Returns ZERO if revenue is zero to avoid division by zero.
     */
    public BigDecimal calculateMarginPercent(BigDecimal revenue, BigDecimal costPrice) {
        if (revenue.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal margin = calculateMargin(revenue, costPrice);
        return margin.divide(revenue, SCALE + 4, ROUNDING)
                .multiply(new BigDecimal("100"))
                .setScale(SCALE, ROUNDING);
    }

    /**
     * Calculates and persists all financial fields on the given WorkOrder:
     *   - revenue, costPrice, margin, marginPercent
     *
     * @param order the work order to update
     * @return the saved work order with updated financial fields
     */
    @Transactional
    public WorkOrder calculateAndUpdate(WorkOrder order) {
        BigDecimal revenue = calculateServiceRevenue(order);
        BigDecimal materialsCost = calculateMaterialsCost(order);
        BigDecimal laborCost = calculateLaborCost(order);
        BigDecimal fuelCost = calculateFuelCost(order);
        BigDecimal refrigerantCost = calculateRefrigerantCost(order);
        BigDecimal zipCost = calculateZipCost(order);
        BigDecimal overhead = calculateOverhead(revenue);

        BigDecimal costPrice = materialsCost
                .add(refrigerantCost)
                .add(zipCost)
                .add(laborCost)
                .add(fuelCost)
                .add(overhead)
                .setScale(SCALE, ROUNDING);

        BigDecimal margin = calculateMargin(revenue, costPrice);
        BigDecimal marginPercent = calculateMarginPercent(revenue, costPrice);

        order.setRevenue(revenue);
        order.setCostPrice(costPrice);
        order.setMargin(margin);
        order.setMarginPercent(marginPercent);

        log.debug("Calculated financials for WorkOrder [{}]: revenue={}, cost={}, margin={}, margin%={}",
                order.getNumber(), revenue, costPrice, margin, marginPercent);

        return workOrderRepository.save(order);
    }
}
