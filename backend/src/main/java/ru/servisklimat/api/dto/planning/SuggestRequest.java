package ru.servisklimat.api.dto.planning;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record SuggestRequest(
        @NotNull UUID workOrderId
) {}
