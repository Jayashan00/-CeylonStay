package com.ceylonstay.backend.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Singleton document holding site-wide branding & configuration that
 * admins can edit from the Admin > Settings screen. There is always
 * exactly one document in this collection, with a fixed id "site".
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "site_settings")
public class SiteSettings {

    @Id
    @Builder.Default
    private String id = "site";

    @Builder.Default
    private String siteName = "CeylonStay";

    @Builder.Default
    private String tagline = "Find your next stay, anywhere in Sri Lanka";

    @Builder.Default
    private String logoUrl = "";

    @Builder.Default
    private String faviconUrl = "";

    @Builder.Default
    private String heroImageUrl = "https://images.pexels.com/photos/11434425/pexels-photo-11434425.jpeg?auto=compress&cs=tinysrgb&w=1800";

    @Builder.Default
    private String primaryColor = "#003580";

    @Builder.Default
    private String accentColor = "#febb02";

    @Builder.Default
    private String contactEmail = "help@ceylonstay.lk";

    @Builder.Default
    private String contactPhone = "+94 11 234 5678";

    @Builder.Default
    private String footerAbout = "Sri Lanka's own platform for hotels, resorts, villas and homestays — from Colombo's skyline to the beaches of the south.";

    @Builder.Default
    private String currencySymbol = "Rs";

    private LocalDateTime updatedAt;
}