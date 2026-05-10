package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.api.dto.stock.*;
import ru.servisklimat.api.mapper.StockMapper;
import ru.servisklimat.domain.model.StockBalance;
import ru.servisklimat.domain.model.StockItem;
import ru.servisklimat.domain.model.StockMovement;
import ru.servisklimat.domain.model.enums.MovementType;
import ru.servisklimat.domain.model.enums.StockLocationType;
import ru.servisklimat.domain.repository.StockBalanceRepository;
import ru.servisklimat.domain.repository.StockItemRepository;
import ru.servisklimat.domain.repository.StockMovementRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class StockService {

    private final StockItemRepository stockItemRepository;
    private final StockBalanceRepository stockBalanceRepository;
    private final StockMovementRepository stockMovementRepository;
    private final StockMapper stockMapper;

    // ─── Stock Items ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<StockItemDto> findActiveItems(Pageable pageable) {
        return stockItemRepository.findByIsActiveTrue(pageable)
                .map(stockMapper::toDto);
    }

    @Transactional(readOnly = true)
    public StockItemDto findById(UUID id) {
        return stockItemRepository.findById(id)
                .map(stockMapper::toDto)
                .orElseThrow(() -> new EntityNotFoundException("StockItem not found: " + id));
    }

    public StockItemDto createItem(CreateStockItemRequest request) {
        StockItem item = stockMapper.toEntity(request);
        item = stockItemRepository.save(item);
        return stockMapper.toDto(item);
    }

    public StockItemDto updateItem(UUID id, UpdateStockItemRequest request) {
        StockItem item = stockItemRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("StockItem not found: " + id));

        if (request.name() != null) item.setName(request.name());
        if (request.article() != null) item.setArticle(request.article());
        if (request.unit() != null) item.setUnit(request.unit());
        if (request.category() != null) item.setCategory(request.category());
        if (request.brandId() != null) item.setBrandId(request.brandId());
        if (request.minStockLevel() != null) item.setMinStockLevel(request.minStockLevel());
        if (request.purchasePrice() != null) item.setPurchasePrice(request.purchasePrice());
        if (request.salePrice() != null) item.setSalePrice(request.salePrice());
        if (request.barcode() != null) item.setBarcode(request.barcode());
        if (request.externalId() != null) item.setExternalId(request.externalId());
        if (request.isActive() != null) item.setIsActive(request.isActive());

        return stockMapper.toDto(stockItemRepository.save(item));
    }

    // ─── Balances ─────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public StockBalanceDto getBalance(UUID stockItemId, StockLocationType type, UUID engineerId) {
        StockBalance balance;
        if (engineerId == null) {
            balance = stockBalanceRepository
                    .findByStockItemIdAndLocationTypeAndEngineerIdIsNull(stockItemId, type)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Balance not found for item " + stockItemId + " at " + type));
        } else {
            balance = stockBalanceRepository
                    .findByStockItemIdAndLocationTypeAndEngineerId(stockItemId, type, engineerId)
                    .orElseThrow(() -> new EntityNotFoundException(
                            "Balance not found for item " + stockItemId + " engineer " + engineerId));
        }
        return stockMapper.toDto(balance);
    }

    @Transactional(readOnly = true)
    public List<StockBalanceDto> getAllBalances(UUID engineerId) {
        List<StockBalance> balances = stockBalanceRepository
                .findByEngineerIdAndLocationType(engineerId, StockLocationType.MOBILE);
        return stockMapper.toBalanceDtoList(balances);
    }

    @Transactional(readOnly = true)
    public List<StockBalanceDto> getLowStockItems() {
        // Return all balances where qty <= minStockLevel
        return stockItemRepository.findAll().stream()
                .filter(item -> Boolean.TRUE.equals(item.getIsActive())
                        && item.getMinStockLevel() != null)
                .flatMap(item -> stockBalanceRepository.findByStockItemId(item.getId()).stream()
                        .filter(b -> b.getLocationType() == StockLocationType.CENTRAL)
                        .filter(b -> b.getQty().compareTo(item.getMinStockLevel()) <= 0))
                .map(stockMapper::toDto)
                .collect(Collectors.toList());
    }

    // ─── Movements ────────────────────────────────────────────────────────────

    public StockMovementDto receipt(ReceiveStockRequest request) {
        // Add qty to CENTRAL balance
        StockBalance balance = stockBalanceRepository
                .findByStockItemIdAndLocationTypeAndEngineerIdIsNull(
                        request.stockItemId(), StockLocationType.CENTRAL)
                .orElseGet(() -> StockBalance.builder()
                        .stockItemId(request.stockItemId())
                        .locationType(StockLocationType.CENTRAL)
                        .qty(BigDecimal.ZERO)
                        .reservedQty(BigDecimal.ZERO)
                        .build());

        balance.setQty(balance.getQty().add(request.qty()));
        stockBalanceRepository.save(balance);

        StockMovement movement = StockMovement.builder()
                .stockItemId(request.stockItemId())
                .toLocationType(StockLocationType.CENTRAL)
                .qty(request.qty())
                .unitPrice(request.unitPrice())
                .type(MovementType.RECEIPT)
                .notes(request.notes())
                .createdBy(request.createdBy())
                .build();

        return stockMapper.toDto(stockMovementRepository.save(movement));
    }

    public StockMovementDto transfer(TransferStockRequest request) {
        // Decrease CENTRAL, increase MOBILE for engineerId
        StockBalance central = stockBalanceRepository
                .findByStockItemIdAndLocationTypeAndEngineerIdIsNull(
                        request.stockItemId(), StockLocationType.CENTRAL)
                .orElseThrow(() -> new InsufficientStockException(
                        "No central stock for item " + request.stockItemId()));

        checkAvailableQty(central, request.qty());

        central.setQty(central.getQty().subtract(request.qty()));
        stockBalanceRepository.save(central);

        StockBalance mobile = stockBalanceRepository
                .findByStockItemIdAndLocationTypeAndEngineerId(
                        request.stockItemId(), StockLocationType.MOBILE, request.engineerId())
                .orElseGet(() -> StockBalance.builder()
                        .stockItemId(request.stockItemId())
                        .locationType(StockLocationType.MOBILE)
                        .engineerId(request.engineerId())
                        .qty(BigDecimal.ZERO)
                        .reservedQty(BigDecimal.ZERO)
                        .build());

        mobile.setQty(mobile.getQty().add(request.qty()));
        stockBalanceRepository.save(mobile);

        StockMovement movement = StockMovement.builder()
                .stockItemId(request.stockItemId())
                .fromLocationType(StockLocationType.CENTRAL)
                .toLocationType(StockLocationType.MOBILE)
                .toEngineerId(request.engineerId())
                .qty(request.qty())
                .type(MovementType.TRANSFER)
                .notes(request.notes())
                .createdBy(request.createdBy())
                .build();

        return stockMapper.toDto(stockMovementRepository.save(movement));
    }

    public StockMovementDto writeOff(WriteOffStockRequest request) {
        // Decrease MOBILE balance for engineer
        StockBalance mobile = stockBalanceRepository
                .findByStockItemIdAndLocationTypeAndEngineerId(
                        request.stockItemId(), StockLocationType.MOBILE, request.engineerId())
                .orElseThrow(() -> new InsufficientStockException(
                        "No mobile stock for item " + request.stockItemId()
                                + " and engineer " + request.engineerId()));

        checkAvailableQty(mobile, request.qty());

        mobile.setQty(mobile.getQty().subtract(request.qty()));
        stockBalanceRepository.save(mobile);

        StockMovement movement = StockMovement.builder()
                .stockItemId(request.stockItemId())
                .fromLocationType(StockLocationType.MOBILE)
                .fromEngineerId(request.engineerId())
                .workOrderId(request.workOrderId())
                .qty(request.qty())
                .unitPrice(request.unitPrice())
                .type(MovementType.WRITE_OFF)
                .notes(request.notes())
                .createdBy(request.createdBy())
                .build();

        return stockMapper.toDto(stockMovementRepository.save(movement));
    }

    public StockMovementDto returnToStock(ReturnStockRequest request) {
        // Return MOBILE -> CENTRAL
        StockBalance mobile = stockBalanceRepository
                .findByStockItemIdAndLocationTypeAndEngineerId(
                        request.stockItemId(), StockLocationType.MOBILE, request.engineerId())
                .orElseThrow(() -> new InsufficientStockException(
                        "No mobile stock to return for item " + request.stockItemId()));

        checkAvailableQty(mobile, request.qty());

        mobile.setQty(mobile.getQty().subtract(request.qty()));
        stockBalanceRepository.save(mobile);

        StockBalance central = stockBalanceRepository
                .findByStockItemIdAndLocationTypeAndEngineerIdIsNull(
                        request.stockItemId(), StockLocationType.CENTRAL)
                .orElseGet(() -> StockBalance.builder()
                        .stockItemId(request.stockItemId())
                        .locationType(StockLocationType.CENTRAL)
                        .qty(BigDecimal.ZERO)
                        .reservedQty(BigDecimal.ZERO)
                        .build());

        central.setQty(central.getQty().add(request.qty()));
        stockBalanceRepository.save(central);

        StockMovement movement = StockMovement.builder()
                .stockItemId(request.stockItemId())
                .fromLocationType(StockLocationType.MOBILE)
                .fromEngineerId(request.engineerId())
                .toLocationType(StockLocationType.CENTRAL)
                .qty(request.qty())
                .unitPrice(request.unitPrice())
                .type(MovementType.RETURN)
                .notes(request.notes())
                .createdBy(request.createdBy())
                .build();

        return stockMapper.toDto(stockMovementRepository.save(movement));
    }

    // ─── Reservations ─────────────────────────────────────────────────────────

    public void reserve(UUID stockItemId, UUID engineerId, BigDecimal qty) {
        StockBalance balance = stockBalanceRepository
                .findByStockItemIdAndLocationTypeAndEngineerId(
                        stockItemId, StockLocationType.MOBILE, engineerId)
                .orElseThrow(() -> new InsufficientStockException(
                        "No mobile stock for reservation: item " + stockItemId));

        if (balance.getAvailableQty().compareTo(qty) < 0) {
            throw new InsufficientStockException(
                    "Insufficient available qty for reservation. Available: "
                            + balance.getAvailableQty() + ", requested: " + qty);
        }

        balance.setReservedQty(balance.getReservedQty().add(qty));
        stockBalanceRepository.save(balance);
    }

    public void releaseReservation(UUID stockItemId, UUID engineerId, BigDecimal qty) {
        StockBalance balance = stockBalanceRepository
                .findByStockItemIdAndLocationTypeAndEngineerId(
                        stockItemId, StockLocationType.MOBILE, engineerId)
                .orElseThrow(() -> new EntityNotFoundException(
                        "Balance not found for release: item " + stockItemId));

        BigDecimal newReserved = balance.getReservedQty().subtract(qty);
        balance.setReservedQty(newReserved.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : newReserved);
        stockBalanceRepository.save(balance);
    }

    @Transactional(readOnly = true)
    public boolean checkAvailability(UUID stockItemId, UUID engineerId, BigDecimal qty) {
        return stockBalanceRepository
                .findByStockItemIdAndLocationTypeAndEngineerId(
                        stockItemId, StockLocationType.MOBILE, engineerId)
                .map(b -> b.getAvailableQty().compareTo(qty) >= 0)
                .orElse(false);
    }

    // ─── Movements queries ────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<StockMovementDto> findMovements(UUID workOrderId, UUID stockItemId) {
        if (workOrderId != null) {
            return stockMapper.toMovementDtoList(stockMovementRepository.findByWorkOrderId(workOrderId));
        } else if (stockItemId != null) {
            return stockMapper.toMovementDtoList(stockMovementRepository.findByStockItemId(stockItemId));
        }
        return stockMapper.toMovementDtoList(stockMovementRepository.findAll());
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private void checkAvailableQty(StockBalance balance, BigDecimal requested) {
        if (balance.getAvailableQty().compareTo(requested) < 0) {
            throw new InsufficientStockException(
                    "Insufficient stock. Available: " + balance.getAvailableQty()
                            + ", requested: " + requested);
        }
    }
}
