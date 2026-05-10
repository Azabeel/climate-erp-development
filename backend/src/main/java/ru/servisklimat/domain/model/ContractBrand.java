package ru.servisklimat.domain.model;

import jakarta.persistence.*;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Entity
@Table(name = "contract_brands")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@IdClass(ContractBrand.ContractBrandId.class)
public class ContractBrand {

    @Id
    @Column(name = "contract_id")
    private UUID contractId;

    @Id
    @Column(name = "brand_id")
    private UUID brandId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", insertable = false, updatable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", insertable = false, updatable = false)
    private Brand brand;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContractBrandId implements Serializable {
        private UUID contractId;
        private UUID brandId;
    }
}
