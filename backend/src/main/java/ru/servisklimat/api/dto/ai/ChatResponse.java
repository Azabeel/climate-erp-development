package ru.servisklimat.api.dto.ai;

import java.util.UUID;

public record ChatResponse(
        String response,
        UUID conversationId
) {}
