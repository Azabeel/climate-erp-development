package ru.servisklimat.api.dto.hr;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePayrollPeriodRequest {

    @NotNull
    private LocalDate periodStart;

    @NotNull
    private LocalDate periodEnd;
}
