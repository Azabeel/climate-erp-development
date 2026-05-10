package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import ru.servisklimat.domain.model.enums.StockLocationType;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_balances")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(name = "stock_item_id", nullable = false)
    private UUID stockItemId;

    @Enumerated(EnumType.STRING)
    @Column(name = "location_type", nullable = false)
    private StockLocationType locationType;

    @Column(name = "engineer_id")
    private UUID engineerId;

    @Column(precision = 10, scale = 3)
    private BigDecimal qty;

    @Column(name = "reserved_qty", precision = 10, scale = 3)
    private BigDecimal reservedQty;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @PrePersist
    @PreUpdate
    protected void onUpdate() {
        updatedAt = ZonedDateTime.now();
        if (qty == null) {
            qty = BigDecimal.ZERO;
        }
        if (reservedQty == null) {
            reservedQty = BigDecimal.ZERO;
        }
    }

    public BigDecimal getAvailableQty() {
        return qty.subtract(reservedQty);
    }
}
