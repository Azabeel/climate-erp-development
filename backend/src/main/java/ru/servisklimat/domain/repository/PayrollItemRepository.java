package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.PayrollItem;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PayrollItemRepository extends JpaRepository<PayrollItem, UUID> {

    List<PayrollItem> findByPeriodId(UUID periodId);

    List<PayrollItem> findByEngineerIdAndPeriodPeriodStartBetween(UUID engineerId, LocalDate from, LocalDate to);
}
