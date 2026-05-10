package ru.servisklimat.api.dto.purchase;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record CreatePaymentRequestDto(
        @NotNull @Positive BigDecimal amount,
        String invoiceUrl,
        LocalDate dueDate,
        UUID supplierId,
        String paymentNote
) {}
