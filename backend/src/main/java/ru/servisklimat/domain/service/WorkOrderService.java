package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.*;
import ru.servisklimat.domain.model.enums.ExecutionType;
import ru.servisklimat.domain.model.enums.Priority;
import ru.servisklimat.domain.model.enums.WorkOrderSource;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;
import ru.servisklimat.domain.model.enums.WorkOrderType;
import ru.servisklimat.domain.repository.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class WorkOrderService {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");

    private final WorkOrderRepository workOrderRepository;
    private final WorkOrderStatusLogRepository statusLogRepository;
    private final ClientRepository clientRepository;
    private final ContractRepository contractRepository;
    private final EngineerRepository engineerRepository;
    private final ServiceCatalogRepository serviceCatalogRepository;
    private final WorkOrderStateMachine stateMachine;
    private final WorkOrderNumberGenerator numberGenerator;
    private final CriticalPathCalculator criticalPathCalculator;
    private final SLACalculator slaCalculator;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public WorkOrder create(UUID clientId, WorkOrderType type, Priority priority,
                            WorkOrderSource source, UUID contractId, UUID contactId,
                            UUID locationId, UUID equipmentId,
                            String description, String dispatcherComment) {
        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found: " + clientId));

        String number = numberGenerator.nextNumber();

        WorkOrder.WorkOrderBuilder builder = WorkOrder.builder()
                .number(number)
                .client(client)
                .type(type)
                .priority(priority)
                .source(source)
                .contactId(contactId)
                .locationId(locationId)
                .equipmentId(equipmentId)
                .description(description)
                .dispatcherComment(dispatcherComment);

        if (contractId != null) {
            Contract contract = contractRepository.findById(contractId)
                    .orElseThrow(() -> new EntityNotFoundException("Contract not found: " + contractId));
            builder.contract(contract);
            if (contract.getSlaConfig() != null) {
                builder.slaConfig(contract.getSlaConfig());
            }
        }

        WorkOrder saved = workOrderRepository.save(builder.build());
        slaCalculator.calculateAndSetSLA(saved);
        return workOrderRepository.save(saved);
    }

    public WorkOrder findById(UUID id) {
        return workOrderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("WorkOrder not found: " + id));
    }

    public Page<WorkOrder> findAll(Pageable pageable) {
        return workOrderRepository.findAll(pageable);
    }

    public Page<WorkOrder> findByClient(UUID clientId, Pageable pageable) {
        return workOrderRepository.findByClientId(clientId, pageable);
    }

    public Page<WorkOrder> findByEngineer(UUID engineerId, Pageable pageable) {
        return workOrderRepository.findByEngineerId(engineerId, pageable);
    }

    public Page<WorkOrder> findByStatuses(List<WorkOrderStatus> statuses, Pageable pageable) {
        return workOrderRepository.findByStatusIn(statuses, pageable);
    }

    @Transactional
    public WorkOrder transition(UUID id, WorkOrderStatus newStatus, UUID changedBy, String comment) {
        WorkOrder order = findById(id);
        WorkOrderStatus oldStatus = order.getStatus();
        stateMachine.transition(order, newStatus, changedBy, comment);
        WorkOrder saved = workOrderRepository.save(order);
        eventPublisher.publishEvent(new WorkOrderStatusChangedEvent(this, saved, oldStatus, newStatus));
        return saved;
    }

    @Transactional
    public WorkOrder assign(UUID id, UUID engineerId, UUID secondEngineerId) {
        WorkOrder order = findById(id);
        Engineer engineer = engineerRepository.findById(engineerId)
                .orElseThrow(() -> new EntityNotFoundException("Engineer not found: " + engineerId));
        order.setEngineer(engineer);

        if (secondEngineerId != null) {
            Engineer second = engineerRepository.findById(secondEngineerId)
                    .orElseThrow(() -> new EntityNotFoundException("Engineer not found: " + secondEngineerId));
            order.setSecondEngineer(second);
        }

        WorkOrderStatus oldStatus = order.getStatus();
        stateMachine.transition(order, WorkOrderStatus.ASSIGNED, engineerId, "Assigned");
        WorkOrder saved = workOrderRepository.save(order);
        eventPublisher.publishEvent(new WorkOrderStatusChangedEvent(this, saved, oldStatus, WorkOrderStatus.ASSIGNED));
        return saved;
    }

    @Transactional
    public WorkOrder addMaterial(UUID id, UUID stockItemId, BigDecimal qty,
                                 BigDecimal unitPrice, BigDecimal salePrice, UUID addedBy) {
        WorkOrder order = findById(id);
        WorkOrderMaterial material = WorkOrderMaterial.builder()
                .workOrder(order)
                .stockItemId(stockItemId)
                .qty(qty)
                .unitPrice(unitPrice)
                .salePrice(salePrice != null ? salePrice : unitPrice)
                .addedBy(addedBy)
                .addedAt(ZonedDateTime.now(MOSCOW))
                .build();
        order.getMaterials().add(material);
        return workOrderRepository.save(order);
    }

    @Transactional
    public WorkOrder addServiceLine(UUID id, UUID serviceId, int quantity) {
        WorkOrder order = findById(id);
        ru.servisklimat.domain.model.Service svc = serviceCatalogRepository.findById(serviceId)
                .orElseThrow(() -> new EntityNotFoundException("Service not found: " + serviceId));

        WorkOrderServiceLine line = WorkOrderServiceLine.builder()
                .workOrder(order)
                .service(svc)
                .calculatedDurationMinutes(svc.getBaseDurationMinutes() * Math.max(1, quantity))
                .executionType(svc.getExecutionType())
                .price(svc.getBasePrice())
                .quantity(quantity)
                .sortOrder(order.getServices().size())
                .build();
        order.getServices().add(line);

        CriticalPathCalculator.CriticalPathResult result = criticalPathCalculator.calculate(order.getServices());
        order.setTotalEstimatedDurationMinutes(result.totalMinutes());
        order.setHasParallelTasks(result.hasParallelTasks());
        order.setRequiresTwoEngineers(result.requiresTwoEngineers());

        return workOrderRepository.save(order);
    }

    @Transactional
    public WorkOrder updateRevenue(UUID id, BigDecimal revenue) {
        WorkOrder order = findById(id);
        order.setRevenue(revenue);
        BigDecimal cost = order.getCostPrice();
        BigDecimal margin = revenue.subtract(cost);
        order.setMargin(margin);
        if (revenue.compareTo(BigDecimal.ZERO) > 0) {
            order.setMarginPercent(margin.divide(revenue, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100")));
        }
        return workOrderRepository.save(order);
    }
}
