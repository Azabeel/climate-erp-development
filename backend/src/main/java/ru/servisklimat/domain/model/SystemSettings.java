package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "system_settings")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "key", nullable = false, unique = true, length = 100)
    private String key;

    @Column(name = "value")
    private String value;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "updated_by")
    private UUID updatedBy;

    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
