package ru.servisklimat.api.dto.engineer;

import java.time.LocalDate;
import java.util.UUID;

public record CertificationDto(
        UUID id,
        UUID engineerId,
        UUID brandId,
        String certName,
        LocalDate issuedAt,
        LocalDate expiresAt,
        String certUrl
) {}
