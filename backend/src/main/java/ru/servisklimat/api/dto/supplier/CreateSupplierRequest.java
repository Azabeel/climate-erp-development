package ru.servisklimat.api.dto.supplier;

import jakarta.validation.constraints.NotBlank;

public record CreateSupplierRequest(
        @NotBlank String name,
        String phone,
        String email,
        String address,
        String contactPerson,
        String notes
) {}
