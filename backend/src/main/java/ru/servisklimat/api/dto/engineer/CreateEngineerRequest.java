package ru.servisklimat.api.dto.engineer;

import jakarta.validation.constraints.NotBlank;

import java.math.BigDecimal;
import java.util.UUID;

public record CreateEngineerRequest(
        UUID userId,
        @NotBlank String fullName,
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
        String externalId
) {}
