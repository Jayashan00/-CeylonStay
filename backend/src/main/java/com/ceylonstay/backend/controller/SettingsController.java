package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.dto.SiteSettingsRequest;
import com.ceylonstay.backend.model.SiteSettings;
import com.ceylonstay.backend.service.SiteSettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class SettingsController {

    private final SiteSettingsService siteSettingsService;

    /** Public: the frontend loads this on every page to render branding. */
    @GetMapping("/api/settings")
    public SiteSettings getSettings() {
        return siteSettingsService.getSettings();
    }

    /** Admin-only: update site branding & configuration. Protected by the
     *  "/api/admin/**" rule already defined in SecurityConfig. */
    @PutMapping("/api/admin/settings")
    public SiteSettings updateSettings(@Valid @RequestBody SiteSettingsRequest request) {
        return siteSettingsService.updateSettings(request);
    }
}