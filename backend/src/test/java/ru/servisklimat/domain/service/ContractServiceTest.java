package ru.servisklimat.domain.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.api.dto.contract.ContractDto;
import ru.servisklimat.api.dto.contract.CreateContractRequest;
import ru.servisklimat.api.mapper.ContractMapper;
import ru.servisklimat.domain.model.Client;
import ru.servisklimat.domain.model.Contract;
import ru.servisklimat.domain.repository.ClientRepository;
import ru.servisklimat.domain.repository.ContractRepository;
import ru.servisklimat.domain.repository.SLAConfigRepository;

import java.time.LocalDate;
import java.util.Collections;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ContractServiceTest {

    @Mock
    ContractRepository contractRepository;

    @Mock
    ClientRepository clientRepository;

    @Mock
    SLAConfigRepository slaConfigRepository;

    @Mock
    ContractMapper contractMapper;

    @InjectMocks
    ContractService contractService;

    @Test
    void testCreate_success() {
        UUID clientId = UUID.randomUUID();
        CreateContractRequest request = new CreateContractRequest(
                clientId, "№123", LocalDate.now(), LocalDate.now().plusYears(1),
                null, false, null, null, null, null, null, null, null);

        Client client = Client.builder().id(clientId).name("ООО Тест").build();
        Contract contract = Contract.builder()
                .id(UUID.randomUUID())
                .number("№123")
                .status("ACTIVE")
                .build();
        ContractDto expectedDto = new ContractDto(
                contract.getId(), clientId, "№123",
                LocalDate.now(), LocalDate.now().plusYears(1),
                "ACTIVE", null, false, null, null, null, null, null, null, null, null, null);

        when(clientRepository.findById(clientId)).thenReturn(Optional.of(client));
        when(contractMapper.toEntity(request)).thenReturn(contract);
        when(contractRepository.save(contract)).thenReturn(contract);
        when(contractMapper.toDto(contract)).thenReturn(expectedDto);

        ContractDto result = contractService.create(request);

        assertThat(result).isNotNull();
        assertThat(result.number()).isEqualTo("№123");
        assertThat(result.status()).isEqualTo("ACTIVE");
        verify(contractRepository).save(contract);
    }

    @Test
    void testFindActiveByClient_returnsEmpty_whenNoActiveContracts() {
        UUID clientId = UUID.randomUUID();
        when(contractRepository.findByClientIdAndStatus(clientId, "ACTIVE"))
                .thenReturn(Collections.emptyList());

        Optional<ContractDto> result = contractService.findActiveByClient(clientId);

        assertThat(result).isEmpty();
    }
}
