package ru.servisklimat.domain.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import ru.servisklimat.domain.model.Engineer;
import ru.servisklimat.domain.model.WorkOrder;
import ru.servisklimat.domain.repository.EngineerRepository;
import ru.servisklimat.domain.repository.WorkOrderRepository;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Sprint 12: Smart Scheduling — PlanningService.
 *
 * suggest(workOrderId): finds top-3 available engineers for a work order.
 * assign(workOrderId, engineerId, secondEngineerId): delegates to WorkOrderService.assign().
 */
@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class PlanningService {

    private static final ZoneId MOSCOW = ZoneId.of("Europe/Moscow");
    private static final int MAX_TRAVEL_DISTANCE_KM = 50;
    private static final int MAX_ORDERS_PER_DAY = 5;
    private static final int TOP_N = 3;

    private final WorkOrderRepository workOrderRepository;
    private final EngineerRepository engineerRepository;
    private final PlanningScoreCalculator scoreCalculator;
    private final CapacityChecker capacityChecker;
    private final WorkOrderService workOrderService;

    public record EngineerSuggestion(UUID engineerId, String engineerName, double score, String reason) {}

    /**
     * Suggests up to 3 best engineers for the given work order.
     * If requiresTwoEngineers=true, returns pair-based suggestions.
     */
    public List<EngineerSuggestion> suggest(UUID workOrderId) {
        WorkOrder workOrder = workOrderRepository.findById(workOrderId)
                .orElseThrow(() -> new EntityNotFoundException("WorkOrder not found: " + workOrderId));

        List<Engineer> candidates = engineerRepository.findByIsActiveTrueAndUseInAutoSchedulerTrue();
        LocalDate targetDate = resolveTargetDate(workOrder);

        if (workOrder.isRequiresTwoEngineers()) {
            return suggestPairs(workOrder, candidates, targetDate);
        } else {
            return suggestSingle(workOrder, candidates, targetDate);
        }
    }

    /**
     * Assigns an engineer (and optionally a second engineer) to a work order.
     */
    @Transactional
    public WorkOrder assign(UUID workOrderId, UUID engineerId, UUID secondEngineerId) {
        return workOrderService.assign(workOrderId, engineerId, secondEngineerId);
    }

    // ---- private helpers ----

    private List<EngineerSuggestion> suggestSingle(WorkOrder workOrder, List<Engineer> candidates, LocalDate targetDate) {
        return candidates.stream()
                .map(engineer -> scoreEngineer(engineer, workOrder, targetDate))
                .sorted(Comparator.comparingDouble(EngineerSuggestion::score).reversed())
                .limit(TOP_N)
                .collect(Collectors.toList());
    }

    /**
     * For REQUIRES_TWO work orders, finds pairs of engineers that both have capacity.
     * Returns top 3 pairs formatted as primary suggestion (the pair with higher combined score).
     */
    private List<EngineerSuggestion> suggestPairs(WorkOrder workOrder, List<Engineer> candidates, LocalDate targetDate) {
        List<EngineerSuggestion> singles = candidates.stream()
                .filter(e -> capacityChecker.hasCapacity(e.getId(), targetDate, MAX_ORDERS_PER_DAY))
                .map(engineer -> scoreEngineer(engineer, workOrder, targetDate))
                .sorted(Comparator.comparingDouble(EngineerSuggestion::score).reversed())
                .collect(Collectors.toList());

        // Build pairs from top available engineers
        List<EngineerSuggestion> pairSuggestions = new ArrayList<>();
        for (int i = 0; i < singles.size() && pairSuggestions.size() < TOP_N; i++) {
            for (int j = i + 1; j < singles.size() && pairSuggestions.size() < TOP_N; j++) {
                EngineerSuggestion primary   = singles.get(i);
                EngineerSuggestion secondary = singles.get(j);
                double pairScore = (primary.score() + secondary.score()) / 2.0;
                String reason = String.format(
                        "Пара: %s (%.1f) + %s (%.1f). Требуется два инженера.",
                        primary.engineerName(), primary.score(),
                        secondary.engineerName(), secondary.score());
                pairSuggestions.add(new EngineerSuggestion(primary.engineerId(), primary.engineerName(), pairScore, reason));
            }
        }

        // Fallback to single suggestions if no pairs found
        return pairSuggestions.isEmpty() ? singles.stream().limit(TOP_N).collect(Collectors.toList()) : pairSuggestions;
    }

    private EngineerSuggestion scoreEngineer(Engineer engineer, WorkOrder workOrder, LocalDate targetDate) {
        int currentLoad = capacityChecker.getCurrentLoad(engineer.getId(), targetDate);

        // Stub travel distance (OSRM not yet integrated) — deterministic based on engineer UUID hash
        double travelDistanceKm = stubTravelDistance(engineer.getId());

        // Competency matching
        int requiredCompetencies = 0;  // No competency filter at this stage (Sprint 12 scope)
        int matchingCompetencies = 0;

        PlanningScoreCalculator.PlanningInput input = new PlanningScoreCalculator.PlanningInput(
                workOrder.getSlaStatus(),
                travelDistanceKm,
                MAX_TRAVEL_DISTANCE_KM,
                currentLoad,
                MAX_ORDERS_PER_DAY,
                matchingCompetencies,
                requiredCompetencies
        );

        double score = scoreCalculator.calculate(input);

        String reason = String.format(
                "Загрузка: %d/%d нарядов. Расстояние: ~%.1f км. SLA: %s.",
                currentLoad, MAX_ORDERS_PER_DAY,
                travelDistanceKm,
                workOrder.getSlaStatus() != null ? workOrder.getSlaStatus().name() : "нет");

        return new EngineerSuggestion(engineer.getId(), engineer.getFullName(), score, reason);
    }

    /**
     * Deterministic stub for travel distance (replaces real OSRM call).
     * Returns a value in [5, 30] km derived from the engineer UUID.
     */
    private double stubTravelDistance(UUID engineerId) {
        long hash = Math.abs(engineerId.getLeastSignificantBits());
        return 5.0 + (hash % 26); // 5..30 km
    }

    private LocalDate resolveTargetDate(WorkOrder workOrder) {
        if (workOrder.getScheduledStart() != null) {
            return workOrder.getScheduledStart().withZoneSameInstant(MOSCOW).toLocalDate();
        }
        return LocalDate.now(MOSCOW);
    }
}
