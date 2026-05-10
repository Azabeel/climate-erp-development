package ru.servisklimat.domain.service;

import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Derives a PurchaseRequest aggregate status from its items' statuses.
 *
 * Rules (evaluated in priority order):
 *   1. empty list              → NEW
 *   2. any TRANSFERRED         → TRANSFERRED
 *   3. all RECEIVED            → FULLY_RECEIVED
 *   4. any RECEIVED (not all)  → PARTIALLY_RECEIVED
 *   5. any IN_TRANSIT          → IN_PROGRESS
 *   6. any ORDERED             → IN_PROGRESS
 *   7. otherwise               → NEW
 */
@Component
public class PurchaseStatusAggregator {

    private static final String NEW = "NEW";
    private static final String ORDERED = "ORDERED";
    private static final String IN_TRANSIT = "IN_TRANSIT";
    private static final String RECEIVED = "RECEIVED";
    private static final String TRANSFERRED = "TRANSFERRED";
    private static final String FULLY_RECEIVED = "FULLY_RECEIVED";
    private static final String PARTIALLY_RECEIVED = "PARTIALLY_RECEIVED";
    private static final String IN_PROGRESS = "IN_PROGRESS";

    public String aggregate(List<String> itemStatuses) {
        if (itemStatuses == null || itemStatuses.isEmpty()) {
            return NEW;
        }

        if (itemStatuses.stream().anyMatch(TRANSFERRED::equals)) {
            return TRANSFERRED;
        }

        long receivedCount = itemStatuses.stream().filter(RECEIVED::equals).count();

        if (receivedCount == itemStatuses.size()) {
            return FULLY_RECEIVED;
        }

        if (receivedCount > 0) {
            return PARTIALLY_RECEIVED;
        }

        boolean anyInProgress = itemStatuses.stream()
                .anyMatch(s -> IN_TRANSIT.equals(s) || ORDERED.equals(s));

        if (anyInProgress) {
            return IN_PROGRESS;
        }

        return NEW;
    }
}
