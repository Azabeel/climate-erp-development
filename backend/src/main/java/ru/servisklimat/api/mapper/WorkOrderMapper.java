package ru.servisklimat.api.mapper;

import org.mapstruct.*;
import ru.servisklimat.api.dto.workorder.WorkOrderDto;
import ru.servisklimat.domain.model.WorkOrder;

@Mapper(componentModel = "spring")
public interface WorkOrderMapper {

    @Mapping(target = "clientId", source = "client.id")
    @Mapping(target = "clientName", source = "client.name")
    @Mapping(target = "contractId", source = "contract.id")
    @Mapping(target = "slaConfigId", source = "slaConfig.id")
    @Mapping(target = "engineerId", source = "engineer.id")
    @Mapping(target = "engineerName", expression = "java(order.getEngineer() != null ? order.getEngineer().getFullName() : null)")
    @Mapping(target = "secondEngineerId", source = "secondEngineer.id")
    @Mapping(target = "secondEngineerName", expression = "java(order.getSecondEngineer() != null ? order.getSecondEngineer().getFullName() : null)")
    WorkOrderDto toDto(WorkOrder order);
}
