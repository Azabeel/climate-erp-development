package ru.servisklimat.api.dto.workorder;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AddServiceLineRequest(
        @NotNull UUID serviceId,
        Integer quantity
) {}
