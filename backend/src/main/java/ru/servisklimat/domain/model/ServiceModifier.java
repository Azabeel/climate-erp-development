package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "service_modifiers")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ServiceModifier {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id", nullable = false)
    private Service service;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "condition_type", length = 100)
    private String conditionType;

    @Column(name = "condition_value", length = 255)
    private String conditionValue;

    @Column(name = "add_minutes")
    @Builder.Default
    private int addMinutes = 0;

    @Column(name = "multiply_factor", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal multiplyFactor = BigDecimal.ONE;
}
