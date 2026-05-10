package ru.servisklimat.api.dto.workorder;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignEngineerRequest(
        @NotNull UUID engineerId,
        UUID secondEngineerId
) {}
