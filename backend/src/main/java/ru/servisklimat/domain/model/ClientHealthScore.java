package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Table(name = "client_health_scores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClientHealthScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "client_id", unique = true, nullable = false)
    private UUID clientId;

    @Column(name = "score")
    @Builder.Default
    private int score = 100;

    @Column(name = "last_order_date")
    private LocalDate lastOrderDate;

    @Column(name = "orders_last_12m")
    @Builder.Default
    private int ordersLast12m = 0;

    @Column(name = "avg_rating", precision = 3, scale = 1)
    private BigDecimal avgRating;

    @Column(name = "open_complaints")
    @Builder.Default
    private int openComplaints = 0;

    @Column(name = "contract_active")
    @Builder.Default
    private boolean contractActive = false;

    @Column(name = "calculated_at")
    @Builder.Default
    private ZonedDateTime calculatedAt = ZonedDateTime.now();
}
