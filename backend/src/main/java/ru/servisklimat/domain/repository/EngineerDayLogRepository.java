package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.EngineerDayLog;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EngineerDayLogRepository extends JpaRepository<EngineerDayLog, UUID> {

    List<EngineerDayLog> findByEngineerIdAndDateBetween(UUID engineerId, LocalDate from, LocalDate to);

    Optional<EngineerDayLog> findByEngineerIdAndDate(UUID engineerId, LocalDate date);
}
