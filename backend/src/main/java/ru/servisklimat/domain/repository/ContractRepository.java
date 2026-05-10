package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.Contract;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ContractRepository extends JpaRepository<Contract, UUID> {

    List<Contract> findByClientIdAndStatus(UUID clientId, String status);

    List<Contract> findByDateEndBefore(LocalDate date);

    Page<Contract> findByClientId(UUID clientId, Pageable pageable);

    List<Contract> findByClientId(UUID clientId);
}
