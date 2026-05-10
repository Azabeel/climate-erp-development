package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.api.dto.client.ClientDto;
import ru.servisklimat.api.dto.client.CreateClientRequest;
import ru.servisklimat.api.dto.client.UpdateClientRequest;
import ru.servisklimat.api.dto.contact.ContactDto;
import ru.servisklimat.api.dto.contact.CreateContactRequest;
import ru.servisklimat.api.mapper.ClientMapper;
import ru.servisklimat.api.mapper.ContactMapper;
import jakarta.persistence.EntityNotFoundException;
import ru.servisklimat.domain.model.Client;
import ru.servisklimat.domain.model.Contact;
import ru.servisklimat.domain.repository.ClientRepository;
import ru.servisklimat.domain.repository.ContactRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ClientService {

    private final ClientRepository clientRepository;
    private final ContactRepository contactRepository;
    private final ClientMapper clientMapper;
    private final ContactMapper contactMapper;

    public Page<ClientDto> findAll(Pageable pageable) {
        return clientRepository.findByIsActiveTrue(pageable).map(clientMapper::toDto);
    }

    public ClientDto findById(UUID id) {
        return clientMapper.toDto(getOrThrow(id));
    }

    @Transactional
    public ClientDto create(CreateClientRequest request) {
        Client client = clientMapper.toEntity(request);
        return clientMapper.toDto(clientRepository.save(client));
    }

    @Transactional
    public ClientDto update(UUID id, UpdateClientRequest request) {
        Client client = getOrThrow(id);
        clientMapper.updateEntity(request, client);
        return clientMapper.toDto(clientRepository.save(client));
    }

    @Transactional
    public void deactivate(UUID id) {
        Client client = getOrThrow(id);
        client.setIsActive(false);
        clientRepository.save(client);
    }

    public List<ContactDto> getContacts(UUID clientId) {
        getOrThrow(clientId);
        return contactRepository.findByClientIdAndIsActiveTrue(clientId)
                .stream()
                .map(contactMapper::toDto)
                .toList();
    }

    @Transactional
    public ContactDto addContact(UUID clientId, CreateContactRequest request) {
        Client client = getOrThrow(clientId);
        Contact contact = contactMapper.toEntity(request);
        contact.setClient(client);
        return contactMapper.toDto(contactRepository.save(contact));
    }

    private Client getOrThrow(UUID id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + id));
    }
}
