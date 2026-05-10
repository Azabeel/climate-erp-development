package ru.servisklimat.domain.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.SLAConfig;
import ru.servisklimat.domain.model.SLAServiceHours;
import ru.servisklimat.domain.model.WorkOrder;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Comparator;
import java.util.List;

/**
 * Calculates planned SLA deadlines (TTR, TTO, TTF) for a WorkOrder.
 *
 * <p>Working-hour calculation: given a start time and a duration in hours,
 * advance the clock through the allowed service windows only, skipping
 * non-working periods.
 *
 * <p>Default fallback (no SLAConfig): TTR=4h, TTO=8h, TTF=24h calendar hours.
 */
@Slf4j
@Component
public class SLACalculator {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");

    // Default SLA values (calendar hours, no service-hours restriction)
    private static final int DEFAULT_TTR_HOURS = 4;
    private static final int DEFAULT_TTO_HOURS = 8;
    private static final int DEFAULT_TTF_HOURS = 24;

    /**
     * Calculates and sets slaTtrPlanned, slaTtoPlanned, slaTtfPlanned on the order.
     * Uses the order's slaConfig (if set) and its associated service hours.
     */
    public void calculateAndSetSLA(WorkOrder order) {
        ZonedDateTime createdAt = order.getCreatedAt();
        if (createdAt == null) {
            createdAt = ZonedDateTime.now(MOSCOW);
        }

        SLAConfig config = order.getSlaConfig();

        if (config == null) {
            // Use calendar-hour defaults
            order.setSlaTtrPlanned(createdAt.plusHours(DEFAULT_TTR_HOURS));
            order.setSlaTtoPlanned(createdAt.plusHours(DEFAULT_TTO_HOURS));
            order.setSlaTtfPlanned(createdAt.plusHours(DEFAULT_TTF_HOURS));
            log.debug("WorkOrder {}: default SLA applied (no SLAConfig)", order.getNumber());
            return;
        }

        int ttrHours = toIntHours(config.getTtrHours(), DEFAULT_TTR_HOURS);
        int ttoHours = toIntHours(config.getTtoHours(), DEFAULT_TTO_HOURS);
        int ttfHours = toIntHours(config.getTtfHours(), DEFAULT_TTF_HOURS);

        // Service hours list may be null if lazy-loaded outside a transaction
        List<SLAServiceHours> serviceHours = config.getServiceHours();
        boolean hasServiceHours = serviceHours != null && !serviceHours.isEmpty();

        if (hasServiceHours) {
            order.setSlaTtrPlanned(addWorkingHours(createdAt, ttrHours, serviceHours));
            order.setSlaTtoPlanned(addWorkingHours(createdAt, ttoHours, serviceHours));
            order.setSlaTtfPlanned(addWorkingHours(createdAt, ttfHours, serviceHours));
        } else {
            order.setSlaTtrPlanned(createdAt.plusHours(ttrHours));
            order.setSlaTtoPlanned(createdAt.plusHours(ttoHours));
            order.setSlaTtfPlanned(createdAt.plusHours(ttfHours));
        }

        log.debug("WorkOrder {}: SLA calculated — TTR={} TTO={} TTF={}",
                order.getNumber(), order.getSlaTtrPlanned(), order.getSlaTtoPlanned(), order.getSlaTtfPlanned());
    }

    /**
     * Advances {@code start} by {@code hours} of working time, skipping periods
     * not covered by any {@code serviceHours} window.
     *
     * <p>Algorithm:
     * <ol>
     *   <li>If current moment is inside a working window, consume time up to the
     *       window end (or until hours exhausted).
     *   <li>Otherwise, advance to the next window start and continue.
     * </ol>
     *
     * @param start        the moment to start from (timezone-aware)
     * @param hours        number of working hours to add (must be &gt;= 0)
     * @param serviceHours the allowed working windows (day-of-week + time range)
     * @return the resulting timestamp after consuming {@code hours} working hours
     */
    public ZonedDateTime addWorkingHours(ZonedDateTime start,
                                         int hours,
                                         List<SLAServiceHours> serviceHours) {
        if (hours <= 0 || serviceHours == null || serviceHours.isEmpty()) {
            return start.plusHours(hours);
        }

        // Work in minutes for precision
        long remainingMinutes = (long) hours * 60;
        ZonedDateTime current = start;

        // Safety limit: never loop more than 366 days worth of minutes
        long safetyLimit = 366L * 24 * 60;
        long elapsed = 0;

        while (remainingMinutes > 0 && elapsed < safetyLimit) {
            // Find the best window for the current moment
            SLAServiceHours activeWindow = findActiveWindow(current, serviceHours);

            if (activeWindow != null) {
                // We are inside a working window; consume as much time as possible
                LocalTime windowEnd = activeWindow.getTimeTo();
                ZonedDateTime windowEndDt = current.with(windowEnd);
                if (windowEndDt.isBefore(current)) {
                    // Shouldn't happen if window is valid, but guard anyway
                    windowEndDt = windowEndDt.plusDays(1);
                }

                long availableMinutes = java.time.Duration.between(current, windowEndDt).toMinutes();
                if (availableMinutes <= 0) {
                    // Move past this window end
                    current = windowEndDt.plusMinutes(1);
                    elapsed++;
                    continue;
                }

                if (remainingMinutes <= availableMinutes) {
                    current = current.plusMinutes(remainingMinutes);
                    remainingMinutes = 0;
                } else {
                    remainingMinutes -= availableMinutes;
                    elapsed += availableMinutes;
                    current = windowEndDt;
                }
            } else {
                // Not in a working window; jump to the next window start
                ZonedDateTime nextStart = findNextWindowStart(current, serviceHours);
                if (nextStart == null) {
                    // No more windows (shouldn't happen for a properly configured SLA)
                    break;
                }
                long jump = java.time.Duration.between(current, nextStart).toMinutes();
                elapsed += jump;
                current = nextStart;
            }
        }

        return current;
    }

    // ─── helpers ────────────────────────────────────────────────────────────────

    /**
     * Returns the service-hours window that contains {@code moment}, or null if
     * {@code moment} is outside all windows.
     */
    private SLAServiceHours findActiveWindow(ZonedDateTime moment,
                                              List<SLAServiceHours> windows) {
        int dow = moment.getDayOfWeek().getValue(); // 1=Mon … 7=Sun
        LocalTime time = moment.toLocalTime();

        for (SLAServiceHours w : windows) {
            if (w.getDayOfWeek() != null && w.getDayOfWeek() == dow) {
                if (!time.isBefore(w.getTimeFrom()) && time.isBefore(w.getTimeTo())) {
                    return w;
                }
            }
        }
        return null;
    }

    /**
     * Finds the earliest window start strictly after {@code moment}.
     * Searches up to 7 days ahead.
     */
    private ZonedDateTime findNextWindowStart(ZonedDateTime moment,
                                               List<SLAServiceHours> windows) {
        for (int dayOffset = 0; dayOffset <= 7; dayOffset++) {
            ZonedDateTime day = moment.plusDays(dayOffset);
            int dow = day.getDayOfWeek().getValue();

            // Collect all windows for this day of week, sorted by start time
            List<SLAServiceHours> dayWindows = windows.stream()
                    .filter(w -> w.getDayOfWeek() != null && w.getDayOfWeek() == dow)
                    .sorted(Comparator.comparing(SLAServiceHours::getTimeFrom))
                    .toList();

            for (SLAServiceHours w : dayWindows) {
                ZonedDateTime candidate;
                if (dayOffset == 0) {
                    // Same day: only consider windows that start after current time
                    candidate = day.with(w.getTimeFrom());
                    if (!candidate.isAfter(moment)) {
                        continue;
                    }
                } else {
                    candidate = day.toLocalDate().atTime(w.getTimeFrom())
                            .atZone(moment.getZone());
                }
                return candidate;
            }
        }
        return null; // No window found in 7 days (mis-configured SLA)
    }

    private int toIntHours(BigDecimal value, int defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        return value.intValue();
    }
}
