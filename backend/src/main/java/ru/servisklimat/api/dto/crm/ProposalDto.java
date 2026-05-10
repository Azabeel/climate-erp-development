package ru.servisklimat.api.dto.crm;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public record ProposalDto(
        UUID id,
        UUID dealId,
        UUID clientId,
        String number,
        String title,
        String variant,
        BigDecimal totalAmount,
        LocalDate validUntil,
        String status,
        ZonedDateTime sentAt,
        ZonedDateTime createdAt
) {}
