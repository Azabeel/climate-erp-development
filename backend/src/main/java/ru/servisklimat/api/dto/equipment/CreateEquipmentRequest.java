package ru.servisklimat.api.dto.equipment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreateEquipmentRequest(
        @NotNull UUID clientId,
        UUID locationId,
        UUID equipmentTypeId,
        @NotBlank String name,
        String serialNumber,
        String inventoryNumber,
        String model,
        UUID brandId,
        String refrigerantType,
        BigDecimal powerKw,
        LocalDate warrantyStart,
        LocalDate warrantyEnd,
        UUID contractId
) {}
