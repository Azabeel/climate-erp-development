package ru.servisklimat.domain.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.api.dto.stock.*;
import ru.servisklimat.api.mapper.StockMapper;
import ru.servisklimat.domain.model.StockBalance;
import ru.servisklimat.domain.model.StockMovement;
import ru.servisklimat.domain.model.enums.MovementType;
import ru.servisklimat.domain.model.enums.StockLocationType;
import ru.servisklimat.domain.repository.StockBalanceRepository;
import ru.servisklimat.domain.repository.StockItemRepository;
import ru.servisklimat.domain.repository.StockMovementRepository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StockServiceTest {

    @Mock
    private StockItemRepository stockItemRepository;
    @Mock
    private StockBalanceRepository stockBalanceRepository;
    @Mock
    private StockMovementRepository stockMovementRepository;
    @Mock
    private StockMapper stockMapper;

    private StockService stockService;

    private UUID stockItemId;
    private UUID engineerId;

    @BeforeEach
    void setUp() {
        stockService = new StockService(
                stockItemRepository, stockBalanceRepository, stockMovementRepository, stockMapper);
        stockItemId = UUID.randomUUID();
        engineerId = UUID.randomUUID();
    }

    @Test
    void testReceipt_increasesBalance() {
        // Given
        ReceiveStockRequest request = new ReceiveStockRequest(
                stockItemId, new BigDecimal("10"), new BigDecimal("500.00"), "Test receipt", null);

        StockBalance existingBalance = buildBalance(StockLocationType.CENTRAL, null,
                new BigDecimal("5"), BigDecimal.ZERO);

        StockMovement savedMovement = StockMovement.builder()
                .id(UUID.randomUUID())
                .stockItemId(stockItemId)
                .type(MovementType.RECEIPT)
                .qty(new BigDecimal("10"))
                .build();

        StockMovementDto expectedDto = new StockMovementDto(
                savedMovement.getId(), stockItemId, null, null,
                StockLocationType.CENTRAL, null, null,
                new BigDecimal("10"), new BigDecimal("500.00"),
                MovementType.RECEIPT, null, null, null);

        when(stockBalanceRepository.findByStockItemIdAndLocationTypeAndEngineerIdIsNull(
                stockItemId, StockLocationType.CENTRAL)).thenReturn(Optional.of(existingBalance));
        when(stockBalanceRepository.save(any())).thenReturn(existingBalance);
        when(stockMovementRepository.save(any())).thenReturn(savedMovement);
        when(stockMapper.toDto(savedMovement)).thenReturn(expectedDto);

        // When
        StockMovementDto result = stockService.receipt(request);

        // Then
        assertThat(existingBalance.getQty()).isEqualByComparingTo(new BigDecimal("15")); // 5 + 10
        assertThat(result.type()).isEqualTo(MovementType.RECEIPT);
        verify(stockBalanceRepository).save(existingBalance);
        verify(stockMovementRepository).save(any(StockMovement.class));
    }

    @Test
    void testWriteOff_decreasesBalance() {
        // Given
        WriteOffStockRequest request = new WriteOffStockRequest(
                stockItemId, engineerId, UUID.randomUUID(),
                new BigDecimal("3"), new BigDecimal("200.00"), "Write off", null);

        StockBalance mobileBalance = buildBalance(StockLocationType.MOBILE, engineerId,
                new BigDecimal("5"), BigDecimal.ZERO);

        StockMovement savedMovement = StockMovement.builder()
                .id(UUID.randomUUID())
                .stockItemId(stockItemId)
                .type(MovementType.WRITE_OFF)
                .qty(new BigDecimal("3"))
                .build();

        StockMovementDto expectedDto = new StockMovementDto(
                savedMovement.getId(), stockItemId, StockLocationType.MOBILE, engineerId,
                null, null, request.workOrderId(),
                new BigDecimal("3"), new BigDecimal("200.00"),
                MovementType.WRITE_OFF, null, null, null);

        when(stockBalanceRepository.findByStockItemIdAndLocationTypeAndEngineerId(
                stockItemId, StockLocationType.MOBILE, engineerId))
                .thenReturn(Optional.of(mobileBalance));
        when(stockBalanceRepository.save(any())).thenReturn(mobileBalance);
        when(stockMovementRepository.save(any())).thenReturn(savedMovement);
        when(stockMapper.toDto(savedMovement)).thenReturn(expectedDto);

        // When
        StockMovementDto result = stockService.writeOff(request);

        // Then
        assertThat(mobileBalance.getQty()).isEqualByComparingTo(new BigDecimal("2")); // 5 - 3
        assertThat(result.type()).isEqualTo(MovementType.WRITE_OFF);
    }

    @Test
    void testWriteOff_throwsWhenInsufficientStock() {
        // Given
        WriteOffStockRequest request = new WriteOffStockRequest(
                stockItemId, engineerId, UUID.randomUUID(),
                new BigDecimal("10"), null, "Write off", null);

        StockBalance mobileBalance = buildBalance(StockLocationType.MOBILE, engineerId,
                new BigDecimal("3"), BigDecimal.ZERO); // only 3 available

        when(stockBalanceRepository.findByStockItemIdAndLocationTypeAndEngineerId(
                stockItemId, StockLocationType.MOBILE, engineerId))
                .thenReturn(Optional.of(mobileBalance));

        // When / Then
        assertThatThrownBy(() -> stockService.writeOff(request))
                .isInstanceOf(InsufficientStockException.class)
                .hasMessageContaining("Insufficient stock");
    }

    @Test
    void testTransfer_movesFromCentralToMobile() {
        // Given
        TransferStockRequest request = new TransferStockRequest(
                stockItemId, engineerId, new BigDecimal("4"), "Transfer", null);

        StockBalance central = buildBalance(StockLocationType.CENTRAL, null,
                new BigDecimal("10"), BigDecimal.ZERO);

        StockBalance mobile = buildBalance(StockLocationType.MOBILE, engineerId,
                new BigDecimal("0"), BigDecimal.ZERO);

        StockMovement savedMovement = StockMovement.builder()
                .id(UUID.randomUUID())
                .stockItemId(stockItemId)
                .type(MovementType.TRANSFER)
                .qty(new BigDecimal("4"))
                .build();

        StockMovementDto expectedDto = new StockMovementDto(
                savedMovement.getId(), stockItemId,
                StockLocationType.CENTRAL, null,
                StockLocationType.MOBILE, engineerId,
                null, new BigDecimal("4"), null,
                MovementType.TRANSFER, null, null, null);

        when(stockBalanceRepository.findByStockItemIdAndLocationTypeAndEngineerIdIsNull(
                stockItemId, StockLocationType.CENTRAL)).thenReturn(Optional.of(central));
        when(stockBalanceRepository.findByStockItemIdAndLocationTypeAndEngineerId(
                stockItemId, StockLocationType.MOBILE, engineerId)).thenReturn(Optional.of(mobile));
        when(stockBalanceRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(stockMovementRepository.save(any())).thenReturn(savedMovement);
        when(stockMapper.toDto(savedMovement)).thenReturn(expectedDto);

        // When
        StockMovementDto result = stockService.transfer(request);

        // Then
        assertThat(central.getQty()).isEqualByComparingTo(new BigDecimal("6")); // 10 - 4
        assertThat(mobile.getQty()).isEqualByComparingTo(new BigDecimal("4")); // 0 + 4
        assertThat(result.type()).isEqualTo(MovementType.TRANSFER);
    }

    @Test
    void testReserve_reducesAvailableQty() {
        // Given
        StockBalance mobile = buildBalance(StockLocationType.MOBILE, engineerId,
                new BigDecimal("10"), BigDecimal.ZERO);

        when(stockBalanceRepository.findByStockItemIdAndLocationTypeAndEngineerId(
                stockItemId, StockLocationType.MOBILE, engineerId))
                .thenReturn(Optional.of(mobile));
        when(stockBalanceRepository.save(any())).thenReturn(mobile);

        // When
        stockService.reserve(stockItemId, engineerId, new BigDecimal("3"));

        // Then
        assertThat(mobile.getReservedQty()).isEqualByComparingTo(new BigDecimal("3"));
        assertThat(mobile.getAvailableQty()).isEqualByComparingTo(new BigDecimal("7")); // 10 - 3
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private StockBalance buildBalance(StockLocationType locationType, UUID engId,
                                       BigDecimal qty, BigDecimal reservedQty) {
        return StockBalance.builder()
                .id(UUID.randomUUID())
                .stockItemId(stockItemId)
                .locationType(locationType)
                .engineerId(engId)
                .qty(qty)
                .reservedQty(reservedQty)
                .build();
    }
}
