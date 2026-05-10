package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "maintenance_plans")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MaintenancePlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "equipment_id", nullable = false)
    private UUID equipmentId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "frequency_months", nullable = false)
    @Builder.Default
    private Integer frequencyMonths = 6;

    @Column(name = "last_done_date")
    private LocalDate lastDoneDate;

    @Column(name = "next_due_date")
    private LocalDate nextDueDate;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @OneToMany(mappedBy = "maintenancePlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<MaintenancePlanItem> items = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
        if (nextDueDate == null && lastDoneDate != null) {
            nextDueDate = lastDoneDate.plusMonths(frequencyMonths);
        }
    }
}
