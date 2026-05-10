package ru.servisklimat.api.dto.hr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollItemDto {
    private UUID id;
    private UUID engineerId;
    private String engineerName;
    private BigDecimal pieceRateEarnings;
    private BigDecimal gsmCompensation;
    private BigDecimal bonuses;
    private BigDecimal deductions;
    private BigDecimal totalGross;
    private LocalDate periodStart;
    private LocalDate periodEnd;
}
