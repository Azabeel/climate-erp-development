package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.servisklimat.domain.model.InvoiceLine;

import java.util.List;
import java.util.UUID;

public interface InvoiceLineRepository extends JpaRepository<InvoiceLine, UUID> {

    List<InvoiceLine> findByInvoiceIdOrderBySortOrder(UUID invoiceId);
}
