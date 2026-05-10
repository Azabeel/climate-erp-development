package ru.servisklimat.api.dto.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public record InvoiceDto(
        UUID id,
        UUID workOrderId,
        UUID clientId,
        String number,
        BigDecimal totalAmount,
        String status,
        ZonedDateTime issuedAt,
        LocalDate dueDate,
        ZonedDateTime paidAt,
        int lineCount
) {}
