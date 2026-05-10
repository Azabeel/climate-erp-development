package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.servisklimat.domain.model.Lead;

import java.util.List;
import java.util.UUID;

public interface LeadRepository extends JpaRepository<Lead, UUID> {

    Page<Lead> findByStatus(String status, Pageable pageable);

    List<Lead> findByClientId(UUID clientId);
}
