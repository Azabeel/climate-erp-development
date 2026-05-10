package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ru.servisklimat.domain.model.enums.MovementType;
import ru.servisklimat.domain.model.enums.StockLocationType;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_movements")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovement {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "stock_item_id", nullable = false)
    private UUID stockItemId;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_location_type")
    private StockLocationType fromLocationType;

    @Column(name = "from_engineer_id")
    private UUID fromEngineerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_location_type")
    private StockLocationType toLocationType;

    @Column(name = "to_engineer_id")
    private UUID toEngineerId;

    @Column(name = "work_order_id")
    private UUID workOrderId;

    @Column(nullable = false, precision = 10, scale = 3)
    private BigDecimal qty;

    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MovementType type;

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
