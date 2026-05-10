package ru.servisklimat.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import ru.servisklimat.domain.model.PaymentRequest;

import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRequestRepository extends JpaRepository<PaymentRequest, UUID> {

    List<PaymentRequest> findByPurchaseItemId(UUID purchaseItemId);
}
