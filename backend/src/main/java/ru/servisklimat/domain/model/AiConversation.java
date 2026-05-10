package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ai_conversations")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiConversation {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "session_id", nullable = false)
    @Builder.Default
    private UUID sessionId = UUID.randomUUID();

    @Column(name = "agent_type", nullable = false, length = 30)
    @Builder.Default
    private String agentType = "CONSULTANT";

    @Column(name = "work_order_id")
    private UUID workOrderId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @OneToMany(mappedBy = "conversationId", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AiMessage> messages = new ArrayList<>();
}
