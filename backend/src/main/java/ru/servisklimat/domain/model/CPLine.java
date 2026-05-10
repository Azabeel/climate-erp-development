package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "cp_lines")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CPLine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id", nullable = false)
    private CommercialProposal proposal;

    @Column(name = "description", nullable = false, length = 500)
    private String description;

    @Column(name = "quantity", precision = 10, scale = 3)
    @Builder.Default
    private BigDecimal quantity = BigDecimal.ONE;

    @Column(name = "unit", length = 20)
    @Builder.Default
    private String unit = "шт";

    @Column(name = "unit_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "sort_order")
    @Builder.Default
    private int sortOrder = 0;
}
