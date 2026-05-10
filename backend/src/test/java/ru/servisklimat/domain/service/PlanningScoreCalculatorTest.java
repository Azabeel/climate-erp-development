package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import ru.servisklimat.domain.model.enums.SLAStatus;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;

/**
 * Unit tests for PlanningScoreCalculator.
 *
 * Key test from CLAUDE.md:
 *   Variant A: SLA_ok=GREEN(1.0), travel=5km/max10km(geoFactor=0.5),
 *              load=3/max5(loadFactor=0.4), cert=1.0
 *   score = (1.0*40) + (0.5*30) + (0.4*20) + (1.0*10) = 40+15+8+10 = 73
 */
class PlanningScoreCalculatorTest {

    private PlanningScoreCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new PlanningScoreCalculator();
    }

    /**
     * Test from CLAUDE.md Sprint 12:
     * slaFactor=1.0(GREEN), geoFactor=(1-5/10)=0.5, loadFactor=(1-3/5)=0.4, certFactor=1.0
     * score = 40 + 15 + 8 + 10 = 73.0
     */
    @Test
    void testClaudeMdExample_score73() {
        PlanningScoreCalculator.PlanningInput input = new PlanningScoreCalculator.PlanningInput(
                SLAStatus.GREEN,
                5.0,   // travelDistanceKm
                10.0,  // maxTravelDistanceKm
                3,     // currentOrderCount
                5,     // maxOrdersPerDay
                1,     // matchingCompetencies
                1      // requiredCompetencies → certFactor = 1.0
        );

        double score = calculator.calculate(input);

        assertThat(score).isEqualTo(73.0);
    }

    /**
     * RED SLA should penalize heavily: slaFactor=0.0
     * score = (0.0*40) + (geoFactor*30) + (loadFactor*20) + (certFactor*10)
     * With perfect geo/load/cert: 0 + 30 + 20 + 10 = 60 (max without SLA)
     */
    @Test
    void testRedSla_penalizedScore() {
        PlanningScoreCalculator.PlanningInput input = new PlanningScoreCalculator.PlanningInput(
                SLAStatus.RED,
                0.0,   // perfect geo (no travel)
                50.0,
                0,     // zero load
                5,
                1,     // all competencies match
                1
        );

        double score = calculator.calculate(input);

        // slaFactor=0.0: 0*40 + 1.0*30 + 1.0*20 + 1.0*10 = 60
        assertThat(score).isEqualTo(60.0);
    }

    /**
     * Perfect score: all factors = 1.0 → score = 100.0
     */
    @Test
    void testPerfectScore_returns100() {
        PlanningScoreCalculator.PlanningInput input = new PlanningScoreCalculator.PlanningInput(
                SLAStatus.GREEN,
                0.0,  // zero travel distance → geoFactor = 1.0
                50.0,
                0,    // zero load → loadFactor = 1.0
                5,
                3,    // all competencies match → certFactor = 1.0
                3
        );

        double score = calculator.calculate(input);

        assertThat(score).isEqualTo(100.0);
    }

    /**
     * No competency requirement (requiredCompetencies=0) → certFactor must be 1.0
     */
    @Test
    void testNoCompetencyRequirement_certFactor1() {
        PlanningScoreCalculator.PlanningInput input = new PlanningScoreCalculator.PlanningInput(
                SLAStatus.GREEN,
                0.0,
                50.0,
                0,
                5,
                0,  // matchingCompetencies
                0   // requiredCompetencies = 0 → certFactor = 1.0
        );

        double score = calculator.calculate(input);

        // certFactor=1.0 (no requirement), all others perfect → 100
        assertThat(score).isEqualTo(100.0);
    }

    /**
     * No competency match at all (0 of 3 required) → certFactor = 0.0
     * score = (1.0*40) + (1.0*30) + (1.0*20) + (0.0*10) = 90
     */
    @Test
    void testNoCompetencyMatch_certFactor0() {
        PlanningScoreCalculator.PlanningInput input = new PlanningScoreCalculator.PlanningInput(
                SLAStatus.GREEN,
                0.0,
                50.0,
                0,
                5,
                0,  // matchingCompetencies = 0
                3   // requiredCompetencies = 3 → certFactor = 0.0
        );

        double score = calculator.calculate(input);

        assertThat(score).isEqualTo(90.0);
    }

    /**
     * YELLOW SLA: slaFactor = 0.5
     * With perfect geo/load/cert: 0.5*40 + 30 + 20 + 10 = 80
     */
    @Test
    void testYellowSla_halfPenalty() {
        PlanningScoreCalculator.PlanningInput input = new PlanningScoreCalculator.PlanningInput(
                SLAStatus.YELLOW,
                0.0,
                50.0,
                0,
                5,
                1,
                1
        );

        double score = calculator.calculate(input);

        assertThat(score).isEqualTo(80.0);
    }

    /**
     * Null SLA status (no SLA configured) → treated as GREEN → slaFactor = 1.0
     */
    @Test
    void testNullSlaStatus_treatedAsGreen() {
        PlanningScoreCalculator.PlanningInput inputNull = new PlanningScoreCalculator.PlanningInput(
                null, 0.0, 50.0, 0, 5, 1, 1
        );
        PlanningScoreCalculator.PlanningInput inputGreen = new PlanningScoreCalculator.PlanningInput(
                SLAStatus.GREEN, 0.0, 50.0, 0, 5, 1, 1
        );

        assertThat(calculator.calculate(inputNull)).isEqualTo(calculator.calculate(inputGreen));
    }

    /**
     * Travel distance exceeding maxTravel → geoFactor clamped to 0
     * score = (1.0*40) + (0.0*30) + (1.0*20) + (1.0*10) = 70
     */
    @Test
    void testTravelExceedsMax_geoFactorClampedToZero() {
        PlanningScoreCalculator.PlanningInput input = new PlanningScoreCalculator.PlanningInput(
                SLAStatus.GREEN,
                100.0,  // travel >> max
                50.0,
                0,
                5,
                1,
                1
        );

        double score = calculator.calculate(input);

        assertThat(score).isEqualTo(70.0);
    }

    /**
     * Partial competency match: 2 of 4 → certFactor = 0.5
     * With everything else perfect: 40 + 30 + 20 + 5 = 95
     */
    @Test
    void testPartialCompetencyMatch() {
        PlanningScoreCalculator.PlanningInput input = new PlanningScoreCalculator.PlanningInput(
                SLAStatus.GREEN,
                0.0,
                50.0,
                0,
                5,
                2,  // matchingCompetencies
                4   // requiredCompetencies → certFactor = 0.5
        );

        double score = calculator.calculate(input);

        assertThat(score).isEqualTo(95.0);
    }
}
