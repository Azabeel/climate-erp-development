package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.api.dto.purchase.*;
import ru.servisklimat.domain.model.PaymentRequest;
import ru.servisklimat.domain.model.PurchaseRequest;
import ru.servisklimat.domain.model.PurchaseRequestItem;
import ru.servisklimat.domain.repository.PaymentRequestRepository;
import ru.servisklimat.domain.repository.PurchaseRequestItemRepository;
import ru.servisklimat.domain.repository.PurchaseRequestRepository;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PurchaseRequestService {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");
    private static final String PR_PREFIX = "PR";

    private final PurchaseRequestRepository purchaseRequestRepository;
    private final PurchaseRequestItemRepository itemRepository;
    private final PaymentRequestRepository paymentRequestRepository;
    private final MarkupCalculationService markupCalculationService;
    private final PurchaseStatusAggregator statusAggregator;

    private final AtomicLong sequence = new AtomicLong(0);

    // ─── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PurchaseRequestDto findById(UUID id) {
        PurchaseRequest pr = purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PurchaseRequest not found: " + id));
        return toDto(pr);
    }

    @Transactional(readOnly = true)
    public Page<PurchaseRequestDto> findAll(Pageable pageable) {
        return purchaseRequestRepository.findAll(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<PurchaseRequestDto> findByWorkOrder(UUID workOrderId) {
        return purchaseRequestRepository.findByWorkOrderId(workOrderId)
                .stream().map(this::toDto).collect(Collectors.toList());
    }

    // ─── Create ───────────────────────────────────────────────────────────────

    @Transactional
    public PurchaseRequestDto create(CreatePurchaseRequest req, UUID createdBy) {
        String number = generateNumber();

        PurchaseRequest pr = PurchaseRequest.builder()
                .number(number)
                .workOrderId(req.workOrderId())
                .engineerId(req.engineerId())
                .responsibleUserId(responsibleUserId(req, createdBy))
                .status("NEW")
                .latestDeliveryDate(req.latestDeliveryDate())
                .clientNotified(false)
                .build();

        return toDto(purchaseRequestRepository.save(pr));
    }

    // ─── Items ────────────────────────────────────────────────────────────────

    @Transactional
    public PurchaseRequestItemDto addItem(UUID requestId, AddPurchaseItemRequest req) {
        PurchaseRequest pr = getRequest(requestId);

        PurchaseRequestItem item = PurchaseRequestItem.builder()
                .request(pr)
                .name(req.name())
                .article(req.article())
                .qty(req.qty() != null ? req.qty() : java.math.BigDecimal.ONE)
                .unit(req.unit() != null ? req.unit() : "шт")
                .supplierId(req.supplierId())
                .purchasePrice(req.purchasePrice())
                .plannedDeliveryDate(req.plannedDeliveryDate())
                .engineerComment(req.engineerComment())
                .status("NEW")
                .build();

        // Apply markup calculation when purchasePrice is provided
        if (req.purchasePrice() != null) {
            MarkupCalculationService.MarkupResult markup =
                    markupCalculationService.calculate(req.purchasePrice(), req.markupPercent(), req.markupAmount());
            item.setSalePrice(markup.salePrice());
            item.setMarkupPercent(markup.markupPercent());
            item.setMarkupAmount(markup.markupAmount());
        }

        PurchaseRequestItem saved = itemRepository.save(item);
        log.info("Added item [{}] to purchase request [{}]", saved.getId(), requestId);
        return toItemDto(saved);
    }

    @Transactional
    public PurchaseRequestDto updateItemStatus(UUID requestId, UUID itemId, UpdateItemStatusRequest req) {
        PurchaseRequest pr = getRequest(requestId);

        PurchaseRequestItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found: " + itemId));

        item.setStatus(req.status());
        if (req.trackingNumber() != null) {
            item.setTrackingNumber(req.trackingNumber());
        }
        if (req.carrierName() != null) {
            item.setCarrierName(req.carrierName());
        }
        itemRepository.save(item);

        // Re-aggregate request status
        List<String> statuses = itemRepository.findByRequestId(requestId)
                .stream().map(PurchaseRequestItem::getStatus).collect(Collectors.toList());
        pr.setStatus(statusAggregator.aggregate(statuses));
        purchaseRequestRepository.save(pr);

        log.info("Updated item [{}] status to [{}], request [{}] status now [{}]",
                itemId, req.status(), requestId, pr.getStatus());

        return toDto(pr);
    }

    // ─── Payment ──────────────────────────────────────────────────────────────

    @Transactional
    public PaymentRequestDto createPaymentRequest(UUID requestId, UUID itemId,
                                                   CreatePaymentRequestDto req) {
        // Validate request exists
        getRequest(requestId);

        PurchaseRequestItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Item not found: " + itemId));

        PaymentRequest payment = PaymentRequest.builder()
                .purchaseItem(item)
                .amount(req.amount())
                .invoiceUrl(req.invoiceUrl())
                .dueDate(req.dueDate())
                .supplierId(req.supplierId())
                .paymentNote(req.paymentNote())
                .paymentStatus("PENDING")
                .build();

        PaymentRequest saved = paymentRequestRepository.save(payment);
        log.info("Created payment request [{}] for item [{}]", saved.getId(), itemId);
        return toPaymentDto(saved);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private PurchaseRequest getRequest(UUID id) {
        return purchaseRequestRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("PurchaseRequest not found: " + id));
    }

    private String generateNumber() {
        int year = ZonedDateTime.now(MOSCOW).getYear();
        long seq = sequence.incrementAndGet();
        return String.format("%s-%d-%06d", PR_PREFIX, year, seq);
    }

    private UUID responsibleUserId(CreatePurchaseRequest req, UUID createdBy) {
        return req.responsibleUserId() != null ? req.responsibleUserId() : createdBy;
    }

    // ─── DTO mapping ──────────────────────────────────────────────────────────

    private PurchaseRequestDto toDto(PurchaseRequest pr) {
        List<PurchaseRequestItemDto> items = pr.getItems() == null
                ? List.of()
                : pr.getItems().stream().map(this::toItemDto).collect(Collectors.toList());

        return new PurchaseRequestDto(
                pr.getId(),
                pr.getNumber(),
                pr.getWorkOrderId(),
                pr.getEngineerId(),
                pr.getResponsibleUserId(),
                pr.getStatus(),
                pr.getLatestDeliveryDate(),
                pr.getClientNotified(),
                pr.getCreatedAt(),
                pr.getUpdatedAt(),
                items
        );
    }

    private PurchaseRequestItemDto toItemDto(PurchaseRequestItem item) {
        return new PurchaseRequestItemDto(
                item.getId(),
                item.getName(),
                item.getArticle(),
                item.getQty(),
                item.getUnit(),
                item.getSupplierId(),
                item.getPurchasePrice(),
                item.getCurrency(),
                item.getMarkupPercent(),
                item.getMarkupAmount(),
                item.getSalePrice(),
                item.getPlannedDeliveryDate(),
                item.getCarrierName(),
                item.getTrackingNumber(),
                item.getInvoiceUrl(),
                item.getStatus(),
                item.getEngineerComment(),
                item.getCreatedAt()
        );
    }

    private PaymentRequestDto toPaymentDto(PaymentRequest pr) {
        return new PaymentRequestDto(
                pr.getId(),
                pr.getPurchaseItem() != null ? pr.getPurchaseItem().getId() : null,
                pr.getSupplierId(),
                pr.getAmount(),
                pr.getCurrency(),
                pr.getDueDate(),
                pr.getInvoiceUrl(),
                pr.getPaymentStatus(),
                pr.getPaidAt(),
                pr.getPaymentNote(),
                pr.getCreatedAt()
        );
    }
}
