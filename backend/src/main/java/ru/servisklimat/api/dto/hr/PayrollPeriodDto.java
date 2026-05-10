package ru.servisklimat.api.dto.hr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayrollPeriodDto {
    private UUID id;
    private LocalDate periodStart;
    private LocalDate periodEnd;
    private String status;
    private ZonedDateTime closedAt;
    private ZonedDateTime createdAt;
}
