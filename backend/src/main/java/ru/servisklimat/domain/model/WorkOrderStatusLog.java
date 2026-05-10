package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ru.servisklimat.domain.model.enums.WorkOrderStatus;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "work_order_status_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderStatusLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @Enumerated(EnumType.STRING)
    @Column(name = "old_status", length = 30)
    private WorkOrderStatus oldStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "new_status", nullable = false, length = 30)
    private WorkOrderStatus newStatus;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    @Column(name = "lat", precision = 10, scale = 6)
    private BigDecimal lat;

    @Column(name = "lng", precision = 10, scale = 6)
    private BigDecimal lng;

    @Column(name = "changed_by")
    private UUID changedBy;

    @Column(name = "changed_at")
    private ZonedDateTime changedAt;
}
