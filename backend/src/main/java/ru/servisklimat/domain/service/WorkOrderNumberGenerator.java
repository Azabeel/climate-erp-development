package ru.servisklimat.domain.service;

import org.springframework.stereotype.Component;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.concurrent.atomic.AtomicLong;

/**
 * Generates work order numbers in format: WO-{YEAR}-{SEQUENCE:06d}
 * Example: WO-2026-000001
 */
@Component
public class WorkOrderNumberGenerator {

    private static final String PREFIX = "WO";
    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");
    private final AtomicLong sequence = new AtomicLong(0);

    public String nextNumber() {
        return generate(sequence.incrementAndGet());
    }

    public String generate(long sequenceNumber) {
        int year = ZonedDateTime.now(MOSCOW).getYear();
        return generate(year, sequenceNumber);
    }

    public String generate(int year, long sequenceNumber) {
        return String.format("%s-%d-%06d", PREFIX, year, sequenceNumber);
    }

    public boolean isValidFormat(String number) {
        if (number == null) return false;
        return number.matches("WO-\\d{4}-\\d{6}");
    }
}
