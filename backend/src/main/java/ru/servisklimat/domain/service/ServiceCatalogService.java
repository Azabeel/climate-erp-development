package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.repository.ServiceCatalogRepository;

import java.util.UUID;

@org.springframework.stereotype.Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ServiceCatalogService {

    private final ServiceCatalogRepository repository;

    public Page<ru.servisklimat.domain.model.Service> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    public Page<ru.servisklimat.domain.model.Service> findActive(Pageable pageable) {
        return repository.findByIsActiveTrue(pageable);
    }

    public ru.servisklimat.domain.model.Service findById(UUID id) {
        return repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service not found: " + id));
    }
}
