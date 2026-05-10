package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.PurchaseRequestItem;
import ru.servisklimat.domain.repository.PurchaseRequestItemRepository;

import java.time.LocalDate;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryTrackingService {

    private final PurchaseRequestItemRepository purchaseRequestItemRepository;

    public record TrackingInfo(
            String trackingNumber,
            String carrier,
            String status,
            LocalDate estimatedDelivery
    ) {}

    /**
     * Stub implementation — real carrier integrations would use HTTP clients.
     * CDEK returns IN_TRANSIT with ETA +3 days.
     * POCHTA returns PROCESSING with ETA +7 days.
     */
    public TrackingInfo checkStatus(String trackingNumber, String carrier) {
        log.info("Checking tracking status for {} via {}", trackingNumber, carrier);

        return switch (carrier.toUpperCase()) {
            case "CDEK" -> new TrackingInfo(
                    trackingNumber,
                    carrier,
                    "IN_TRANSIT",
                    LocalDate.now().plusDays(3)
            );
            case "POCHTA" -> new TrackingInfo(
                    trackingNumber,
                    carrier,
                    "PROCESSING",
                    LocalDate.now().plusDays(7)
            );
            default -> new TrackingInfo(
                    trackingNumber,
                    carrier,
                    "UNKNOWN",
                    null
            );
        };
    }

    @Transactional
    public void updatePurchaseItemStatus(UUID purchaseItemId, String trackingNumber, String carrier) {
        PurchaseRequestItem item = purchaseRequestItemRepository.findById(purchaseItemId)
                .orElseThrow(() -> new EntityNotFoundException("PurchaseRequestItem not found: " + purchaseItemId));

        TrackingInfo info = checkStatus(trackingNumber, carrier);

        item.setTrackingNumber(trackingNumber);
        item.setCarrierName(carrier);

        if ("IN_TRANSIT".equals(info.status())) {
            item.setStatus("IN_TRANSIT");
            item.setPlannedDeliveryDate(info.estimatedDelivery());
        } else if ("PROCESSING".equals(info.status())) {
            item.setStatus("ORDERED");
        }

        purchaseRequestItemRepository.save(item);
        log.info("Updated purchase item {} status to {} via {}", purchaseItemId, info.status(), carrier);
    }
}
