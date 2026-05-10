package ru.servisklimat.api.dto.purchase;

import jakarta.validation.constraints.NotBlank;

public record UpdateItemStatusRequest(
        @NotBlank String status,
        String trackingNumber,
        String carrierName
) {}
