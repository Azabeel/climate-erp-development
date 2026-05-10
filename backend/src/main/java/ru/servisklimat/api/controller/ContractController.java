package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.contract.ContractDto;
import ru.servisklimat.api.dto.contract.CreateContractRequest;
import ru.servisklimat.api.dto.contract.UpdateContractRequest;
import ru.servisklimat.domain.service.ContractService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/contracts")
@RequiredArgsConstructor
public class ContractController {

    private final ContractService contractService;

    @GetMapping
    public ResponseEntity<?> findAll(
            @RequestParam(required = false) UUID clientId,
            @PageableDefault(size = 20) Pageable pageable) {
        if (clientId != null) {
            List<ContractDto> contracts = contractService.findByClient(clientId);
            return ResponseEntity.ok(contracts);
        }
        Page<ContractDto> page = contractService.findAll(pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ContractDto> findById(@PathVariable UUID id) {
        return ResponseEntity.ok(contractService.findById(id));
    }

    @PostMapping
    public ResponseEntity<ContractDto> create(@Valid @RequestBody CreateContractRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(contractService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ContractDto> update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateContractRequest request) {
        return ResponseEntity.ok(contractService.update(id, request));
    }
}
