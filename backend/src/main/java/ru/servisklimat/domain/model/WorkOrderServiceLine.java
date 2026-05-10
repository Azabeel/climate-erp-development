package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ru.servisklimat.domain.model.enums.ExecutionType;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "work_order_services")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderServiceLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    /**
     * JSONB in PostgreSQL — stored as String in Java
     */
    @Column(name = "applied_modifiers", columnDefinition = "TEXT")
    @Builder.Default
    private String appliedModifiers = "[]";

    @Column(name = "calculated_duration_minutes", nullable = false)
    private int calculatedDurationMinutes;

    @Enumerated(EnumType.STRING)
    @Column(name = "execution_type", nullable = false, length = 20)
    @Builder.Default
    private ExecutionType executionType = ExecutionType.SEQUENTIAL;

    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "quantity")
    @Builder.Default
    private int quantity = 1;

    @Column(name = "sort_order")
    @Builder.Default
    private int sortOrder = 0;
}
