package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.InboxMessage;
import ru.servisklimat.domain.model.enums.Channel;
import ru.servisklimat.domain.repository.ClientRepository;
import ru.servisklimat.domain.repository.InboxRepository;

import java.time.ZonedDateTime;
import java.util.UUID;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class InboxService {

    private final InboxRepository inboxRepository;
    private final ClientRepository clientRepository;

    @Transactional
    public InboxMessage receive(Channel channel, String externalId, String phone, String body) {
        InboxMessage.InboxMessageBuilder builder = InboxMessage.builder()
                .channel(channel)
                .externalId(externalId)
                .phone(phone)
                .body(body);

        if (phone != null && !phone.isBlank()) {
            clientRepository.findByPhone(phone)
                    .ifPresent(client -> builder.clientId(client.getId()));
        }

        InboxMessage message = builder.build();
        InboxMessage saved = inboxRepository.save(message);
        log.info("Inbox message received: channel={}, externalId={}, clientId={}", channel, externalId, saved.getClientId());
        return saved;
    }

    @Transactional
    public InboxMessage markRead(UUID id) {
        InboxMessage message = getOrThrow(id);
        message.setRead(true);
        message.setProcessedAt(ZonedDateTime.now());
        return inboxRepository.save(message);
    }

    @Transactional
    public InboxMessage assignToWorkOrder(UUID messageId, UUID workOrderId) {
        InboxMessage message = getOrThrow(messageId);
        message.setWorkOrderId(workOrderId);
        return inboxRepository.save(message);
    }

    public Page<InboxMessage> findAll(Pageable pageable) {
        return inboxRepository.findAll(pageable);
    }

    public Page<InboxMessage> findUnread(Pageable pageable) {
        return inboxRepository.findByIsReadFalse(pageable);
    }

    private InboxMessage getOrThrow(UUID id) {
        return inboxRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("InboxMessage not found: " + id));
    }
}
