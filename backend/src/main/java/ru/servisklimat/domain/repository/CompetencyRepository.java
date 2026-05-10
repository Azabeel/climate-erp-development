package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.Competency;

import java.util.UUID;

@Repository
public interface CompetencyRepository extends JpaRepository<Competency, UUID> {
}
