package ru.servisklimat.integration.onec;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.repository.ClientRepository;
import ru.servisklimat.domain.repository.WorkOrderRepository;

import java.util.UUID;

/**
 * Stub implementation for 1C:UNF integration via OData REST API.
 * The real implementation would use RestTemplate/WebClient to call 1C endpoints.
 * Enabled only when onec.enabled=true in application properties.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class OneCIntegrationService {

    private final WorkOrderRepository workOrderRepository;
    private final ClientRepository clientRepository;

    @Value("${onec.enabled:false}")
    private boolean enabled;

    /**
     * Checks whether 1C integration is available.
     * Stub always returns false — real impl would ping the 1C OData endpoint.
     */
    public boolean isAvailable() {
        if (!enabled) {
            log.debug("1C integration is disabled (onec.enabled=false)");
            return false;
        }
        // Real impl: ping http://<onec-host>/odata/standard.odata/$metadata
        return false;
    }

    /**
     * Syncs a work order to 1C:UNF.
     * Stub logs the action; real impl would POST/PATCH the document via OData.
     */
    @Transactional
    public void syncWorkOrder(UUID workOrderId) {
        if (!enabled) {
            log.debug("1C integration disabled — skipping syncWorkOrder for {}", workOrderId);
            return;
        }

        var workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("WorkOrder not found: " + workOrderId));

        log.info("Syncing WO {} ({}) to 1C", workOrderId, workOrder.getNumber());
        // Real impl: oneCClient.postDocument("РеализацияТоваровУслуг", buildPayload(workOrder))
    }

    /**
     * Syncs a client to 1C:UNF.
     * Stub logs the action; real impl would POST/PATCH the client via OData.
     */
    @Transactional
    public void syncClient(UUID clientId) {
        if (!enabled) {
            log.debug("1C integration disabled — skipping syncClient for {}", clientId);
            return;
        }

        var client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found: " + clientId));

        log.info("Syncing client {} ({}) to 1C", clientId, client.getName());
        // Real impl: oneCClient.patchEntity("Контрагенты", client.getExternalId(), buildPayload(client))
    }
}
