package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "contracts")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "number", nullable = false, length = 100)
    private String number;

    @Column(name = "date_start", nullable = false)
    private LocalDate dateStart;

    @Column(name = "date_end")
    private LocalDate dateEnd;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "ACTIVE";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sla_config_id")
    private SLAConfig slaConfig;

    @Column(name = "penalty_enabled")
    @Builder.Default
    private Boolean penaltyEnabled = false;

    @Column(name = "penalty_type", length = 10)
    private String penaltyType;

    @Column(name = "penalty_value", precision = 12, scale = 2)
    private BigDecimal penaltyValue;

    @Column(name = "budget_limit", precision = 12, scale = 2)
    private BigDecimal budgetLimit;

    @Column(name = "budget_period", length = 20)
    private String budgetPeriod;

    @Column(name = "notes")
    private String notes;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "external_id", length = 100)
    private String externalId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
