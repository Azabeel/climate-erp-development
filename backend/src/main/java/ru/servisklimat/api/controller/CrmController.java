package ru.servisklimat.api.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import ru.servisklimat.api.dto.crm.*;
import ru.servisklimat.api.mapper.CrmMapper;
import ru.servisklimat.domain.model.Deal;
import ru.servisklimat.domain.model.Lead;
import ru.servisklimat.domain.model.enums.DealStage;
import ru.servisklimat.domain.service.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/crm")
@RequiredArgsConstructor
public class CrmController {

    private final LeadService leadService;
    private final DealService dealService;
    private final CPService cpService;
    private final CrmMapper crmMapper;

    // ─── Leads ───────────────────────────────────────────────────────────────

    @GetMapping("/leads")
    public Page<LeadDto> listLeads(Pageable pageable) {
        return leadService.findAll(pageable).map(crmMapper::toDto);
    }

    @GetMapping("/leads/{id}")
    public LeadDto getLead(@PathVariable UUID id) {
        return crmMapper.toDto(leadService.findById(id));
    }

    @PostMapping("/leads")
    @ResponseStatus(HttpStatus.CREATED)
    public LeadDto createLead(@Valid @RequestBody CreateLeadRequest request) {
        Lead lead = Lead.builder()
                .name(request.name())
                .phone(request.phone())
                .email(request.email())
                .source(request.source() != null ? request.source() : "MANUAL")
                .description(request.description())
                .clientId(request.clientId())
                .assignedTo(request.assignedTo())
                .build();
        return crmMapper.toDto(leadService.create(lead));
    }

    @PostMapping("/leads/{id}/convert")
    public DealDto convertLead(@PathVariable UUID id,
                               @RequestBody Map<String, Object> body) {
        String title = (String) body.getOrDefault("title", "Deal from lead");
        UUID clientId = UUID.fromString((String) body.get("clientId"));
        return crmMapper.toDto(leadService.convert(id, title, clientId));
    }

    // ─── Deals ───────────────────────────────────────────────────────────────

    @GetMapping("/deals")
    public Page<DealDto> listDeals(Pageable pageable) {
        return dealService.findAll(pageable).map(crmMapper::toDto);
    }

    @GetMapping("/deals/{id}")
    public DealDto getDeal(@PathVariable UUID id) {
        return crmMapper.toDto(dealService.findById(id));
    }

    @PostMapping("/deals")
    @ResponseStatus(HttpStatus.CREATED)
    public DealDto createDeal(@Valid @RequestBody CreateDealRequest request) {
        Deal deal = Deal.builder()
                .leadId(request.leadId())
                .title(request.title())
                .amount(request.amount() != null ? request.amount() : BigDecimal.ZERO)
                .probability(request.probability() != null ? request.probability() : 50)
                .plannedCloseDate(request.plannedCloseDate())
                .assignedTo(request.assignedTo())
                .build();
        return crmMapper.toDto(dealService.create(deal));
    }

    @PutMapping("/deals/{id}/stage")
    public DealDto updateStage(@PathVariable UUID id,
                               @RequestBody Map<String, String> body) {
        DealStage stage = DealStage.valueOf(body.get("stage"));
        return crmMapper.toDto(dealService.updateStage(id, stage));
    }

    @GetMapping("/deals/forecast")
    public Map<String, BigDecimal> getForecast() {
        return Map.of("forecast", dealService.getForecast());
    }

    // ─── Proposals ───────────────────────────────────────────────────────────

    @PostMapping("/proposals")
    @ResponseStatus(HttpStatus.CREATED)
    public ProposalDto createProposal(@RequestBody Map<String, String> body) {
        UUID dealId = UUID.fromString(body.get("dealId"));
        String title = body.get("title");
        String variant = body.get("variant");
        return crmMapper.toDto(cpService.create(dealId, title, variant));
    }

    @GetMapping("/proposals/{id}")
    public ProposalDto getProposal(@PathVariable UUID id) {
        return crmMapper.toDto(cpService.findById(id));
    }

    @PostMapping("/proposals/{id}/send")
    public ProposalDto sendProposal(@PathVariable UUID id) {
        return crmMapper.toDto(cpService.send(id));
    }
}
