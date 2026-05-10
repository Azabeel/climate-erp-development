package ru.servisklimat.api.dto.engineer;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.UUID;

public record CreateCertificationRequest(
        UUID brandId,
        @NotBlank String certName,
        LocalDate issuedAt,
        LocalDate expiresAt,
        String certUrl
) {}
