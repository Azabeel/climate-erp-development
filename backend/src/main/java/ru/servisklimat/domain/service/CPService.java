package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.CommercialProposal;
import ru.servisklimat.domain.model.Deal;
import ru.servisklimat.domain.repository.CommercialProposalRepository;
import ru.servisklimat.domain.repository.DealRepository;

import java.time.LocalDate;
import java.time.Year;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CPService {

    private final CommercialProposalRepository proposalRepository;
    private final DealRepository dealRepository;

    private static final AtomicInteger SEQUENCE = new AtomicInteger(0);

    @Transactional
    public CommercialProposal create(UUID dealId, String title, String variant) {
        Deal deal = dealRepository.findById(dealId)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found: " + dealId));

        String number = generateNumber();

        CommercialProposal proposal = CommercialProposal.builder()
                .deal(deal)
                .clientId(deal.getClient().getId())
                .number(number)
                .title(title)
                .variant(variant != null ? variant : "STANDARD")
                .validUntil(LocalDate.now().plusDays(30))
                .build();

        return proposalRepository.save(proposal);
    }

    public CommercialProposal findById(UUID id) {
        return proposalRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Proposal not found: " + id));
    }

    @Transactional
    public CommercialProposal send(UUID id) {
        CommercialProposal proposal = findById(id);
        proposal.setStatus("SENT");
        proposal.setSentAt(java.time.ZonedDateTime.now());
        return proposalRepository.save(proposal);
    }

    private String generateNumber() {
        int year = Year.now().getValue();
        int seq = SEQUENCE.incrementAndGet();
        return String.format("CP-%d-%06d", year, seq);
    }
}
