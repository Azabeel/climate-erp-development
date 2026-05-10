package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class GPSTrackAnalyzerTest {

    private GPSTrackAnalyzer analyzer;

    @BeforeEach
    void setUp() {
        analyzer = new GPSTrackAnalyzer();
    }

    @Test
    void emptyList_returnsZero() {
        BigDecimal result = analyzer.calculateDistance(Collections.emptyList());
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void singlePoint_returnsZero() {
        List<double[]> points = List.of(new double[]{55.75, 37.62});
        BigDecimal result = analyzer.calculateDistance(points);
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void nullList_returnsZero() {
        BigDecimal result = analyzer.calculateDistance(null);
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void twoPoints_Moscow_returnsPositiveDistance() {
        // ~1.1 km north of Moscow center
        List<double[]> points = List.of(
                new double[]{55.75, 37.62},  // Moscow center-ish
                new double[]{55.76, 37.62}   // ~1.11 km north
        );
        BigDecimal result = analyzer.calculateDistance(points);
        assertThat(result).isGreaterThan(BigDecimal.ZERO);
        // 0.01 degree latitude ≈ 1.11 km
        assertThat(result).isBetween(new BigDecimal("1.0"), new BigDecimal("1.2"));
    }

    @Test
    void fivePoints_sumGreaterThanFirstLastLeg() {
        // Five points in a line going north
        List<double[]> points = List.of(
                new double[]{55.70, 37.62},
                new double[]{55.72, 37.62},
                new double[]{55.74, 37.62},
                new double[]{55.76, 37.62},
                new double[]{55.78, 37.62}
        );
        BigDecimal totalDistance = analyzer.calculateDistance(points);

        // Direct first-last leg distance
        List<double[]> firstLast = List.of(
                new double[]{55.70, 37.62},
                new double[]{55.78, 37.62}
        );
        BigDecimal directDistance = analyzer.calculateDistance(firstLast);

        // Sum of 4 legs should approximately equal direct distance (straight line)
        // Allow 1% tolerance for floating point
        assertThat(totalDistance).isGreaterThan(BigDecimal.ZERO);
        assertThat(totalDistance.subtract(directDistance).abs())
                .isLessThanOrEqualTo(new BigDecimal("0.05"));
    }

    @Test
    void samePointTwice_returnsZeroLeg() {
        List<double[]> points = List.of(
                new double[]{55.75, 37.62},
                new double[]{55.75, 37.62}
        );
        BigDecimal result = analyzer.calculateDistance(points);
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }
}
