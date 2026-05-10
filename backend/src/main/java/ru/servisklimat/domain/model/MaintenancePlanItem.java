package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "maintenance_plan_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenancePlanItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maintenance_plan_id", nullable = false)
    private MaintenancePlan maintenancePlan;

    @Column(name = "service_id")
    private UUID serviceId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Column(name = "is_mandatory")
    @Builder.Default
    private Boolean isMandatory = true;
}
