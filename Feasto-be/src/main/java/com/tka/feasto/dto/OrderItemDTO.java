package com.tka.feasto.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDTO {

    private Long orderItemId;
    private Long orderId;
    private Long menuItemId;
    private Integer quantity;
    private Double price;
}