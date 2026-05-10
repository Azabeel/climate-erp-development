package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import ru.servisklimat.domain.model.enums.Channel;
import ru.servisklimat.domain.model.enums.ClientType;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "clients")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Client {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private ClientType type;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "inn", length = 12)
    private String inn;

    @Column(name = "kpp", length = 9)
    private String kpp;

    @Column(name = "legal_address")
    private String legalAddress;

    @Column(name = "actual_address")
    private String actualAddress;

    @Column(name = "phone", length = 20)
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

    @Column(name = "health_score")
    private Integer healthScore;

    @Column(name = "external_id", length = 100)
    private String externalId;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
