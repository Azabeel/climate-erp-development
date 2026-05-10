package ru.servisklimat.api.dto.purchase;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZonedDateTime;
import java.util.UUID;

public record PaymentRequestDto(
        UUID id,
        UUID purchaseItemId,
        UUID supplierId,
        BigDecimal amount,
        String currency,
        LocalDate dueDate,
        String invoiceUrl,
        String paymentStatus,
        ZonedDateTime paidAt,
        String paymentNote,
        ZonedDateTime createdAt
) {}
