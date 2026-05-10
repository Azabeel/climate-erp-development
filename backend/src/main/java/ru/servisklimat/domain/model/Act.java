package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "acts")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Act {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "work_order_id")
    private UUID workOrderId;

    @Column(name = "invoice_id")
    private UUID invoiceId;

    @Column(name = "client_id")
    private UUID clientId;

    @Column(name = "number", nullable = false, unique = true, length = 50)
    private String number;

    @Column(name = "total_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "signed_at")
    private ZonedDateTime signedAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
