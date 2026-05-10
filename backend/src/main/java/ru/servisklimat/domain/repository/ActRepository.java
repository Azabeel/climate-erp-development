package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import ru.servisklimat.domain.model.Act;

import java.util.List;
import java.util.UUID;

public interface ActRepository extends JpaRepository<Act, UUID> {

    List<Act> findByWorkOrderId(UUID workOrderId);

    List<Act> findByInvoiceId(UUID invoiceId);
}
