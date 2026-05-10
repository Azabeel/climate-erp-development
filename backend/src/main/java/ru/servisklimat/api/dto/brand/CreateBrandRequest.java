package ru.servisklimat.api.dto.brand;

import jakarta.validation.constraints.NotBlank;

public record CreateBrandRequest(
        @NotBlank String name
) {}
