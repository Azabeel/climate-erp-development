package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.hr.*;
import ru.servisklimat.domain.service.PayrollService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/hr")
@RequiredArgsConstructor
public class HRController {

    private final PayrollService payrollService;

    /**
     * GET /api/v1/hr/payslip/{engineerId}/{period}
     * period format: "2026-05"
     */
    @GetMapping("/payslip/{engineerId}/{period}")
    public List<PayslipDto> getPayslip(
            @PathVariable UUID engineerId,
            @PathVariable String period) {
        return payrollService.findPayslips(engineerId, period);
    }

    /**
     * GET /api/v1/hr/payroll-periods
     */
    @GetMapping("/payroll-periods")
    public Page<PayrollPeriodDto> getPayrollPeriods(
            @PageableDefault(size = 20) Pageable pageable) {
        return payrollService.findAllPeriods(pageable);
    }

    /**
     * POST /api/v1/hr/payroll-periods
     */
    @PostMapping("/payroll-periods")
    @ResponseStatus(HttpStatus.CREATED)
    public PayrollPeriodDto createPayrollPeriod(
            @Valid @RequestBody CreatePayrollPeriodRequest request) {
        return payrollService.createPeriod(request);
    }

    /**
     * GET /api/v1/hr/payroll-periods/{id}/items
     */
    @GetMapping("/payroll-periods/{id}/items")
    public List<PayrollItemDto> getPayrollItems(@PathVariable UUID id) {
        return payrollService.findItemsByPeriod(id);
    }
}
