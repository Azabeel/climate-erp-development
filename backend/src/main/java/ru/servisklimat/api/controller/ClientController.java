package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.client.ClientDto;
import ru.servisklimat.api.dto.client.CreateClientRequest;
import ru.servisklimat.api.dto.client.UpdateClientRequest;
import ru.servisklimat.api.dto.contact.ContactDto;
import ru.servisklimat.api.dto.contact.CreateContactRequest;
import ru.servisklimat.domain.service.ClientService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
public class ClientController {

    private final ClientService clientService;

    @GetMapping
    public ResponseEntity<Page<ClientDto>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(clientService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClientDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ClientDto> create(@Valid @RequestBody CreateClientRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(clientService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClientDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateClientRequest request) {
        return ResponseEntity.ok(clientService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deactivate(@PathVariable UUID id) {
        clientService.deactivate(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/contacts")
    public ResponseEntity<List<ContactDto>> getContacts(@PathVariable UUID id) {
        return ResponseEntity.ok(clientService.getContacts(id));
    }

    @PostMapping("/{id}/contacts")
    public ResponseEntity<ContactDto> addContact(
            @PathVariable UUID id,
            @Valid @RequestBody CreateContactRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(clientService.addContact(id, request));
    }
}
