package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.domain.model.Engineer;
import ru.servisklimat.domain.model.EngineerDayLog;
import ru.servisklimat.domain.model.PayrollItem;
import ru.servisklimat.domain.repository.EngineerDayLogRepository;
import ru.servisklimat.domain.repository.EngineerRepository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PayrollCalculationServiceTest {

    @Mock
    private EngineerDayLogRepository dayLogRepository;

    @Mock
    private EngineerRepository engineerRepository;

    private PayrollCalculationService service;

    private UUID engineerId;
    private Engineer engineer;
    private LocalDate periodStart;
    private LocalDate periodEnd;

    @BeforeEach
    void setUp() {
        service = new PayrollCalculationService(dayLogRepository, engineerRepository);
        engineerId = UUID.randomUUID();
        engineer = Engineer.builder()
                .id(engineerId)
                .fullName("Иванов Иван")
                .fuelRatePerKm(BigDecimal.ZERO)
                .build();
        periodStart = LocalDate.of(2026, 5, 1);
        periodEnd = LocalDate.of(2026, 5, 31);
    }

    @Test
    void noDayLogs_allZero() {
        when(engineerRepository.findById(engineerId)).thenReturn(Optional.of(engineer));
        when(dayLogRepository.findByEngineerIdAndDateBetween(engineerId, periodStart, periodEnd))
                .thenReturn(Collections.emptyList());

        PayrollItem result = service.calculateForEngineer(engineerId, periodStart, periodEnd);

        assertThat(result.getPieceRateEarnings()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getGsmCompensation()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(result.getTotalGross()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void oneDayLog_revenueAndDistance_calculatesCorrectly() {
        // revenue=10000, distance=50km
        // pieceRate = 10000 * 0.15 = 1500
        // gsm = 50 * 12 = 600 (default rate)
        // total = 1500 + 600 = 2100
        EngineerDayLog log = EngineerDayLog.builder()
                .engineer(engineer)
                .date(LocalDate.of(2026, 5, 10))
                .totalRevenue(new BigDecimal("10000.00"))
                .totalDistanceKm(new BigDecimal("50.00"))
                .build();

        when(engineerRepository.findById(engineerId)).thenReturn(Optional.of(engineer));
        when(dayLogRepository.findByEngineerIdAndDateBetween(engineerId, periodStart, periodEnd))
                .thenReturn(List.of(log));

        PayrollItem result = service.calculateForEngineer(engineerId, periodStart, periodEnd);

        assertThat(result.getPieceRateEarnings()).isEqualByComparingTo(new BigDecimal("1500.00"));
        assertThat(result.getGsmCompensation()).isEqualByComparingTo(new BigDecimal("600.00"));
        assertThat(result.getTotalGross()).isEqualByComparingTo(new BigDecimal("2100.00"));
    }

    @Test
    void twoDayLogs_sumsCorrectly() {
        // Day 1: revenue=8000, distance=30km → pieceRate=1200, gsm=360
        // Day 2: revenue=5000, distance=20km → pieceRate=750, gsm=240
        // Total pieceRate=1950, gsm=600, total=2550
        EngineerDayLog log1 = EngineerDayLog.builder()
                .engineer(engineer)
                .date(LocalDate.of(2026, 5, 10))
                .totalRevenue(new BigDecimal("8000.00"))
                .totalDistanceKm(new BigDecimal("30.00"))
                .build();

        EngineerDayLog log2 = EngineerDayLog.builder()
                .engineer(engineer)
                .date(LocalDate.of(2026, 5, 11))
                .totalRevenue(new BigDecimal("5000.00"))
                .totalDistanceKm(new BigDecimal("20.00"))
                .build();

        when(engineerRepository.findById(engineerId)).thenReturn(Optional.of(engineer));
        when(dayLogRepository.findByEngineerIdAndDateBetween(engineerId, periodStart, periodEnd))
                .thenReturn(List.of(log1, log2));

        PayrollItem result = service.calculateForEngineer(engineerId, periodStart, periodEnd);

        assertThat(result.getPieceRateEarnings()).isEqualByComparingTo(new BigDecimal("1950.00"));
        assertThat(result.getGsmCompensation()).isEqualByComparingTo(new BigDecimal("600.00"));
        assertThat(result.getTotalGross()).isEqualByComparingTo(new BigDecimal("2550.00"));
    }

    @Test
    void engineerWithCustomFuelRate_usesEngineerRate() {
        // Engineer has fuel rate 15 RUB/km
        Engineer richEngineer = Engineer.builder()
                .id(engineerId)
                .fullName("Петров Пётр")
                .fuelRatePerKm(new BigDecimal("15.00"))
                .build();

        EngineerDayLog log = EngineerDayLog.builder()
                .engineer(richEngineer)
                .date(LocalDate.of(2026, 5, 10))
                .totalRevenue(new BigDecimal("10000.00"))
                .totalDistanceKm(new BigDecimal("20.00"))
                .build();

        when(engineerRepository.findById(engineerId)).thenReturn(Optional.of(richEngineer));
        when(dayLogRepository.findByEngineerIdAndDateBetween(engineerId, periodStart, periodEnd))
                .thenReturn(List.of(log));

        PayrollItem result = service.calculateForEngineer(engineerId, periodStart, periodEnd);

        // gsm = 20 * 15 = 300
        assertThat(result.getGsmCompensation()).isEqualByComparingTo(new BigDecimal("300.00"));
    }
}
