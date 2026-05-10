package ru.servisklimat.domain.service;

import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.enums.SLAStatus;

/**
 * Calculates a planning score for assigning an engineer to a work order.
 *
 * Score formula (from CLAUDE.md Sprint 12):
 *   score = (slaFactor * 40) + (geoFactor * 30) + (loadFactor * 20) + (certFactor * 10)
 *
 * Where:
 *   slaFactor  — 1.0 if GREEN (or no SLA), 0.5 if YELLOW, 0.0 if RED
 *   geoFactor  — 1.0 - (travelDistanceKm / maxTravelDistanceKm), clamped [0, 1]
 *   loadFactor — 1.0 - (currentOrderCount / maxOrdersPerDay), clamped [0, 1]
 *   certFactor — matchingCompetencies / requiredCompetencies (1.0 if no requirement)
 */
@Component
public class PlanningScoreCalculator {

    public record PlanningInput(
            SLAStatus slaStatus,          // null = no SLA = treated as GREEN
            double travelDistanceKm,
            double maxTravelDistanceKm,   // normalization denominator, e.g. 50 km
            int currentOrderCount,
            int maxOrdersPerDay,          // default 5
            int matchingCompetencies,
            int requiredCompetencies      // 0 = no requirement → certFactor = 1.0
    ) {}

    /**
     * Calculates the planning score in range [0, 100].
     */
    public double calculate(PlanningInput input) {
        double slaFactor   = computeSlaFactor(input.slaStatus());
        double geoFactor   = computeGeoFactor(input.travelDistanceKm(), input.maxTravelDistanceKm());
        double loadFactor  = computeLoadFactor(input.currentOrderCount(), input.maxOrdersPerDay());
        double certFactor  = computeCertFactor(input.matchingCompetencies(), input.requiredCompetencies());

        return (slaFactor * 40.0)
             + (geoFactor  * 30.0)
             + (loadFactor * 20.0)
             + (certFactor * 10.0);
    }

    // ---- private helpers ----

    private double computeSlaFactor(SLAStatus slaStatus) {
        if (slaStatus == null || slaStatus == SLAStatus.GREEN) {
            return 1.0;
        } else if (slaStatus == SLAStatus.YELLOW) {
            return 0.5;
        } else { // RED
            return 0.0;
        }
    }

    private double computeGeoFactor(double travelDistanceKm, double maxTravelDistanceKm) {
        if (maxTravelDistanceKm <= 0) {
            return 1.0;
        }
        double factor = 1.0 - (travelDistanceKm / maxTravelDistanceKm);
        return Math.max(0.0, Math.min(1.0, factor));
    }

    private double computeLoadFactor(int currentOrderCount, int maxOrdersPerDay) {
        if (maxOrdersPerDay <= 0) {
            return 0.0;
        }
        double factor = 1.0 - ((double) currentOrderCount / maxOrdersPerDay);
        return Math.max(0.0, Math.min(1.0, factor));
    }

    private double computeCertFactor(int matchingCompetencies, int requiredCompetencies) {
        if (requiredCompetencies <= 0) {
            return 1.0;
        }
        double factor = (double) matchingCompetencies / requiredCompetencies;
        return Math.max(0.0, Math.min(1.0, factor));
    }
}
