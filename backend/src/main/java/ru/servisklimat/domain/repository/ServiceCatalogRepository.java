package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.Service;

import java.util.UUID;

@Repository
public interface ServiceCatalogRepository extends JpaRepository<Service, UUID> {

    Page<Service> findByIsActiveTrue(Pageable pageable);
}
