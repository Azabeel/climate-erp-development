package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.Brand;

import java.util.UUID;

@Repository
public interface BrandRepository extends JpaRepository<Brand, UUID> {

    Page<Brand> findByIsActiveTrue(Pageable pageable);
}
