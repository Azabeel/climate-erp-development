package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.domain.model.ErrorCode;
import ru.servisklimat.domain.repository.ErrorCodeRepository;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ErrorCodeServiceTest {

    @Mock
    ErrorCodeRepository errorCodeRepository;

    @InjectMocks
    ErrorCodeService errorCodeService;

    @Test
    void findByCode_existingCode_returnsErrorCode() {
        ErrorCode errorCode = ErrorCode.builder()
                .id(UUID.randomUUID())
                .code("E-01")
                .displayText("Compressor overload")
                .build();

        when(errorCodeRepository.findByCode("E-01")).thenReturn(Optional.of(errorCode));

        ErrorCode result = errorCodeService.findByCode("E-01");

        assertThat(result).isNotNull();
        assertThat(result.getCode()).isEqualTo("E-01");
        assertThat(result.getDisplayText()).isEqualTo("Compressor overload");
    }

    @Test
    void findByCode_unknownCode_throwsEntityNotFoundException() {
        when(errorCodeRepository.findByCode("UNKNOWN")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> errorCodeService.findByCode("UNKNOWN"))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining("UNKNOWN");
    }
}
