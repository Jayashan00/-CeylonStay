package com.ceylonstay.backend.controller;

import com.ceylonstay.backend.dto.ExternalCalendarLinkRequest;
import com.ceylonstay.backend.model.ExternalCalendarLink;
import com.ceylonstay.backend.model.Role;
import com.ceylonstay.backend.model.Room;
import com.ceylonstay.backend.security.UserPrincipal;
import com.ceylonstay.backend.service.ChannelSyncService;
import com.ceylonstay.backend.service.RoomService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * Owner-facing "connect to Booking.com / Trip.lk / etc" panel:
 *  - GET  returns the room's own export link (paste this INTO the OTA's
 *    "import calendar" field so it learns about bookings made on this site)
 *    plus the list of OTA calendars currently feeding INTO this site.
 *  - POST adds an OTA's own iCal export link (paste that link IN HERE so
 *    this site learns about bookings made on the OTA).
 */
@RestController
@RequestMapping("/api/owner")
@RequiredArgsConstructor
public class ChannelSyncController {

    private final ChannelSyncService channelSyncService;
    private final RoomService roomService;

    private boolean isAdmin(UserPrincipal p) {
        return p.getUser().getRole() == Role.ADMIN;
    }

    private String baseUrl(HttpServletRequest request) {
        String scheme = request.getHeader("X-Forwarded-Proto") != null
                ? request.getHeader("X-Forwarded-Proto") : request.getScheme();
        String host = request.getHeader("X-Forwarded-Host") != null
                ? request.getHeader("X-Forwarded-Host") : request.getHeader("Host");
        return scheme + "://" + host;
    }

    @GetMapping("/rooms/{roomId}/channels")
    public Map<String, Object> getChannelInfo(@AuthenticationPrincipal UserPrincipal principal,
                                              @PathVariable String roomId,
                                              HttpServletRequest request) {
        List<ExternalCalendarLink> links = channelSyncService.getLinksForRoom(roomId, principal.getId(), isAdmin(principal));
        Room room = roomService.getRoom(roomId);
        String exportUrl = roomService.getOrCreateExportUrl(room, baseUrl(request));
        return Map.of(
                "exportUrl", exportUrl,
                "links", links
        );
    }

    @PostMapping("/rooms/{roomId}/channels")
    public ExternalCalendarLink addChannel(@AuthenticationPrincipal UserPrincipal principal,
                                           @PathVariable String roomId,
                                           @Valid @RequestBody ExternalCalendarLinkRequest request) {
        return channelSyncService.addLink(roomId, principal.getId(), isAdmin(principal), request);
    }

    @PostMapping("/channels/{linkId}/sync-now")
    public ExternalCalendarLink syncNow(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String linkId) {
        return channelSyncService.syncNow(linkId, principal.getId(), isAdmin(principal));
    }

    @DeleteMapping("/channels/{linkId}")
    public void deleteChannel(@AuthenticationPrincipal UserPrincipal principal, @PathVariable String linkId) {
        channelSyncService.deleteLink(linkId, principal.getId(), isAdmin(principal));
    }
}