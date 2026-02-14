package com.nuraly.docgen.dto;

import java.util.UUID;

public class GenerateResponse {

    public UUID jobId;
    public String status;
    public String fileUrl;

    public GenerateResponse() {}

    public GenerateResponse(UUID jobId, String status, String fileUrl) {
        this.jobId = jobId;
        this.status = status;
        this.fileUrl = fileUrl;
    }
}
