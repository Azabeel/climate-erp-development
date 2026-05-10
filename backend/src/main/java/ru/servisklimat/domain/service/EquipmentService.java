package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.Equipment;
import ru.servisklimat.domain.model.EquipmentType;
import ru.servisklimat.domain.model.MaintenancePlan;
import ru.servisklimat.domain.model.ServiceLocation;
import ru.servisklimat.domain.repository.EquipmentRepository;
import ru.servisklimat.domain.repository.EquipmentTypeRepository;
import ru.servisklimat.domain.repository.MaintenancePlanRepository;
import ru.servisklimat.domain.repository.ServiceLocationRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EquipmentService {

    private final EquipmentRepository equipmentRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;
    private final ServiceLocationRepository serviceLocationRepository;
    private final MaintenancePlanRepository maintenancePlanRepository;
    private final QRCodeService qrCodeService;

    // ─── Equipment ────────────────────────────────────────────────────────────

    public Page<Equipment> findAll(Pageable pageable) {
        return equipmentRepository.findByIsActiveTrue(pageable);
    }

    public Equipment findById(UUID id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Equipment not found: " + id));
    }

    public Page<Equipment> findByClientId(UUID clientId, Pageable pageable) {
        return equipmentRepository.findByClientId(clientId, pageable);
    }

    @Transactional
    public Equipment create(Equipment equipment) {
        return equipmentRepository.save(equipment);
    }

    @Transactional
    public Equipment update(UUID id, Equipment updates) {
        Equipment existing = findById(id);
        updates.setId(existing.getId());
        return equipmentRepository.save(updates);
    }

    @Transactional
    public void deactivate(UUID id) {
        Equipment equipment = findById(id);
        equipment.setIsActive(false);
        equipmentRepository.save(equipment);
    }

    /**
     * Generates a QR code for the equipment, stores it in qrCodeUrl, and saves.
     *
     * @param id equipment UUID
     * @return the generated QR code string
     */
    @Transactional
    public String generateQr(UUID id) {
        Equipment equipment = findById(id);
        String qrCode = qrCodeService.generateQrCode(
                equipment.getId(),
                equipment.getClientId(),
                equipment.getSerialNumber()
        );
        equipment.setQrCodeUrl(qrCode);
        equipmentRepository.save(equipment);
        return qrCode;
    }

    /**
     * Returns all active equipment whose last service date was more than
     * (frequencyMonths) ago — i.e., due within the next 30 days window.
     */
    public List<Equipment> findDueForMaintenance() {
        LocalDate cutoff = LocalDate.now().plusDays(30);
        return equipmentRepository.findDueForMaintenance(cutoff);
    }

    // ─── EquipmentType ────────────────────────────────────────────────────────

    public Page<EquipmentType> findAllTypes(Pageable pageable) {
        return equipmentTypeRepository.findByIsActiveTrue(pageable);
    }

    public EquipmentType findTypeById(UUID id) {
        return equipmentTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("EquipmentType not found: " + id));
    }

    @Transactional
    public EquipmentType createType(EquipmentType type) {
        return equipmentTypeRepository.save(type);
    }

    // ─── ServiceLocation ──────────────────────────────────────────────────────

    public Page<ServiceLocation> findAllLocations(Pageable pageable) {
        return serviceLocationRepository.findByIsActiveTrue(pageable);
    }

    public ServiceLocation findLocationById(UUID id) {
        return serviceLocationRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("ServiceLocation not found: " + id));
    }

    public List<ServiceLocation> findLocationsByClientId(UUID clientId) {
        return serviceLocationRepository.findByClientId(clientId);
    }

    @Transactional
    public ServiceLocation createLocation(ServiceLocation location) {
        return serviceLocationRepository.save(location);
    }

    // ─── MaintenancePlan ──────────────────────────────────────────────────────

    public List<MaintenancePlan> findPlansByEquipmentId(UUID equipmentId) {
        return maintenancePlanRepository.findByEquipmentIdAndIsActiveTrue(equipmentId);
    }

    @Transactional
    public MaintenancePlan createPlan(MaintenancePlan plan) {
        return maintenancePlanRepository.save(plan);
    }
}
