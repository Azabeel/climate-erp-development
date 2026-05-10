package ru.servisklimat.domain.service;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;

/**
 * Calculates GPS track distances using the Haversine formula.
 */
@Component
public class GPSTrackAnalyzer {

    private static final double EARTH_RADIUS_KM = 6371.0;

    /**
     * Calculates the total distance from a list of GPS points.
     *
     * @param points list of [lat, lng] pairs as double[2] arrays
     * @return total distance in kilometers, rounded to 3 decimal places
     */
    public BigDecimal calculateDistance(List<double[]> points) {
        if (points == null || points.size() < 2) {
            return BigDecimal.ZERO;
        }

        double totalKm = 0.0;
        for (int i = 1; i < points.size(); i++) {
            double[] prev = points.get(i - 1);
            double[] curr = points.get(i);
            totalKm += haversineKm(prev[0], prev[1], curr[0], curr[1]);
        }

        return BigDecimal.valueOf(totalKm).setScale(3, RoundingMode.HALF_UP);
    }

    /**
     * Haversine formula: calculates great-circle distance between two coordinates.
     *
     * @param lat1 latitude of point 1 in degrees
     * @param lng1 longitude of point 1 in degrees
     * @param lat2 latitude of point 2 in degrees
     * @param lng2 longitude of point 2 in degrees
     * @return distance in kilometers
     */
    double haversineKm(double lat1, double lng1, double lat2, double lng2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLng = Math.toRadians(lng2 - lng1);

        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(lat1Rad) * Math.cos(lat2Rad)
                * Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }
}
