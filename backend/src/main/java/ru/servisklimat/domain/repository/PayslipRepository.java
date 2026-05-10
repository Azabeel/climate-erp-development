package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.Payslip;

import java.util.List;
import java.util.UUID;

@Repository
public interface PayslipRepository extends JpaRepository<Payslip, UUID> {

    Page<Payslip> findByEngineerId(UUID engineerId, Pageable pageable);

    List<Payslip> findByPayrollItemId(UUID payrollItemId);

    List<Payslip> findByEngineerIdAndPeriod(UUID engineerId, String period);
}
