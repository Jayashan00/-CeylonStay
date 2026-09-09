package com.ceylonstay.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SiteSettingsRequest {
    @NotBlank
    private String siteName;

    private String tagline;
    private String logoUrl;
    private String faviconUrl;
    private String heroImageUrl;

    @NotBlank
    private String primaryColor;

    @NotBlank
    private String accentColor;

    private String contactEmail;
    private String contactPhone;
    private String footerAbout;
    private String currencySymbol;
}