package ru.servisklimat.api.dto.brand;

public record UpdateBrandRequest(
        String name,
        Boolean isActive
) {}
