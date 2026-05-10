package ru.servisklimat.api.dto.engineer;

import java.math.BigDecimal;
import java.util.UUID;

public record UpdateEngineerRequest(
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
        String externalId
) {}
