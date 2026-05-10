package ru.servisklimat.ai.consultant;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.model.WorkOrderServiceLine;

import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Generates pre-work briefing text for the assigned engineer.
 * In production would use an LLM for richer context-aware briefs.
 */
@Slf4j
@Component
public class PreWorkBriefGenerator {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");
    private static final DateTimeFormatter DATETIME_FMT =
            DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm").withZone(MOSCOW);

    /**
     * Generates a pre-work brief for the given work order.
     *
     * @param order the work order
     * @return formatted brief string
     */
    public String generate(WorkOrder order) {
        StringBuilder sb = new StringBuilder();

        sb.append("=== БРИФИНГ ПЕРЕД ВЫЕЗДОМ ===\n\n");

        // Narad number and type
        sb.append("Наряд: ").append(order.getNumber())
          .append(" [").append(order.getType()).append("]\n");
        sb.append("Приоритет: ").append(order.getPriority()).append("\n\n");

        // Client info
        if (order.getClient() != null) {
            sb.append("Клиент: ").append(order.getClient().getName()).append("\n");
        }

        // Equipment info
        if (order.getEquipmentId() != null) {
            sb.append("Оборудование ID: ").append(order.getEquipmentId()).append("\n");
        }

        // Services to perform
        List<WorkOrderServiceLine> services = order.getServices();
        if (services != null && !services.isEmpty()) {
            sb.append("\nРаботы (").append(services.size()).append(" позиций):\n");
            for (int i = 0; i < services.size(); i++) {
                WorkOrderServiceLine line = services.get(i);
                String serviceName = (line.getService() != null && line.getService().getName() != null)
                        ? line.getService().getName()
                        : "Услуга " + (i + 1);
                sb.append("  ").append(i + 1).append(". ").append(serviceName).append("\n");
            }
        } else {
            sb.append("\nРаботы: не указаны\n");
        }

        // Description
        if (order.getDescription() != null && !order.getDescription().isBlank()) {
            sb.append("\nОписание проблемы:\n").append(order.getDescription()).append("\n");
        }

        // SLA deadline
        if (order.getSlaTtfPlanned() != null) {
            sb.append("\nДедлайн SLA (TTF): ")
              .append(DATETIME_FMT.format(order.getSlaTtfPlanned()))
              .append("\n");
        }

        sb.append("\n=== УДАЧНОЙ РАБОТЫ! ===");

        return sb.toString();
    }
}
