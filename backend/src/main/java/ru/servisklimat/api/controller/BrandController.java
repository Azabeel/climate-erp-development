package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.brand.BrandDto;
import ru.servisklimat.api.dto.brand.CreateBrandRequest;
import ru.servisklimat.api.dto.brand.UpdateBrandRequest;
import ru.servisklimat.api.mapper.BrandMapper;
import jakarta.persistence.EntityNotFoundException;
import ru.servisklimat.domain.model.Brand;
import ru.servisklimat.domain.repository.BrandRepository;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/brands")
@RequiredArgsConstructor
public class BrandController {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;

    @GetMapping
    public ResponseEntity<Page<BrandDto>> findAll(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(brandRepository.findAll(pageable).map(brandMapper::toDto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BrandDto> findById(@PathVariable UUID id) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        return ResponseEntity.ok(brandMapper.toDto(brand));
    }

    @PostMapping
    public ResponseEntity<BrandDto> create(@Valid @RequestBody CreateBrandRequest request) {
        Brand brand = brandMapper.toEntity(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(brandMapper.toDto(brandRepository.save(brand)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<BrandDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateBrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Brand not found with id: " + id));
        brandMapper.updateEntity(request, brand);
        return ResponseEntity.ok(brandMapper.toDto(brandRepository.save(brand)));
    }
}
