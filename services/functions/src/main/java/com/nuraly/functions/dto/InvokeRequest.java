package com.nuraly.functions.dto;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Data;


@Data

public class InvokeRequest {

    private JsonNode data;
    public InvokeRequest () {
    }
    public InvokeRequest (JsonNode data) {
        this.data = data;
    }


}