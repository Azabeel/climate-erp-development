package ru.servisklimat.api.dto.equipment;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public record EquipmentDto(
        UUID id,
        UUID clientId,
        UUID locationId,
        UUID equipmentTypeId,
        String serialNumber,
        String inventoryNumber,
        String name,
        String model,
        UUID brandId,
        String refrigerantType,
        BigDecimal powerKw,
        String status,
        LocalDate warrantyStart,
        LocalDate warrantyEnd,
        UUID contractId,
        String qrCodeUrl,
        LocalDate lastServiceDate,
        LocalDate predictedFailureDate,
        Boolean isActive,
        ZonedDateTime createdAt
) {}
