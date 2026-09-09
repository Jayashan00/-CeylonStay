package com.ceylonstay.backend.service;

import com.ceylonstay.backend.dto.SiteSettingsRequest;
import com.ceylonstay.backend.model.SiteSettings;
import com.ceylonstay.backend.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {

    private static final String SETTINGS_ID = "site";

    private final SiteSettingsRepository settingsRepository;

    /**
     * Returns the single site settings document, creating it with sensible
     * defaults the first time it's requested (so no manual seeding is needed).
     */
    public SiteSettings getSettings() {
        return settingsRepository.findById(SETTINGS_ID)
                .orElseGet(() -> settingsRepository.save(SiteSettings.builder().id(SETTINGS_ID).build()));
    }

    public SiteSettings updateSettings(SiteSettingsRequest req) {
        SiteSettings settings = getSettings();

        settings.setSiteName(req.getSiteName());
        settings.setTagline(req.getTagline());
        settings.setLogoUrl(req.getLogoUrl());
        settings.setFaviconUrl(req.getFaviconUrl());
        settings.setHeroImageUrl(req.getHeroImageUrl());
        settings.setPrimaryColor(req.getPrimaryColor());
        settings.setAccentColor(req.getAccentColor());
        settings.setContactEmail(req.getContactEmail());
        settings.setContactPhone(req.getContactPhone());
        settings.setFooterAbout(req.getFooterAbout());
        settings.setCurrencySymbol(req.getCurrencySymbol());
        settings.setUpdatedAt(LocalDateTime.now());

        return settingsRepository.save(settings);
    }
}