package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.servisklimat.domain.model.CommercialProposal;

import java.util.UUID;

public interface CommercialProposalRepository extends JpaRepository<CommercialProposal, UUID> {
    Page<CommercialProposal> findByDealId(UUID dealId, Pageable pageable);
    Page<CommercialProposal> findByClientId(UUID clientId, Pageable pageable);
}
