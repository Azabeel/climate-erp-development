package ru.servisklimat.api.dto.hr;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PayslipDto {
    private UUID id;
    private UUID engineerId;
    private String period;
    private BigDecimal totalGross;
    private String detailsJson;
    private boolean isVisible;
    private ZonedDateTime createdAt;
}
