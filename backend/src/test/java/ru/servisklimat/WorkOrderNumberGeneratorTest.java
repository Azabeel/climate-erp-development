package ru.servisklimat;

import org.junit.jupiter.api.Test;
import ru.servisklimat.domain.service.WorkOrderNumberGenerator;

import static org.assertj.core.api.Assertions.assertThat;

class WorkOrderNumberGeneratorTest {

    private final WorkOrderNumberGenerator generator = new WorkOrderNumberGenerator();

    @Test
    void generateFormatsCorrectly() {
        String number = generator.generate(2026, 1L);
        assertThat(number).isEqualTo("WO-2026-000001");
    }

    @Test
    void generatePadsSequenceToSixDigits() {
        assertThat(generator.generate(2026, 999999L)).isEqualTo("WO-2026-999999");
        assertThat(generator.generate(2026, 42L)).isEqualTo("WO-2026-000042");
    }

    @Test
    void isValidFormatAcceptsCorrectPattern() {
        assertThat(generator.isValidFormat("WO-2026-000001")).isTrue();
        assertThat(generator.isValidFormat("WO-2025-123456")).isTrue();
    }

    @Test
    void isValidFormatRejectsInvalidPatterns() {
        assertThat(generator.isValidFormat(null)).isFalse();
        assertThat(generator.isValidFormat("")).isFalse();
        assertThat(generator.isValidFormat("WO-2026-1")).isFalse();
        assertThat(generator.isValidFormat("INVALID")).isFalse();
    }
}
