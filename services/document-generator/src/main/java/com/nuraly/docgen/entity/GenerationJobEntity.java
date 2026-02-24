package com.nuraly.docgen.entity;

import com.nuraly.docgen.entity.enums.JobStatus;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "generation_jobs")
@Getter
@Setter
public class GenerationJobEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id", nullable = false)
    public TemplateEntity template;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    public JobStatus status = JobStatus.PENDING;

    @Column(name = "input_data", columnDefinition = "TEXT")
    public String inputData;

    @Column(name = "output_path", length = 512)
    public String outputPath;

    @Column(name = "error", columnDefinition = "TEXT")
    public String error;

    @Column(name = "callback_id")
    public String callbackId;

    @Column(name = "application_id")
    public String applicationId;

    @Column(name = "created_by")
    public String createdBy;

    @Column(name = "created_at")
    public Instant createdAt;

    @Column(name = "completed_at")
    public Instant completedAt;

    @PrePersist
    public void prePersist() {
        createdAt = Instant.now();
    }
}
