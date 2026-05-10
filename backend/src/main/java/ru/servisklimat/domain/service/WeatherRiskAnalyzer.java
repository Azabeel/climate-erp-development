package ru.servisklimat.domain.service;

import org.springframework.stereotype.Component;

/**
 * Analyzes weather risk for outdoor installation/maintenance work.
 *
 * Rules (from CLAUDE.md Sprint 12):
 *   - temperature < -20 or > 40  → HIGH
 *   - windSpeed > 60              → HIGH
 *   - precipitationMm > 20       → HIGH
 *   - temperature < -10 or > 35 OR windSpeed > 30 OR precipitationMm > 10 → MEDIUM
 *   - else                       → LOW
 *   - if !isOutdoor              → always LOW (indoor work ignores weather)
 */
@Component
public class WeatherRiskAnalyzer {

    public enum RiskLevel { LOW, MEDIUM, HIGH }

    public record WeatherRisk(RiskLevel riskLevel, String recommendation) {}

    /**
     * Analyzes weather conditions and returns a risk assessment.
     *
     * @param temperatureCelsius ambient temperature in degrees Celsius
     * @param windSpeedKmh       wind speed in km/h
     * @param precipitationMm    precipitation (rain/snow) in mm
     * @param isOutdoor          true if the work involves outdoor activities
     * @return WeatherRisk with risk level and recommendation text
     */
    public WeatherRisk analyze(int temperatureCelsius, int windSpeedKmh, double precipitationMm, boolean isOutdoor) {
        if (!isOutdoor) {
            return new WeatherRisk(RiskLevel.LOW, "Работа в помещении. Погодные условия не влияют.");
        }

        // HIGH risk conditions
        if (temperatureCelsius < -20) {
            return new WeatherRisk(RiskLevel.HIGH,
                    "Экстремальный мороз (" + temperatureCelsius + "°C). Рекомендуется перенести работы на улице.");
        }
        if (temperatureCelsius > 40) {
            return new WeatherRisk(RiskLevel.HIGH,
                    "Экстремальная жара (" + temperatureCelsius + "°C). Высокий риск теплового удара. Перенесите работы.");
        }
        if (windSpeedKmh > 60) {
            return new WeatherRisk(RiskLevel.HIGH,
                    "Штормовой ветер (" + windSpeedKmh + " км/ч). Работы на высоте запрещены. Перенесите работы.");
        }
        if (precipitationMm > 20) {
            return new WeatherRisk(RiskLevel.HIGH,
                    "Сильные осадки (" + precipitationMm + " мм). Работы на улице опасны. Рекомендуется перенести.");
        }

        // MEDIUM risk conditions
        if (temperatureCelsius < -10 || temperatureCelsius > 35
                || windSpeedKmh > 30
                || precipitationMm > 10) {
            return new WeatherRisk(RiskLevel.MEDIUM,
                    buildMediumRecommendation(temperatureCelsius, windSpeedKmh, precipitationMm));
        }

        // LOW risk
        return new WeatherRisk(RiskLevel.LOW,
                "Погодные условия благоприятны для работы. Соблюдайте стандартные меры безопасности.");
    }

    private String buildMediumRecommendation(int temp, int wind, double rain) {
        StringBuilder sb = new StringBuilder("Неблагоприятные условия: ");
        if (temp < -10) {
            sb.append("низкая температура (").append(temp).append("°C); ");
        } else if (temp > 35) {
            sb.append("высокая температура (").append(temp).append("°C); ");
        }
        if (wind > 30) {
            sb.append("сильный ветер (").append(wind).append(" км/ч); ");
        }
        if (rain > 10) {
            sb.append("умеренные осадки (").append(rain).append(" мм); ");
        }
        sb.append("Используйте защитное снаряжение и соблюдайте дополнительные меры предосторожности.");
        return sb.toString();
    }
}
