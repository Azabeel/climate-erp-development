package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ru.servisklimat.domain.model.enums.StockLocationType;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "refrigerant_cylinders")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefrigerantCylinder {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "serial_number", unique = true, nullable = false)
    private String serialNumber;

    @Column(name = "refrigerant_type_id", nullable = false)
    private UUID refrigerantTypeId;

    @Column(name = "initial_weight_kg", nullable = false, precision = 10, scale = 3)
    private BigDecimal initialWeightKg;

    @Column(name = "current_weight_kg", nullable = false, precision = 10, scale = 3)
    private BigDecimal currentWeightKg;

    @Column(name = "engineer_id")
    private UUID engineerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_type")
    private StockLocationType locationType;

    @Column(name = "purchase_price", precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "is_active")
    private Boolean isActive;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
        if (isActive == null) {
            isActive = true;
        }
        if (locationType == null) {
            locationType = StockLocationType.CENTRAL;
        }
    }
}
