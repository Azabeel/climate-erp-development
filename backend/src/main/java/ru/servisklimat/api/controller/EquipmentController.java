package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.equipment.*;
import ru.servisklimat.domain.model.Equipment;
import ru.servisklimat.domain.model.EquipmentType;
import ru.servisklimat.domain.model.ServiceLocation;
import ru.servisklimat.domain.service.AssetHistoryService;
import ru.servisklimat.domain.service.EquipmentService;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;
    private final AssetHistoryService assetHistoryService;

    // ─── Equipment endpoints ──────────────────────────────────────────────────

    @GetMapping("/api/v1/equipment")
    public Page<EquipmentDto> listEquipment(Pageable pageable) {
        return equipmentService.findAll(pageable).map(this::toDto);
    }

    @GetMapping("/api/v1/equipment/{id}")
    public EquipmentDto getEquipment(@PathVariable UUID id) {
        return toDto(equipmentService.findById(id));
    }

    @PostMapping("/api/v1/equipment")
    @ResponseStatus(HttpStatus.CREATED)
    public EquipmentDto createEquipment(@Valid @RequestBody CreateEquipmentRequest request) {
        Equipment equipment = Equipment.builder()
                .clientId(request.clientId())
                .locationId(request.locationId())
                .equipmentTypeId(request.equipmentTypeId())
                .name(request.name())
                .serialNumber(request.serialNumber())
                .inventoryNumber(request.inventoryNumber())
                .model(request.model())
                .brandId(request.brandId())
                .refrigerantType(request.refrigerantType())
                .powerKw(request.powerKw())
                .warrantyStart(request.warrantyStart())
                .warrantyEnd(request.warrantyEnd())
                .contractId(request.contractId())
                .build();
        return toDto(equipmentService.create(equipment));
    }

    @GetMapping("/api/v1/equipment/{id}/history")
    public List<AssetEventDto> getEquipmentHistory(@PathVariable UUID id) {
        return assetHistoryService.getHistory(id).stream()
                .map(e -> new AssetEventDto(e.id(), e.eventType(), e.description(),
                        e.occurredAt(), e.relatedEntityId()))
                .collect(Collectors.toList());
    }

    @GetMapping("/api/v1/equipment/{id}/qr")
    public QrCodeResponse getEquipmentQr(@PathVariable UUID id) {
        String qrCode = equipmentService.generateQr(id);
        return new QrCodeResponse(id, qrCode);
    }

    @GetMapping("/api/v1/equipment/due-maintenance")
    public List<EquipmentDto> getDueMaintenance() {
        return equipmentService.findDueForMaintenance().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ─── ServiceLocation endpoints ────────────────────────────────────────────

    @GetMapping("/api/v1/service-locations")
    public Page<ServiceLocationDto> listLocations(Pageable pageable) {
        return equipmentService.findAllLocations(pageable).map(this::toLocationDto);
    }

    @GetMapping("/api/v1/service-locations/{id}")
    public ServiceLocationDto getLocation(@PathVariable UUID id) {
        return toLocationDto(equipmentService.findLocationById(id));
    }

    @PostMapping("/api/v1/service-locations")
    @ResponseStatus(HttpStatus.CREATED)
    public ServiceLocationDto createLocation(@Valid @RequestBody CreateServiceLocationRequest request) {
        ServiceLocation location = ServiceLocation.builder()
                .clientId(request.clientId())
                .name(request.name())
                .address(request.address())
                .lat(request.lat())
                .lng(request.lng())
                .floor(request.floor())
                .room(request.room())
                .accessNotes(request.accessNotes())
                .build();
        return toLocationDto(equipmentService.createLocation(location));
    }

    // ─── EquipmentType endpoints ──────────────────────────────────────────────

    @GetMapping("/api/v1/equipment-types")
    public Page<EquipmentTypeDto> listTypes(Pageable pageable) {
        return equipmentService.findAllTypes(pageable).map(this::toTypeDto);
    }

    @PostMapping("/api/v1/equipment-types")
    @ResponseStatus(HttpStatus.CREATED)
    public EquipmentTypeDto createType(@RequestBody EquipmentTypeDto request) {
        EquipmentType type = EquipmentType.builder()
                .name(request.name())
                .build();
        return toTypeDto(equipmentService.createType(type));
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    private EquipmentDto toDto(Equipment e) {
        return new EquipmentDto(
                e.getId(), e.getClientId(), e.getLocationId(), e.getEquipmentTypeId(),
                e.getSerialNumber(), e.getInventoryNumber(), e.getName(), e.getModel(),
                e.getBrandId(), e.getRefrigerantType(), e.getPowerKw(),
                e.getStatus(), e.getWarrantyStart(), e.getWarrantyEnd(),
                e.getContractId(), e.getQrCodeUrl(), e.getLastServiceDate(),
                e.getPredictedFailureDate(), e.getIsActive(), e.getCreatedAt()
        );
    }

    private ServiceLocationDto toLocationDto(ServiceLocation l) {
        return new ServiceLocationDto(
                l.getId(), l.getClientId(), l.getName(), l.getAddress(),
                l.getLat(), l.getLng(), l.getTimezone(), l.getFloor(),
                l.getRoom(), l.getAccessNotes(), l.getIsActive()
        );
    }

    private EquipmentTypeDto toTypeDto(EquipmentType t) {
        return new EquipmentTypeDto(t.getId(), t.getName(), t.getAttributesSchema(), t.getIsActive());
    }

    // ─── Response wrappers ────────────────────────────────────────────────────

    public record QrCodeResponse(UUID equipmentId, String qrCode) {}
}
