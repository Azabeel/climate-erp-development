package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.Deal;
import ru.servisklimat.domain.model.Lead;
import ru.servisklimat.domain.model.enums.DealStage;
import ru.servisklimat.domain.repository.ClientRepository;
import ru.servisklimat.domain.repository.DealRepository;
import ru.servisklimat.domain.repository.LeadRepository;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class LeadService {

    private final LeadRepository leadRepository;
    private final DealRepository dealRepository;
    private final ClientRepository clientRepository;

    public Page<Lead> findAll(Pageable pageable) {
        return leadRepository.findAll(pageable);
    }

    public Lead findById(UUID id) {
        return leadRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Lead not found: " + id));
    }

    @Transactional
    public Lead create(Lead lead) {
        return leadRepository.save(lead);
    }

    @Transactional
    public Lead updateStatus(UUID id, String status) {
        Lead lead = findById(id);
        lead.setStatus(status);
        return leadRepository.save(lead);
    }

    @Transactional
    public Deal convert(UUID leadId, String dealTitle, UUID clientId) {
        Lead lead = findById(leadId);
        lead.setStatus("CONVERTED");

        var client = clientRepository.findById(clientId)
                .orElseThrow(() -> new EntityNotFoundException("Client not found: " + clientId));

        Deal deal = Deal.builder()
                .leadId(leadId)
                .client(client)
                .title(dealTitle)
                .stage(DealStage.QUALIFICATION)
                .build();
        Deal saved = dealRepository.save(deal);

        lead.setConvertedToDealId(saved.getId());
        leadRepository.save(lead);

        return saved;
    }
}
