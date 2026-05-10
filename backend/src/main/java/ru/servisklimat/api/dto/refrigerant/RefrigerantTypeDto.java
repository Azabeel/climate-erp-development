package ru.servisklimat.api.dto.refrigerant;

import java.math.BigDecimal;
import java.util.UUID;

public record RefrigerantTypeDto(
        UUID id,
        String name,
        Integer gwp,
        BigDecimal ozoneDepletionPotential,
        BigDecimal maxChargeKg,
        Boolean isActive
) {}
