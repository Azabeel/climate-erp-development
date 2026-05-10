package ru.servisklimat.api.dto.finance;

import java.math.BigDecimal;
import java.util.UUID;

public record MarginDto(
        UUID workOrderId,
        BigDecimal revenue,
        BigDecimal costPrice,
        BigDecimal margin,
        BigDecimal marginPercent
) {}
