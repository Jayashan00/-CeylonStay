package com.ceylonstay.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ExternalCalendarLinkRequest {
    @NotBlank
    private String channelName;

    @NotBlank
    private String icalUrl;
}