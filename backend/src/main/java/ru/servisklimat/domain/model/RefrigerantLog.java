package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ru.servisklimat.domain.model.enums.RefrigerantOperation;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "refrigerant_log")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefrigerantLog {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "work_order_id")
    private UUID workOrderId;

    @Column(name = "equipment_id")
    private UUID equipmentId;

    @Column(name = "engineer_id")
    private UUID engineerId;

    @Column(name = "cylinder_id", nullable = false)
    private UUID cylinderId;

    @Column(name = "refrigerant_type_id", nullable = false)
    private UUID refrigerantTypeId;

    @Enumerated(EnumType.STRING)
    @Column(name = "operation_type", nullable = false)
    private RefrigerantOperation operationType;

    @Column(name = "amount_kg", nullable = false, precision = 10, scale = 3)
    private BigDecimal amountKg;

    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice;

    private String notes;

    @Column(name = "created_by")
    private UUID createdBy;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
    }
}
