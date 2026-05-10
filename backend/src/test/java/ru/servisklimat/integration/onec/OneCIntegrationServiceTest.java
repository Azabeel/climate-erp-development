package ru.servisklimat.integration.onec;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.domain.repository.ClientRepository;
import ru.servisklimat.domain.repository.WorkOrderRepository;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

@ExtendWith(MockitoExtension.class)
class OneCIntegrationServiceTest {

    @Mock
    WorkOrderRepository workOrderRepository;

    @Mock
    ClientRepository clientRepository;

    @InjectMocks
    OneCIntegrationService oneCIntegrationService;

    @Test
    void isAvailable_returnsFalse_whenStub() {
        // The stub always returns false (enabled defaults to false)
        boolean available = oneCIntegrationService.isAvailable();
        assertThat(available).isFalse();
    }

    @Test
    void syncWorkOrder_doesNotThrow_whenDisabled() {
        // When onec.enabled=false (default), method logs and returns without throwing
        assertThatCode(() -> oneCIntegrationService.syncWorkOrder(UUID.randomUUID()))
                .doesNotThrowAnyException();
    }
}
