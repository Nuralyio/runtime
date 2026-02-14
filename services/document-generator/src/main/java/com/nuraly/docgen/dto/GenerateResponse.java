package com.nuraly.docgen.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class GenerateResponse {

    private UUID jobId;
    private String status;
    private String fileUrl;
}
