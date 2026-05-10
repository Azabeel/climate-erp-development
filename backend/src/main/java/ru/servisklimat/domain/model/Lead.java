package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import ru.servisklimat.domain.model.enums.Channel;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "leads")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Lead {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_id")
    private UUID clientId;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "phone", length = 20)
    private String phone;

    @Column(name = "email", length = 255)
    private String email;

    @Column(name = "source", length = 30)
    @Builder.Default
    private String source = "MANUAL";

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", length = 20)
    private Channel channel;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "assigned_to")
    private UUID assignedTo;

    @Column(name = "status", length = 30)
    @Builder.Default
    private String status = "NEW";

    @Column(name = "converted_to_deal_id")
    private UUID convertedToDealId;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;
}
