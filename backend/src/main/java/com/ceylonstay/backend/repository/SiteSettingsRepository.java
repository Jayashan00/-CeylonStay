package com.ceylonstay.backend.repository;

import com.ceylonstay.backend.model.SiteSettings;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SiteSettingsRepository extends MongoRepository<SiteSettings, String> {
}