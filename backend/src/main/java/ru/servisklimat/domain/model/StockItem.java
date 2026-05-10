package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "stock_items")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockItem {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String name;

    private String article;

    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'шт'")
    private String unit;

    private String category;

    @Column(name = "brand_id")
    private UUID brandId;

    @Column(name = "min_stock_level", precision = 10, scale = 3)
    private BigDecimal minStockLevel;

    @Column(name = "purchase_price", precision = 12, scale = 2)
    private BigDecimal purchasePrice;

    @Column(name = "sale_price", precision = 12, scale = 2)
    private BigDecimal salePrice;

    private String barcode;

    @Column(name = "external_id")
    private String externalId;

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
        if (unit == null) {
            unit = "шт";
        }
    }
}
