package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "engineer_day_logs")
@EntityListeners(AuditingEntityListener.class)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EngineerDayLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "engineer_id", nullable = false)
    private Engineer engineer;

    @Column(name = "date", nullable = false)
    private LocalDate date;

    @Column(name = "start_type", length = 10)
    @Builder.Default
    private String startType = "HOME";

    @Column(name = "start_lat", precision = 10, scale = 6)
    private BigDecimal startLat;

    @Column(name = "start_lng", precision = 10, scale = 6)
    private BigDecimal startLng;

    /**
     * GPS track stored as JSON text (mapped from gps_track JSONB column in V001).
     */
    @Column(name = "gps_track", columnDefinition = "jsonb")
    @Builder.Default
    private String gpsTrackJson = "[]";

    /**
     * Total distance in km (mapped from total_km column in V001).
     */
    @Column(name = "total_km", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal totalDistanceKm = BigDecimal.ZERO;

    // The following fields are calculated/stored in memory but not persisted to V001 schema.
    // They are transient to avoid mapping issues with missing columns.

    @Transient
    @Builder.Default
    private int workMinutes = 0;

    @Transient
    @Builder.Default
    private int ordersCompleted = 0;

    /**
     * Total revenue generated during this day.
     * Transient — calculated from work orders, not stored in day_log table.
     */
    @Transient
    @Builder.Default
    private BigDecimal totalRevenue = BigDecimal.ZERO;

    @Column(name = "start_time")
    private ZonedDateTime startTime;

    @Column(name = "end_time")
    private ZonedDateTime endTime;
}
