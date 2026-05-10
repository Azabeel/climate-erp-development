package ru.servisklimat.domain.service;

import org.junit.jupiter.api.Test;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static ru.servisklimat.domain.model.enums.WorkOrderStatus.*;

class WorkOrderStateMachineTest {

    private final WorkOrderStateMachine fsm = new WorkOrderStateMachine();

    private WorkOrder order(WorkOrderStatus status) {
        return WorkOrder.builder().status(status).build();
    }

    @Test
    void happyPathNewToCompleted() {
        WorkOrder wo = order(NEW);
        fsm.transition(wo, ASSIGNED, UUID.randomUUID(), null);
        fsm.transition(wo, EN_ROUTE, UUID.randomUUID(), null);
        fsm.transition(wo, ON_SITE, UUID.randomUUID(), null);
        fsm.transition(wo, IN_PROGRESS, UUID.randomUUID(), null);
        fsm.transition(wo, COMPLETED, UUID.randomUUID(), null);
        assertThat(wo.getStatus()).isEqualTo(COMPLETED);
        assertThat(wo.getClosedAt()).isNotNull();
        assertThat(wo.getActualEnd()).isNotNull();
    }

    @Test
    void closedAfterCompleted() {
        WorkOrder wo = order(COMPLETED);
        fsm.transition(wo, CLOSED, UUID.randomUUID(), null);
        assertThat(wo.getStatus()).isEqualTo(CLOSED);
    }

    @Test
    void invalidTransitionNewToCompleted() {
        WorkOrder wo = order(NEW);
        assertThatThrownBy(() -> fsm.transition(wo, COMPLETED, UUID.randomUUID(), null))
                .isInstanceOf(InvalidStateTransitionException.class);
    }

    @Test
    void cancelledIsTerminal() {
        WorkOrder wo = order(CANCELLED);
        assertThatThrownBy(() -> fsm.transition(wo, ASSIGNED, UUID.randomUUID(), null))
                .isInstanceOf(InvalidStateTransitionException.class);
    }

    @Test
    void awaitingPartsCanBeCancelled() {
        WorkOrder wo = order(AWAITING_PARTS);
        fsm.transition(wo, CANCELLED, UUID.randomUUID(), "parts not available");
        assertThat(wo.getStatus()).isEqualTo(CANCELLED);
    }

    @Test
    void statusLogIsAppended() {
        WorkOrder wo = order(NEW);
        fsm.transition(wo, ASSIGNED, UUID.randomUUID(), "assigned");
        assertThat(wo.getStatusLogs()).hasSize(1);
        assertThat(wo.getStatusLogs().get(0).getOldStatus()).isEqualTo(NEW);
        assertThat(wo.getStatusLogs().get(0).getNewStatus()).isEqualTo(ASSIGNED);
    }
}
