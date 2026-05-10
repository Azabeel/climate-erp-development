package ru.servisklimat.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import ru.servisklimat.api.dto.client.ClientDto;
import ru.servisklimat.api.dto.client.CreateClientRequest;
import ru.servisklimat.api.dto.client.UpdateClientRequest;
import ru.servisklimat.domain.model.Client;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ClientMapper {

    ClientDto toDto(Client client);

    Client toEntity(CreateClientRequest request);

    void updateEntity(UpdateClientRequest request, @MappingTarget Client client);
}
