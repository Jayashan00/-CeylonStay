package com.ceylonstay.backend.service;

import lombok.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Minimal, dependency-free iCalendar (.ics) reader/writer — just enough to:
 *   (a) read a Booking.com / Trip.lk / Airbnb "export calendar" feed and
 *       pull out booked date ranges, and
 *   (b) write our own bookings out as a feed those platforms can import.
 * No external library needed, so no extra cost and nothing new to install.
 */
@Service
public class IcalService {

    private static final DateTimeFormatter ICS_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");

    @Value
    public static class ParsedEvent {
        String uid;
        LocalDate start; // inclusive
        LocalDate end;   // exclusive (matches Booking/RoomBlock semantics)
        String summary;
    }

    /** Un-folds RFC5545 line folding (continuation lines start with a space or tab). */
    private List<String> unfold(String icsText) {
        String[] rawLines = icsText.replace("\r\n", "\n").split("\n");
        List<String> lines = new ArrayList<>();
        for (String raw : rawLines) {
            if (!raw.isEmpty() && (raw.charAt(0) == ' ' || raw.charAt(0) == '\t') && !lines.isEmpty()) {
                int last = lines.size() - 1;
                lines.set(last, lines.get(last) + raw.substring(1));
            } else {
                lines.add(raw);
            }
        }
        return lines;
    }

    /** Handles all-day "20250101" and date-time "20250101T140000Z" style values. */
    private LocalDate parseDateValue(String value) {
        String datePart = value.length() >= 8 ? value.substring(0, 8) : value;
        return LocalDate.parse(datePart, ICS_DATE);
    }

    public List<ParsedEvent> parse(String icsText) {
        List<ParsedEvent> events = new ArrayList<>();
        List<String> lines = unfold(icsText);

        boolean inEvent = false;
        String uid = null;
        LocalDate start = null;
        LocalDate end = null;
        String summary = null;

        for (String line : lines) {
            if (line.startsWith("BEGIN:VEVENT")) {
                inEvent = true;
                uid = null;
                start = null;
                end = null;
                summary = null;
                continue;
            }
            if (line.startsWith("END:VEVENT")) {
                if (inEvent && start != null) {
                    LocalDate resolvedEnd = (end != null) ? end : start.plusDays(1);
                    if (!resolvedEnd.isAfter(start)) resolvedEnd = start.plusDays(1);
                    events.add(new ParsedEvent(
                            uid != null ? uid : UUID.randomUUID().toString(),
                            start, resolvedEnd,
                            summary != null ? summary : "Booked"
                    ));
                }
                inEvent = false;
                continue;
            }
            if (!inEvent) continue;

            int colon = line.indexOf(':');
            if (colon < 0) continue;
            String key = line.substring(0, colon);
            String value = line.substring(colon + 1).trim();
            String keyName = key.split(";")[0];

            switch (keyName) {
                case "UID" -> uid = value;
                case "DTSTART" -> start = parseDateValue(value);
                case "DTEND" -> end = parseDateValue(value);
                case "SUMMARY" -> summary = value.replace("\\,", ",").replace("\\;", ";");
                default -> {
                }
            }
        }
        return events;
    }

    private String escape(String text) {
        if (text == null) return "";
        return text.replace("\\", "\\\\").replace(",", "\\,").replace(";", "\\;").replace("\n", "\\n");
    }

    public String buildCalendar(String calendarName, List<ParsedEvent> events) {
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//CeylonStay//Room Availability//EN\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("X-WR-CALNAME:").append(escape(calendarName)).append("\r\n");
        for (ParsedEvent e : events) {
            sb.append("BEGIN:VEVENT\r\n");
            sb.append("UID:").append(escape(e.getUid())).append("\r\n");
            sb.append("DTSTART;VALUE=DATE:").append(e.getStart().format(ICS_DATE)).append("\r\n");
            sb.append("DTEND;VALUE=DATE:").append(e.getEnd().format(ICS_DATE)).append("\r\n");
            sb.append("SUMMARY:").append(escape(e.getSummary())).append("\r\n");
            sb.append("END:VEVENT\r\n");
        }
        sb.append("END:VCALENDAR\r\n");
        return sb.toString();
    }
}