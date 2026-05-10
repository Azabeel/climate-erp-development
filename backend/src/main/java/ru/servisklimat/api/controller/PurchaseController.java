package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.purchase.*;
import ru.servisklimat.domain.service.PurchaseRequestService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/purchases")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseRequestService purchaseRequestService;

    // ─── Purchase Requests ────────────────────────────────────────────────────

    @GetMapping
    public Page<PurchaseRequestDto> getAll(Pageable pageable) {
        return purchaseRequestService.findAll(pageable);
    }

    @GetMapping("/{id}")
    public PurchaseRequestDto getById(@PathVariable UUID id) {
        return purchaseRequestService.findById(id);
    }

    @GetMapping("/by-work-order/{workOrderId}")
    public List<PurchaseRequestDto> getByWorkOrder(@PathVariable UUID workOrderId) {
        return purchaseRequestService.findByWorkOrder(workOrderId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseRequestDto create(@Valid @RequestBody CreatePurchaseRequest request) {
        // In real app, extract createdBy from security context; using null for MVP
        return purchaseRequestService.create(request, null);
    }

    // ─── Items ────────────────────────────────────────────────────────────────

    @PostMapping("/{id}/items")
    @ResponseStatus(HttpStatus.CREATED)
    public PurchaseRequestItemDto addItem(@PathVariable UUID id,
                                          @Valid @RequestBody AddPurchaseItemRequest request) {
        return purchaseRequestService.addItem(id, request);
    }

    @PutMapping("/{id}/items/{itemId}/status")
    public PurchaseRequestDto updateItemStatus(@PathVariable UUID id,
                                               @PathVariable UUID itemId,
                                               @Valid @RequestBody UpdateItemStatusRequest request) {
        return purchaseRequestService.updateItemStatus(id, itemId, request);
    }

    // ─── Payment ──────────────────────────────────────────────────────────────

    @PostMapping("/{id}/items/{itemId}/payment")
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentRequestDto createPayment(@PathVariable UUID id,
                                           @PathVariable UUID itemId,
                                           @Valid @RequestBody CreatePaymentRequestDto request) {
        return purchaseRequestService.createPaymentRequest(id, itemId, request);
    }
}
