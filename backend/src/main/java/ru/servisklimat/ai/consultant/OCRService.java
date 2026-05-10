package ru.servisklimat.ai.consultant;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Stub OCR service for error code recognition from images.
 * In production would use ML Kit BarcodeScanning or Tesseract OCR.
 */
@Slf4j
@Service
public class OCRService {

    /**
     * Recognizes an error code from a base64-encoded image.
     *
     * @param imageBase64 base64-encoded image data
     * @return recognized error code string, or null if nothing recognized
     */
    public String recognize(String imageBase64) {
        if (imageBase64 == null || imageBase64.isBlank()) {
            return null;
        }

        // Stub implementation — in production would call ML Kit or Tesseract
        log.debug("OCR stub: processing image of {} chars", imageBase64.length());

        if (imageBase64.length() > 100) {
            return "E-01";
        }

        return null;
    }
}
