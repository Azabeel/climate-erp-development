package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.domain.model.Invoice;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.repository.InvoiceRepository;
import ru.servisklimat.domain.repository.WorkOrderRepository;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InvoiceServiceTest {

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private WorkOrderRepository workOrderRepository;

    @InjectMocks
    private InvoiceService invoiceService;

    private UUID workOrderId;
    private UUID clientId;
    private WorkOrder workOrder;

    @BeforeEach
    void setUp() {
        workOrderId = UUID.randomUUID();
        clientId = UUID.randomUUID();
        workOrder = WorkOrder.builder()
                .id(workOrderId)
                .number("WO-2026-000001")
                .build();
    }

    /**
     * Test 1: create invoice generates unique number INV-{YEAR}-{SEQ:06d}
     */
    @Test
    @DisplayName("Create invoice generates INV-{YEAR}-{SEQ:06d} number")
    void createInvoice_generatesNumber() {
        when(workOrderRepository.findById(workOrderId)).thenReturn(Optional.of(workOrder));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> {
            Invoice saved = inv.getArgument(0);
            saved = Invoice.builder()
                    .id(UUID.randomUUID())
                    .workOrderId(saved.getWorkOrderId())
                    .clientId(saved.getClientId())
                    .number(saved.getNumber())
                    .totalAmount(saved.getTotalAmount())
                    .status(saved.getStatus())
                    .issuedAt(saved.getIssuedAt())
                    .dueDate(saved.getDueDate())
                    .build();
            return saved;
        });

        Invoice result = invoiceService.create(workOrderId, clientId, null);

        assertThat(result.getNumber()).matches("INV-\\d{4}-\\d{6}");
        assertThat(result.getStatus()).isEqualTo("DRAFT");
        assertThat(result.getWorkOrderId()).isEqualTo(workOrderId);
        assertThat(result.getClientId()).isEqualTo(clientId);
    }

    /**
     * Test 2: sequential create calls produce different invoice numbers.
     */
    @Test
    @DisplayName("Sequential create calls produce unique invoice numbers")
    void createInvoice_sequentialNumbers() {
        when(workOrderRepository.findById(any())).thenReturn(Optional.of(workOrder));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        Invoice inv1 = invoiceService.create(workOrderId, clientId, null);
        Invoice inv2 = invoiceService.create(workOrderId, clientId, null);

        assertThat(inv1.getNumber()).isNotEqualTo(inv2.getNumber());
    }

    /**
     * Test 3: markPaid sets status=PAID.
     */
    @Test
    @DisplayName("markPaid sets status=PAID and paidAt timestamp")
    void markPaid_setsStatusAndTimestamp() {
        UUID invoiceId = UUID.randomUUID();
        Invoice invoice = Invoice.builder()
                .id(invoiceId)
                .number("INV-2026-000001")
                .status("DRAFT")
                .totalAmount(new BigDecimal("5000.00"))
                .build();

        when(invoiceRepository.findById(invoiceId)).thenReturn(Optional.of(invoice));
        when(invoiceRepository.save(any(Invoice.class))).thenAnswer(inv -> inv.getArgument(0));

        Invoice result = invoiceService.markPaid(invoiceId);

        assertThat(result.getStatus()).isEqualTo("PAID");
        assertThat(result.getPaidAt()).isNotNull();
        assertThat(result.getPaidAt()).isBeforeOrEqualTo(ZonedDateTime.now());
    }

    /**
     * Test 4: findById not found → EntityNotFoundException.
     */
    @Test
    @DisplayName("findById with unknown ID → EntityNotFoundException")
    void findById_notFound_throwsException() {
        UUID unknownId = UUID.randomUUID();
        when(invoiceRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.findById(unknownId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining(unknownId.toString());
    }

    /**
     * Test 5: create with non-existent workOrderId → EntityNotFoundException.
     */
    @Test
    @DisplayName("Create invoice for non-existent WorkOrder → EntityNotFoundException")
    void createInvoice_workOrderNotFound() {
        UUID unknownOrderId = UUID.randomUUID();
        when(workOrderRepository.findById(unknownOrderId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> invoiceService.create(unknownOrderId, clientId, null))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining(unknownOrderId.toString());
    }

    /**
     * Test 6: generateNumber format check directly on helper method.
     */
    @Test
    @DisplayName("generateNumber format: INV-YYYY-NNNNNN")
    void generateNumber_format() {
        String number = invoiceService.generateNumber();
        assertThat(number).matches("INV-\\d{4}-\\d{6}");
    }
}
