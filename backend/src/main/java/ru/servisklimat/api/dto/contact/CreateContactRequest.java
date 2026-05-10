package ru.servisklimat.api.dto.contact;

import jakarta.validation.constraints.NotBlank;
import ru.servisklimat.domain.model.enums.Channel;

public record CreateContactRequest(
        @NotBlank String fullName,
        String position,
        @NotBlank String phone,
        String email,
        Channel preferredChannel,
        String telegramChatId,
        String whatsappNumber,
        Boolean isPrimary
) {}
