package ru.servisklimat.domain.model.enums;

public enum WorkOrderStatus {
    NEW,
    ASSIGNED,
    EN_ROUTE,
    ON_SITE,
    IN_PROGRESS,
    AWAITING_PARTS,
    READY_TO_RESUME,
    COMPLETED,
    CLOSED,
    CANCELLED;

    public boolean isTerminal() {
        return this == COMPLETED || this == CLOSED || this == CANCELLED;
    }

    public boolean isActive() {
        return !isTerminal();
    }
}
