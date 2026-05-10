package ru.servisklimat.api.dto.ai;

import jakarta.validation.constraints.NotBlank;

public record ErrorLookupRequest(
        @NotBlank String code
) {}
