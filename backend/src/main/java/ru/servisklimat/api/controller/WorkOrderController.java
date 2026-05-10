package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.workorder.*;
import ru.servisklimat.api.mapper.WorkOrderMapper;
import ru.servisklimat.domain.service.WorkOrderService;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/work-orders")
@RequiredArgsConstructor
public class WorkOrderController {

    private final WorkOrderService workOrderService;
    private final WorkOrderMapper workOrderMapper;

    @GetMapping
    public Page<WorkOrderDto> list(Pageable pageable) {
        return workOrderService.findAll(pageable).map(workOrderMapper::toDto);
    }

    @GetMapping("/{id}")
    public WorkOrderDto getById(@PathVariable UUID id) {
        return workOrderMapper.toDto(workOrderService.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public WorkOrderDto create(@Valid @RequestBody CreateWorkOrderRequest request) {
        return workOrderMapper.toDto(workOrderService.create(
                request.clientId(), request.type(), request.priority(), request.source(),
                request.contractId(), request.contactId(), request.locationId(),
                request.equipmentId(), request.description(), request.dispatcherComment()));
    }

    @PostMapping("/{id}/status")
    public WorkOrderDto updateStatus(@PathVariable UUID id,
                                     @Valid @RequestBody UpdateStatusRequest request,
                                     @AuthenticationPrincipal Jwt jwt) {
        UUID userId = jwt != null ? UUID.fromString(jwt.getSubject()) : null;
        return workOrderMapper.toDto(
                workOrderService.transition(id, request.status(), userId, request.comment()));
    }

    @PostMapping("/{id}/assign")
    public WorkOrderDto assign(@PathVariable UUID id,
                               @Valid @RequestBody AssignEngineerRequest request) {
        return workOrderMapper.toDto(
                workOrderService.assign(id, request.engineerId(), request.secondEngineerId()));
    }

    @PostMapping("/{id}/materials")
    @ResponseStatus(HttpStatus.CREATED)
    public WorkOrderDto addMaterial(@PathVariable UUID id,
                                    @Valid @RequestBody AddMaterialRequest request,
                                    @AuthenticationPrincipal Jwt jwt) {
        UUID userId = jwt != null ? UUID.fromString(jwt.getSubject()) : null;
        return workOrderMapper.toDto(workOrderService.addMaterial(
                id, request.stockItemId(), request.qty(),
                request.unitPrice(), request.salePrice(), userId));
    }
}
