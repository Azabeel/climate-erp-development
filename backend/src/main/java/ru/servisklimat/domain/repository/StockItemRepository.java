package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.StockItem;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface StockItemRepository extends JpaRepository<StockItem, UUID> {

    Page<StockItem> findByIsActiveTrue(Pageable pageable);

    Optional<StockItem> findByBarcode(String barcode);

    Optional<StockItem> findByExternalId(String externalId);
}
