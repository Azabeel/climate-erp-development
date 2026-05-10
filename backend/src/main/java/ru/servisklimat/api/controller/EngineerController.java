package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.engineer.CertificationDto;
import ru.servisklimat.api.dto.engineer.CreateCertificationRequest;
import ru.servisklimat.api.dto.engineer.CreateEngineerRequest;
import ru.servisklimat.api.dto.engineer.EngineerDto;
import ru.servisklimat.api.dto.engineer.UpdateEngineerRequest;
import ru.servisklimat.domain.service.EngineerService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/engineers")
@RequiredArgsConstructor
public class EngineerController {

    private final EngineerService engineerService;

    @GetMapping
    public ResponseEntity<Page<EngineerDto>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(engineerService.findAll(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EngineerDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(engineerService.findById(id));
    }

    @PostMapping
    public ResponseEntity<EngineerDto> create(@Valid @RequestBody CreateEngineerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(engineerService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<EngineerDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEngineerRequest request) {
        return ResponseEntity.ok(engineerService.update(id, request));
    }

    @GetMapping("/{id}/certifications")
    public ResponseEntity<List<CertificationDto>> getCertifications(@PathVariable UUID id) {
        return ResponseEntity.ok(engineerService.getCertifications(id));
    }

    @PostMapping("/{id}/certifications")
    public ResponseEntity<CertificationDto> addCertification(
            @PathVariable UUID id,
            @Valid @RequestBody CreateCertificationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(engineerService.addCertification(id, request));
    }
}
