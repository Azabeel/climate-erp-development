package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "sla_configs")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SLAConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "level", nullable = false, length = 20)
    private String level;

    @Column(name = "contract_id")
    private UUID contractId;

    @Column(name = "ttr_hours", precision = 10, scale = 2)
    private BigDecimal ttrHours;

    @Column(name = "tto_hours", precision = 10, scale = 2)
    private BigDecimal ttoHours;

    @Column(name = "ttf_hours", precision = 10, scale = 2)
    private BigDecimal ttfHours;

    @Column(name = "critical_metric", length = 10)
    @Builder.Default
    private String criticalMetric = "TTF";

    @Column(name = "warning_percent")
    @Builder.Default
    private Integer warningPercent = 20;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @OneToMany(mappedBy = "slaConfig", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<SLAServiceHours> serviceHours = new ArrayList<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
