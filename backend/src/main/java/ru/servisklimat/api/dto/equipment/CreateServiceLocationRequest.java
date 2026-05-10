package ru.servisklimat.api.dto.equipment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateServiceLocationRequest(
        @NotNull UUID clientId,
        @NotBlank String name,
        @NotBlank String address,
        BigDecimal lat,
        BigDecimal lng,
        String floor,
        String room,
        String accessNotes
) {}
