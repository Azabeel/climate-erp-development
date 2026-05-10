package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.inbox.CreateInboxMessageRequest;
import ru.servisklimat.api.dto.inbox.InboxMessageDto;
import ru.servisklimat.domain.model.InboxMessage;
import ru.servisklimat.domain.service.InboxService;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/inbox")
@RequiredArgsConstructor
public class InboxController {

    private final InboxService inboxService;

    @GetMapping
    public ResponseEntity<Page<InboxMessageDto>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(inboxService.findAll(pageable).map(this::toDto));
    }

    @GetMapping("/unread")
    public ResponseEntity<Page<InboxMessageDto>> findUnread(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(inboxService.findUnread(pageable).map(this::toDto));
    }

    @PostMapping
    public ResponseEntity<InboxMessageDto> receive(
            @Valid @RequestBody CreateInboxMessageRequest request) {
        InboxMessage message = inboxService.receive(
                request.channel(), request.externalId(), request.phone(), request.body());
        return ResponseEntity.status(HttpStatus.CREATED).body(toDto(message));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<InboxMessageDto> markRead(@PathVariable UUID id) {
        return ResponseEntity.ok(toDto(inboxService.markRead(id)));
    }

    @PutMapping("/{id}/assign-work-order")
    public ResponseEntity<InboxMessageDto> assignWorkOrder(
            @PathVariable UUID id,
            @RequestBody Map<String, UUID> body) {
        UUID workOrderId = body.get("workOrderId");
        return ResponseEntity.ok(toDto(inboxService.assignToWorkOrder(id, workOrderId)));
    }

    private InboxMessageDto toDto(InboxMessage m) {
        return new InboxMessageDto(
                m.getId(),
                m.getChannel(),
                m.getClientId(),
                m.getPhone(),
                m.getEmail(),
                m.getSubject(),
                m.getBody(),
                m.isRead(),
                m.getWorkOrderId(),
                m.getReceivedAt(),
                m.getProcessedAt()
        );
    }
}
