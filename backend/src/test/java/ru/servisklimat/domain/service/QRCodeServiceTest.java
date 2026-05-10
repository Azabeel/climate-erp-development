package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class QRCodeServiceTest {

    private QRCodeService qrCodeService;

    @BeforeEach
    void setUp() {
        qrCodeService = new QRCodeService();
    }

    /**
     * Test 1: generateQrContent produces correct format "SK-EQ:{id}:{clientId}:{serial}"
     */
    @Test
    void testGenerateQrContent_correctFormat() {
        UUID equipmentId = UUID.fromString("11111111-1111-1111-1111-111111111111");
        UUID clientId = UUID.fromString("22222222-2222-2222-2222-222222222222");
        String serial = "SN-ABC-123";

        String content = qrCodeService.generateQrContent(equipmentId, clientId, serial);

        assertThat(content).isEqualTo("SK-EQ:" + equipmentId + ":" + clientId + ":" + serial);
    }

    /**
     * Test 2: null serial number falls back to "UNKNOWN"
     */
    @Test
    void testGenerateQrContent_nullSerial_usesUnknown() {
        UUID equipmentId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();

        String content = qrCodeService.generateQrContent(equipmentId, clientId, null);

        assertThat(content).endsWith(":UNKNOWN");
        assertThat(content).startsWith("SK-EQ:");
    }

    /**
     * Test 3: generateQrCode returns non-null non-empty Base64 string
     */
    @Test
    void testGenerateQrCode_returnsNonEmpty() {
        UUID equipmentId = UUID.randomUUID();
        UUID clientId = UUID.randomUUID();
        String serial = "TEST-SERIAL";

        String qrCode = qrCodeService.generateQrCode(equipmentId, clientId, serial);

        assertThat(qrCode).isNotNull();
        assertThat(qrCode).isNotBlank();
        // Verify it is valid Base64
        byte[] decoded = java.util.Base64.getDecoder().decode(qrCode);
        assertThat(new String(decoded)).contains("SK-EQ:");
    }
}
