package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "purchase_request_items")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequestItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_request_id", nullable = false)
    private PurchaseRequest request;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "article", length = 100)
    private String article;

    @Column(name = "qty", nullable = false, precision = 10, scale = 3)
    @Builder.Default
    private BigDecimal qty = BigDecimal.ONE;

    @Column(name = "unit", length = 20)
    @Builder.Default
    private String unit = "шт";

    @Column(name = "supplier_id")
    private UUID supplierId;

    @Column(name = "purchase_price", precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "RUB";

    @Column(name = "markup_percent", precision = 8, scale = 2)
    private BigDecimal markupPercent;

    @Column(name = "markup_amount", precision = 12, scale = 2)
    private BigDecimal markupAmount;

    @Column(name = "sale_price", precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "planned_delivery_date")
    private LocalDate plannedDeliveryDate;

    @Column(name = "carrier_name", length = 100)
    private String carrierName;

    @Column(name = "tracking_number", length = 100)
    private String trackingNumber;

    @Column(name = "invoice_url", length = 500)
    private String invoiceUrl;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "NEW";

    @Column(name = "payment_request_id")
    private UUID paymentRequestId;

    @Column(name = "engineer_comment")
    private String engineerComment;

    @CreatedDate
    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @OneToMany(mappedBy = "purchaseItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PaymentRequest> payments = new ArrayList<>();
}
