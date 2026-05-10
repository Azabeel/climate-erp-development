package ru.servisklimat.ai.consultant;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;
import ru.servisklimat.domain.model.AiConversation;
import ru.servisklimat.domain.model.AiMessage;
import ru.servisklimat.domain.model.ErrorCode;
import ru.servisklimat.domain.repository.AiConversationRepository;
import ru.servisklimat.domain.repository.AiMessageRepository;
import ru.servisklimat.domain.service.ErrorCodeService;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TechConsultantServiceTest {

    @Mock
    AiConversationRepository conversationRepository;

    @Mock
    AiMessageRepository messageRepository;

    @Mock
    ErrorCodeService errorCodeService;

    @InjectMocks
    TechConsultantService service;

    @Test
    void chat_withErrorMessage_callsErrorCodeService() {
        UUID workOrderId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        AiConversation conv = AiConversation.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .workOrderId(workOrderId)
                .agentType("CONSULTANT")
                .build();

        ErrorCode errorCode = ErrorCode.builder()
                .id(UUID.randomUUID())
                .code("E-01")
                .displayText("Compressor overload")
                .build();

        when(conversationRepository.findFirstByWorkOrderIdOrderByCreatedAtDesc(workOrderId))
                .thenReturn(Optional.of(conv));
        when(errorCodeService.findByCode("E-01")).thenReturn(errorCode);
        when(messageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String response = service.chat(workOrderId, "I see error E-01 on display", userId);

        assertThat(response).contains("E-01").contains("Compressor overload");
        verify(errorCodeService).findByCode("E-01");
    }

    @Test
    void chat_withGenericMessage_returnsDefaultAdvice() {
        UUID workOrderId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        AiConversation conv = AiConversation.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .workOrderId(workOrderId)
                .agentType("CONSULTANT")
                .build();

        when(conversationRepository.findFirstByWorkOrderIdOrderByCreatedAtDesc(workOrderId))
                .thenReturn(Optional.of(conv));
        when(messageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String response = service.chat(workOrderId, "Кондиционер не охлаждает", userId);

        assertThat(response).contains("укажите код ошибки");
    }

    @Test
    void chat_savesBothUserAndAssistantMessages() {
        UUID workOrderId = UUID.randomUUID();
        UUID userId = UUID.randomUUID();

        AiConversation conv = AiConversation.builder()
                .id(UUID.randomUUID())
                .userId(userId)
                .workOrderId(workOrderId)
                .agentType("CONSULTANT")
                .build();

        when(conversationRepository.findFirstByWorkOrderIdOrderByCreatedAtDesc(workOrderId))
                .thenReturn(Optional.of(conv));
        when(messageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        service.chat(workOrderId, "Тестовый вопрос", userId);

        ArgumentCaptor<AiMessage> captor = ArgumentCaptor.forClass(AiMessage.class);
        verify(messageRepository, times(2)).save(captor.capture());

        List<AiMessage> saved = captor.getAllValues();
        assertThat(saved).hasSize(2);
        assertThat(saved.get(0).getRole()).isEqualTo("USER");
        assertThat(saved.get(0).getContent()).isEqualTo("Тестовый вопрос");
        assertThat(saved.get(1).getRole()).isEqualTo("ASSISTANT");
    }

    @Test
    void getHistory_returnsMessagesForWorkOrder() {
        UUID workOrderId = UUID.randomUUID();
        UUID convId = UUID.randomUUID();

        AiConversation conv = AiConversation.builder()
                .id(convId)
                .userId(UUID.randomUUID())
                .workOrderId(workOrderId)
                .agentType("CONSULTANT")
                .build();

        AiMessage msg1 = AiMessage.builder().id(UUID.randomUUID()).conversationId(convId)
                .role("USER").content("Hello").build();
        AiMessage msg2 = AiMessage.builder().id(UUID.randomUUID()).conversationId(convId)
                .role("ASSISTANT").content("Hi").build();

        when(conversationRepository.findFirstByWorkOrderIdOrderByCreatedAtDesc(workOrderId))
                .thenReturn(Optional.of(conv));
        when(messageRepository.findByConversationId(eq(convId), any(Sort.class)))
                .thenReturn(List.of(msg1, msg2));

        List<AiMessage> history = service.getHistory(workOrderId);

        assertThat(history).hasSize(2);
        assertThat(history.get(0).getRole()).isEqualTo("USER");
        assertThat(history.get(1).getRole()).isEqualTo("ASSISTANT");
    }
}
