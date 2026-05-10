package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.api.dto.refrigerant.*;
import ru.servisklimat.api.mapper.RefrigerantMapper;
import ru.servisklimat.domain.model.RefrigerantCylinder;
import ru.servisklimat.domain.model.RefrigerantLog;
import ru.servisklimat.domain.model.RefrigerantType;
import ru.servisklimat.domain.repository.RefrigerantCylinderRepository;
import ru.servisklimat.domain.repository.RefrigerantLogRepository;
import ru.servisklimat.domain.repository.RefrigerantTypeRepository;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class RefrigerantService {

    private final RefrigerantTypeRepository refrigerantTypeRepository;
    private final RefrigerantCylinderRepository refrigerantCylinderRepository;
    private final RefrigerantLogRepository refrigerantLogRepository;
    private final RefrigerantMapper refrigerantMapper;

    // ─── Types ────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<RefrigerantTypeDto> findAllTypes() {
        return refrigerantMapper.toTypeDtoList(refrigerantTypeRepository.findAll());
    }

    public RefrigerantTypeDto createType(CreateRefrigerantTypeRequest request) {
        RefrigerantType type = refrigerantMapper.toEntity(request);
        return refrigerantMapper.toDto(refrigerantTypeRepository.save(type));
    }

    // ─── Cylinders ────────────────────────────────────────────────────────────

    public RefrigerantCylinderDto createCylinder(CreateCylinderRequest request) {
        RefrigerantCylinder cylinder = refrigerantMapper.toEntity(request);
        return refrigerantMapper.toDto(refrigerantCylinderRepository.save(cylinder));
    }

    @Transactional(readOnly = true)
    public RefrigerantCylinderDto findCylinderById(UUID id) {
        return refrigerantCylinderRepository.findById(id)
                .map(refrigerantMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("RefrigerantCylinder not found: " + id));
    }

    @Transactional(readOnly = true)
    public List<RefrigerantCylinderDto> findActiveCylinders() {
        return refrigerantMapper.toCylinderDtoList(refrigerantCylinderRepository.findByIsActiveTrue());
    }

    public RefrigerantCylinderDto updateCylinder(UUID id, CreateCylinderRequest request) {
        RefrigerantCylinder cylinder = refrigerantCylinderRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("RefrigerantCylinder not found: " + id));

        if (request.serialNumber() != null) cylinder.setSerialNumber(request.serialNumber());
        if (request.refrigerantTypeId() != null) cylinder.setRefrigerantTypeId(request.refrigerantTypeId());
        if (request.initialWeightKg() != null) cylinder.setInitialWeightKg(request.initialWeightKg());
        if (request.currentWeightKg() != null) cylinder.setCurrentWeightKg(request.currentWeightKg());
        if (request.engineerId() != null) cylinder.setEngineerId(request.engineerId());
        if (request.locationType() != null) cylinder.setLocationType(request.locationType());
        if (request.purchasePrice() != null) cylinder.setPurchasePrice(request.purchasePrice());

        return refrigerantMapper.toDto(refrigerantCylinderRepository.save(cylinder));
    }

    // ─── Log ──────────────────────────────────────────────────────────────────

    public RefrigerantLogDto logOperation(CreateRefrigerantLogRequest request) {
        RefrigerantLog log = refrigerantMapper.toEntity(request);
        return refrigerantMapper.toDto(refrigerantLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<RefrigerantLogDto> getEquipmentHistory(UUID equipmentId) {
        return refrigerantMapper.toLogDtoList(refrigerantLogRepository.findByEquipmentId(equipmentId));
    }
}
