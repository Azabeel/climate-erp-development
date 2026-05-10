package ru.servisklimat.domain.service;

import ru.servisklimat.domain.model.enums.WorkOrderStatus;

public class InvalidStateTransitionException extends RuntimeException {

    private final WorkOrderStatus from;
    private final WorkOrderStatus to;

    public InvalidStateTransitionException(WorkOrderStatus from, WorkOrderStatus to) {
        super(String.format("Invalid state transition: %s → %s", from, to));
        this.from = from;
        this.to = to;
    }

    public WorkOrderStatus getFrom() {
        return from;
    }

    public WorkOrderStatus getTo() {
        return to;
    }
}
