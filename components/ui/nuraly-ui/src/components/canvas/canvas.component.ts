import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';

@customElement('nodes-canvas')
class NodeRedCanvas extends LitElement {
  static override styles = css`
      .container {
          display: flex;
          justify-content: space-between;
      }
      .canvas-container {
          position: relative;
      }
      canvas {
          border: none; /* Removed the border */
          cursor: crosshair;
          background: repeating-linear-gradient(0deg, transparent, transparent 20px, rgba(200, 200, 200, 0.1) 20px, rgba(200, 200, 200, 0.1) 21px),
          repeating-linear-gradient(90deg, transparent, transparent 20px, rgba(200, 200, 200, 0.1) 20px, rgba(200, 200, 200, 0.1) 21px);
      }
      .node {
          position: absolute;
          width: 100px;
          height: 30px;
          background: #434343;
          color: white;
          text-align: center;
          line-height: 30px;
          border-radius: 5px;
          user-select: none;
          cursor: move;
      }
      .port {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          cursor: pointer;
      }
      .out-port {
          top: 10px;
          right: -5px;
          background: #3498db; /* Blue color for the output port */
      }
      .in-port {
          top: 10px;
          left: -5px;
          background: #2ecc71; /* Green color for the input port */
      }
      .add-button {
          position: absolute;
          top: 10px;
          left: 10px;
          padding: 10px;
          background-color: #2ecc71;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
      }
      .json-container {
          width: 400px;
          margin-left: 20px;
          padding: 10px;
          border-radius: 5px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          font-family: monospace;
          white-space: pre-wrap;
          word-wrap: break-word;
      }
  `;

  @property({ type: Array }) nodes = [
    { id: 1, x: 100, y: 100, label: 'Node 1' },
    { id: 2, x: 300, y: 150, label: 'Node 2' },
    { id: 4, x: 600, y: 250, label: 'Node 3' },
  ];

  @property({ type: Array }) connections = [{ from: 1, to: 2 }];

  @state() activeNode = null;
  @state() connectionStart = null;

  offsetX = 0;
  offsetY = 0;
  startPos = null;
  @state() canvas = null;
  @state() ctx = null;

  override render() {
    return html`
      <div class="container">
        <div class="canvas-container">
          <!--button class="add-button" @click="${this.addNode}">+</button-->
          <canvas
            id="canvas"
            width="1100"
            height="760"
            @mousedown="${this.startConnecting}"
            @mousemove="${this.drawTemporaryLine}"
            @mouseup="${this.stopConnecting}"
            @dblclick="${this.createNodeOnDoubleClick}"
          ></canvas>
          ${this.nodes.map(
            (node) => html`
              <div
                class="node"
                style="top: ${node.y}px; left: ${node.x}px;"
                @mousedown="${(e) => this.startDragging(e, node)}"
              >
                ${node.label}
                <div
                  class="port out-port"
                  @mousedown="${(e) => this.startConnecting(e, node, 'out')}"
                ></div>
                <div
                  class="port in-port"
                  @mouseup="${(e) => this.stopConnecting(e, node, 'in')}"
                ></div>
              </div>
            `
          )}
        </div>
        <!--div class="json-container">
          <h3>Canvas JSON</h3>
          <pre>${this.renderJSON()}</pre>
        </div-->
      </div>
    `;
  }

  renderJSON() {
    const jsonData = {
      nodes: this.nodes,
      connections: this.connections,
    };
    return JSON.stringify(jsonData, null, 2);
  }

  override firstUpdated() {
    this.canvas = this.renderRoot.querySelector('#canvas');
    this.ctx = this.canvas.getContext('2d');
    this.drawConnections();
  }

  startDragging(e, node) {
    if (this.connectionStart) return; // Prevent dragging if connection is in progress
    this.activeNode = node;
    this.offsetX = e.clientX - node.x;
    this.offsetY = e.clientY - node.y;
    window.addEventListener('mousemove', this.dragNode);
    window.addEventListener('mouseup', this.stopDragging); // Listen for mouseup to stop dragging
  }

  dragNode = (e) => {
    if (this.activeNode) {
      this.activeNode.x = e.clientX - this.offsetX;
      this.activeNode.y = e.clientY - this.offsetY;
      this.requestUpdate();
      this.drawConnections();
    }
  };

  stopDragging = () => {
    this.activeNode = null;
    window.removeEventListener('mousemove', this.dragNode); // Remove mousemove listener
    window.removeEventListener('mouseup', this.stopDragging); // Remove mouseup listener
  };

  startConnecting(e, node, portType) {
    e.stopPropagation(); // Prevent the mousedown event from triggering dragging
    if (portType === 'out') {
      // Only set the connection start if it's an 'out' port
      this.connectionStart = { node, portType };
    }
  }

  isConnectionExists(fromId, toId) {
    return this.connections.some(
      (connection) =>
        connection.from === fromId && connection.to === toId
    );
  }

  stopConnecting(e, node, portType) {
    if (!this.connectionStart) return; // No connection in progress
    const { node: startNode, portType: startPort } = this.connectionStart;

    if (
      startPort === 'out' &&
      portType === 'in' &&
      startNode.id !== node.id
    ) {
      if (!this.isConnectionExists(startNode.id, node.id)) {
        this.connections = [
          ...this.connections,
          { from: startNode.id, to: node.id },
        ];
        this.drawConnections();
      }
    }

    // Reset connection state
    this.connectionStart = null;
  }

  drawTemporaryLine(e) {
    if (!this.connectionStart) return; // No connection in progress
    const { node: startNode, portType: startPort } = this.connectionStart;
    const rect = this.canvas.getBoundingClientRect();
    const endPos = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    // Draw the temporary line from the port to the mouse position
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.drawConnections(); // Redraw the existing connections

    if (startPort === 'out') {
      const startX = startNode.x + 95; // position of the 'out' port
      const startY = startNode.y + 15; // vertical center of the 'out' port
      this.ctx.beginPath();
      this.ctx.moveTo(startX, startY);
      this.ctx.lineTo(endPos.x, endPos.y); // Temporary line to mouse position
      this.ctx.strokeStyle = '#3498db';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();

      // Draw the arrowhead on the temporary line
      const angle = Math.atan2(endPos.y - startY, endPos.x - startX);
      const arrowSize = 10;
      this.ctx.beginPath();
      this.ctx.moveTo(endPos.x, endPos.y);
      this.ctx.lineTo(endPos.x - arrowSize * Math.cos(angle - Math.PI / 6), endPos.y - arrowSize * Math.sin(angle - Math.PI / 6));
      this.ctx.lineTo(endPos.x - arrowSize * Math.cos(angle + Math.PI / 6), endPos.y - arrowSize * Math.sin(angle + Math.PI / 6));
      this.ctx.closePath();
      this.ctx.fillStyle = '#3498db';
      this.ctx.fill();
    }
  }

  drawConnections() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.connections.forEach((connection) => {
      const fromNode = this.nodes.find((node) => node.id === connection.from);
      const toNode = this.nodes.find((node) => node.id === connection.to);

      if (fromNode && toNode) {
        const fromX = fromNode.x + 95; // 'out' port x position
        const fromY = fromNode.y + 15; // 'out' port y position (center)
        const toX = toNode.x - 5; // 'in' port x position
        const toY = toNode.y + 15; // 'in' port y position (center)

        // Draw the line
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.strokeStyle = '#3498db';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw the arrowhead
        const angle = Math.atan2(toY - fromY, toX - fromX);
        const arrowSize = 10;
        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(
          toX - arrowSize * Math.cos(angle - Math.PI / 6),
          toY - arrowSize * Math.sin(angle - Math.PI / 6)
        );
        this.ctx.lineTo(
          toX - arrowSize * Math.cos(angle + Math.PI / 6),
          toY - arrowSize * Math.sin(angle + Math.PI / 6)
        );
        this.ctx.closePath();
        this.ctx.fillStyle = '#3498db';
        this.ctx.fill();
      }
    });
  }

  createNodeOnDoubleClick(e) {
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Check if the position is not too close to an existing node
    const overlappingNode = this.nodes.find(
      (node) =>
        Math.abs(mouseX - node.x) < 100 && Math.abs(mouseY - node.y) < 50
    );

    if (!overlappingNode) {
      const newNode = {
        id: this.nodes.length + 1,
        x: mouseX - 50, // Center the node at the clicked position
        y: mouseY - 25,
        label: `Node ${this.nodes.length + 1}`,
      };
      this.nodes = [...this.nodes, newNode];
    }
  }

  addNode() {
    const newNode = {
      id: this.nodes.length + 1,
      x: 50,
      y: 50,
      label: `Node ${this.nodes.length + 1}`,
    };
    this.nodes = [...this.nodes, newNode];
  }
}