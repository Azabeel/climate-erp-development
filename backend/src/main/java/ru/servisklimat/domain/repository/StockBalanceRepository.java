package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.StockBalance;
import ru.servisklimat.domain.model.enums.StockLocationType;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockBalanceRepository extends JpaRepository<StockBalance, UUID> {

    List<StockBalance> findByStockItemId(UUID stockItemId);

    Optional<StockBalance> findByStockItemIdAndLocationTypeAndEngineerIdIsNull(
            UUID stockItemId, StockLocationType locationType);

    Optional<StockBalance> findByStockItemIdAndLocationTypeAndEngineerId(
            UUID stockItemId, StockLocationType locationType, UUID engineerId);

    List<StockBalance> findByEngineerIdAndLocationType(UUID engineerId, StockLocationType locationType);
}
