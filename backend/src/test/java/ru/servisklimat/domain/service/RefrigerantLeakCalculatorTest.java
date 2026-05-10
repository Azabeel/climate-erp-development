package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.domain.model.enums.RefrigerantOperation;
import ru.servisklimat.domain.repository.RefrigerantLogRepository;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RefrigerantLeakCalculatorTest {

    @Mock
    private RefrigerantLogRepository refrigerantLogRepository;

    private RefrigerantLeakCalculator calculator;

    private UUID equipmentId;
    private ZonedDateTime from;
    private ZonedDateTime to;

    @BeforeEach
    void setUp() {
        calculator = new RefrigerantLeakCalculator(refrigerantLogRepository);
        equipmentId = UUID.randomUUID();
        to = ZonedDateTime.now(ZoneId.of("Europe/Moscow"));
        from = to.minusMonths(12);
    }

    /**
     * КРИТИЧЕСКИЙ ТЕСТ: 0.8 кг / 2.5 кг * 100 = 32% → превышает норму 30%
     */
    @Test
    void testLeakExceedsThreshold() {
        List<RefrigerantOperation> chargeTypes = List.of(
                RefrigerantOperation.CHARGE, RefrigerantOperation.TOP_UP);

        when(refrigerantLogRepository.sumAmountByEquipmentAndTypesBetween(
                eq(equipmentId), eq(chargeTypes), any(), any()))
                .thenReturn(new BigDecimal("0.8"));

        BigDecimal leakRate = calculator.calculateLeakRate(
                equipmentId, new BigDecimal("2.5"), from, to);

        assertThat(leakRate).isEqualByComparingTo(new BigDecimal("32.00"));
        assertThat(calculator.exceedsThreshold(leakRate)).isTrue();
    }

    /**
     * 0.7 кг / 2.5 кг * 100 = 28% → не превышает норму
     */
    @Test
    void testLeakBelowThreshold() {
        List<RefrigerantOperation> chargeTypes = List.of(
                RefrigerantOperation.CHARGE, RefrigerantOperation.TOP_UP);

        when(refrigerantLogRepository.sumAmountByEquipmentAndTypesBetween(
                eq(equipmentId), eq(chargeTypes), any(), any()))
                .thenReturn(new BigDecimal("0.7"));

        BigDecimal leakRate = calculator.calculateLeakRate(
                equipmentId, new BigDecimal("2.5"), from, to);

        assertThat(leakRate).isEqualByComparingTo(new BigDecimal("28.00"));
        assertThat(calculator.exceedsThreshold(leakRate)).isFalse();
    }

    /**
     * 0.75 кг / 2.5 кг * 100 = 30% → граница НЕ превышает (строго больше)
     */
    @Test
    void testLeakExactlyAtThreshold() {
        List<RefrigerantOperation> chargeTypes = List.of(
                RefrigerantOperation.CHARGE, RefrigerantOperation.TOP_UP);

        when(refrigerantLogRepository.sumAmountByEquipmentAndTypesBetween(
                eq(equipmentId), eq(chargeTypes), any(), any()))
                .thenReturn(new BigDecimal("0.75"));

        BigDecimal leakRate = calculator.calculateLeakRate(
                equipmentId, new BigDecimal("2.5"), from, to);

        assertThat(leakRate).isEqualByComparingTo(new BigDecimal("30.00"));
        assertThat(calculator.exceedsThreshold(leakRate)).isFalse();
    }

    @Test
    void testLeakRate_whenNoCharges_returnsZero() {
        List<RefrigerantOperation> chargeTypes = List.of(
                RefrigerantOperation.CHARGE, RefrigerantOperation.TOP_UP);

        when(refrigerantLogRepository.sumAmountByEquipmentAndTypesBetween(
                eq(equipmentId), eq(chargeTypes), any(), any()))
                .thenReturn(null);

        BigDecimal leakRate = calculator.calculateLeakRate(
                equipmentId, new BigDecimal("2.5"), from, to);

        assertThat(leakRate).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(calculator.exceedsThreshold(leakRate)).isFalse();
    }
}
