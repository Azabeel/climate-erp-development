package ru.servisklimat.api.dto.purchase;

import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

public record PurchaseRequestDto(
        UUID id,
        String number,
        UUID workOrderId,
        UUID engineerId,
        UUID responsibleUserId,
        String status,
        LocalDate latestDeliveryDate,
        Boolean clientNotified,
        ZonedDateTime createdAt,
        ZonedDateTime updatedAt,
        List<PurchaseRequestItemDto> items
) {}
