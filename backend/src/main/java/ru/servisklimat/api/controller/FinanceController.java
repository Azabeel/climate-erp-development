package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.finance.CreateInvoiceRequest;
import ru.servisklimat.api.dto.finance.InvoiceDto;
import ru.servisklimat.api.dto.finance.MarginDto;
import ru.servisklimat.domain.model.Invoice;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.service.InvoiceService;
import ru.servisklimat.domain.service.WorkOrderService;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class FinanceController {

    private final InvoiceService invoiceService;
    private final WorkOrderService workOrderService;

    // ─── Invoices ─────────────────────────────────────────────────────────────

    @GetMapping("/api/v1/finance/invoices")
    public Page<InvoiceDto> getAllInvoices(Pageable pageable) {
        return invoiceService.findAll(pageable).map(this::toDto);
    }

    @GetMapping("/api/v1/finance/invoices/{id}")
    public InvoiceDto getInvoice(@PathVariable UUID id) {
        return toDto(invoiceService.findById(id));
    }

    @PostMapping("/api/v1/finance/invoices")
    @ResponseStatus(HttpStatus.CREATED)
    public InvoiceDto createInvoice(@Valid @RequestBody CreateInvoiceRequest request) {
        return toDto(invoiceService.create(
                request.workOrderId(),
                request.clientId(),
                request.dueDate()
        ));
    }

    @PutMapping("/api/v1/finance/invoices/{id}/paid")
    public InvoiceDto markPaid(@PathVariable UUID id) {
        return toDto(invoiceService.markPaid(id));
    }

    // ─── Margin ───────────────────────────────────────────────────────────────

    @GetMapping("/api/v1/work-orders/{id}/margin")
    public MarginDto getMargin(@PathVariable UUID id) {
        WorkOrder order = workOrderService.findById(id);
        return new MarginDto(
                order.getId(),
                order.getRevenue(),
                order.getCostPrice(),
                order.getMargin(),
                order.getMarginPercent()
        );
    }

    // ─── Mapping helpers ──────────────────────────────────────────────────────

    private InvoiceDto toDto(Invoice invoice) {
        return new InvoiceDto(
                invoice.getId(),
                invoice.getWorkOrderId(),
                invoice.getClientId(),
                invoice.getNumber(),
                invoice.getTotalAmount(),
                invoice.getStatus(),
                invoice.getIssuedAt(),
                invoice.getDueDate(),
                invoice.getPaidAt(),
                invoice.getLines() != null ? invoice.getLines().size() : 0
        );
    }
}
