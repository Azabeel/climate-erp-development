package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "purchase_requests")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "number", nullable = false, unique = true, length = 50)
    private String number;

    @Column(name = "work_order_id")
    private UUID workOrderId;

    @Column(name = "engineer_id")
    private UUID engineerId;

    @Column(name = "responsible_user_id")
    private UUID responsibleUserId;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "NEW";

    @Column(name = "latest_delivery_date")
    private LocalDate latestDeliveryDate;

    @Column(name = "client_notified")
    @Builder.Default
    private Boolean clientNotified = false;

    @CreatedDate
    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @OneToMany(mappedBy = "request", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseRequestItem> items = new ArrayList<>();
}
