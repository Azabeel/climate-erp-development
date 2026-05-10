package ru.servisklimat.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import ru.servisklimat.api.dto.crm.DealDto;
import ru.servisklimat.api.dto.crm.LeadDto;
import ru.servisklimat.api.dto.crm.ProposalDto;
import ru.servisklimat.domain.model.CommercialProposal;
import ru.servisklimat.domain.model.Deal;
import ru.servisklimat.domain.model.Lead;

@Mapper(componentModel = "spring")
public interface CrmMapper {

    LeadDto toDto(Lead lead);

    @Mapping(target = "clientId", source = "client.id")
    DealDto toDto(Deal deal);

    @Mapping(target = "dealId", source = "deal.id")
    ProposalDto toDto(CommercialProposal proposal);
}
