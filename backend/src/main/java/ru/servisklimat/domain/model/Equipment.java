package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "equipment")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Equipment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "location_id")
    private UUID locationId;

    @Column(name = "parent_equipment_id")
    private UUID parentEquipmentId;

    @Column(name = "inventory_number", length = 100)
    private String inventoryNumber;

    @Column(name = "serial_number", length = 100)
    private String serialNumber;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "brand_id")
    private UUID brandId;

    @Column(name = "model", length = 255)
    private String model;

    @Column(name = "equipment_type_id")
    private UUID equipmentTypeId;

    @Column(name = "power_kw", precision = 10, scale = 2)
    private BigDecimal powerKw;

    @Column(name = "refrigerant_type", length = 20)
    private String refrigerantType;

    @Column(name = "service_area_sqm", precision = 10, scale = 2)
    private BigDecimal serviceAreaSqm;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "IN_SERVICE";

    @Column(name = "warranty_start")
    private LocalDate warrantyStart;

    @Column(name = "warranty_end")
    private LocalDate warrantyEnd;

    @Column(name = "warranty_cert_url", length = 500)
    private String warrantyCertUrl;

    @Column(name = "contract_id")
    private UUID contractId;

    @Column(name = "sla_config_id")
    private UUID slaConfigId;

    @Column(name = "qr_code_url", length = 500)
    private String qrCodeUrl;

    @Column(name = "attributes", columnDefinition = "jsonb")
    @Builder.Default
    private String attributes = "{}";

    @Column(name = "last_service_date")
    private LocalDate lastServiceDate;

    @Column(name = "predicted_failure_date")
    private LocalDate predictedFailureDate;

    @Column(name = "external_id", length = 100)
    private String externalId;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at")
    private ZonedDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = ZonedDateTime.now();
        }
    }
}
