package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.PayrollPeriod;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface PayrollPeriodRepository extends JpaRepository<PayrollPeriod, UUID> {

    Page<PayrollPeriod> findByStatus(String status, Pageable pageable);

    List<PayrollPeriod> findByPeriodStartGreaterThanEqual(LocalDate periodStart);
}
