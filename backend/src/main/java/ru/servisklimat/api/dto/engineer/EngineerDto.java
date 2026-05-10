package ru.servisklimat.api.dto.engineer;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.UUID;

public record EngineerDto(
        UUID id,
        UUID userId,
        String fullName,
        String phone,
        String email,
        String employmentType,
        String homeAddress,
        BigDecimal homeLat,
        BigDecimal homeLng,
        String vehicleType,
        BigDecimal fuelRatePerKm,
        BigDecimal hourlyRate,
        Boolean hasAllCompetencies,
        Boolean useInAutoScheduler,
        Boolean isActive,
        String externalId,
        ZonedDateTime createdAt
) {}
