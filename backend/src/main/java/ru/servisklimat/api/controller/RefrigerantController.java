package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.refrigerant.*;
import ru.servisklimat.domain.service.RefrigerantLeakCalculator;
import ru.servisklimat.domain.service.RefrigerantService;

import java.math.BigDecimal;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stock/refrigerant")
@RequiredArgsConstructor
public class RefrigerantController {

    private final RefrigerantService refrigerantService;
    private final RefrigerantLeakCalculator leakCalculator;

    // ─── Types ────────────────────────────────────────────────────────────────

    @GetMapping("/types")
    public List<RefrigerantTypeDto> getTypes() {
        return refrigerantService.findAllTypes();
    }

    @PostMapping("/types")
    @ResponseStatus(HttpStatus.CREATED)
    public RefrigerantTypeDto createType(@Valid @RequestBody CreateRefrigerantTypeRequest request) {
        return refrigerantService.createType(request);
    }

    // ─── Cylinders ────────────────────────────────────────────────────────────

    @GetMapping("/cylinders")
    public List<RefrigerantCylinderDto> getCylinders() {
        return refrigerantService.findActiveCylinders();
    }

    @PostMapping("/cylinders")
    @ResponseStatus(HttpStatus.CREATED)
    public RefrigerantCylinderDto createCylinder(@Valid @RequestBody CreateCylinderRequest request) {
        return refrigerantService.createCylinder(request);
    }

    @GetMapping("/cylinders/{id}")
    public RefrigerantCylinderDto getCylinder(@PathVariable UUID id) {
        return refrigerantService.findCylinderById(id);
    }

    @PutMapping("/cylinders/{id}")
    public RefrigerantCylinderDto updateCylinder(@PathVariable UUID id,
                                                  @Valid @RequestBody CreateCylinderRequest request) {
        return refrigerantService.updateCylinder(id, request);
    }

    // ─── Log ──────────────────────────────────────────────────────────────────

    @PostMapping("/log")
    @ResponseStatus(HttpStatus.CREATED)
    public RefrigerantLogDto addLog(@Valid @RequestBody CreateRefrigerantLogRequest request) {
        return refrigerantService.logOperation(request);
    }

    @GetMapping("/log/{equipmentId}")
    public List<RefrigerantLogDto> getEquipmentHistory(@PathVariable UUID equipmentId) {
        return refrigerantService.getEquipmentHistory(equipmentId);
    }

    // ─── Leak Rate ────────────────────────────────────────────────────────────

    @GetMapping("/leak-rate/{equipmentId}")
    public LeakRateDto getLeakRate(
            @PathVariable UUID equipmentId,
            @RequestParam BigDecimal fullChargeKg,
            @RequestParam(required = false) Integer monthsBack) {

        int months = monthsBack != null ? monthsBack : 12;
        ZonedDateTime now = ZonedDateTime.now(ZoneId.of("Europe/Moscow"));
        ZonedDateTime periodStart = now.minusMonths(months);

        BigDecimal leakRate = leakCalculator.calculateLeakRate(
                equipmentId, fullChargeKg, periodStart, now);

        // Calculate chargedKg for response
        BigDecimal chargedKg = leakRate.multiply(fullChargeKg)
                .divide(new BigDecimal("100"), 3, java.math.RoundingMode.HALF_UP);

        return new LeakRateDto(
                equipmentId,
                leakRate,
                fullChargeKg,
                chargedKg,
                periodStart,
                now,
                leakCalculator.exceedsThreshold(leakRate)
        );
    }
}
