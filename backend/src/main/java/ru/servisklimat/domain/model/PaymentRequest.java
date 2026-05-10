package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "payment_requests")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_request_item_id", nullable = false)
    private PurchaseRequestItem purchaseItem;

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "RUB";

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "invoice_url", length = 500)
    private String invoiceUrl;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String paymentStatus = "PENDING";

    @Column(name = "accountant_user_id")
    private UUID accountantUserId;

    @Column(name = "paid_at")
    private ZonedDateTime paidAt;

    @Column(name = "payment_note")
    private String paymentNote;

    @CreatedDate
    @Column(name = "created_at")
    private ZonedDateTime createdAt;
}
