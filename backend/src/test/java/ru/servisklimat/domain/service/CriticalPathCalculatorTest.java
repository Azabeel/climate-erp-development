package ru.servisklimat.domain.service;

import org.junit.jupiter.api.Test;
import ru.servisklimat.domain.model.WorkOrderServiceLine;
import ru.servisklimat.domain.model.enums.ExecutionType;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CriticalPathCalculatorTest {

    private final CriticalPathCalculator calculator = new CriticalPathCalculator();

    private WorkOrderServiceLine line(int minutes, ExecutionType type) {
        return WorkOrderServiceLine.builder()
                .calculatedDurationMinutes(minutes)
                .executionType(type)
                .build();
    }

    @Test
    void emptyListReturnBuffer() {
        var result = calculator.calculate(List.of());
        assertThat(result.totalMinutes()).isEqualTo(CriticalPathCalculator.MOVEMENT_BUFFER_MINUTES);
    }

    @Test
    void allSequentialSumsUp() {
        var result = calculator.calculate(List.of(
                line(60, ExecutionType.SEQUENTIAL),
                line(45, ExecutionType.SEQUENTIAL)
        ));
        // 60 + 45 + 15 buffer = 120
        assertThat(result.totalMinutes()).isEqualTo(120);
        assertThat(result.hasParallelTasks()).isFalse();
    }

    @Test
    void parallelGroupTakesMax() {
        var result = calculator.calculate(List.of(
                line(30, ExecutionType.PARALLEL),
                line(40, ExecutionType.PARALLEL)
        ));
        // max(30,40) + 15 = 55
        assertThat(result.totalMinutes()).isEqualTo(55);
        assertThat(result.hasParallelTasks()).isTrue();
    }

    @Test
    void requiresTwoTreatedAsSequential() {
        var result = calculator.calculate(List.of(
                line(60, ExecutionType.REQUIRES_TWO),
                line(30, ExecutionType.REQUIRES_TWO)
        ));
        // 60 + 30 + 15 = 105
        assertThat(result.totalMinutes()).isEqualTo(105);
        assertThat(result.requiresTwoEngineers()).isTrue();
    }

    @Test
    void mixedTasks() {
        // SEQUENTIAL(60) + PARALLEL(max(30,40)) + SEQUENTIAL(45) + 15 buffer = 160
        var result = calculator.calculate(List.of(
                line(60, ExecutionType.SEQUENTIAL),
                line(30, ExecutionType.PARALLEL),
                line(40, ExecutionType.PARALLEL),
                line(45, ExecutionType.SEQUENTIAL)
        ));
        assertThat(result.totalMinutes()).isEqualTo(160);
        assertThat(result.hasParallelTasks()).isTrue();
        assertThat(result.requiresTwoEngineers()).isFalse();
    }
}
