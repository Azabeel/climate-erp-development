package ru.servisklimat.ai.consultant;

import org.junit.jupiter.api.Test;
import ru.servisklimat.domain.model.*;
import ru.servisklimat.domain.model.enums.*;

import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PreWorkBriefGeneratorTest {

    private final PreWorkBriefGenerator generator = new PreWorkBriefGenerator();

    @Test
    void generate_withServices_briefContainsServiceCount() {
        Client client = Client.builder()
                .id(UUID.randomUUID())
                .name("ООО Тест")
                .type(ClientType.LEGAL_ENTITY)
                .build();

        Service svc1 = Service.builder().id(UUID.randomUUID()).name("Диагностика").build();
        Service svc2 = Service.builder().id(UUID.randomUUID()).name("Заправка хладагентом").build();

        WorkOrderServiceLine line1 = WorkOrderServiceLine.builder()
                .id(UUID.randomUUID())
                .service(svc1)
                .calculatedDurationMinutes(30)
                .executionType(ExecutionType.SEQUENTIAL)
                .build();
        WorkOrderServiceLine line2 = WorkOrderServiceLine.builder()
                .id(UUID.randomUUID())
                .service(svc2)
                .calculatedDurationMinutes(60)
                .executionType(ExecutionType.SEQUENTIAL)
                .build();

        WorkOrder order = WorkOrder.builder()
                .id(UUID.randomUUID())
                .number("WO-2026-000001")
                .type(WorkOrderType.MAINTENANCE)
                .priority(Priority.NORMAL)
                .client(client)
                .services(List.of(line1, line2))
                .build();

        String brief = generator.generate(order);

        assertThat(brief).contains("2 позиций");
        assertThat(brief).contains("Диагностика");
        assertThat(brief).contains("Заправка хладагентом");
    }

    @Test
    void generate_withSlaDeadline_briefContainsDeadlineDate() {
        Client client = Client.builder()
                .id(UUID.randomUUID())
                .name("Иванов Иван")
                .type(ClientType.INDIVIDUAL)
                .build();

        ZonedDateTime deadline = ZonedDateTime.of(2026, 5, 15, 14, 30, 0, 0,
                ZoneId.of("Europe/Moscow"));

        WorkOrder order = WorkOrder.builder()
                .id(UUID.randomUUID())
                .number("WO-2026-000002")
                .type(WorkOrderType.REPAIR)
                .priority(Priority.URGENT)
                .client(client)
                .slaTtfPlanned(deadline)
                .build();

        String brief = generator.generate(order);

        assertThat(brief).contains("15.05.2026");
        assertThat(brief).contains("14:30");
    }

    @Test
    void generate_withNullSla_generatedWithoutNPE() {
        Client client = Client.builder()
                .id(UUID.randomUUID())
                .name("ИП Сидоров")
                .type(ClientType.INDIVIDUAL)
                .build();

        WorkOrder order = WorkOrder.builder()
                .id(UUID.randomUUID())
                .number("WO-2026-000003")
                .type(WorkOrderType.REPAIR)
                .priority(Priority.NORMAL)
                .client(client)
                .slaTtfPlanned(null)
                .build();

        String brief = generator.generate(order);

        assertThat(brief).isNotNull();
        assertThat(brief).contains("WO-2026-000003");
        assertThat(brief).doesNotContain("Дедлайн SLA");
    }
}
