package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.stock.*;
import ru.servisklimat.domain.model.enums.StockLocationType;
import ru.servisklimat.domain.service.StockService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    // ─── Stock Items ───────────────────────────────────────────────────────────

    @GetMapping("/items")
    public Page<StockItemDto> getItems(Pageable pageable) {
        return stockService.findActiveItems(pageable);
    }

    @GetMapping("/items/{id}")
    public StockItemDto getItem(@PathVariable UUID id) {
        return stockService.findById(id);
    }

    @PostMapping("/items")
    @ResponseStatus(HttpStatus.CREATED)
    public StockItemDto createItem(@Valid @RequestBody CreateStockItemRequest request) {
        return stockService.createItem(request);
    }

    @PutMapping("/items/{id}")
    public StockItemDto updateItem(@PathVariable UUID id,
                                   @Valid @RequestBody UpdateStockItemRequest request) {
        return stockService.updateItem(id, request);
    }

    // ─── Balances ─────────────────────────────────────────────────────────────

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(
            @RequestParam(required = false) UUID stockItemId,
            @RequestParam(required = false) UUID engineerId,
            @RequestParam(required = false) StockLocationType locationType) {

        if (engineerId != null && stockItemId == null) {
            // Return all mobile balances for engineer
            List<StockBalanceDto> balances = stockService.getAllBalances(engineerId);
            return ResponseEntity.ok(balances);
        }

        StockLocationType type = locationType != null ? locationType : StockLocationType.CENTRAL;
        StockBalanceDto balance = stockService.getBalance(stockItemId, type, engineerId);
        return ResponseEntity.ok(balance);
    }

    @GetMapping("/balance/low-stock")
    public List<StockBalanceDto> getLowStockItems() {
        return stockService.getLowStockItems();
    }

    // ─── Movements ────────────────────────────────────────────────────────────

    @PostMapping("/movements/receive")
    @ResponseStatus(HttpStatus.CREATED)
    public StockMovementDto receive(@Valid @RequestBody ReceiveStockRequest request) {
        return stockService.receipt(request);
    }

    @PostMapping("/movements/transfer")
    @ResponseStatus(HttpStatus.CREATED)
    public StockMovementDto transfer(@Valid @RequestBody TransferStockRequest request) {
        return stockService.transfer(request);
    }

    @PostMapping("/movements/write-off")
    @ResponseStatus(HttpStatus.CREATED)
    public StockMovementDto writeOff(@Valid @RequestBody WriteOffStockRequest request) {
        return stockService.writeOff(request);
    }

    @PostMapping("/movements/return")
    @ResponseStatus(HttpStatus.CREATED)
    public StockMovementDto returnToStock(@Valid @RequestBody ReturnStockRequest request) {
        return stockService.returnToStock(request);
    }

    @GetMapping("/movements")
    public List<StockMovementDto> getMovements(
            @RequestParam(required = false) UUID workOrderId,
            @RequestParam(required = false) UUID stockItemId) {
        return stockService.findMovements(workOrderId, stockItemId);
    }
}
