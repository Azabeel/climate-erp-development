package ru.servisklimat.api.dto.planning;

import java.util.UUID;

public record EngineerSuggestionDto(
        UUID engineerId,
        String engineerName,
        double score,
        String reason
) {}
