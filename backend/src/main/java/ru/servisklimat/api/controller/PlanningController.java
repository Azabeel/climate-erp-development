package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.planning.AssignRequest;
import ru.servisklimat.api.dto.planning.EngineerSuggestionDto;
import ru.servisklimat.api.dto.planning.SuggestRequest;
import ru.servisklimat.api.dto.workorder.WorkOrderDto;
import ru.servisklimat.api.mapper.WorkOrderMapper;
import ru.servisklimat.domain.service.PlanningService;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Sprint 12: Smart Planning REST API.
 *
 * POST /api/v1/planning/suggest → top-3 engineer suggestions for a work order
 * POST /api/v1/planning/assign  → assign engineer(s) to a work order
 */
@RestController
@RequestMapping("/api/v1/planning")
@RequiredArgsConstructor
public class PlanningController {

    private final PlanningService planningService;
    private final WorkOrderMapper workOrderMapper;

    /**
     * POST /api/v1/planning/suggest
     * Body: {"workOrderId": "uuid"}
     * Returns: top-3 engineer suggestions with scores and reasons
     */
    @PostMapping("/suggest")
    public List<EngineerSuggestionDto> suggest(@Valid @RequestBody SuggestRequest request) {
        return planningService.suggest(request.workOrderId())
                .stream()
                .map(s -> new EngineerSuggestionDto(
                        s.engineerId(),
                        s.engineerName(),
                        s.score(),
                        s.reason()))
                .collect(Collectors.toList());
    }

    /**
     * POST /api/v1/planning/assign
     * Body: {"workOrderId": "uuid", "engineerId": "uuid", "secondEngineerId": "uuid|null"}
     * Returns: updated WorkOrderDto
     */
    @PostMapping("/assign")
    public WorkOrderDto assign(@Valid @RequestBody AssignRequest request) {
        return workOrderMapper.toDto(
                planningService.assign(
                        request.workOrderId(),
                        request.engineerId(),
                        request.secondEngineerId()));
    }
}
