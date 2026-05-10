package ru.servisklimat.domain.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.domain.model.Deal;
import ru.servisklimat.domain.model.enums.DealStage;
import ru.servisklimat.domain.repository.DealRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DealServiceTest {

    @Mock DealRepository dealRepository;
    @InjectMocks DealService dealService;

    @Test
    void forecastCalculatesWeightedSum() {
        Deal d1 = Deal.builder().amount(new BigDecimal("10000")).probability(80).stage(DealStage.NEGOTIATION).build();
        Deal d2 = Deal.builder().amount(new BigDecimal("5000")).probability(50).stage(DealStage.PROPOSAL).build();

        when(dealRepository.findByStageNotIn(any())).thenReturn(List.of(d1, d2));

        BigDecimal forecast = dealService.getForecast();
        // 10000*0.80 + 5000*0.50 = 8000 + 2500 = 10500
        assertThat(forecast).isEqualByComparingTo(new BigDecimal("10500.00"));
    }

    @Test
    void forecastEmptyPipeline() {
        when(dealRepository.findByStageNotIn(any())).thenReturn(List.of());
        assertThat(dealService.getForecast()).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void createDealIsSaved() {
        Deal deal = Deal.builder().title("Test Deal").build();
        when(dealRepository.save(any())).thenReturn(deal);

        Deal result = dealService.create(deal);
        assertThat(result.getTitle()).isEqualTo("Test Deal");
        verify(dealRepository).save(deal);
    }
}
