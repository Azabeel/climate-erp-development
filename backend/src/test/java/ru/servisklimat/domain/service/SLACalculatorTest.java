package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ru.servisklimat.domain.model.Client;
import ru.servisklimat.domain.model.SLAConfig;
import ru.servisklimat.domain.model.SLAServiceHours;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.enums.ClientType;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

/**
 * Pure unit tests for {@link SLACalculator} — no Spring context required.
 */
class SLACalculatorTest {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");

    private SLACalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new SLACalculator();
    }

    // ─── Default SLA (no SLAConfig) ──────────────────────────────────────────

    @Test
    void defaultSLA_noConfig_usesCalendarHours() {
        ZonedDateTime created = ZonedDateTime.of(2026, 5, 10, 12, 0, 0, 0, MOSCOW);

        WorkOrder order = buildOrder(created, null);
        calculator.calculateAndSetSLA(order);

        assertThat(order.getSlaTtrPlanned()).isEqualTo(created.plusHours(4));
        assertThat(order.getSlaTtoPlanned()).isEqualTo(created.plusHours(8));
        assertThat(order.getSlaTtfPlanned()).isEqualTo(created.plusHours(24));
    }

    // ─── Config with calendar hours (no service hours windows) ───────────────

    @Test
    void configWithoutServiceHours_usesCalendarHours() {
        ZonedDateTime created = ZonedDateTime.of(2026, 5, 10, 9, 0, 0, 0, MOSCOW);

        SLAConfig config = SLAConfig.builder()
                .id(UUID.randomUUID())
                .name("Test SLA")
                .level("CONTRACT")
                .ttrHours(new BigDecimal("2"))
                .ttoHours(new BigDecimal("4"))
                .ttfHours(new BigDecimal("8"))
                .warningPercent(20)
                .serviceHours(new ArrayList<>())
                .build();

        WorkOrder order = buildOrder(created, config);
        calculator.calculateAndSetSLA(order);

        assertThat(order.getSlaTtrPlanned()).isEqualTo(created.plusHours(2));
        assertThat(order.getSlaTtoPlanned()).isEqualTo(created.plusHours(4));
        assertThat(order.getSlaTtfPlanned()).isEqualTo(created.plusHours(8));
    }

    // ─── Working-hours SLA: Friday crossing into next week ───────────────────

    /**
     * Created at 17:00 on Friday (Mon-Fri 9:00-18:00).
     * 8 working hours = 1h Fri + jump to Mon 09:00 + 7h = Mon 16:00.
     */
    @Test
    void workingHours_fridayEvening_continuesMonday() {
        // Find a Friday
        ZonedDateTime created = ZonedDateTime.of(2026, 5, 8, 17, 0, 0, 0, MOSCOW); // Friday
        assertThat(created.getDayOfWeek()).isEqualTo(DayOfWeek.FRIDAY);

        List<SLAServiceHours> windows = mondayToFriday9to18();

        ZonedDateTime result = calculator.addWorkingHours(created, 8, windows);

        // 1h on Friday (17:00-18:00) + 7h starting Monday 09:00 → Monday 16:00
        ZonedDateTime expectedMonday = ZonedDateTime.of(2026, 5, 11, 16, 0, 0, 0, MOSCOW);
        assertThat(result).isEqualTo(expectedMonday);
    }

    /**
     * Same scenario but specifically testing TTF on the work order.
     */
    @Test
    void workingHours_ttfAcrossWeekend() {
        ZonedDateTime created = ZonedDateTime.of(2026, 5, 8, 17, 0, 0, 0, MOSCOW); // Friday

        SLAConfig config = SLAConfig.builder()
                .id(UUID.randomUUID())
                .name("Weekend SLA")
                .level("CORPORATE")
                .ttrHours(new BigDecimal("2"))
                .ttoHours(new BigDecimal("4"))
                .ttfHours(new BigDecimal("8"))
                .warningPercent(20)
                .serviceHours(mondayToFriday9to18())
                .build();

        WorkOrder order = buildOrder(created, config);
        calculator.calculateAndSetSLA(order);

        // TTF: 8 working hours from Fri 17:00 → Mon 16:00
        ZonedDateTime expectedTtf = ZonedDateTime.of(2026, 5, 11, 16, 0, 0, 0, MOSCOW);
        assertThat(order.getSlaTtfPlanned()).isEqualTo(expectedTtf);

        // TTR: 2 working hours from Fri 17:00 → Fri 18:00 (1h) → Mon 09:00 (1h) → Mon 10:00
        ZonedDateTime expectedTtr = ZonedDateTime.of(2026, 5, 11, 10, 0, 0, 0, MOSCOW);
        assertThat(order.getSlaTtrPlanned()).isEqualTo(expectedTtr);
    }

    // ─── addWorkingHours: mid-day addition ───────────────────────────────────

    @Test
    void addWorkingHours_midDayAddition() {
        // Monday 10:00, add 4 hours → Monday 14:00
        ZonedDateTime start = ZonedDateTime.of(2026, 5, 11, 10, 0, 0, 0, MOSCOW); // Monday
        assertThat(start.getDayOfWeek()).isEqualTo(DayOfWeek.MONDAY);

        ZonedDateTime result = calculator.addWorkingHours(start, 4, mondayToFriday9to18());

        assertThat(result).isEqualTo(ZonedDateTime.of(2026, 5, 11, 14, 0, 0, 0, MOSCOW));
    }

    @Test
    void addWorkingHours_crossingDayBoundary() {
        // Monday 16:00, add 4 hours → Monday 18:00 (2h) → Tuesday 09:00 → 11:00
        ZonedDateTime start = ZonedDateTime.of(2026, 5, 11, 16, 0, 0, 0, MOSCOW);

        ZonedDateTime result = calculator.addWorkingHours(start, 4, mondayToFriday9to18());

        assertThat(result).isEqualTo(ZonedDateTime.of(2026, 5, 12, 11, 0, 0, 0, MOSCOW));
    }

    @Test
    void addWorkingHours_zeroHours_returnsSameTime() {
        ZonedDateTime start = ZonedDateTime.of(2026, 5, 11, 10, 0, 0, 0, MOSCOW);
        ZonedDateTime result = calculator.addWorkingHours(start, 0, mondayToFriday9to18());
        assertThat(result).isEqualTo(start);
    }

    @Test
    void addWorkingHours_emptyWindowList_fallsBackToCalendar() {
        ZonedDateTime start = ZonedDateTime.of(2026, 5, 11, 10, 0, 0, 0, MOSCOW);
        ZonedDateTime result = calculator.addWorkingHours(start, 3, new ArrayList<>());
        assertThat(result).isEqualTo(start.plusHours(3));
    }

    // ─── Three metrics on a single config ────────────────────────────────────

    @Test
    void allThreeMetrics_setCorrectly() {
        ZonedDateTime created = ZonedDateTime.of(2026, 5, 11, 9, 0, 0, 0, MOSCOW); // Monday 09:00

        SLAConfig config = SLAConfig.builder()
                .id(UUID.randomUUID())
                .name("Full SLA")
                .level("CONTRACT")
                .ttrHours(new BigDecimal("2"))
                .ttoHours(new BigDecimal("4"))
                .ttfHours(new BigDecimal("8"))
                .warningPercent(20)
                .serviceHours(mondayToFriday9to18())
                .build();

        WorkOrder order = buildOrder(created, config);
        calculator.calculateAndSetSLA(order);

        assertThat(order.getSlaTtrPlanned()).isEqualTo(created.plusHours(2));  // Mon 11:00
        assertThat(order.getSlaTtoPlanned()).isEqualTo(created.plusHours(4));  // Mon 13:00
        assertThat(order.getSlaTtfPlanned()).isEqualTo(created.plusHours(8));  // Mon 17:00
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private WorkOrder buildOrder(ZonedDateTime createdAt, SLAConfig config) {
        Client client = Client.builder()
                .id(UUID.randomUUID())
                .name("Test Client")
                .type(ClientType.INDIVIDUAL)
                .build();

        return WorkOrder.builder()
                .id(UUID.randomUUID())
                .number("WO-2026-000001")
                .client(client)
                .createdAt(createdAt)
                .slaConfig(config)
                .build();
    }

    /** Mon-Fri 09:00-18:00 service windows (dayOfWeek: 1=Mon…5=Fri). */
    private List<SLAServiceHours> mondayToFriday9to18() {
        List<SLAServiceHours> hours = new ArrayList<>();
        for (int dow = 1; dow <= 5; dow++) {
            hours.add(SLAServiceHours.builder()
                    .id(UUID.randomUUID())
                    .dayOfWeek(dow)
                    .timeFrom(LocalTime.of(9, 0))
                    .timeTo(LocalTime.of(18, 0))
                    .build());
        }
        return hours;
    }
}
