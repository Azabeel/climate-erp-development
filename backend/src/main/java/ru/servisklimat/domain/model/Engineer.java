package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "engineers")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Engineer {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "employment_type", length = 20)
    @Builder.Default
    private String employmentType = "EMPLOYEE";

    @Column(name = "home_address")
    private String homeAddress;

    @Column(name = "home_lat", precision = 10, scale = 6)
    private BigDecimal homeLat;

    @Column(name = "home_lng", precision = 10, scale = 6)
    private BigDecimal homeLng;

    @Column(name = "vehicle_type", length = 20)
    @Builder.Default
    private String vehicleType = "OWN_CAR";

    @Column(name = "fuel_rate_per_km", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal fuelRatePerKm = BigDecimal.ZERO;

    @Column(name = "hourly_rate", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal hourlyRate = BigDecimal.ZERO;

    @Column(name = "has_all_competencies")
    @Builder.Default
    private Boolean hasAllCompetencies = false;

    @Column(name = "use_in_auto_scheduler")
    @Builder.Default
    private Boolean useInAutoScheduler = true;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "external_id", length = 100)
    private String externalId;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "engineer_competencies",
        joinColumns = @JoinColumn(name = "engineer_id"),
        inverseJoinColumns = @JoinColumn(name = "competency_id")
    )
    @Builder.Default
    private Set<Competency> competencies = new HashSet<>();

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
