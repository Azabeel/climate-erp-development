package ru.servisklimat.api.dto.refrigerant;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;

public record CreateRefrigerantTypeRequest(
        @NotBlank String name,
        Integer gwp,
        BigDecimal ozoneDepletionPotential,
        BigDecimal maxChargeKg
) {}
