package com.ceylonstay.backend.model;

/**
 * Where a RoomBlock came from.
 *  - MANUAL: the owner clicked "Block these dates" themselves (maintenance,
 *    offline booking, personal use, etc — this already existed).
 *  - EXTERNAL_SYNC: pulled in automatically from a connected OTA's iCal
 *    feed (Booking.com, Trip.lk, Agoda, Airbnb...) by ChannelSyncService.
 */
public enum BlockSource {
    MANUAL,
    EXTERNAL_SYNC
}