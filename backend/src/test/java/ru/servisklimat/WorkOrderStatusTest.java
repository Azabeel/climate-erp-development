package ru.servisklimat;

import org.junit.jupiter.api.Test;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;

import static org.assertj.core.api.Assertions.assertThat;

class WorkOrderStatusTest {

    @Test
    void terminalStatusesAreCorrect() {
        assertThat(WorkOrderStatus.COMPLETED.isTerminal()).isTrue();
        assertThat(WorkOrderStatus.CLOSED.isTerminal()).isTrue();
        assertThat(WorkOrderStatus.CANCELLED.isTerminal()).isTrue();
    }

    @Test
    void activeStatusesAreCorrect() {
        assertThat(WorkOrderStatus.NEW.isActive()).isTrue();
        assertThat(WorkOrderStatus.ASSIGNED.isActive()).isTrue();
        assertThat(WorkOrderStatus.EN_ROUTE.isActive()).isTrue();
        assertThat(WorkOrderStatus.ON_SITE.isActive()).isTrue();
        assertThat(WorkOrderStatus.IN_PROGRESS.isActive()).isTrue();
        assertThat(WorkOrderStatus.AWAITING_PARTS.isActive()).isTrue();
        assertThat(WorkOrderStatus.READY_TO_RESUME.isActive()).isTrue();
    }

    @Test
    void terminalStatusesAreNotActive() {
        assertThat(WorkOrderStatus.COMPLETED.isActive()).isFalse();
        assertThat(WorkOrderStatus.CLOSED.isActive()).isFalse();
        assertThat(WorkOrderStatus.CANCELLED.isActive()).isFalse();
    }

    @Test
    void allStatusValuesExist() {
        assertThat(WorkOrderStatus.values()).hasSize(10);
    }
}
