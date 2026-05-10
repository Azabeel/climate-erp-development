package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.supplier.CreateSupplierRequest;
import ru.servisklimat.api.dto.supplier.SupplierDto;
import ru.servisklimat.api.dto.supplier.UpdateSupplierRequest;
import ru.servisklimat.api.mapper.SupplierMapper;
import jakarta.persistence.EntityNotFoundException;
import ru.servisklimat.domain.model.Supplier;
import ru.servisklimat.domain.repository.SupplierRepository;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/suppliers")
@RequiredArgsConstructor
public class SupplierController {

    private final SupplierRepository supplierRepository;
    private final SupplierMapper supplierMapper;

    @GetMapping
    public ResponseEntity<Page<SupplierDto>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(supplierRepository.findAll(pageable).map(supplierMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierDto> findById(@PathVariable UUID id) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
        return ResponseEntity.ok(supplierMapper.toDto(supplier));
    }

    @PostMapping
    public ResponseEntity<SupplierDto> create(@Valid @RequestBody CreateSupplierRequest request) {
        Supplier supplier = supplierMapper.toEntity(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(supplierMapper.toDto(supplierRepository.save(supplier)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSupplierRequest request) {
        Supplier supplier = supplierRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Supplier not found with id: " + id));
        supplierMapper.updateEntity(request, supplier);
        return ResponseEntity.ok(supplierMapper.toDto(supplierRepository.save(supplier)));
    }
}
