package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.domain.model.Equipment;
import ru.servisklimat.domain.repository.EquipmentRepository;
import ru.servisklimat.domain.repository.EquipmentTypeRepository;
import ru.servisklimat.domain.repository.MaintenancePlanRepository;
import ru.servisklimat.domain.repository.ServiceLocationRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EquipmentServiceTest {

    @Mock
    private EquipmentRepository equipmentRepository;

    @Mock
    private EquipmentTypeRepository equipmentTypeRepository;

    @Mock
    private ServiceLocationRepository serviceLocationRepository;

    @Mock
    private MaintenancePlanRepository maintenancePlanRepository;

    @Mock
    private QRCodeService qrCodeService;

    @InjectMocks
    private EquipmentService equipmentService;

    /**
     * Test 1: findById with unknown UUID throws EntityNotFoundException
     */
    @Test
    void testFindById_notFound_throwsEntityNotFoundException() {
        UUID unknownId = UUID.randomUUID();
        when(equipmentRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> equipmentService.findById(unknownId))
                .isInstanceOf(EntityNotFoundException.class)
                .hasMessageContaining(unknownId.toString());
    }

    /**
     * Test 2: create saves and returns the equipment entity
     */
    @Test
    void testCreate_savesAndReturns() {
        UUID clientId = UUID.randomUUID();
        Equipment input = Equipment.builder()
                .clientId(clientId)
                .name("Кондиционер Samsung")
                .serialNumber("SN-001")
                .build();

        Equipment saved = Equipment.builder()
                .id(UUID.randomUUID())
                .clientId(clientId)
                .name("Кондиционер Samsung")
                .serialNumber("SN-001")
                .build();

        when(equipmentRepository.save(input)).thenReturn(saved);

        Equipment result = equipmentService.create(input);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isNotNull();
        assertThat(result.getName()).isEqualTo("Кондиционер Samsung");
        verify(equipmentRepository).save(input);
    }

    /**
     * Test 3: findDueForMaintenance calls repository with date = today + 30 days
     */
    @Test
    void testFindDueForMaintenance_callsRepositoryWithCorrectDate() {
        LocalDate expectedCutoff = LocalDate.now().plusDays(30);
        UUID equipmentId = UUID.randomUUID();

        Equipment dueEquipment = Equipment.builder()
                .id(equipmentId)
                .name("Старый кондиционер")
                .lastServiceDate(LocalDate.now().minusMonths(8))
                .build();

        when(equipmentRepository.findDueForMaintenance(expectedCutoff))
                .thenReturn(List.of(dueEquipment));

        List<Equipment> result = equipmentService.findDueForMaintenance();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(equipmentId);
        verify(equipmentRepository).findDueForMaintenance(expectedCutoff);
    }
}
