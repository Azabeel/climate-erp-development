package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "integration_log")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IntegrationLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "system", nullable = false, length = 50)
    private String system;

    @Column(name = "direction", nullable = false, length = 10)
    private String direction;

    @Column(name = "document_type", length = 100)
    private String documentType;

    @Column(name = "document_id")
    private UUID documentId;

    @Column(name = "request_payload", columnDefinition = "JSONB")
    private String requestPayload;

    @Column(name = "response_payload", columnDefinition = "JSONB")
    private String responsePayload;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "attempt_count")
    @Builder.Default
    private Integer attemptCount = 1;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @Column(name = "completed_at")
    private ZonedDateTime completedAt;
}
