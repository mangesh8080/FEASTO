package com.tka.feasto.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeliveryPartnerAvailabilityDTO {

    private Boolean available;
    private LocationDTO currentLocation;

}
