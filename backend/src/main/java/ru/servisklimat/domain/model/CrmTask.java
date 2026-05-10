package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "crm_tasks")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CrmTask {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "lead_id")
    private UUID leadId;

    @Column(name = "deal_id")
    private UUID dealId;

    @Column(name = "client_id")
    private UUID clientId;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "type", length = 30)
    @Builder.Default
    private String type = "CALL";

    @Column(name = "due_date")
    private ZonedDateTime dueDate;

    @Column(name = "completed_at")
    private ZonedDateTime completedAt;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(name = "created_by")
    private UUID createdBy;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
