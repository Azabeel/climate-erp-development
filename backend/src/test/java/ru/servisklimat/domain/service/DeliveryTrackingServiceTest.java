package ru.servisklimat.domain.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import ru.servisklimat.domain.repository.PurchaseRequestItemRepository;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@ExtendWith(MockitoExtension.class)
class DeliveryTrackingServiceTest {

    @Mock
    PurchaseRequestItemRepository purchaseRequestItemRepository;

    @InjectMocks
    DeliveryTrackingService deliveryTrackingService;

    @Test
    void checkStatus_cdek_returnsInTransit() {
        DeliveryTrackingService.TrackingInfo info =
                deliveryTrackingService.checkStatus("1234567890", "CDEK");

        assertThat(info.trackingNumber()).isEqualTo("1234567890");
        assertThat(info.carrier()).isEqualTo("CDEK");
        assertThat(info.status()).isEqualTo("IN_TRANSIT");
        assertThat(info.estimatedDelivery()).isNotNull();
    }

    @Test
    void checkStatus_pochta_returnsProcessing() {
        DeliveryTrackingService.TrackingInfo info =
                deliveryTrackingService.checkStatus("RA987654321RU", "POCHTA");

        assertThat(info.trackingNumber()).isEqualTo("RA987654321RU");
        assertThat(info.carrier()).isEqualTo("POCHTA");
        assertThat(info.status()).isEqualTo("PROCESSING");
    }

    @Test
    void checkStatus_cdek_estimatedDeliveryIsThreeDaysFromNow() {
        DeliveryTrackingService.TrackingInfo info =
                deliveryTrackingService.checkStatus("ABC123", "CDEK");

        LocalDate expectedEta = LocalDate.now().plusDays(3);
        assertThat(info.estimatedDelivery()).isEqualTo(expectedEta);
    }
}
