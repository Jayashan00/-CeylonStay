package com.ceylonstay.backend.repository;

import com.ceylonstay.backend.model.ExternalCalendarLink;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ExternalCalendarLinkRepository extends MongoRepository<ExternalCalendarLink, String> {
    List<ExternalCalendarLink> findByRoomId(String roomId);
    List<ExternalCalendarLink> findByHotelIdIn(List<String> hotelIds);
}