package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.Client;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ClientRepository extends JpaRepository<Client, UUID> {

    Page<Client> findByIsActiveTrue(Pageable pageable);

    Optional<Client> findByPhone(String phone);

    Optional<Client> findByExternalId(String externalId);
}
