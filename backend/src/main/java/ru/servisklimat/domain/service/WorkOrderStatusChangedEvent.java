package ru.servisklimat.domain.service;

import org.springframework.context.ApplicationEvent;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;

public class WorkOrderStatusChangedEvent extends ApplicationEvent {

    private final WorkOrder workOrder;
    private final WorkOrderStatus oldStatus;
    private final WorkOrderStatus newStatus;

    public WorkOrderStatusChangedEvent(Object source, WorkOrder workOrder,
                                       WorkOrderStatus oldStatus, WorkOrderStatus newStatus) {
        super(source);
        this.workOrder = workOrder;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
    }

    public WorkOrder getWorkOrder() {
        return workOrder;
    }

    public WorkOrderStatus getOldStatus() {
        return oldStatus;
    }

    public WorkOrderStatus getNewStatus() {
        return newStatus;
    }
}
