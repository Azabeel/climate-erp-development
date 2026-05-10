package ru.servisklimat.domain.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.api.dto.engineer.CreateEngineerRequest;
import ru.servisklimat.api.dto.engineer.EngineerDto;
import ru.servisklimat.api.mapper.EngineerMapper;
import ru.servisklimat.domain.model.Engineer;
import ru.servisklimat.domain.repository.BrandRepository;
import ru.servisklimat.domain.repository.EngineerCertificationRepository;
import ru.servisklimat.domain.repository.EngineerRepository;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EngineerServiceTest {

    @Mock
    EngineerRepository engineerRepository;

    @Mock
    EngineerCertificationRepository certificationRepository;

    @Mock
    BrandRepository brandRepository;

    @Mock
    EngineerMapper engineerMapper;

    @InjectMocks
    EngineerService engineerService;

    @Test
    void testCreate_success() {
        CreateEngineerRequest request = new CreateEngineerRequest(
                null, "Петров Пётр Петрович", "+79001112233",
                "petrov@example.com", "EMPLOYEE", null, null, null,
                "OWN_CAR", null, null, false, true, null);

        Engineer engineer = Engineer.builder()
                .id(UUID.randomUUID())
                .fullName("Петров Пётр Петрович")
                .isActive(true)
                .useInAutoScheduler(true)
                .build();

        EngineerDto expectedDto = new EngineerDto(
                engineer.getId(), null, "Петров Пётр Петрович",
                "+79001112233", "petrov@example.com", "EMPLOYEE",
                null, null, null, "OWN_CAR", null, null,
                false, true, true, null, null);

        when(engineerMapper.toEntity(request)).thenReturn(engineer);
        when(engineerRepository.save(engineer)).thenReturn(engineer);
        when(engineerMapper.toDto(engineer)).thenReturn(expectedDto);

        EngineerDto result = engineerService.create(request);

        assertThat(result).isNotNull();
        assertThat(result.fullName()).isEqualTo("Петров Пётр Петрович");
        verify(engineerRepository).save(engineer);
    }

    @Test
    void testFindAvailable_returnsOnlyActive() {
        Engineer activeEngineer = Engineer.builder()
                .id(UUID.randomUUID())
                .fullName("Активный Инженер")
                .isActive(true)
                .useInAutoScheduler(true)
                .build();

        EngineerDto activeDto = new EngineerDto(
                activeEngineer.getId(), null, "Активный Инженер",
                null, null, "EMPLOYEE", null, null, null, "OWN_CAR",
                null, null, false, true, true, null, null);

        when(engineerRepository.findByIsActiveTrueAndUseInAutoSchedulerTrue())
                .thenReturn(List.of(activeEngineer));
        when(engineerMapper.toDto(activeEngineer)).thenReturn(activeDto);

        List<EngineerDto> result = engineerService.findAvailable();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).isActive()).isTrue();
        assertThat(result.get(0).useInAutoScheduler()).isTrue();
    }
}
