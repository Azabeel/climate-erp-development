package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;

/**
 * Listens to {@link WorkOrderStatusChangedEvent} and triggers automatic
 * cost / margin recalculation when a work order reaches COMPLETED or CLOSED.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MarginUpdateListener {

    private final CostCalculationService costCalculationService;

    @EventListener
    public void onWorkOrderStatusChanged(WorkOrderStatusChangedEvent event) {
        WorkOrderStatus newStatus = event.getNewStatus();

        if (newStatus == WorkOrderStatus.COMPLETED || newStatus == WorkOrderStatus.CLOSED) {
            log.debug("WorkOrder [{}] reached status {}. Recalculating margin.",
                    event.getWorkOrder().getNumber(), newStatus);
            costCalculationService.calculateAndUpdate(event.getWorkOrder());
        }
    }
}
