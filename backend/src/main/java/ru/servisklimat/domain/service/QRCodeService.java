package ru.servisklimat.domain.service;

import org.springframework.stereotype.Component;

import java.util.Base64;
import java.util.UUID;

/**
 * Generates QR code content for equipment identification.
 * Format: SK-EQ:{equipmentId}:{clientId}:{serialNumber}
 *
 * In production, this would integrate with a QR library (e.g., ZXing)
 * to produce an actual PNG image. For now, the content string is
 * returned as a Base64-encoded placeholder.
 */
@Component
public class QRCodeService {

    private static final String QR_PREFIX = "SK-EQ";

    /**
     * Generates the canonical QR code content string for a piece of equipment.
     *
     * @param equipmentId  UUID of the equipment
     * @param clientId     UUID of the owning client
     * @param serialNumber equipment serial number (null-safe — falls back to "UNKNOWN")
     * @return formatted content string
     */
    public String generateQrContent(UUID equipmentId, UUID clientId, String serialNumber) {
        String serial = (serialNumber != null && !serialNumber.isBlank()) ? serialNumber : "UNKNOWN";
        return QR_PREFIX + ":" + equipmentId + ":" + clientId + ":" + serial;
    }

    /**
     * Returns a Base64-encoded representation of the QR code content.
     * Stub implementation — replace with ZXing-based PNG generation when needed.
     *
     * @param equipmentId  UUID of the equipment
     * @param clientId     UUID of the owning client
     * @param serialNumber equipment serial number
     * @return Base64-encoded string (non-null, non-empty)
     */
    public String generateQrCode(UUID equipmentId, UUID clientId, String serialNumber) {
        String content = generateQrContent(equipmentId, clientId, serialNumber);
        return Base64.getEncoder().encodeToString(content.getBytes());
    }
}
