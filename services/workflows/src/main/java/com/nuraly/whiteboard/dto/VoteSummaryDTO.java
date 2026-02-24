package com.nuraly.whiteboard.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Data
public class VoteSummaryDTO {
    public UUID elementId;
    public long totalVotes;
    public Map<String, Long> voteCounts;  // value -> count
    public List<VoteDTO> votes;

    @Data
    public static class VoteDTO {
        public UUID userId;
        public String userName;
        public String value;

        public static VoteDTO of(UUID userId, String userName, String value) {
            VoteDTO dto = new VoteDTO();
            dto.userId = userId;
            dto.userName = userName;
            dto.value = value;
            return dto;
        }
    }
}
