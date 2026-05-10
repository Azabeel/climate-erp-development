package ru.servisklimat.api.dto.planning;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignRequest(
        @NotNull UUID workOrderId,
        @NotNull UUID engineerId,
        UUID secondEngineerId  // nullable — only required when requiresTwoEngineers=true
) {}
