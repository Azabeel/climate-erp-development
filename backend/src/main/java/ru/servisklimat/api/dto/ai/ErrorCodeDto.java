package ru.servisklimat.api.dto.ai;

import java.util.UUID;

public record ErrorCodeDto(
        UUID id,
        UUID brandId,
        String code,
        String displayText,
        String descriptions,
        String probableCauses,
        String resolutionSteps,
        String relatedManualSection
) {}
