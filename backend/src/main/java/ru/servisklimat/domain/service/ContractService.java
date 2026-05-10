package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.api.dto.contract.ContractDto;
import ru.servisklimat.api.dto.contract.CreateContractRequest;
import ru.servisklimat.api.dto.contract.UpdateContractRequest;
import ru.servisklimat.api.mapper.ContractMapper;
import jakarta.persistence.EntityNotFoundException;
import ru.servisklimat.domain.model.Client;
import ru.servisklimat.domain.model.Contract;
import ru.servisklimat.domain.model.SLAConfig;
import ru.servisklimat.domain.repository.ClientRepository;
import ru.servisklimat.domain.repository.ContractRepository;
import ru.servisklimat.domain.repository.SLAConfigRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ContractService {

    private final ContractRepository contractRepository;
    private final ClientRepository clientRepository;
    private final SLAConfigRepository slaConfigRepository;
    private final ContractMapper contractMapper;

    public Page<ContractDto> findAll(Pageable pageable) {
        return contractRepository.findAll(pageable).map(contractMapper::toDto);
    }

    public ContractDto findById(UUID id) {
        return contractMapper.toDto(getOrThrow(id));
    }

    @Transactional
    public ContractDto create(CreateContractRequest request) {
        Client client = clientRepository.findById(request.clientId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + request.clientId()));

        Contract contract = contractMapper.toEntity(request);
        contract.setClient(client);

        if (request.slaConfigId() != null) {
            SLAConfig slaConfig = slaConfigRepository.findById(request.slaConfigId())
                    .orElseThrow(() -> new EntityNotFoundException("SLAConfig not found with id: " + request.slaConfigId()));
            contract.setSlaConfig(slaConfig);
        }

        return contractMapper.toDto(contractRepository.save(contract));
    }

    @Transactional
    public ContractDto update(UUID id, UpdateContractRequest request) {
        Contract contract = getOrThrow(id);
        contractMapper.updateEntity(request, contract);

        if (request.slaConfigId() != null) {
            SLAConfig slaConfig = slaConfigRepository.findById(request.slaConfigId())
                    .orElseThrow(() -> new EntityNotFoundException("SLAConfig not found with id: " + request.slaConfigId()));
            contract.setSlaConfig(slaConfig);
        }

        return contractMapper.toDto(contractRepository.save(contract));
    }

    public List<ContractDto> findByClient(UUID clientId) {
        return contractRepository.findByClientId(clientId)
                .stream()
                .map(contractMapper::toDto)
                .toList();
    }

    public Optional<ContractDto> findActiveByClient(UUID clientId) {
        return contractRepository.findByClientIdAndStatus(clientId, "ACTIVE")
                .stream()
                .findFirst()
                .map(contractMapper::toDto);
    }

    private Contract getOrThrow(UUID id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Contract not found with id: " + id));
    }
}
