package ru.servisklimat;

import io.minio.MinioClient;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.test.context.ActiveProfiles;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.WorkOrderServiceLine;
import ru.servisklimat.domain.model.enums.ExecutionType;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;
import ru.servisklimat.domain.service.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Sprint 16 smoke test — verifies that all core business beans load and
 * produce correct results in an integrated Spring context.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
class HappyPathSmokeTest {

    @MockBean JwtDecoder jwtDecoder;
    @MockBean MinioClient minioClient;
    @MockBean ConnectionFactory connectionFactory;
    @MockBean RedisConnectionFactory redisConnectionFactory;

    @Autowired WorkOrderStateMachine stateMachine;
    @Autowired CriticalPathCalculator criticalPathCalculator;
    @Autowired RefrigerantLeakCalculator leakCalculator;
    @Autowired PlanningScoreCalculator scoringCalculator;
    @Autowired MarkupCalculationService markupService;
    @Autowired CostCalculationService costService;

    @Test
    void allCoreBeansLoad() {
        assertThat(stateMachine).isNotNull();
        assertThat(criticalPathCalculator).isNotNull();
        assertThat(leakCalculator).isNotNull();
        assertThat(scoringCalculator).isNotNull();
        assertThat(markupService).isNotNull();
        assertThat(costService).isNotNull();
    }

    @Test
    void workOrderFSMHappyPath() {
        WorkOrder wo = WorkOrder.builder().status(WorkOrderStatus.NEW).build();
        stateMachine.transition(wo, WorkOrderStatus.ASSIGNED, UUID.randomUUID(), null);
        stateMachine.transition(wo, WorkOrderStatus.EN_ROUTE, UUID.randomUUID(), null);
        stateMachine.transition(wo, WorkOrderStatus.ON_SITE, UUID.randomUUID(), null);
        stateMachine.transition(wo, WorkOrderStatus.IN_PROGRESS, UUID.randomUUID(), null);
        stateMachine.transition(wo, WorkOrderStatus.COMPLETED, UUID.randomUUID(), null);
        assertThat(wo.getStatus()).isEqualTo(WorkOrderStatus.COMPLETED);
        assertThat(wo.getClosedAt()).isNotNull();
    }

    @Test
    void criticalPathCalculation() {
        // SEQUENTIAL(60) + PARALLEL(max(30,40)) + SEQUENTIAL(45) + 15 buffer = 160
        List<WorkOrderServiceLine> lines = List.of(
            WorkOrderServiceLine.builder()
                .calculatedDurationMinutes(60)
                .executionType(ExecutionType.SEQUENTIAL)
                .build(),
            WorkOrderServiceLine.builder()
                .calculatedDurationMinutes(30)
                .executionType(ExecutionType.PARALLEL)
                .build(),
            WorkOrderServiceLine.builder()
                .calculatedDurationMinutes(40)
                .executionType(ExecutionType.PARALLEL)
                .build(),
            WorkOrderServiceLine.builder()
                .calculatedDurationMinutes(45)
                .executionType(ExecutionType.SEQUENTIAL)
                .build()
        );
        CriticalPathCalculator.CriticalPathResult result = criticalPathCalculator.calculate(lines);
        assertThat(result.totalMinutes()).isEqualTo(160);
        assertThat(result.hasParallelTasks()).isTrue();
    }

    @Test
    void markupCalculationByPercent() {
        // 1500 * (1 + 30/100) = 1950.00
        MarkupCalculationService.MarkupResult result =
            markupService.calculate(new BigDecimal("1500"), new BigDecimal("30"), null);
        assertThat(result.salePrice()).isEqualByComparingTo(new BigDecimal("1950.00"));
        assertThat(result.markupAmount()).isEqualByComparingTo(new BigDecimal("450.00"));
    }

    @Test
    void markupCalculationByAmount() {
        // 1500 + 450 = 1950, markup% = 30%
        MarkupCalculationService.MarkupResult result =
            markupService.calculate(new BigDecimal("1500"), null, new BigDecimal("450"));
        assertThat(result.salePrice()).isEqualByComparingTo(new BigDecimal("1950.00"));
        assertThat(result.markupPercent()).isEqualByComparingTo(new BigDecimal("30.00"));
    }
}
