package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.Deal;
import ru.servisklimat.domain.model.enums.DealStage;
import ru.servisklimat.domain.repository.DealRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DealService {

    private static final List<DealStage> CLOSED_STAGES =
            List.of(DealStage.CLOSED_WON, DealStage.CLOSED_LOST);

    private final DealRepository dealRepository;

    public Page<Deal> findAll(Pageable pageable) {
        return dealRepository.findAll(pageable);
    }

    public Deal findById(UUID id) {
        return dealRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Deal not found: " + id));
    }

    @Transactional
    public Deal create(Deal deal) {
        return dealRepository.save(deal);
    }

    @Transactional
    public Deal updateStage(UUID id, DealStage stage) {
        Deal deal = findById(id);
        deal.setStage(stage);
        return dealRepository.save(deal);
    }

    /**
     * Returns weighted pipeline forecast: SUM(amount * probability / 100)
     * for all non-closed deals.
     */
    public BigDecimal getForecast() {
        List<Deal> active = dealRepository.findByStageNotIn(CLOSED_STAGES);
        return active.stream()
                .map(d -> d.getAmount().multiply(
                        new BigDecimal(d.getProbability()).divide(new BigDecimal("100"))))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
