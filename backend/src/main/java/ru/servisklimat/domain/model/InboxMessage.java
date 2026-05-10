package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import ru.servisklimat.domain.model.enums.Channel;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "inbox_messages")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InboxMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private Channel channel;

    @Column(name = "external_id", length = 200, unique = true)
    private String externalId;

    @Column(name = "client_id")
    private UUID clientId;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "subject", length = 500)
    private String subject;

    @Column(name = "body", columnDefinition = "TEXT")
    private String body;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(name = "work_order_id")
    private UUID workOrderId;

    @CreatedDate
    @Column(name = "received_at", updatable = false)
    private ZonedDateTime receivedAt;

    @Column(name = "processed_at")
    private ZonedDateTime processedAt;
}
