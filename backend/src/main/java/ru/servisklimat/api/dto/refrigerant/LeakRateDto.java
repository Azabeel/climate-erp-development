package ru.servisklimat.api.dto.refrigerant;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record LeakRateDto(
        UUID equipmentId,
        BigDecimal leakRatePercent,
        BigDecimal fullChargeKg,
        BigDecimal chargedKg,
        ZonedDateTime periodStart,
        ZonedDateTime periodEnd,
        boolean exceedsThreshold
) {}
