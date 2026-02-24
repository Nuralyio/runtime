package com.nuraly.workflows.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/**
 * Result of an ownership acquisition attempt.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OwnershipResult {

    public enum Status {
        ACQUIRED,           // Successfully acquired ownership
        ALREADY_OWNED,      // Already owned by this instance
        RESOURCE_BUSY,      // Owned by another instance (lease not expired)
        CLAIMED_ORPHAN      // Claimed from expired lease
    }

    private Status status;
    private String resourceKey;
    private String ownerInstanceId;
    private String previousOwnerInstanceId;
    private Instant leaseExpiresAt;
    private String message;

    public boolean isSuccess() {
        return status == Status.ACQUIRED || status == Status.ALREADY_OWNED || status == Status.CLAIMED_ORPHAN;
    }

    public static OwnershipResult acquired(String resourceKey, String instanceId, Instant leaseExpires) {
        return new OwnershipResult(Status.ACQUIRED, resourceKey, instanceId, null, leaseExpires,
            "Ownership acquired successfully");
    }

    public static OwnershipResult alreadyOwned(String resourceKey, String instanceId, Instant leaseExpires) {
        return new OwnershipResult(Status.ALREADY_OWNED, resourceKey, instanceId, null, leaseExpires,
            "Already owned by this instance");
    }

    public static OwnershipResult resourceBusy(String resourceKey, String currentOwner, Instant leaseExpires) {
        return new OwnershipResult(Status.RESOURCE_BUSY, resourceKey, currentOwner, null, leaseExpires,
            "Resource is busy, owned by: " + currentOwner);
    }

    public static OwnershipResult claimedOrphan(String resourceKey, String instanceId, String previousOwner, Instant leaseExpires) {
        return new OwnershipResult(Status.CLAIMED_ORPHAN, resourceKey, instanceId, previousOwner, leaseExpires,
            "Claimed orphaned resource from: " + previousOwner);
    }
}
