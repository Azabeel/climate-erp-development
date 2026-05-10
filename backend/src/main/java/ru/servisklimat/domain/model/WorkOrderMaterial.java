package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "work_order_materials")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrderMaterial {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "work_order_id", nullable = false)
    private WorkOrder workOrder;

    @Column(name = "stock_item_id")
    private UUID stockItemId;

    @Column(name = "qty", precision = 10, scale = 3)
    private BigDecimal qty;

    @Column(name = "unit_price", precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "sale_price", precision = 12, scale = 2)
    private BigDecimal salePrice;

    @Column(name = "added_by")
    private UUID addedBy;

    @Column(name = "added_at")
    private ZonedDateTime addedAt;
}
