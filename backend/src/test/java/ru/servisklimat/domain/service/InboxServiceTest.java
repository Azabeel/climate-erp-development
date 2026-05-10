package ru.servisklimat.domain.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import ru.servisklimat.domain.model.Client;
import ru.servisklimat.domain.model.InboxMessage;
import ru.servisklimat.domain.model.enums.Channel;
import ru.servisklimat.domain.model.enums.ClientType;
import ru.servisklimat.domain.repository.ClientRepository;
import ru.servisklimat.domain.repository.InboxRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InboxServiceTest {

    @Mock
    InboxRepository inboxRepository;

    @Mock
    ClientRepository clientRepository;

    @InjectMocks
    InboxService inboxService;

    @Test
    void receive_createsInboxMessageAndSaves() {
        InboxMessage saved = InboxMessage.builder()
                .id(UUID.randomUUID())
                .channel(Channel.TELEGRAM)
                .externalId("tg-123")
                .phone("+79001234567")
                .body("Hello!")
                .build();
        when(inboxRepository.save(any())).thenReturn(saved);
        when(clientRepository.findByPhone(any())).thenReturn(Optional.empty());

        InboxMessage result = inboxService.receive(Channel.TELEGRAM, "tg-123", "+79001234567", "Hello!");

        assertThat(result).isNotNull();
        assertThat(result.getChannel()).isEqualTo(Channel.TELEGRAM);
        assertThat(result.getBody()).isEqualTo("Hello!");
        verify(inboxRepository, times(1)).save(any(InboxMessage.class));
    }

    @Test
    void receive_withExistingClientByPhone_setsClientId() {
        UUID clientId = UUID.randomUUID();
        Client client = Client.builder()
                .id(clientId)
                .type(ClientType.INDIVIDUAL)
                .name("Иван Иванов")
                .phone("+79001234567")
                .build();

        when(clientRepository.findByPhone("+79001234567")).thenReturn(Optional.of(client));

        ArgumentCaptor<InboxMessage> captor = ArgumentCaptor.forClass(InboxMessage.class);
        InboxMessage saved = InboxMessage.builder()
                .id(UUID.randomUUID())
                .channel(Channel.WHATSAPP)
                .phone("+79001234567")
                .clientId(clientId)
                .body("Нужна помощь")
                .build();
        when(inboxRepository.save(any())).thenReturn(saved);

        InboxMessage result = inboxService.receive(Channel.WHATSAPP, null, "+79001234567", "Нужна помощь");

        verify(inboxRepository).save(captor.capture());
        assertThat(captor.getValue().getClientId()).isEqualTo(clientId);
        assertThat(result.getClientId()).isEqualTo(clientId);
    }

    @Test
    void markRead_setsIsReadTrue() {
        UUID id = UUID.randomUUID();
        InboxMessage message = InboxMessage.builder()
                .id(id)
                .channel(Channel.EMAIL)
                .body("Test email")
                .isRead(false)
                .build();

        when(inboxRepository.findById(id)).thenReturn(Optional.of(message));
        when(inboxRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        InboxMessage result = inboxService.markRead(id);

        assertThat(result.isRead()).isTrue();
        assertThat(result.getProcessedAt()).isNotNull();
        verify(inboxRepository).save(message);
    }

    @Test
    void findUnread_delegatesToRepository() {
        PageRequest pageable = PageRequest.of(0, 10);
        InboxMessage msg = InboxMessage.builder()
                .id(UUID.randomUUID())
                .channel(Channel.TELEGRAM)
                .body("Unread")
                .isRead(false)
                .build();
        Page<InboxMessage> page = new PageImpl<>(List.of(msg));
        when(inboxRepository.findByIsReadFalse(pageable)).thenReturn(page);

        Page<InboxMessage> result = inboxService.findUnread(pageable);

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).isRead()).isFalse();
        verify(inboxRepository).findByIsReadFalse(pageable);
    }
}
