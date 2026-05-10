package ru.servisklimat.domain.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.api.dto.client.ClientDto;
import ru.servisklimat.api.dto.client.CreateClientRequest;
import ru.servisklimat.api.mapper.ClientMapper;
import ru.servisklimat.api.mapper.ContactMapper;
import jakarta.persistence.EntityNotFoundException;
import ru.servisklimat.domain.model.Client;
import ru.servisklimat.domain.model.enums.ClientType;
import ru.servisklimat.domain.repository.ClientRepository;
import ru.servisklimat.domain.repository.ContactRepository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ClientServiceTest {

    @Mock
    ClientRepository clientRepository;

    @Mock
    ContactRepository contactRepository;

    @Mock
    ClientMapper clientMapper;

    @Mock
    ContactMapper contactMapper;

    @InjectMocks
    ClientService clientService;

    @Test
    void testCreateClient_success() {
        CreateClientRequest request = new CreateClientRequest(
                ClientType.INDIVIDUAL, "Иван Иванов", null, null,
                null, null, "+79001234567", null, null, null, null, null, null);

        Client client = Client.builder()
                .id(UUID.randomUUID())
                .type(ClientType.INDIVIDUAL)
                .name("Иван Иванов")
                .build();

        ClientDto expectedDto = new ClientDto(
                client.getId(), ClientType.INDIVIDUAL, "Иван Иванов",
                null, null, null, null, "+79001234567", null, null,
                null, null, null, null, null, true, null, null);

        when(clientMapper.toEntity(request)).thenReturn(client);
        when(clientRepository.save(client)).thenReturn(client);
        when(clientMapper.toDto(client)).thenReturn(expectedDto);

        ClientDto result = clientService.create(request);

        assertThat(result).isNotNull();
        assertThat(result.name()).isEqualTo("Иван Иванов");
        verify(clientRepository).save(client);
    }

    @Test
    void testFindById_throwsWhenNotFound() {
        UUID id = UUID.randomUUID();
        when(clientRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> clientService.findById(id))
                .isInstanceOf(EntityNotFoundException.class);
    }

    @Test
    void testDeactivate_setsIsActiveFalse() {
        UUID id = UUID.randomUUID();
        Client client = Client.builder()
                .id(id)
                .name("Test Client")
                .isActive(true)
                .build();

        when(clientRepository.findById(id)).thenReturn(Optional.of(client));
        when(clientRepository.save(any(Client.class))).thenReturn(client);

        clientService.deactivate(id);

        assertThat(client.getIsActive()).isFalse();
        verify(clientRepository).save(client);
    }
}
