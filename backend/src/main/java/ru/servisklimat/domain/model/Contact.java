package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import ru.servisklimat.domain.model.enums.Channel;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "contacts")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "position", length = 100)
    private String position;

    @Column(name = "phone", nullable = false, length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_channel", length = 20)
    private Channel preferredChannel;

    @Column(name = "telegram_chat_id", length = 50)
    private String telegramChatId;

    @Column(name = "whatsapp_number", length = 20)
    private String whatsappNumber;

    @Column(name = "max_user_id", length = 50)
    private String maxUserId;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
