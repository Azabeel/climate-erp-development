package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.ai.analyst.BusinessAnalystService;
import ru.servisklimat.ai.consultant.TechConsultantService;
import ru.servisklimat.api.dto.ai.*;
import ru.servisklimat.domain.model.AiMessage;
import ru.servisklimat.domain.model.ErrorCode;
import ru.servisklimat.domain.service.ErrorCodeService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final TechConsultantService techConsultantService;
    private final BusinessAnalystService businessAnalystService;
    private final ErrorCodeService errorCodeService;

    @PostMapping("/consultant/chat")
    public ChatResponse chat(@Valid @RequestBody ChatRequest request) {
        UUID userId = request.userId() != null ? request.userId() : UUID.randomUUID();
        String response = techConsultantService.chat(request.workOrderId(), request.message(), userId);
        return new ChatResponse(response, null);
    }

    @GetMapping("/consultant/history/{workOrderId}")
    public List<AiMessage> getHistory(@PathVariable UUID workOrderId) {
        return techConsultantService.getHistory(workOrderId);
    }

    @PostMapping("/error-lookup")
    public ErrorCodeDto lookupError(@Valid @RequestBody ErrorLookupRequest request) {
        ErrorCode ec = errorCodeService.findByCode(request.code());
        return toDto(ec);
    }

    @GetMapping("/analyst/summary")
    public String getDailySummary() {
        return businessAnalystService.generateDailySummary();
    }

    private ErrorCodeDto toDto(ErrorCode ec) {
        return new ErrorCodeDto(
                ec.getId(),
                ec.getBrandId(),
                ec.getCode(),
                ec.getDisplayText(),
                ec.getDescriptions(),
                ec.getProbableCauses(),
                ec.getResolutionSteps(),
                ec.getRelatedManualSection()
        );
    }
}
