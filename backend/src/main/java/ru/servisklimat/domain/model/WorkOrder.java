package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import ru.servisklimat.domain.model.enums.*;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "work_orders")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WorkOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "number", nullable = false, unique = true, length = 50)
    private String number;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    @Builder.Default
    private WorkOrderType type = WorkOrderType.REPAIR;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private WorkOrderStatus status = WorkOrderStatus.NEW;

    @Enumerated(EnumType.STRING)
    @Column(name = "priority", length = 20)
    @Builder.Default
    private Priority priority = Priority.NORMAL;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", length = 20)
    @Builder.Default
    private WorkOrderSource source = WorkOrderSource.MANUAL;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id")
    private Contract contract;

    @Column(name = "contact_id")
    private UUID contactId;

    @Column(name = "location_id")
    private UUID locationId;

    @Column(name = "equipment_id")
    private UUID equipmentId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sla_config_id")
    private SLAConfig slaConfig;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "dispatcher_comment", columnDefinition = "TEXT")
    private String dispatcherComment;

    @Column(name = "engineer_report", columnDefinition = "TEXT")
    private String engineerReport;

    @Column(name = "total_estimated_duration_minutes")
    private Integer totalEstimatedDurationMinutes;

    @Column(name = "has_parallel_tasks")
    @Builder.Default
    private boolean hasParallelTasks = false;

    @Column(name = "requires_two_engineers")
    @Builder.Default
    private boolean requiresTwoEngineers = false;

    @Column(name = "scheduled_start")
    private ZonedDateTime scheduledStart;

    @Column(name = "scheduled_end")
    private ZonedDateTime scheduledEnd;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "engineer_id")
    private Engineer engineer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "second_engineer_id")
    private Engineer secondEngineer;

    @Column(name = "actual_start")
    private ZonedDateTime actualStart;

    @Column(name = "actual_end")
    private ZonedDateTime actualEnd;

    @Column(name = "sla_ttr_planned")
    private ZonedDateTime slaTtrPlanned;

    @Column(name = "sla_ttr_actual")
    private ZonedDateTime slaTtrActual;

    @Column(name = "sla_tto_planned")
    private ZonedDateTime slaTtoPlanned;

    @Column(name = "sla_tto_actual")
    private ZonedDateTime slaTtoActual;

    @Column(name = "sla_ttf_planned")
    private ZonedDateTime slaTtfPlanned;

    @Column(name = "sla_ttf_actual")
    private ZonedDateTime slaTtfActual;

    @Enumerated(EnumType.STRING)
    @Column(name = "sla_status", length = 10)
    @Builder.Default
    private SLAStatus slaStatus = SLAStatus.GREEN;

    @Column(name = "sla_violated")
    @Builder.Default
    private boolean slaViolated = false;

    @Column(name = "sla_notified_yellow")
    @Builder.Default
    private boolean slaNotifiedYellow = false;

    @Column(name = "sla_notified_red")
    @Builder.Default
    private boolean slaNotifiedRed = false;

    @Column(name = "penalty_amount", precision = 12, scale = 2)
    private BigDecimal penaltyAmount;

    @Column(name = "cost_price", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal costPrice = BigDecimal.ZERO;

    @Column(name = "revenue", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal revenue = BigDecimal.ZERO;

    @Column(name = "margin", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal margin = BigDecimal.ZERO;

    @Column(name = "margin_percent", precision = 8, scale = 2)
    @Builder.Default
    private BigDecimal marginPercent = BigDecimal.ZERO;

    @Column(name = "client_rating")
    private Integer clientRating;

    @Column(name = "client_comment", columnDefinition = "TEXT")
    private String clientComment;

    @Column(name = "external_id", length = 100)
    private String externalId;

    @Column(name = "onec_synced")
    @Builder.Default
    private boolean onecSynced = false;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @Column(name = "closed_at")
    private ZonedDateTime closedAt;

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkOrderServiceLine> services = new ArrayList<>();

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkOrderMaterial> materials = new ArrayList<>();

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkOrderPhoto> photos = new ArrayList<>();

    @OneToMany(mappedBy = "workOrder", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<WorkOrderStatusLog> statusLogs = new ArrayList<>();
}
