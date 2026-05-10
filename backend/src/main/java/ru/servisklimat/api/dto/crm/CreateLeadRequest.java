package ru.servisklimat.api.dto.crm;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CreateLeadRequest(
        @NotBlank String name,
        String phone,
        String email,
        String source,
        String description,
        UUID clientId,
        UUID assignedTo
) {}
