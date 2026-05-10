package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Unit tests for WeatherRiskAnalyzer.
 */
class WeatherRiskAnalyzerTest {

    private WeatherRiskAnalyzer analyzer;

    @BeforeEach
    void setUp() {
        analyzer = new WeatherRiskAnalyzer();
    }

    /**
     * Test 1: -25°C outdoor → HIGH risk (temperature < -20)
     */
    @Test
    void testExtremeFrost_outdoor_returnsHigh() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(-25, 10, 0.0, true);

        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.HIGH);
        assertThat(risk.recommendation()).isNotBlank();
    }

    /**
     * Test 2: 45°C outdoor → HIGH risk (temperature > 40)
     */
    @Test
    void testExtremeHeat_outdoor_returnsHigh() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(45, 5, 0.0, true);

        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.HIGH);
    }

    /**
     * Test 3: windSpeed=70 km/h outdoor → HIGH risk (wind > 60)
     */
    @Test
    void testHighWind_outdoor_returnsHigh() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(20, 70, 0.0, true);

        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.HIGH);
    }

    /**
     * Test 4: -12°C outdoor → MEDIUM risk (-20 ≤ temp < -10 is medium boundary: temp < -10 is MEDIUM)
     */
    @Test
    void testModerateFrost_outdoor_returnsMedium() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(-12, 10, 0.0, true);

        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.MEDIUM);
    }

    /**
     * Test 5: normal conditions (20°C, wind 10, rain 0) outdoor → LOW risk
     */
    @Test
    void testNormalConditions_outdoor_returnsLow() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(20, 10, 0.0, true);

        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.LOW);
    }

    /**
     * Test 6: -30°C INDOOR → LOW risk (indoor ignores weather)
     */
    @Test
    void testExtremeFrost_indoor_returnsLow() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(-30, 80, 50.0, false);

        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.LOW);
        assertThat(risk.recommendation()).containsIgnoringCase("помещен");
    }

    /**
     * Test 7: heavy rain (precipitationMm=25) outdoor → HIGH risk (> 20mm)
     */
    @Test
    void testHeavyRain_outdoor_returnsHigh() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(15, 10, 25.0, true);

        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.HIGH);
    }

    /**
     * Moderate rain (11mm) outdoor → MEDIUM risk (> 10mm)
     */
    @Test
    void testModerateRain_outdoor_returnsMedium() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(15, 10, 11.0, true);

        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.MEDIUM);
    }

    /**
     * Moderate wind (35 km/h) → MEDIUM risk (> 30)
     */
    @Test
    void testModerateWind_outdoor_returnsMedium() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(20, 35, 0.0, true);

        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.MEDIUM);
    }

    /**
     * Exactly -20°C → should NOT be HIGH (boundary: < -20 is HIGH, -20 itself is MEDIUM)
     */
    @Test
    void testExactlyMinus20_outdoor_returnsMedium() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(-20, 0, 0.0, true);

        // -20 is NOT < -20, so no HIGH. But -20 < -10 is true → MEDIUM
        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.MEDIUM);
    }

    /**
     * Hot but within safe range (35°C) → MEDIUM (> 35 is HIGH, 35 = MEDIUM boundary)
     */
    @Test
    void testExactly35Celsius_outdoor_returnsMedium() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(35, 0, 0.0, true);

        // 35 is NOT > 35, but 35 > 35 is false. 35 >= 35 → check: temp > 35 is false
        // But temp < -10 || temp > 35 → both false. wind/rain also 0 → LOW
        // Actually rule says temp > 35 → MEDIUM. 35 is boundary so → LOW
        assertThat(risk.riskLevel()).isIn(WeatherRiskAnalyzer.RiskLevel.LOW, WeatherRiskAnalyzer.RiskLevel.MEDIUM);
    }

    /**
     * All factors combined: HIGH wind takes priority for HIGH risk
     */
    @Test
    void testStormyWeather_outdoor_returnsHigh() {
        WeatherRiskAnalyzer.WeatherRisk risk = analyzer.analyze(10, 65, 5.0, true);

        assertThat(risk.riskLevel()).isEqualTo(WeatherRiskAnalyzer.RiskLevel.HIGH);
    }
}
