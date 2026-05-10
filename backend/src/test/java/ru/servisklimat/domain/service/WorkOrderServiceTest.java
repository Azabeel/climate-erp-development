package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.domain.model.Client;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.enums.*;
import ru.servisklimat.domain.repository.*;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WorkOrderServiceTest {

    @Mock WorkOrderRepository workOrderRepository;
    @Mock WorkOrderStatusLogRepository statusLogRepository;
    @Mock ClientRepository clientRepository;
    @Mock ContractRepository contractRepository;
    @Mock EngineerRepository engineerRepository;
    @Mock ServiceCatalogRepository serviceCatalogRepository;
    @Mock WorkOrderStateMachine stateMachine;
    @Mock WorkOrderNumberGenerator numberGenerator;
    @Mock CriticalPathCalculator criticalPathCalculator;

    @InjectMocks
    WorkOrderService workOrderService;

    private Client client;

    @BeforeEach
    void setup() {
        client = Client.builder()
                .id(UUID.randomUUID())
                .name("Test Client")
                .type(ClientType.INDIVIDUAL)
                .build();
    }

    @Test
    void createWorkOrderSuccess() {
        when(clientRepository.findById(client.getId())).thenReturn(Optional.of(client));
        when(numberGenerator.nextNumber()).thenReturn("WO-2026-000001");
        WorkOrder saved = WorkOrder.builder()
                .id(UUID.randomUUID())
                .number("WO-2026-000001")
                .client(client)
                .build();
        when(workOrderRepository.save(any())).thenReturn(saved);

        WorkOrder result = workOrderService.create(
                client.getId(), WorkOrderType.REPAIR, Priority.NORMAL, WorkOrderSource.MANUAL,
                null, null, null, null, "desc", null);

        assertThat(result.getNumber()).isEqualTo("WO-2026-000001");
        verify(workOrderRepository).save(any());
    }

    @Test
    void createWorkOrderClientNotFound() {
        UUID id = UUID.randomUUID();
        when(clientRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> workOrderService.create(
                id, WorkOrderType.REPAIR, Priority.NORMAL, WorkOrderSource.MANUAL,
                null, null, null, null, null, null))
                .isInstanceOf(jakarta.persistence.EntityNotFoundException.class);
    }

    @Test
    void findByIdNotFound() {
        UUID id = UUID.randomUUID();
        when(workOrderRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> workOrderService.findById(id))
                .isInstanceOf(jakarta.persistence.EntityNotFoundException.class);
    }

    @Test
    void transitionCallsStateMachine() {
        WorkOrder wo = WorkOrder.builder()
                .id(UUID.randomUUID())
                .status(WorkOrderStatus.NEW)
                .build();
        when(workOrderRepository.findById(wo.getId())).thenReturn(Optional.of(wo));
        when(workOrderRepository.save(any())).thenReturn(wo);

        workOrderService.transition(wo.getId(), WorkOrderStatus.ASSIGNED, UUID.randomUUID(), null);

        verify(stateMachine).transition(eq(wo), eq(WorkOrderStatus.ASSIGNED), any(), any());
    }
}
