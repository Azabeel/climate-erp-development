package ru.servisklimat.api.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import ru.servisklimat.api.dto.stock.*;
import ru.servisklimat.domain.model.StockBalance;
import ru.servisklimat.domain.model.StockItem;
import ru.servisklimat.domain.model.StockMovement;

import java.util.List;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface StockMapper {

    StockItemDto toDto(StockItem entity);

    List<StockItemDto> toDtoList(List<StockItem> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    StockItem toEntity(CreateStockItemRequest request);

    @Mapping(target = "availableQty", expression = "java(entity.getAvailableQty())")
    StockBalanceDto toDto(StockBalance entity);

    List<StockBalanceDto> toBalanceDtoList(List<StockBalance> entities);

    StockMovementDto toDto(StockMovement entity);

    List<StockMovementDto> toMovementDtoList(List<StockMovement> entities);
}
