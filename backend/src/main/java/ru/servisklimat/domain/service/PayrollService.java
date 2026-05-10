package ru.servisklimat.domain.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.api.dto.hr.*;
import ru.servisklimat.domain.model.PayrollItem;
import ru.servisklimat.domain.model.PayrollPeriod;
import ru.servisklimat.domain.model.Payslip;
import ru.servisklimat.domain.repository.PayrollItemRepository;
import ru.servisklimat.domain.repository.PayrollPeriodRepository;
import ru.servisklimat.domain.repository.PayslipRepository;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayrollService {

    private final PayrollPeriodRepository periodRepository;
    private final PayrollItemRepository itemRepository;
    private final PayslipRepository payslipRepository;

    // ─── Payroll Periods ──────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<PayrollPeriodDto> findAllPeriods(Pageable pageable) {
        return periodRepository.findAll(pageable).map(this::toPeriodDto);
    }

    @Transactional
    public PayrollPeriodDto createPeriod(CreatePayrollPeriodRequest request) {
        PayrollPeriod period = PayrollPeriod.builder()
                .periodStart(request.getPeriodStart())
                .periodEnd(request.getPeriodEnd())
                .status("OPEN")
                .build();
        return toPeriodDto(periodRepository.save(period));
    }

    @Transactional(readOnly = true)
    public List<PayrollItemDto> findItemsByPeriod(UUID periodId) {
        return itemRepository.findByPeriodId(periodId)
                .stream()
                .map(this::toItemDto)
                .collect(Collectors.toList());
    }

    // ─── Payslips ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<PayslipDto> findPayslips(UUID engineerId, String period) {
        return payslipRepository.findByEngineerIdAndPeriod(engineerId, period)
                .stream()
                .map(this::toPayslipDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PayslipDto> findPayslipsByEngineer(UUID engineerId, Pageable pageable) {
        return payslipRepository.findByEngineerId(engineerId, pageable).map(this::toPayslipDto);
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    private PayrollPeriodDto toPeriodDto(PayrollPeriod p) {
        return PayrollPeriodDto.builder()
                .id(p.getId())
                .periodStart(p.getPeriodStart())
                .periodEnd(p.getPeriodEnd())
                .status(p.getStatus())
                .closedAt(p.getClosedAt())
                .createdAt(p.getCreatedAt())
                .build();
    }

    private PayrollItemDto toItemDto(PayrollItem item) {
        String engineerName = item.getEngineer() != null ? item.getEngineer().getFullName() : null;
        UUID engineerId = item.getEngineer() != null ? item.getEngineer().getId() : null;
        return PayrollItemDto.builder()
                .id(item.getId())
                .engineerId(engineerId)
                .engineerName(engineerName)
                .pieceRateEarnings(item.getPieceRateEarnings())
                .gsmCompensation(item.getGsmCompensation())
                .bonuses(item.getBonuses())
                .deductions(item.getDeductions())
                .totalGross(item.getTotalGross())
                .periodStart(item.getPeriodStart())
                .periodEnd(item.getPeriodEnd())
                .build();
    }

    private PayslipDto toPayslipDto(Payslip s) {
        return PayslipDto.builder()
                .id(s.getId())
                .engineerId(s.getEngineerId())
                .period(s.getPeriod())
                .totalGross(s.getTotalGross())
                .detailsJson(s.getDetailsJson())
                .isVisible(s.isVisible())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
