package com.ceylonstay.backend.dto;

import com.ceylonstay.backend.model.HotelStatus;
import lombok.Data;

@Data
public class HotelStatusRequest {
    private HotelStatus status;
}
