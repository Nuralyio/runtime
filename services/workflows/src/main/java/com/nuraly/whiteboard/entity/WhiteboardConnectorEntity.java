package com.nuraly.whiteboard.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.nuraly.canvas.entity.BaseCanvasConnector;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

/**
 * Connector entity for whiteboard canvas.
 * Represents arrows and lines connecting elements.
 */
@Entity
@Table(name = "whiteboard_connectors")
@Getter
@Setter
public class WhiteboardConnectorEntity extends BaseCanvasConnector {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "whiteboard_id", nullable = false)
    @JsonIgnore
    public WhiteboardEntity whiteboard;

    /**
     * Line type for the connector.
     * Values: straight, curved, elbow, step
     */
    @Column(name = "line_type")
    public String lineType = "straight";

    /**
     * Label position along the connector (0.0 to 1.0).
     */
    @Column(name = "label_position")
    public Float labelPosition = 0.5f;
}
