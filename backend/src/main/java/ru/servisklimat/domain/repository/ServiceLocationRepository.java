package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.ServiceLocation;

import java.util.List;
import java.util.UUID;

@Repository
public interface ServiceLocationRepository extends JpaRepository<ServiceLocation, UUID> {

    List<ServiceLocation> findByClientId(UUID clientId);

    Page<ServiceLocation> findByIsActiveTrue(Pageable pageable);
}
