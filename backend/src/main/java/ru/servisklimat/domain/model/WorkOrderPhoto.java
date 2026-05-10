package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "work_order_photos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    /**
     * Photo type: "BEFORE", "AFTER", "OTHER"
     */
    @Column(name = "photo_type", length = 10)
    private String photoType;

    @Column(name = "url", length = 500)
    private String url;

    @Column(name = "service_id")
    private UUID serviceId;

    @Column(name = "uploaded_by")
    private UUID uploadedBy;

    @Column(name = "uploaded_at")
    private ZonedDateTime uploadedAt;
}
