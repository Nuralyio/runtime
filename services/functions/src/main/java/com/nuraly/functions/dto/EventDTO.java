package com.nuraly.functions.dto;

import com.nuraly.functions.entity.enums.EventStatus;
import com.nuraly.functions.entity.enums.EventType;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.Instant;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventDTO {

    private EventType type;
    private Instant timestamp;
    private String source;
    private String payload;
    private EventStatus status;
    private int retryCount;
    private Instant processingTime;
}
