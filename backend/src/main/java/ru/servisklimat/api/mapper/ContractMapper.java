package ru.servisklimat.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import ru.servisklimat.api.dto.contract.ContractDto;
import ru.servisklimat.api.dto.contract.CreateContractRequest;
import ru.servisklimat.api.dto.contract.UpdateContractRequest;
import ru.servisklimat.domain.model.Contract;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ContractMapper {

    @Mapping(source = "client.id", target = "clientId")
    @Mapping(source = "slaConfig.id", target = "slaConfigId")
    ContractDto toDto(Contract contract);

    @Mapping(target = "client", ignore = true)
    @Mapping(target = "slaConfig", ignore = true)
    Contract toEntity(CreateContractRequest request);

    @Mapping(target = "client", ignore = true)
    @Mapping(target = "slaConfig", ignore = true)
    void updateEntity(UpdateContractRequest request, @MappingTarget Contract contract);
}
