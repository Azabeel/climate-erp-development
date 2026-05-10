package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import ru.servisklimat.domain.model.enums.ExecutionType;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "services")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Service {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "short_name", length = 100)
    private String shortName;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "specification", columnDefinition = "TEXT")
    private String specification;

    @Column(name = "base_duration_minutes", nullable = false)
    @Builder.Default
    private int baseDurationMinutes = 60;

    @Enumerated(EnumType.STRING)
    @Column(name = "execution_type", length = 20)
    @Builder.Default
    private ExecutionType executionType = ExecutionType.SEQUENTIAL;

    @Column(name = "base_price", precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "RUB";

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ServiceModifier> modifiers = new ArrayList<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "service_competencies",
        joinColumns = @JoinColumn(name = "service_id"),
        inverseJoinColumns = @JoinColumn(name = "competency_id")
    )
    @Builder.Default
    private Set<Competency> requiredCompetencies = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "service_brands",
        joinColumns = @JoinColumn(name = "service_id"),
        inverseJoinColumns = @JoinColumn(name = "brand_id")
    )
    @Builder.Default
    private Set<Brand> applicableBrands = new HashSet<>();
}
