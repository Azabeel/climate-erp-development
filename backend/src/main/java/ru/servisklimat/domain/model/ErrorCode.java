package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "error_codes")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ErrorCode {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "brand_id")
    private UUID brandId;

    @Column(name = "model_pattern", length = 255)
    private String modelPattern;

    @Column(name = "code", nullable = false, length = 50)
    private String code;

    @Column(name = "display_text", length = 255)
    private String displayText;

    @Column(name = "descriptions", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private String descriptions = "{}";

    @Column(name = "probable_causes", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private String probableCauses = "[]";

    @Column(name = "resolution_steps", columnDefinition = "jsonb")
    @JdbcTypeCode(SqlTypes.JSON)
    @Builder.Default
    private String resolutionSteps = "[]";

    @Column(name = "related_manual_section", length = 255)
    private String relatedManualSection;

    @Column(name = "similar_cases_count")
    @Builder.Default
    private Integer similarCasesCount = 0;

    @CreatedDate
    @Column(name = "created_at", updatable = false)
    private ZonedDateTime createdAt;
}
