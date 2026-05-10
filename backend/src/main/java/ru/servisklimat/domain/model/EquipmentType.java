package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "equipment_types")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EquipmentType {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, unique = true, length = 255)
    private String name;

    // attributes_schema stored as JSONB — mapped as String for simplicity
    @Column(name = "attributes_schema", columnDefinition = "jsonb")
    @Builder.Default
    private String attributesSchema = "{}";

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;
}
