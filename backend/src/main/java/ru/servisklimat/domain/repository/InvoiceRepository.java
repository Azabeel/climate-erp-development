package ru.servisklimat.domain.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import ru.servisklimat.domain.model.Invoice;

import java.util.List;
import java.util.UUID;

public interface InvoiceRepository extends JpaRepository<Invoice, UUID> {

    List<Invoice> findByWorkOrderId(UUID workOrderId);

    Page<Invoice> findByClientId(UUID clientId, Pageable pageable);

    boolean existsByNumber(String number);
}
