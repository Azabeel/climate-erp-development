package ru.servisklimat.api.dto.workorder;

import java.time.ZonedDateTime;
import java.util.UUID;

public record WorkOrderPhotoDto(
        UUID id,
        UUID workOrderId,
        String photoType,
        String url,
        UUID serviceId,
        UUID uploadedBy,
        ZonedDateTime uploadedAt
) {}
