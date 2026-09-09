package com.ceylonstay.backend.dto;

import com.ceylonstay.backend.model.PaymentMethod;
import com.ceylonstay.backend.model.PaymentType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class PaymentRequest {
    @Positive
    private double amount;

    @NotNull
    private PaymentType type;

    @NotNull
    private PaymentMethod method;

    private String reference;
    private String notes;
}
