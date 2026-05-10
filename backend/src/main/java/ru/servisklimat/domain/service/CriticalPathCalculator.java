package ru.servisklimat.domain.service;

import org.springframework.stereotype.Component;
import ru.servisklimat.domain.model.WorkOrderServiceLine;
import ru.servisklimat.domain.model.enums.ExecutionType;

import java.util.ArrayList;
import java.util.List;

/**
 * Calculates total_duration_minutes for a work order based on service lines.
 *
 * Rules:
 *   SEQUENTIAL — adds duration to running total
 *   PARALLEL   — consecutive PARALLEL lines form a group; only max(duration) counts
 *   REQUIRES_TWO — treated as SEQUENTIAL in time, but sets requiresTwoEngineers=true
 *   Buffer of 15 minutes is always added at the end
 */
@Component
public class CriticalPathCalculator {

    public static final int MOVEMENT_BUFFER_MINUTES = 15;

    public record CriticalPathResult(
        int totalMinutes,
        boolean hasParallelTasks,
        boolean requiresTwoEngineers
    ) {}

    public CriticalPathResult calculate(List<WorkOrderServiceLine> serviceLines) {
        if (serviceLines == null || serviceLines.isEmpty()) {
            return new CriticalPathResult(MOVEMENT_BUFFER_MINUTES, false, false);
        }

        // Group consecutive PARALLEL lines together; everything else is its own group
        List<List<WorkOrderServiceLine>> groups = groupLines(serviceLines);

        int totalMinutes = 0;
        boolean hasParallelTasks = false;
        boolean requiresTwoEngineers = false;

        for (List<WorkOrderServiceLine> group : groups) {
            ExecutionType groupType = group.get(0).getExecutionType();

            if (groupType == ExecutionType.PARALLEL) {
                hasParallelTasks = true;
                int maxDuration = group.stream()
                        .mapToInt(WorkOrderServiceLine::getCalculatedDurationMinutes)
                        .max()
                        .orElse(0);
                totalMinutes += maxDuration;
            } else if (groupType == ExecutionType.REQUIRES_TWO) {
                requiresTwoEngineers = true;
                int groupSum = group.stream()
                        .mapToInt(WorkOrderServiceLine::getCalculatedDurationMinutes)
                        .sum();
                totalMinutes += groupSum;
            } else {
                // SEQUENTIAL
                int groupSum = group.stream()
                        .mapToInt(WorkOrderServiceLine::getCalculatedDurationMinutes)
                        .sum();
                totalMinutes += groupSum;
            }
        }

        totalMinutes += MOVEMENT_BUFFER_MINUTES;

        return new CriticalPathResult(totalMinutes, hasParallelTasks, requiresTwoEngineers);
    }

    /**
     * Groups service lines: consecutive lines with PARALLEL type go into the same group.
     * Non-PARALLEL lines each become their own single-element group.
     */
    private List<List<WorkOrderServiceLine>> groupLines(List<WorkOrderServiceLine> lines) {
        List<List<WorkOrderServiceLine>> groups = new ArrayList<>();
        List<WorkOrderServiceLine> currentParallelGroup = null;

        for (WorkOrderServiceLine line : lines) {
            if (line.getExecutionType() == ExecutionType.PARALLEL) {
                if (currentParallelGroup == null) {
                    currentParallelGroup = new ArrayList<>();
                    groups.add(currentParallelGroup);
                }
                currentParallelGroup.add(line);
            } else {
                // Close any open parallel group
                currentParallelGroup = null;
                // Add this line as its own group
                List<WorkOrderServiceLine> singleGroup = new ArrayList<>();
                singleGroup.add(line);
                groups.add(singleGroup);
            }
        }

        return groups;
    }
}
