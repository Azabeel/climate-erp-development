package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.Invoice;
import ru.servisklimat.domain.model.InvoiceLine;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.WorkOrderServiceLine;
import ru.servisklimat.domain.repository.InvoiceRepository;
import ru.servisklimat.domain.repository.WorkOrderRepository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Service for creating and managing invoices.
 *
 * Invoice numbers use format: INV-{YEAR}-{SEQ:06d}
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class InvoiceService {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");
    private static final String INV_PREFIX = "INV";
    private static final int SCALE = 2;
    private static final RoundingMode ROUNDING = RoundingMode.HALF_UP;

    private final InvoiceRepository invoiceRepository;
    private final WorkOrderRepository workOrderRepository;

    private final AtomicLong sequence = new AtomicLong(0);

    // ─── Read ─────────────────────────────────────────────────────────────────

    public Invoice findById(UUID id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Invoice not found: " + id));
    }

    public Page<Invoice> findAll(Pageable pageable) {
        return invoiceRepository.findAll(pageable);
    }

    public List<Invoice> findByWorkOrderId(UUID workOrderId) {
        return invoiceRepository.findByWorkOrderId(workOrderId);
    }

    // ─── Write ────────────────────────────────────────────────────────────────

    /**
     * Creates an invoice for the given work order, generating lines from its service lines.
     *
     * @param workOrderId the work order to invoice
     * @param clientId    the client to bill
     * @param dueDate     optional due date
     * @return the saved Invoice with generated number and lines
     */
    @Transactional
    public Invoice create(UUID workOrderId, UUID clientId, java.time.LocalDate dueDate) {
        WorkOrder order = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("WorkOrder not found: " + workOrderId));

        String number = generateNumber();

        Invoice invoice = Invoice.builder()
                .workOrderId(workOrderId)
                .clientId(clientId)
                .number(number)
                .status("DRAFT")
                .issuedAt(ZonedDateTime.now(MOSCOW))
                .dueDate(dueDate)
                .build();

        // Build invoice lines from work order service lines
        BigDecimal total = BigDecimal.ZERO;
        int sortOrder = 0;
        if (order.getServices() != null) {
            for (WorkOrderServiceLine svcLine : order.getServices()) {
                if (svcLine.getPrice() == null) continue;
                BigDecimal qty = new BigDecimal(svcLine.getQuantity());
                BigDecimal lineTotal = svcLine.getPrice()
                        .multiply(qty)
                        .setScale(SCALE, ROUNDING);

                String description = svcLine.getService() != null
                        ? svcLine.getService().getName()
                        : "Услуга";

                InvoiceLine line = InvoiceLine.builder()
                        .invoice(invoice)
                        .description(description)
                        .quantity(qty)
                        .unitPrice(svcLine.getPrice())
                        .totalPrice(lineTotal)
                        .sortOrder(sortOrder++)
                        .build();
                invoice.getLines().add(line);
                total = total.add(lineTotal);
            }
        }

        invoice.setTotalAmount(total.setScale(SCALE, ROUNDING));

        Invoice saved = invoiceRepository.save(invoice);
        log.info("Created invoice [{}] for WorkOrder [{}], total={}", number, order.getNumber(), total);
        return saved;
    }

    /**
     * Marks an invoice as PAID, setting the paidAt timestamp.
     *
     * @param id invoice ID
     * @return the updated Invoice
     */
    @Transactional
    public Invoice markPaid(UUID id) {
        Invoice invoice = findById(id);
        invoice.setStatus("PAID");
        invoice.setPaidAt(ZonedDateTime.now(MOSCOW));
        Invoice saved = invoiceRepository.save(invoice);
        log.info("Invoice [{}] marked as PAID", invoice.getNumber());
        return saved;
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    String generateNumber() {
        int year = ZonedDateTime.now(MOSCOW).getYear();
        long seq = sequence.incrementAndGet();
        return String.format("%s-%d-%06d", INV_PREFIX, year, seq);
    }
}
