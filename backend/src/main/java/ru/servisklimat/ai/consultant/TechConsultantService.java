package ru.servisklimat.ai.consultant;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.AiConversation;
import ru.servisklimat.domain.model.AiMessage;
import ru.servisklimat.domain.model.ErrorCode;
import ru.servisklimat.domain.repository.AiConversationRepository;
import ru.servisklimat.domain.repository.AiMessageRepository;
import ru.servisklimat.domain.service.ErrorCodeService;

import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Stub AI technical consultant.
 * In production would use LangChain4j + Ollama (mistral:7b) with RAG.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TechConsultantService {

    private static final String ROLE_USER = "USER";
    private static final String ROLE_ASSISTANT = "ASSISTANT";
    private static final Pattern ERROR_CODE_PATTERN = Pattern.compile("([A-Za-z][\\-]?\\d+)", Pattern.CASE_INSENSITIVE);

    private final AiConversationRepository conversationRepository;
    private final AiMessageRepository messageRepository;
    private final ErrorCodeService errorCodeService;

    @Transactional
    public String chat(UUID workOrderId, String userMessage, UUID userId) {
        // Load or create conversation for this work order
        AiConversation conversation = conversationRepository
                .findFirstByWorkOrderIdOrderByCreatedAtDesc(workOrderId)
                .orElseGet(() -> conversationRepository.save(
                        AiConversation.builder()
                                .userId(userId)
                                .workOrderId(workOrderId)
                                .agentType("CONSULTANT")
                                .build()
                ));

        // Save user message
        messageRepository.save(AiMessage.builder()
                .conversationId(conversation.getId())
                .role(ROLE_USER)
                .content(userMessage)
                .build());

        // Generate stub response
        String response = generateResponse(userMessage);

        // Save assistant response
        messageRepository.save(AiMessage.builder()
                .conversationId(conversation.getId())
                .role(ROLE_ASSISTANT)
                .content(response)
                .build());

        log.debug("TechConsultant chat: workOrder={}, response length={}", workOrderId, response.length());
        return response;
    }

    @Transactional(readOnly = true)
    public List<AiMessage> getHistory(UUID workOrderId) {
        return conversationRepository.findFirstByWorkOrderIdOrderByCreatedAtDesc(workOrderId)
                .map(conv -> messageRepository.findByConversationId(
                        conv.getId(), Sort.by(Sort.Direction.ASC, "createdAt")))
                .orElse(List.of());
    }

    private String generateResponse(String userMessage) {
        String lower = userMessage.toLowerCase(Locale.ROOT);

        if (lower.contains("error") || lower.contains("ошибка") || lower.contains("код")) {
            return lookupErrorCode(userMessage);
        }

        if (lower.contains("refrigerant") || lower.contains("хладагент") || lower.contains("фреон")) {
            return "При работе с хладагентами соблюдайте правила безопасности: " +
                   "используйте манометрический коллектор для проверки давления, " +
                   "проверьте герметичность контура течеискателем, " +
                   "при заправке соблюдайте норму заправки по документации на оборудование.";
        }

        return "Для получения помощи укажите код ошибки или симптом неисправности";
    }

    private String lookupErrorCode(String userMessage) {
        Matcher matcher = ERROR_CODE_PATTERN.matcher(userMessage);
        if (matcher.find()) {
            String code = matcher.group(1).toUpperCase(Locale.ROOT);
            try {
                ErrorCode errorCode = errorCodeService.findByCode(code);
                String display = errorCode.getDisplayText() != null ? errorCode.getDisplayText() : code;
                return String.format("Код ошибки %s: %s. " +
                        "Рекомендуемые действия: проверьте описание в журнале ошибок и следуйте инструкции по устранению.",
                        code, display);
            } catch (EntityNotFoundException e) {
                return String.format("Код ошибки %s не найден в базе знаний. " +
                        "Обратитесь к документации производителя или укажите бренд оборудования.", code);
            }
        }
        return "Укажите код ошибки в формате, например: E-01, F1, P5. " +
               "Я найду описание и рекомендации по устранению.";
    }
}
