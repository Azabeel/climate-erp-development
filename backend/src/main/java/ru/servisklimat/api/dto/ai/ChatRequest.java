package ru.servisklimat.api.dto.ai;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ChatRequest(
        @NotNull UUID workOrderId,
        @NotBlank String message,
        UUID userId
) {}
