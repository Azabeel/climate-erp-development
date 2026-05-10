package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "commercial_proposals")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommercialProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deal_id", nullable = false)
    private Deal deal;

    @Column(name = "client_id", nullable = false)
    private UUID clientId;

    @Column(name = "number", unique = true, nullable = false, length = 50)
    private String number;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "variant", length = 20)
    @Builder.Default
    private String variant = "STANDARD";

    @Column(name = "total_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(name = "valid_until")
    private LocalDate validUntil;

    @Column(name = "status", length = 20)
    @Builder.Default
    private String status = "DRAFT";

    @Column(name = "pdf_url", length = 500)
    private String pdfUrl;

    @Column(name = "sent_at")
    private ZonedDateTime sentAt;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private ZonedDateTime updatedAt;

    @OneToMany(mappedBy = "proposal", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("sortOrder ASC")
    private List<CPLine> lines = new ArrayList<>();
}
