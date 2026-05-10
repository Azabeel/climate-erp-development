package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.EquipmentType;

import java.util.UUID;

@Repository
public interface EquipmentTypeRepository extends JpaRepository<EquipmentType, UUID> {

    Page<EquipmentType> findByIsActiveTrue(Pageable pageable);
}
