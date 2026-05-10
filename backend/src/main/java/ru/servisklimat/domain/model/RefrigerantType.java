package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "refrigerant_types")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RefrigerantType {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    private Integer gwp;

    @Column(name = "ozone_depletion_potential", precision = 5, scale = 3)
    private BigDecimal ozoneDepletionPotential;

    @Column(name = "max_charge_kg", precision = 10, scale = 3)
    private BigDecimal maxChargeKg;

    @Column(name = "is_active")
    private Boolean isActive;

    @PrePersist
    protected void onCreate() {
        if (isActive == null) {
            isActive = true;
        }
    }
}
