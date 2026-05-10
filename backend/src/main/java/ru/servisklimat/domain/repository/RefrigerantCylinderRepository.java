package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.RefrigerantCylinder;

import java.util.List;
import java.util.UUID;

@Repository
public interface RefrigerantCylinderRepository extends JpaRepository<RefrigerantCylinder, UUID> {

    List<RefrigerantCylinder> findByIsActiveTrue();

    List<RefrigerantCylinder> findByEngineerId(UUID engineerId);
}
