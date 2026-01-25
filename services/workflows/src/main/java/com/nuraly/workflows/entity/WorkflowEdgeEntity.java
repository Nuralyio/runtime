package com.nuraly.workflows.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.GenericGenerator;

import java.util.UUID;

@Entity
@Table(name = "workflow_edges")
@Getter
@Setter
public class WorkflowEdgeEntity extends PanacheEntityBase {

    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    @JsonIgnore
    public WorkflowEntity workflow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_node_id", nullable = false)
    @JsonIgnore
    public WorkflowNodeEntity sourceNode;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_node_id", nullable = false)
    @JsonIgnore
    public WorkflowNodeEntity targetNode;

    @Column(name = "source_port_id")
    public String sourcePortId;

    @Column(name = "target_port_id")
    public String targetPortId;

    // For conditional edges
    @Lob
    @Column(columnDefinition = "TEXT", name = "condition_expression")
    public String condition; // JSON: condition expression

    public String label; // "true", "false", "default", custom label

    public Integer priority = 0; // Evaluation order for multiple outgoing edges
}
