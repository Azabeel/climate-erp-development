package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class PurchaseStatusAggregatorTest {

    private PurchaseStatusAggregator aggregator;

    @BeforeEach
    void setUp() {
        aggregator = new PurchaseStatusAggregator();
    }

    /**
     * Test 1 — all RECEIVED → FULLY_RECEIVED
     */
    @Test
    @DisplayName("All items RECEIVED → FULLY_RECEIVED")
    void allReceived_returnsFullyReceived() {
        assertThat(aggregator.aggregate(List.of("RECEIVED", "RECEIVED", "RECEIVED")))
                .isEqualTo("FULLY_RECEIVED");
    }

    /**
     * Test 2 — one RECEIVED, one NEW → PARTIALLY_RECEIVED
     */
    @Test
    @DisplayName("Some items RECEIVED, some not → PARTIALLY_RECEIVED")
    void partialReceived_returnsPartiallyReceived() {
        assertThat(aggregator.aggregate(List.of("RECEIVED", "NEW")))
                .isEqualTo("PARTIALLY_RECEIVED");

        assertThat(aggregator.aggregate(List.of("RECEIVED", "ORDERED")))
                .isEqualTo("PARTIALLY_RECEIVED");
    }

    /**
     * Test 3 — all NEW → NEW
     */
    @Test
    @DisplayName("All items NEW → NEW")
    void allNew_returnsNew() {
        assertThat(aggregator.aggregate(List.of("NEW", "NEW")))
                .isEqualTo("NEW");
    }

    /**
     * Test 4 — any IN_TRANSIT → IN_PROGRESS
     */
    @Test
    @DisplayName("Any item IN_TRANSIT → IN_PROGRESS")
    void anyInTransit_returnsInProgress() {
        assertThat(aggregator.aggregate(List.of("NEW", "IN_TRANSIT")))
                .isEqualTo("IN_PROGRESS");
    }

    /**
     * Test 4b — any ORDERED → IN_PROGRESS
     */
    @Test
    @DisplayName("Any item ORDERED → IN_PROGRESS")
    void anyOrdered_returnsInProgress() {
        assertThat(aggregator.aggregate(List.of("NEW", "ORDERED")))
                .isEqualTo("IN_PROGRESS");
    }

    /**
     * Test 5 — empty list → NEW
     */
    @Test
    @DisplayName("Empty item list → NEW")
    void emptyList_returnsNew() {
        assertThat(aggregator.aggregate(List.of())).isEqualTo("NEW");
        assertThat(aggregator.aggregate(null)).isEqualTo("NEW");
    }

    /**
     * Test 6 — any TRANSFERRED → TRANSFERRED (highest priority after empty)
     */
    @Test
    @DisplayName("Any TRANSFERRED → TRANSFERRED")
    void anyTransferred_returnsTransferred() {
        assertThat(aggregator.aggregate(List.of("TRANSFERRED", "RECEIVED")))
                .isEqualTo("TRANSFERRED");
    }

    /**
     * Test 7 — single RECEIVED → FULLY_RECEIVED (not PARTIALLY_RECEIVED)
     */
    @Test
    @DisplayName("Single item RECEIVED → FULLY_RECEIVED")
    void singleReceived_returnsFullyReceived() {
        assertThat(aggregator.aggregate(List.of("RECEIVED")))
                .isEqualTo("FULLY_RECEIVED");
    }
}
