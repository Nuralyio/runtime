import type { Meta, StoryObj } from '@storybook/web-components';
import { html } from 'lit';
import './index.js';
import '../icon/index.js';
import {
  Workflow,
  WorkflowNode,
  WorkflowNodeType,
  AgentNodeType,
  DbDesignerNodeType,
  CanvasType,
  ExecutionStatus as NodeExecutionStatus,
  createNodeFromTemplate,
  NODE_TEMPLATES,
  NODE_CATEGORIES,
  getCategoriesForCanvasType,
} from './workflow-canvas.types.js';

// Helper function to create sample workflows
function createStandardWorkflow(): Workflow {
  const chatbotNode = createNodeFromTemplate(WorkflowNodeType.CHATBOT, { x: 100, y: 200 }, 'chatbot_1');
  const functionNode = createNodeFromTemplate(WorkflowNodeType.FUNCTION, { x: 400, y: 200 }, 'function_1');
  const conditionNode = createNodeFromTemplate(WorkflowNodeType.CONDITION, { x: 640, y: 200 }, 'condition_1');
  const httpNode = createNodeFromTemplate(WorkflowNodeType.HTTP, { x: 880, y: 100 }, 'http_1');
  const endNodeSuccess = createNodeFromTemplate(WorkflowNodeType.END, { x: 1120, y: 100 }, 'end_success');
  const endNodeFailure = createNodeFromTemplate(WorkflowNodeType.END, { x: 880, y: 320 }, 'end_failure');

  if (chatbotNode) {
    chatbotNode.name = 'Chatbot Trigger';
    chatbotNode.configuration = {
      triggerEvents: ['MESSAGE_SENT'],
      title: 'Chat Assistant',
      placeholder: 'Type a message...',
      chatbotSize: 'medium',
      chatbotVariant: 'default',
      enableSuggestions: true,
      suggestions: [
        { id: '1', text: 'Help me get started' },
        { id: '2', text: 'What can you do?' },
      ],
    };
  }
  if (functionNode) {
    functionNode.name = 'Process Data';
    functionNode.configuration = { functionId: 'process-data-fn' };
  }
  if (conditionNode) {
    conditionNode.name = 'Check Result';
    conditionNode.configuration = { expression: 'result.success === true' };
  }
  if (httpNode) {
    httpNode.name = 'Send Notification';
    httpNode.configuration = { method: 'POST', url: 'https://api.example.com/notify' };
  }
  if (endNodeSuccess) endNodeSuccess.name = 'Success';
  if (endNodeFailure) endNodeFailure.name = 'Failure';

  const nodes = [chatbotNode, functionNode, conditionNode, httpNode, endNodeSuccess, endNodeFailure].filter(Boolean) as WorkflowNode[];

  return {
    id: 'standard-workflow-1',
    name: 'Data Processing Workflow',
    description: 'Process data and send notifications based on results',
    nodes,
    edges: [
      { id: 'edge_1', sourceNodeId: 'chatbot_1', sourcePortId: 'out', targetNodeId: 'function_1', targetPortId: 'in' },
      { id: 'edge_2', sourceNodeId: 'function_1', sourcePortId: 'out', targetNodeId: 'condition_1', targetPortId: 'in' },
      { id: 'edge_3', sourceNodeId: 'condition_1', sourcePortId: 'true', targetNodeId: 'http_1', targetPortId: 'in', label: 'Success' },
      { id: 'edge_4', sourceNodeId: 'condition_1', sourcePortId: 'false', targetNodeId: 'end_failure', targetPortId: 'in', label: 'Failed' },
      { id: 'edge_5', sourceNodeId: 'http_1', sourcePortId: 'out', targetNodeId: 'end_success', targetPortId: 'in' },
    ],
  };
}

function createAgentWorkflow(): Workflow {
  const promptNode = createNodeFromTemplate(AgentNodeType.PROMPT, { x: 100, y: 200 }, 'prompt_1');
  const memoryNode = createNodeFromTemplate(AgentNodeType.MEMORY, { x: 100, y: 380 }, 'memory_1');
  const llmNode = createNodeFromTemplate(AgentNodeType.LLM, { x: 340, y: 200 }, 'llm_1');
  const agentNode = createNodeFromTemplate(AgentNodeType.AGENT, { x: 580, y: 200 }, 'agent_1');
  const toolNode = createNodeFromTemplate(AgentNodeType.TOOL, { x: 580, y: 380 }, 'tool_1');
  const parserNode = createNodeFromTemplate(AgentNodeType.OUTPUT_PARSER, { x: 820, y: 200 }, 'parser_1');
  const retrieverNode = createNodeFromTemplate(AgentNodeType.RETRIEVER, { x: 340, y: 380 }, 'retriever_1');

  if (promptNode) promptNode.name = 'User Query';
  if (memoryNode) memoryNode.name = 'Chat Memory';
  if (llmNode) {
    llmNode.name = 'Claude-3';
    llmNode.configuration = { provider: 'anthropic', modelName: 'claude-3-opus', temperature: 0.7 };
  }
  if (agentNode) {
    agentNode.name = 'Research Agent';
    agentNode.configuration = { systemPrompt: 'You are a helpful research assistant.' };
  }
  if (toolNode) {
    toolNode.name = 'Web Search';
    toolNode.configuration = { toolName: 'tavily_search' };
  }
  if (parserNode) parserNode.name = 'JSON Parser';
  if (retrieverNode) {
    retrieverNode.name = 'RAG Retriever';
    retrieverNode.configuration = { vectorStoreId: 'docs-store', topK: 5 };
  }

  const nodes = [promptNode, memoryNode, llmNode, agentNode, toolNode, parserNode, retrieverNode].filter(Boolean) as WorkflowNode[];

  return {
    id: 'agent-workflow-1',
    name: 'AI Research Agent',
    description: 'An AI agent that can search the web and answer questions',
    nodes,
    edges: [
      { id: 'edge_1', sourceNodeId: 'prompt_1', sourcePortId: 'out', targetNodeId: 'llm_1', targetPortId: 'in' },
      { id: 'edge_2', sourceNodeId: 'memory_1', sourcePortId: 'out', targetNodeId: 'llm_1', targetPortId: 'in' },
      { id: 'edge_3', sourceNodeId: 'retriever_1', sourcePortId: 'out', targetNodeId: 'llm_1', targetPortId: 'in' },
      { id: 'edge_4', sourceNodeId: 'llm_1', sourcePortId: 'out', targetNodeId: 'agent_1', targetPortId: 'in' },
      { id: 'edge_5', sourceNodeId: 'agent_1', sourcePortId: 'tool', targetNodeId: 'tool_1', targetPortId: 'in', animated: true },
      { id: 'edge_6', sourceNodeId: 'agent_1', sourcePortId: 'out', targetNodeId: 'parser_1', targetPortId: 'in' },
    ],
  };
}

function createComplexWorkflow(): Workflow {
  const startNode = createNodeFromTemplate(WorkflowNodeType.START, { x: 100, y: 300 }, 'start_1');
  const parallelNode = createNodeFromTemplate(WorkflowNodeType.PARALLEL, { x: 340, y: 300 }, 'parallel_1');
  const httpNode1 = createNodeFromTemplate(WorkflowNodeType.HTTP, { x: 580, y: 160 }, 'http_1');
  const httpNode2 = createNodeFromTemplate(WorkflowNodeType.HTTP, { x: 580, y: 440 }, 'http_2');
  const transformNode = createNodeFromTemplate(WorkflowNodeType.TRANSFORM, { x: 820, y: 300 }, 'transform_1');
  const loopNode = createNodeFromTemplate(WorkflowNodeType.LOOP, { x: 1060, y: 300 }, 'loop_1');
  const emailNode = createNodeFromTemplate(WorkflowNodeType.EMAIL, { x: 1300, y: 200 }, 'email_1');
  const endNode = createNodeFromTemplate(WorkflowNodeType.END, { x: 1300, y: 400 }, 'end_1');

  if (startNode) startNode.name = 'Start';
  if (parallelNode) parallelNode.name = 'Fetch Data';
  if (httpNode1) {
    httpNode1.name = 'API Call 1';
    httpNode1.configuration = { method: 'GET', url: 'https://api.service1.com/data' };
  }
  if (httpNode2) {
    httpNode2.name = 'API Call 2';
    httpNode2.configuration = { method: 'GET', url: 'https://api.service2.com/data' };
  }
  if (transformNode) {
    transformNode.name = 'Merge Results';
    transformNode.configuration = { transformExpression: '{ merged: $merge([$[0], $[1]]) }' };
  }
  if (loopNode) {
    loopNode.name = 'Process Items';
    loopNode.configuration = { iteratorVariable: 'item', arrayExpression: '$.data.items' };
  }
  if (emailNode) {
    emailNode.name = 'Send Report';
    emailNode.configuration = { to: 'admin@example.com', subject: 'Processing Complete' };
  }
  if (endNode) endNode.name = 'Done';

  const nodes = [startNode, parallelNode, httpNode1, httpNode2, transformNode, loopNode, emailNode, endNode].filter(Boolean) as WorkflowNode[];

  return {
    id: 'complex-workflow-1',
    name: 'Complex Data Pipeline',
    description: 'Parallel data fetching, transformation, and batch processing',
    nodes,
    edges: [
      { id: 'edge_1', sourceNodeId: 'start_1', sourcePortId: 'out', targetNodeId: 'parallel_1', targetPortId: 'in' },
      { id: 'edge_2', sourceNodeId: 'parallel_1', sourcePortId: 'branch1', targetNodeId: 'http_1', targetPortId: 'in', label: 'Branch 1' },
      { id: 'edge_3', sourceNodeId: 'parallel_1', sourcePortId: 'branch2', targetNodeId: 'http_2', targetPortId: 'in', label: 'Branch 2' },
      { id: 'edge_4', sourceNodeId: 'http_1', sourcePortId: 'out', targetNodeId: 'transform_1', targetPortId: 'in' },
      { id: 'edge_5', sourceNodeId: 'http_2', sourcePortId: 'out', targetNodeId: 'transform_1', targetPortId: 'in' },
      { id: 'edge_6', sourceNodeId: 'transform_1', sourcePortId: 'out', targetNodeId: 'loop_1', targetPortId: 'in' },
      { id: 'edge_7', sourceNodeId: 'loop_1', sourcePortId: 'item', targetNodeId: 'email_1', targetPortId: 'in', label: 'Each Item' },
      { id: 'edge_8', sourceNodeId: 'loop_1', sourcePortId: 'done', targetNodeId: 'end_1', targetPortId: 'in', label: 'Complete' },
    ],
  };
}

function createExecutionStatusWorkflow(): Workflow {
  const workflow = createStandardWorkflow();

  // Set different execution statuses
  if (workflow.nodes[0]) workflow.nodes[0].status = NodeExecutionStatus.COMPLETED;
  if (workflow.nodes[1]) workflow.nodes[1].status = NodeExecutionStatus.COMPLETED;
  if (workflow.nodes[2]) workflow.nodes[2].status = NodeExecutionStatus.RUNNING;
  if (workflow.nodes[3]) workflow.nodes[3].status = NodeExecutionStatus.PENDING;
  if (workflow.nodes[4]) workflow.nodes[4].status = NodeExecutionStatus.IDLE;
  if (workflow.nodes[5]) workflow.nodes[5].status = NodeExecutionStatus.IDLE;

  return workflow;
}

/**
 * ## Workflow Canvas
 *
 * A powerful visual workflow editor component for building and visualizing workflows.
 * Supports both standard automation workflows and AI agent-based workflows.
 *
 * ### Features
 * - Visual node-based workflow editing
 * - Drag-and-drop node creation
 * - Visual edge connections with bezier curves
 * - Pan and zoom navigation
 * - Node palette with categorized node types
 * - Support for standard workflow nodes (HTTP, Function, Condition, etc.)
 * - Support for AI agent nodes (LLM, Agent, Tool, Memory, etc.)
 * - Execution status visualization
 * - Multi-selection and keyboard shortcuts
 *
 * ### When to use
 * - Building automation workflows
 * - Creating AI agent pipelines
 * - Visualizing process flows
 * - Designing data transformation pipelines
 *
 * ### Keyboard Shortcuts
 * - **Delete/Backspace**: Delete selected nodes/edges
 * - **Escape**: Cancel current operation, clear selection
 * - **Ctrl/Cmd + A**: Select all
 * - **Alt + Drag / Middle Mouse**: Pan canvas
 * - **Mouse Wheel**: Zoom in/out
 */
const meta: Meta = {
  title: 'Data Display/Workflow Canvas',
  component: 'workflow-canvas',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'A visual workflow editor for building automation and AI agent workflows. Supports drag-and-drop node creation, visual connections, and real-time execution status display.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    workflow: {
      control: { type: 'object' },
      description: 'The workflow object containing nodes and edges',
      table: {
        category: 'Data',
        type: { summary: 'Workflow' },
      },
    },
    canvasType: {
      control: { type: 'select' },
      options: ['WORKFLOW', 'DATABASE'],
      description: 'Canvas mode - WORKFLOW for automation or DATABASE for schema design',
      table: {
        category: 'Mode',
        defaultValue: { summary: 'WORKFLOW' },
        type: { summary: 'CanvasType' },
      },
    },
    readonly: {
      control: { type: 'boolean' },
      description: 'Whether the canvas is in read-only mode',
      table: {
        category: 'State',
        defaultValue: { summary: 'false' },
      },
    },
    showToolbar: {
      control: { type: 'boolean' },
      description: 'Show/hide the toolbar',
      table: {
        category: 'UI',
        defaultValue: { summary: 'true' },
      },
    },
    showMinimap: {
      control: { type: 'boolean' },
      description: 'Show/hide the minimap',
      table: {
        category: 'UI',
        defaultValue: { summary: 'true' },
      },
    },
    showPalette: {
      control: { type: 'boolean' },
      description: 'Show/hide the node palette',
      table: {
        category: 'UI',
        defaultValue: { summary: 'false' },
      },
    },
  },
  args: {
    canvasType: 'WORKFLOW',
    readonly: false,
    showToolbar: true,
    showMinimap: true,
    showPalette: false,
  },
};

export default meta;
type Story = StoryObj;

/**
 * The default workflow canvas with a standard automation workflow.
 * Shows basic workflow nodes like Start, Function, Condition, HTTP, and End.
 */
export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A standard automation workflow with branching logic and HTTP requests.',
      },
    },
  },
  render: (args: any) => html`
    <div style="width: 100%; height: 100vh; background: #0f0f0f;">
      <workflow-canvas
        .workflow=${createStandardWorkflow()}
        ?readonly=${args.readonly}
        ?showToolbar=${args.showToolbar}
        ?showMinimap=${args.showMinimap}
        ?showPalette=${args.showPalette}
        @workflow-changed=${(e: CustomEvent) => console.log('Workflow changed:', e.detail)}
        @node-selected=${(e: CustomEvent) => console.log('Node selected:', e.detail)}
        @node-configured=${(e: CustomEvent) => console.log('Configure node:', e.detail)}
      ></workflow-canvas>
    </div>
  `,
};

/**
 * ## AI Agent Workflow
 *
 * Demonstrates the AI agent node types for building LLM-powered workflows.
 * Includes nodes for prompts, LLM calls, agents, tools, memory, and output parsing.
 */
export const AgentWorkflow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'An AI agent workflow with LLM, memory, retrieval, and tool nodes.',
      },
    },
  },
  render: (args: any) => html`
    <div style="width: 100%; height: 600px; background: #0f0f0f;">
      <workflow-canvas
        .workflow=${createAgentWorkflow()}
        ?readonly=${args.readonly}
        ?showToolbar=${args.showToolbar}
        ?showMinimap=${args.showMinimap}
        ?showPalette=${args.showPalette}
      ></workflow-canvas>
    </div>
  `,
};

/**
 * ## Complex Workflow
 *
 * A more complex workflow demonstrating parallel execution, loops, and data transformation.
 */
export const ComplexWorkflow: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A complex workflow with parallel branches, loops, and data transformation.',
      },
    },
  },
  render: (args: any) => html`
    <div style="width: 100%; height: 700px; background: #0f0f0f;">
      <workflow-canvas
        .workflow=${createComplexWorkflow()}
        ?readonly=${args.readonly}
        ?showToolbar=${args.showToolbar}
        ?showMinimap=${args.showMinimap}
        ?showPalette=${args.showPalette}
      ></workflow-canvas>
    </div>
  `,
};

/**
 * ## Empty Canvas
 *
 * An empty canvas ready for creating new workflows.
 * Click the + button or open the palette to add nodes.
 */
export const EmptyCanvas: Story = {
  parameters: {
    docs: {
      description: {
        story: 'An empty canvas for creating new workflows from scratch.',
      },
    },
  },
  args: {
    showPalette: true,
  },
  render: (args: any) => html`
    <div style="width: 100%; height: 600px; background: #0f0f0f;">
      <workflow-canvas
        .workflow=${{ id: 'new', name: 'New Workflow', nodes: [], edges: [] }}
        ?readonly=${args.readonly}
        ?showToolbar=${args.showToolbar}
        ?showMinimap=${args.showMinimap}
        ?showPalette=${args.showPalette}
      ></workflow-canvas>
    </div>
  `,
};

/**
 * ## Execution Status
 *
 * Demonstrates how nodes display different execution statuses.
 * Nodes can show idle, pending, running, completed, or failed states.
 */
export const ExecutionStatus: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Workflow nodes showing different execution statuses during workflow execution.',
      },
    },
  },
  render: (args: any) => html`
    <div style="width: 100%; height: 600px; background: #0f0f0f;">
      <workflow-canvas
        .workflow=${createExecutionStatusWorkflow()}
        ?readonly=${true}
        ?showToolbar=${args.showToolbar}
        ?showMinimap=${args.showMinimap}
        ?showPalette=${false}
      ></workflow-canvas>
    </div>
    <div style="position: absolute; top: 20px; right: 20px; background: rgba(0,0,0,0.8); padding: 16px; border-radius: 8px; color: #fff; font-size: 12px;">
      <div style="font-weight: 600; margin-bottom: 8px;">Execution Status Legend:</div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></span>
        Completed
      </div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%;"></span>
        Running
      </div>
      <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
        <span style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%;"></span>
        Pending
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="width: 8px; height: 8px; background: #6b7280; border-radius: 50%;"></span>
        Idle
      </div>
    </div>
  `,
};

/**
 * ## Read-Only Mode
 *
 * The canvas in read-only mode prevents any modifications.
 * Useful for viewing workflow executions or displaying published workflows.
 */
export const ReadOnly: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A read-only canvas for viewing workflows without allowing modifications.',
      },
    },
  },
  args: {
    readonly: true,
  },
  render: (args: any) => html`
    <div style="width: 100%; height: 600px; background: #0f0f0f;">
      <workflow-canvas
        .workflow=${createStandardWorkflow()}
        ?readonly=${args.readonly}
        ?showToolbar=${false}
        ?showMinimap=${args.showMinimap}
        ?showPalette=${false}
      ></workflow-canvas>
    </div>
  `,
};

/**
 * ## With Node Palette
 *
 * Shows the canvas with the node palette open.
 * Nodes can be dragged from the palette or double-clicked to add.
 */
export const WithPalette: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Canvas with the node palette open for adding new nodes.',
      },
    },
  },
  args: {
    showPalette: true,
  },
  render: (args: any) => html`
    <div style="width: 100%; height: 600px; background: #0f0f0f;">
      <workflow-canvas
        .workflow=${createStandardWorkflow()}
        ?readonly=${args.readonly}
        ?showToolbar=${args.showToolbar}
        ?showMinimap=${args.showMinimap}
        ?showPalette=${args.showPalette}
      ></workflow-canvas>
    </div>
  `,
};

/**
 * ## All Node Types
 *
 * Demonstrates all available node types organized by category.
 */
export const AllNodeTypes: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Reference of all available node types grouped by category.',
      },
    },
  },
  render: () => html`
    <div style="padding: 24px; background: #1a1a1a; border-radius: 12px; max-width: 900px;">
      <h2 style="color: #e5e5e5; margin: 0 0 24px 0; font-size: 20px;">Available Node Types</h2>

      ${NODE_CATEGORIES.map(category => html`
        <div style="margin-bottom: 32px;">
          <h3 style="color: #888; font-size: 14px; text-transform: uppercase; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
            <nr-icon name=${category.icon || 'folder'} size="small"></nr-icon>
            ${category.name}
          </h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px;">
            ${category.nodeTypes.map(nodeType => {
              const template = NODE_TEMPLATES.find(t => t.type === nodeType);
              if (!template) return '';
              return html`
                <div style="
                  background: #252525;
                  border-radius: 8px;
                  padding: 12px;
                  display: flex;
                  align-items: center;
                  gap: 12px;
                ">
                  <div style="
                    width: 36px;
                    height: 36px;
                    border-radius: 6px;
                    background: ${template.color};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                  ">
                    <nr-icon name=${template.icon} size="small" style="color: white;"></nr-icon>
                  </div>
                  <div>
                    <div style="color: #e5e5e5; font-size: 13px; font-weight: 500;">${template.name}</div>
                    <div style="color: #666; font-size: 11px;">${template.type}</div>
                  </div>
                </div>
              `;
            })}
          </div>
        </div>
      `)}
    </div>
  `,
};

/**
 * ## Interactive Demo
 *
 * A fully interactive demo with sidebar showing workflow JSON and selected node details.
 */
export const InteractiveDemo: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive demo with workflow JSON view and node details sidebar.',
      },
    },
  },
  render: () => {
    let workflow = createStandardWorkflow();
    let selectedNode: WorkflowNode | null = null;

    const handleWorkflowChanged = (e: CustomEvent) => {
      workflow = e.detail.workflow;
      updateUI();
    };

    const handleNodeSelected = (e: CustomEvent) => {
      selectedNode = e.detail.node;
      updateUI();
    };

    const updateUI = () => {
      const jsonEl = document.getElementById('workflow-json');
      const nodeEl = document.getElementById('selected-node');
      if (jsonEl) jsonEl.textContent = JSON.stringify(workflow, null, 2);
      if (nodeEl) {
        if (selectedNode) {
          nodeEl.innerHTML = `
            <div style="margin-bottom: 12px;">
              <div style="color: #888; font-size: 10px; text-transform: uppercase;">Name</div>
              <div style="color: #e5e5e5; font-size: 13px;">${selectedNode.name}</div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="color: #888; font-size: 10px; text-transform: uppercase;">Type</div>
              <div style="color: #e5e5e5; font-size: 13px;">${selectedNode.type}</div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="color: #888; font-size: 10px; text-transform: uppercase;">ID</div>
              <div style="color: #e5e5e5; font-size: 11px; font-family: monospace;">${selectedNode.id}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 10px; text-transform: uppercase;">Configuration</div>
              <pre style="color: #aaa; font-size: 10px; margin: 8px 0 0 0; background: #1a1a1a; padding: 8px; border-radius: 4px; overflow: auto;">${JSON.stringify(selectedNode.configuration, null, 2)}</pre>
            </div>
          `;
        } else {
          nodeEl.innerHTML = '<div style="color: #666; font-style: italic;">Click a node to see details</div>';
        }
      }
    };

    return html`
      <div style="display: flex; width: 100%; height: 100vh;">
        <div style="flex: 1; height: 100%;">
          <workflow-canvas
            .workflow=${workflow}
            showToolbar
            showMinimap
            @workflow-changed=${handleWorkflowChanged}
            @node-selected=${handleNodeSelected}
          ></workflow-canvas>
        </div>
        <div style="width: 320px; height: 100%; background: #1a1a1a; border-left: 1px solid #333; overflow-y: auto; padding: 16px;">
          <div style="color: #888; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 12px;">
            Selected Node
          </div>
          <div id="selected-node" style="background: #252525; padding: 12px; border-radius: 8px; margin-bottom: 24px;">
            <div style="color: #666; font-style: italic;">Click a node to see details</div>
          </div>

          <div style="color: #888; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 12px;">
            Workflow JSON
          </div>
          <pre id="workflow-json" style="background: #0f0f0f; padding: 12px; border-radius: 8px; color: #aaa; font-size: 10px; overflow: auto; max-height: 400px; white-space: pre-wrap;">${JSON.stringify(workflow, null, 2)}</pre>
        </div>
      </div>
    `;
  },
};

/**
 * ## Workflow Node Component
 *
 * Individual workflow node component showcase.
 */
export const WorkflowNodeShowcase: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Individual workflow node components showing different types and states.',
      },
    },
  },
  render: () => {
    const nodes: WorkflowNode[] = [
      { ...createNodeFromTemplate(WorkflowNodeType.START, { x: 0, y: 0 })!, name: 'Start', status: NodeExecutionStatus.COMPLETED },
      { ...createNodeFromTemplate(WorkflowNodeType.FUNCTION, { x: 0, y: 0 })!, name: 'Process Data', status: NodeExecutionStatus.RUNNING },
      { ...createNodeFromTemplate(WorkflowNodeType.CONDITION, { x: 0, y: 0 })!, name: 'Check Result', status: NodeExecutionStatus.PENDING },
      { ...createNodeFromTemplate(WorkflowNodeType.HTTP, { x: 0, y: 0 })!, name: 'API Request', status: NodeExecutionStatus.FAILED, error: 'Connection timeout' },
      { ...createNodeFromTemplate(AgentNodeType.AGENT, { x: 0, y: 0 })!, name: 'AI Agent', status: NodeExecutionStatus.IDLE },
      { ...createNodeFromTemplate(AgentNodeType.LLM, { x: 0, y: 0 })!, name: 'GPT-4', status: NodeExecutionStatus.WAITING },
    ];

    return html`
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px; background: #1a1a1a; border-radius: 12px;">
        <h3 style="color: #e5e5e5; margin: 0;">Workflow Node States</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
          ${nodes.map(node => html`
            <div style="position: relative; width: 200px; height: 120px;">
              <workflow-node .node=${node}></workflow-node>
            </div>
          `)}
        </div>
      </div>
    `;
  },
};

/**
 * ## Dark Theme Variations
 *
 * The workflow canvas with different dark theme backgrounds.
 */
export const ThemeVariations: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Canvas with different background color variations.',
      },
    },
  },
  render: () => html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <div>
        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">Default Dark (#0f0f0f)</div>
        <div style="width: 600px; height: 300px; background: #0f0f0f; border-radius: 8px; overflow: hidden;">
          <workflow-canvas
            .workflow=${createStandardWorkflow()}
            showToolbar=${false}
            showMinimap=${false}
          ></workflow-canvas>
        </div>
      </div>
      <div>
        <div style="color: #888; font-size: 12px; margin-bottom: 8px;">Darker (#080808)</div>
        <div style="width: 600px; height: 300px; background: #080808; border-radius: 8px; overflow: hidden;">
          <workflow-canvas
            .workflow=${createAgentWorkflow()}
            showToolbar=${false}
            showMinimap=${false}
            style="--canvas-bg: #080808;"
          ></workflow-canvas>
        </div>
      </div>
    </div>
  `,
};

/**
 * ## Realtime Execution Simulation
 *
 * Demonstrates realtime workflow execution with nodes updating their status
 * as the workflow progresses. Click "Run Workflow" to start the simulation.
 */
export const RealtimeExecution: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Simulates realtime workflow execution with status updates progressing through nodes.',
      },
    },
  },
  render: () => {
    // Create a complex workflow with parallel branches and AI nodes
    const createExecutionWorkflow = (): Workflow => {
      // Row 1: Start and initial processing
      const startNode = createNodeFromTemplate(WorkflowNodeType.START, { x: 80, y: 300 }, 'start_1');

      // Row 2: Parallel branch - split into two paths
      const functionNode = createNodeFromTemplate(WorkflowNodeType.FUNCTION, { x: 320, y: 300 }, 'function_1');

      // Upper branch: AI processing path
      const llmNode = createNodeFromTemplate(AgentNodeType.LLM, { x: 580, y: 120 }, 'llm_1');
      const agentNode = createNodeFromTemplate(AgentNodeType.AGENT, { x: 840, y: 120 }, 'agent_1');
      const toolNode = createNodeFromTemplate(AgentNodeType.TOOL, { x: 1100, y: 50 }, 'tool_1');

      // Lower branch: Data processing path
      const httpNode = createNodeFromTemplate(WorkflowNodeType.HTTP, { x: 580, y: 480 }, 'http_1');
      const transformNode = createNodeFromTemplate(WorkflowNodeType.TRANSFORM, { x: 840, y: 480 }, 'transform_1');

      // Merge point: Condition to check both paths
      const conditionNode = createNodeFromTemplate(WorkflowNodeType.CONDITION, { x: 1100, y: 300 }, 'condition_1');

      // Final processing
      const memoryNode = createNodeFromTemplate(AgentNodeType.MEMORY, { x: 1360, y: 200 }, 'memory_1');
      const notifyNode = createNodeFromTemplate(WorkflowNodeType.EMAIL, { x: 1360, y: 400 }, 'notify_1');

      // End nodes
      const endNodeSuccess = createNodeFromTemplate(WorkflowNodeType.END, { x: 1620, y: 300 }, 'end_success');
      const endNodeFailure = createNodeFromTemplate(WorkflowNodeType.END, { x: 1100, y: 550 }, 'end_failure');

      // Configure nodes
      if (startNode) {
        startNode.name = 'Trigger';
        startNode.metadata = { ...startNode.metadata, description: 'Webhook received' };
      }
      if (functionNode) {
        functionNode.name = 'Load Context';
        functionNode.metadata = { ...functionNode.metadata, description: 'Nuraly function' };
        functionNode.configuration = { functionId: 'load-user-context' };
      }
      if (llmNode) {
        llmNode.name = 'Claude 3.5';
        llmNode.metadata = { ...llmNode.metadata, description: 'Analyze request' };
        llmNode.configuration = { provider: 'anthropic', model: 'claude-3.5-sonnet' };
      }
      if (agentNode) {
        agentNode.name = 'Research Agent';
        agentNode.metadata = { ...agentNode.metadata, description: 'Multi-step reasoning' };
        agentNode.configuration = { systemPrompt: 'Research and analyze data' };
      }
      if (toolNode) {
        toolNode.name = 'Web Search';
        toolNode.metadata = { ...toolNode.metadata, description: 'Tavily API' };
        toolNode.configuration = { toolName: 'tavily_search' };
      }
      if (httpNode) {
        httpNode.name = 'Fetch External';
        httpNode.metadata = { ...httpNode.metadata, description: 'GET /api/data' };
        httpNode.configuration = { method: 'GET', url: 'https://api.example.com/data' };
      }
      if (transformNode) {
        transformNode.name = 'Merge Data';
        transformNode.metadata = { ...transformNode.metadata, description: 'Combine results' };
      }
      if (conditionNode) {
        conditionNode.name = 'Validate';
        conditionNode.metadata = { ...conditionNode.metadata, description: 'Check quality' };
        conditionNode.configuration = { expression: 'score > 0.8' };
      }
      if (memoryNode) {
        memoryNode.name = 'Save Context';
        memoryNode.metadata = { ...memoryNode.metadata, description: 'Store in memory' };
      }
      if (notifyNode) {
        notifyNode.name = 'Send Alert';
        notifyNode.metadata = { ...notifyNode.metadata, description: 'Email notification' };
        notifyNode.configuration = { to: 'team@example.com' };
      }
      if (endNodeSuccess) {
        endNodeSuccess.name = 'Complete';
        endNodeSuccess.metadata = { ...endNodeSuccess.metadata, description: 'Success' };
      }
      if (endNodeFailure) {
        endNodeFailure.name = 'Failed';
        endNodeFailure.metadata = { ...endNodeFailure.metadata, description: 'Error exit' };
      }

      const nodes = [
        startNode, functionNode,
        llmNode, agentNode, toolNode,
        httpNode, transformNode,
        conditionNode,
        memoryNode, notifyNode,
        endNodeSuccess, endNodeFailure
      ].filter(Boolean) as WorkflowNode[];

      return {
        id: 'realtime-execution-workflow',
        name: 'AI-Powered Data Pipeline',
        description: 'Complex workflow with parallel AI and data processing branches',
        nodes,
        edges: [
          // Start to function
          { id: 'edge_1', sourceNodeId: 'start_1', sourcePortId: 'out', targetNodeId: 'function_1', targetPortId: 'in' },

          // Split into two parallel branches
          { id: 'edge_2', sourceNodeId: 'function_1', sourcePortId: 'out', targetNodeId: 'llm_1', targetPortId: 'in', label: 'AI Path' },
          { id: 'edge_3', sourceNodeId: 'function_1', sourcePortId: 'out', targetNodeId: 'http_1', targetPortId: 'in', label: 'Data Path' },

          // Upper branch: AI processing
          { id: 'edge_4', sourceNodeId: 'llm_1', sourcePortId: 'out', targetNodeId: 'agent_1', targetPortId: 'in' },
          { id: 'edge_5', sourceNodeId: 'agent_1', sourcePortId: 'out', targetNodeId: 'tool_1', targetPortId: 'in', label: 'Search' },
          { id: 'edge_6', sourceNodeId: 'tool_1', sourcePortId: 'out', targetNodeId: 'condition_1', targetPortId: 'in' },
          { id: 'edge_7', sourceNodeId: 'agent_1', sourcePortId: 'out', targetNodeId: 'condition_1', targetPortId: 'in', label: 'Direct' },

          // Lower branch: Data processing
          { id: 'edge_8', sourceNodeId: 'http_1', sourcePortId: 'out', targetNodeId: 'transform_1', targetPortId: 'in' },
          { id: 'edge_9', sourceNodeId: 'transform_1', sourcePortId: 'out', targetNodeId: 'condition_1', targetPortId: 'in' },

          // Condition branches
          { id: 'edge_10', sourceNodeId: 'condition_1', sourcePortId: 'true', targetNodeId: 'memory_1', targetPortId: 'in', label: 'Pass' },
          { id: 'edge_11', sourceNodeId: 'condition_1', sourcePortId: 'true', targetNodeId: 'notify_1', targetPortId: 'in', label: 'Alert' },
          { id: 'edge_12', sourceNodeId: 'condition_1', sourcePortId: 'false', targetNodeId: 'end_failure', targetPortId: 'in', label: 'Reject' },

          // Final convergence
          { id: 'edge_13', sourceNodeId: 'memory_1', sourcePortId: 'out', targetNodeId: 'end_success', targetPortId: 'in' },
          { id: 'edge_14', sourceNodeId: 'notify_1', sourcePortId: 'out', targetNodeId: 'end_success', targetPortId: 'in' },
        ],
      };
    };

    // Execution state
    interface ExecutionState {
      workflow: Workflow;
      isRunning: boolean;
      executionId: string | null;
      logs: Array<{ timestamp: Date; nodeId: string; nodeName: string; status: string; message: string }>;
      currentNodeIndex: number;
    }

    const state: ExecutionState = {
      workflow: createExecutionWorkflow(),
      isRunning: false,
      executionId: null,
      logs: [],
      currentNodeIndex: -1,
    };

    // Define execution steps with node and the edges that lead TO that node
    interface ExecutionStep {
      nodeId: string;
      incomingEdgeIds: string[]; // Edge IDs that lead to this node in this execution
    }

    // Execution path for success scenario (AI branch with tool usage)
    const successSteps: ExecutionStep[] = [
      { nodeId: 'start_1', incomingEdgeIds: [] },
      { nodeId: 'function_1', incomingEdgeIds: ['edge_1'] },
      { nodeId: 'llm_1', incomingEdgeIds: ['edge_2'] },        // AI branch
      { nodeId: 'http_1', incomingEdgeIds: ['edge_3'] },       // Data branch (parallel)
      { nodeId: 'agent_1', incomingEdgeIds: ['edge_4'] },
      { nodeId: 'transform_1', incomingEdgeIds: ['edge_8'] },  // Data branch continues
      { nodeId: 'tool_1', incomingEdgeIds: ['edge_5'] },       // Agent uses tool
      { nodeId: 'condition_1', incomingEdgeIds: ['edge_6', 'edge_9'] },  // Merge from tool and transform
      { nodeId: 'memory_1', incomingEdgeIds: ['edge_10'] },    // Save result
      { nodeId: 'notify_1', incomingEdgeIds: ['edge_11'] },    // Send notification (parallel)
      { nodeId: 'end_success', incomingEdgeIds: ['edge_13', 'edge_14'] }
    ];

    // Execution path for failure scenario
    const failureSteps: ExecutionStep[] = [
      { nodeId: 'start_1', incomingEdgeIds: [] },
      { nodeId: 'function_1', incomingEdgeIds: ['edge_1'] },
      { nodeId: 'llm_1', incomingEdgeIds: ['edge_2'] },
      { nodeId: 'http_1', incomingEdgeIds: ['edge_3'] },
      { nodeId: 'agent_1', incomingEdgeIds: ['edge_4'] },
      { nodeId: 'transform_1', incomingEdgeIds: ['edge_8'] },
      { nodeId: 'condition_1', incomingEdgeIds: ['edge_7', 'edge_9'] },  // Direct from agent + transform
      { nodeId: 'end_failure', incomingEdgeIds: ['edge_12'] }
    ];

    let timeoutIds: number[] = [];

    const updateCanvas = () => {
      const canvas = document.querySelector('workflow-canvas') as any;
      if (canvas) {
        canvas.workflow = { ...state.workflow };
      }
    };

    const updateLogs = () => {
      const logsEl = document.getElementById('execution-logs');
      if (logsEl) {
        logsEl.innerHTML = state.logs.map(log => `
          <div style="display: flex; gap: 8px; padding: 6px 8px; background: ${
            log.status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.1)' :
            log.status === 'RUNNING' ? 'rgba(59, 130, 246, 0.1)' :
            log.status === 'FAILED' ? 'rgba(239, 68, 68, 0.1)' :
            'rgba(255, 255, 255, 0.05)'
          }; border-radius: 4px; margin-bottom: 4px;">
            <span style="color: #666; font-size: 10px; min-width: 60px;">${log.timestamp.toLocaleTimeString()}</span>
            <span style="color: ${
              log.status === 'COMPLETED' ? '#22c55e' :
              log.status === 'RUNNING' ? '#3b82f6' :
              log.status === 'FAILED' ? '#ef4444' :
              '#f59e0b'
            }; font-size: 10px; min-width: 70px;">[${log.status}]</span>
            <span style="color: #e5e5e5; font-size: 11px;">${log.nodeName}</span>
            <span style="color: #888; font-size: 10px; margin-left: auto;">${log.message}</span>
          </div>
        `).join('');
        logsEl.scrollTop = logsEl.scrollHeight;
      }
    };

    const updateStatus = (text: string, color: string = '#888') => {
      const statusEl = document.getElementById('execution-status');
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: ${color};">${text}</span>`;
      }
    };

    const updateNodeStatus = (nodeId: string, status: NodeExecutionStatus, error?: string) => {
      state.workflow = {
        ...state.workflow,
        nodes: state.workflow.nodes.map(node =>
          node.id === nodeId
            ? { ...node, status, error }
            : node
        ),
      };
      updateCanvas();
    };

    const updateEdgeStatusById = (edgeId: string, status: NodeExecutionStatus) => {
      state.workflow = {
        ...state.workflow,
        edges: state.workflow.edges.map(edge =>
          edge.id === edgeId
            ? { ...edge, status }
            : edge
        ),
      };
      updateCanvas();
    };

    const updateEdgesStatus = (edgeIds: string[], status: NodeExecutionStatus) => {
      state.workflow = {
        ...state.workflow,
        edges: state.workflow.edges.map(edge =>
          edgeIds.includes(edge.id)
            ? { ...edge, status }
            : edge
        ),
      };
      updateCanvas();
    };

    const addLog = (nodeId: string, nodeName: string, status: string, message: string) => {
      state.logs.push({
        timestamp: new Date(),
        nodeId,
        nodeName,
        status,
        message,
      });
      updateLogs();
    };

    const resetWorkflow = () => {
      // Clear all timeouts
      timeoutIds.forEach(id => clearTimeout(id));
      timeoutIds = [];

      state.workflow = createExecutionWorkflow();
      state.isRunning = false;
      state.executionId = null;
      state.logs = [];
      state.currentNodeIndex = -1;
      updateCanvas();
      updateLogs();
      updateStatus('Ready to execute');

      const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
      if (runBtn) {
        runBtn.disabled = false;
        runBtn.textContent = 'Run Workflow';
      }
    };

    const runExecution = (simulateFailure: boolean = false) => {
      if (state.isRunning) return;

      resetWorkflow();
      state.isRunning = true;
      state.executionId = `exec_${Date.now()}`;
      state.logs = [];

      const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
      if (runBtn) {
        runBtn.disabled = true;
        runBtn.textContent = 'Running...';
      }

      updateStatus('Execution started...', '#3b82f6');
      addLog('system', 'System', 'INFO', `Execution ${state.executionId} started`);

      const executionSteps = simulateFailure ? failureSteps : successSteps;
      let delay = 500;

      // Set all nodes in path to PENDING first
      executionSteps.forEach(step => {
        const node = state.workflow.nodes.find(n => n.id === step.nodeId);
        if (node) {
          updateNodeStatus(step.nodeId, NodeExecutionStatus.PENDING);
        }
      });

      // Execute each step with delays
      executionSteps.forEach((step, index) => {
        const node = state.workflow.nodes.find(n => n.id === step.nodeId);
        if (!node) return;

        // Start running
        const runTimeout = setTimeout(() => {
          updateNodeStatus(step.nodeId, NodeExecutionStatus.RUNNING);
          addLog(step.nodeId, node.name, 'RUNNING', 'Node execution started');
          updateStatus(`Executing: ${node.name}`, '#3b82f6');

          // Mark incoming edges as RUNNING (data flowing in)
          if (step.incomingEdgeIds.length > 0) {
            updateEdgesStatus(step.incomingEdgeIds, NodeExecutionStatus.RUNNING);
          }
        }, delay);
        timeoutIds.push(runTimeout);

        delay += 800 + Math.random() * 400; // Random execution time

        // Complete or fail
        const completeTimeout = setTimeout(() => {
          const isLastNode = index === executionSteps.length - 1;
          const isFailed = simulateFailure && step.nodeId === 'condition_1';

          if (isFailed) {
            // Simulate condition evaluating to false
            updateNodeStatus(step.nodeId, NodeExecutionStatus.COMPLETED);
            addLog(step.nodeId, node.name, 'COMPLETED', 'Condition evaluated to FALSE');
            // Mark incoming edges as COMPLETED
            if (step.incomingEdgeIds.length > 0) {
              updateEdgesStatus(step.incomingEdgeIds, NodeExecutionStatus.COMPLETED);
            }
          } else if (simulateFailure && step.nodeId === 'end_failure') {
            updateNodeStatus(step.nodeId, NodeExecutionStatus.FAILED);
            addLog(step.nodeId, node.name, 'FAILED', 'Workflow ended with failure path');
            // Mark incoming edges as FAILED
            if (step.incomingEdgeIds.length > 0) {
              updateEdgesStatus(step.incomingEdgeIds, NodeExecutionStatus.FAILED);
            }
          } else {
            updateNodeStatus(step.nodeId, NodeExecutionStatus.COMPLETED);
            addLog(step.nodeId, node.name, 'COMPLETED', `Execution completed in ${Math.floor(Math.random() * 500 + 100)}ms`);
            // Mark incoming edges as COMPLETED
            if (step.incomingEdgeIds.length > 0) {
              updateEdgesStatus(step.incomingEdgeIds, NodeExecutionStatus.COMPLETED);
            }
          }

          if (isLastNode) {
            state.isRunning = false;
            const finalStatus = simulateFailure ? 'FAILED' : 'COMPLETED';
            updateStatus(`Execution ${finalStatus}`, simulateFailure ? '#ef4444' : '#22c55e');
            addLog('system', 'System', finalStatus, `Workflow execution ${finalStatus.toLowerCase()}`);

            const runBtn = document.getElementById('run-btn') as HTMLButtonElement;
            if (runBtn) {
              runBtn.disabled = false;
              runBtn.textContent = 'Run Again';
            }
          }
        }, delay);
        timeoutIds.push(completeTimeout);

        delay += 300;
      });
    };

    // Cleanup on unmount
    const cleanup = () => {
      timeoutIds.forEach(id => clearTimeout(id));
    };

    return html`
      <div style="display: flex; width: 100%; height: 100vh;" @disconnected=${cleanup}>
        <div style="flex: 1; height: 100%;">
          <workflow-canvas
            .workflow=${state.workflow}
            ?readonly=${true}
            showToolbar
            showMinimap
          ></workflow-canvas>
        </div>
        <div style="width: 320px; height: 100%; background: #1a1a1a; border-left: 1px solid #333; display: flex; flex-direction: column;">
          <!-- Header -->
          <div style="padding: 16px; border-bottom: 1px solid #333;">
            <h3 style="color: #e5e5e5; margin: 0 0 12px 0; font-size: 14px;">Execution Simulator</h3>
            <div style="display: flex; gap: 8px;">
              <button
                id="run-btn"
                @click=${() => runExecution(false)}
                style="flex: 1; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;"
              >
                Run Workflow
              </button>
              <button
                @click=${() => runExecution(true)}
                style="padding: 8px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;"
                title="Simulate failure path"
              >
                Fail
              </button>
              <button
                @click=${resetWorkflow}
                style="padding: 8px 12px; background: #333; color: #888; border: none; border-radius: 6px; cursor: pointer; font-size: 12px;"
              >
                Reset
              </button>
            </div>
          </div>

          <!-- Status -->
          <div style="padding: 12px 16px; background: #252525; border-bottom: 1px solid #333;">
            <div style="color: #666; font-size: 10px; text-transform: uppercase; margin-bottom: 4px;">Status</div>
            <div id="execution-status" style="color: #888; font-size: 12px;">Ready to execute</div>
          </div>

          <!-- Logs -->
          <div style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
            <div style="padding: 12px 16px 8px; color: #666; font-size: 10px; text-transform: uppercase;">
              Execution Logs
            </div>
            <div id="execution-logs" style="flex: 1; overflow-y: auto; padding: 0 16px 16px; font-family: monospace;">
              <div style="color: #666; font-size: 11px; font-style: italic;">Click "Run Workflow" to start...</div>
            </div>
          </div>

          <!-- Legend -->
          <div style="padding: 16px; border-top: 1px solid #333; background: #252525;">
            <div style="color: #666; font-size: 10px; text-transform: uppercase; margin-bottom: 8px;">Status Legend</div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; background: #6b7280; border-radius: 50%;"></span>
                <span style="color: #888;">Idle</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; background: #f59e0b; border-radius: 50%;"></span>
                <span style="color: #888;">Pending</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; animation: pulse 1s infinite;"></span>
                <span style="color: #888;">Running</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></span>
                <span style="color: #888;">Completed</span>
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="width: 8px; height: 8px; background: #ef4444; border-radius: 50%;"></span>
                <span style="color: #888;">Failed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style>
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      </style>
    `;
  },
};

// ============================================================================
// DB DESIGNER STORIES
// ============================================================================

/**
 * Helper function to create a sample database schema
 */
function createDatabaseSchema(): Workflow {
  // Tables
  const usersTable = createNodeFromTemplate(DbDesignerNodeType.TABLE, { x: 100, y: 100 }, 'table_users');
  const ordersTable = createNodeFromTemplate(DbDesignerNodeType.TABLE, { x: 500, y: 100 }, 'table_orders');
  const productsTable = createNodeFromTemplate(DbDesignerNodeType.TABLE, { x: 500, y: 400 }, 'table_products');
  const orderItemsTable = createNodeFromTemplate(DbDesignerNodeType.TABLE, { x: 900, y: 250 }, 'table_order_items');

  // Views
  const activeUsersView = createNodeFromTemplate(DbDesignerNodeType.VIEW, { x: 100, y: 400 }, 'view_active_users');

  // Indexes
  const emailIndex = createNodeFromTemplate(DbDesignerNodeType.INDEX, { x: 100, y: 600 }, 'idx_users_email');
  const orderDateIndex = createNodeFromTemplate(DbDesignerNodeType.INDEX, { x: 500, y: 600 }, 'idx_orders_date');

  // Relationships
  const userOrderRelation = createNodeFromTemplate(DbDesignerNodeType.RELATIONSHIP, { x: 300, y: 200 }, 'rel_user_orders');
  const orderItemsRelation = createNodeFromTemplate(DbDesignerNodeType.RELATIONSHIP, { x: 700, y: 180 }, 'rel_order_items');
  const productItemsRelation = createNodeFromTemplate(DbDesignerNodeType.RELATIONSHIP, { x: 700, y: 380 }, 'rel_product_items');

  // Constraints
  const uniqueEmailConstraint = createNodeFromTemplate(DbDesignerNodeType.CONSTRAINT, { x: 100, y: 250 }, 'const_unique_email');

  // Query
  const salesReportQuery = createNodeFromTemplate(DbDesignerNodeType.QUERY, { x: 900, y: 500 }, 'query_sales_report');

  // Configure nodes
  if (usersTable) {
    usersTable.name = 'users';
    usersTable.configuration = {
      tableName: 'users',
      primaryKey: 'id',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false },
        { name: 'email', type: 'VARCHAR(255)', nullable: false },
        { name: 'name', type: 'VARCHAR(100)', nullable: true },
        { name: 'status', type: 'VARCHAR(20)', nullable: false, defaultValue: 'active' },
        { name: 'created_at', type: 'TIMESTAMP', nullable: false },
      ],
    };
  }

  if (ordersTable) {
    ordersTable.name = 'orders';
    ordersTable.configuration = {
      tableName: 'orders',
      primaryKey: 'id',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false },
        { name: 'user_id', type: 'INTEGER', nullable: false },
        { name: 'total', type: 'DECIMAL(10,2)', nullable: false },
        { name: 'status', type: 'VARCHAR(20)', nullable: false },
        { name: 'order_date', type: 'TIMESTAMP', nullable: false },
      ],
    };
  }

  if (productsTable) {
    productsTable.name = 'products';
    productsTable.configuration = {
      tableName: 'products',
      primaryKey: 'id',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false },
        { name: 'name', type: 'VARCHAR(255)', nullable: false },
        { name: 'price', type: 'DECIMAL(10,2)', nullable: false },
        { name: 'stock', type: 'INTEGER', nullable: false, defaultValue: 0 },
      ],
    };
  }

  if (orderItemsTable) {
    orderItemsTable.name = 'order_items';
    orderItemsTable.configuration = {
      tableName: 'order_items',
      primaryKey: 'id',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false },
        { name: 'order_id', type: 'INTEGER', nullable: false },
        { name: 'product_id', type: 'INTEGER', nullable: false },
        { name: 'quantity', type: 'INTEGER', nullable: false },
        { name: 'unit_price', type: 'DECIMAL(10,2)', nullable: false },
      ],
    };
  }

  if (activeUsersView) {
    activeUsersView.name = 'active_users_view';
    activeUsersView.configuration = {
      viewName: 'active_users_view',
      query: "SELECT * FROM users WHERE status = 'active'",
      materialized: false,
    };
  }

  if (emailIndex) {
    emailIndex.name = 'idx_users_email';
    emailIndex.configuration = {
      indexName: 'idx_users_email',
      indexColumns: ['email'],
      unique: true,
      indexType: 'BTREE',
    };
  }

  if (orderDateIndex) {
    orderDateIndex.name = 'idx_orders_date';
    orderDateIndex.configuration = {
      indexName: 'idx_orders_date',
      indexColumns: ['order_date'],
      unique: false,
      indexType: 'BTREE',
    };
  }

  if (userOrderRelation) {
    userOrderRelation.name = 'users → orders';
    userOrderRelation.configuration = {
      relationshipType: 'ONE_TO_MANY',
      sourceColumn: 'id',
      targetColumn: 'user_id',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    };
  }

  if (orderItemsRelation) {
    orderItemsRelation.name = 'orders → items';
    orderItemsRelation.configuration = {
      relationshipType: 'ONE_TO_MANY',
      sourceColumn: 'id',
      targetColumn: 'order_id',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    };
  }

  if (productItemsRelation) {
    productItemsRelation.name = 'products → items';
    productItemsRelation.configuration = {
      relationshipType: 'ONE_TO_MANY',
      sourceColumn: 'id',
      targetColumn: 'product_id',
      onDelete: 'RESTRICT',
      onUpdate: 'CASCADE',
    };
  }

  if (uniqueEmailConstraint) {
    uniqueEmailConstraint.name = 'uq_users_email';
    uniqueEmailConstraint.configuration = {
      constraintName: 'uq_users_email',
      constraintType: 'UNIQUE',
      constraintColumns: ['email'],
    };
  }

  if (salesReportQuery) {
    salesReportQuery.name = 'sales_report';
    salesReportQuery.configuration = {
      queryName: 'get_sales_report',
      queryText: `SELECT
  p.name AS product_name,
  SUM(oi.quantity) AS total_sold,
  SUM(oi.quantity * oi.unit_price) AS total_revenue
FROM order_items oi
JOIN products p ON p.id = oi.product_id
WHERE oi.created_at >= :start_date
GROUP BY p.id, p.name
ORDER BY total_revenue DESC`,
      parameters: [
        { name: 'start_date', type: 'TIMESTAMP' },
      ],
    };
  }

  const nodes = [
    usersTable,
    ordersTable,
    productsTable,
    orderItemsTable,
    activeUsersView,
    emailIndex,
    orderDateIndex,
    userOrderRelation,
    orderItemsRelation,
    productItemsRelation,
    uniqueEmailConstraint,
    salesReportQuery,
  ].filter(Boolean) as WorkflowNode[];

  return {
    id: 'db-schema-1',
    name: 'E-Commerce Database Schema',
    description: 'Database schema for an e-commerce application',
    nodes,
    edges: [
      // Relationships connect tables
      { id: 'edge_1', sourceNodeId: 'table_users', sourcePortId: 'ref', targetNodeId: 'rel_user_orders', targetPortId: 'source' },
      { id: 'edge_2', sourceNodeId: 'rel_user_orders', sourcePortId: 'source', targetNodeId: 'table_orders', targetPortId: 'ref' },
      { id: 'edge_3', sourceNodeId: 'table_orders', sourcePortId: 'ref', targetNodeId: 'rel_order_items', targetPortId: 'source' },
      { id: 'edge_4', sourceNodeId: 'rel_order_items', sourcePortId: 'source', targetNodeId: 'table_order_items', targetPortId: 'ref' },
      { id: 'edge_5', sourceNodeId: 'table_products', sourcePortId: 'ref', targetNodeId: 'rel_product_items', targetPortId: 'source' },
      { id: 'edge_6', sourceNodeId: 'rel_product_items', sourcePortId: 'source', targetNodeId: 'table_order_items', targetPortId: 'ref' },
      // View references table
      { id: 'edge_7', sourceNodeId: 'table_users', sourcePortId: 'ref', targetNodeId: 'view_active_users', targetPortId: 'source' },
      // Indexes reference tables
      { id: 'edge_8', sourceNodeId: 'table_users', sourcePortId: 'ref', targetNodeId: 'idx_users_email', targetPortId: 'table' },
      { id: 'edge_9', sourceNodeId: 'table_orders', sourcePortId: 'ref', targetNodeId: 'idx_orders_date', targetPortId: 'table' },
      // Constraint references table
      { id: 'edge_10', sourceNodeId: 'table_users', sourcePortId: 'ref', targetNodeId: 'const_unique_email', targetPortId: 'table' },
      // Query references tables
      { id: 'edge_11', sourceNodeId: 'table_order_items', sourcePortId: 'ref', targetNodeId: 'query_sales_report', targetPortId: 'tables' },
      { id: 'edge_12', sourceNodeId: 'table_products', sourcePortId: 'ref', targetNodeId: 'query_sales_report', targetPortId: 'tables' },
    ],
  };
}

/**
 * Helper function to create a simple database schema for demo
 */
function createSimpleDatabaseSchema(): Workflow {
  const usersTable = createNodeFromTemplate(DbDesignerNodeType.TABLE, { x: 150, y: 200 }, 'table_users');
  const postsTable = createNodeFromTemplate(DbDesignerNodeType.TABLE, { x: 550, y: 200 }, 'table_posts');
  const commentsTable = createNodeFromTemplate(DbDesignerNodeType.TABLE, { x: 950, y: 200 }, 'table_comments');

  const userPostRelation = createNodeFromTemplate(DbDesignerNodeType.RELATIONSHIP, { x: 350, y: 300 }, 'rel_user_posts');
  const postCommentRelation = createNodeFromTemplate(DbDesignerNodeType.RELATIONSHIP, { x: 750, y: 300 }, 'rel_post_comments');

  if (usersTable) {
    usersTable.name = 'users';
    usersTable.configuration = {
      tableName: 'users',
      primaryKey: 'id',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false },
        { name: 'username', type: 'VARCHAR(50)', nullable: false },
        { name: 'email', type: 'VARCHAR(255)', nullable: false },
      ],
    };
  }

  if (postsTable) {
    postsTable.name = 'posts';
    postsTable.configuration = {
      tableName: 'posts',
      primaryKey: 'id',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false },
        { name: 'user_id', type: 'INTEGER', nullable: false },
        { name: 'title', type: 'VARCHAR(255)', nullable: false },
        { name: 'content', type: 'TEXT', nullable: true },
      ],
    };
  }

  if (commentsTable) {
    commentsTable.name = 'comments';
    commentsTable.configuration = {
      tableName: 'comments',
      primaryKey: 'id',
      columns: [
        { name: 'id', type: 'SERIAL', nullable: false },
        { name: 'post_id', type: 'INTEGER', nullable: false },
        { name: 'user_id', type: 'INTEGER', nullable: false },
        { name: 'content', type: 'TEXT', nullable: false },
      ],
    };
  }

  if (userPostRelation) {
    userPostRelation.name = 'users → posts';
    userPostRelation.configuration = {
      relationshipType: 'ONE_TO_MANY',
      sourceColumn: 'id',
      targetColumn: 'user_id',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    };
  }

  if (postCommentRelation) {
    postCommentRelation.name = 'posts → comments';
    postCommentRelation.configuration = {
      relationshipType: 'ONE_TO_MANY',
      sourceColumn: 'id',
      targetColumn: 'post_id',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    };
  }

  const nodes = [
    usersTable,
    postsTable,
    commentsTable,
    userPostRelation,
    postCommentRelation,
  ].filter(Boolean) as WorkflowNode[];

  return {
    id: 'db-schema-simple',
    name: 'Blog Database Schema',
    description: 'Simple blog database with users, posts, and comments',
    nodes,
    edges: [
      { id: 'edge_1', sourceNodeId: 'table_users', sourcePortId: 'ref', targetNodeId: 'rel_user_posts', targetPortId: 'source' },
      { id: 'edge_2', sourceNodeId: 'rel_user_posts', sourcePortId: 'source', targetNodeId: 'table_posts', targetPortId: 'ref' },
      { id: 'edge_3', sourceNodeId: 'table_posts', sourcePortId: 'ref', targetNodeId: 'rel_post_comments', targetPortId: 'source' },
      { id: 'edge_4', sourceNodeId: 'rel_post_comments', sourcePortId: 'source', targetNodeId: 'table_comments', targetPortId: 'ref' },
    ],
  };
}

/**
 * ## Database Designer Canvas
 *
 * The workflow canvas in DATABASE mode for designing database schemas.
 * Shows DB designer nodes like Tables, Views, Indexes, Relationships, Constraints, and Queries.
 */
export const DatabaseDesigner: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A database schema designer showing tables, relationships, and other database elements for an e-commerce application.',
      },
    },
  },
  render: (args: any) => html`
    <div style="width: 100%; height: 100vh; background: #0f0f0f;">
      <workflow-canvas
        .workflow=${createDatabaseSchema()}
        canvasType="DATABASE"
        ?readonly=${args.readonly}
        ?showToolbar=${args.showToolbar}
        ?showMinimap=${args.showMinimap}
        ?showPalette=${args.showPalette}
        @workflow-changed=${(e: CustomEvent) => console.log('Schema changed:', e.detail)}
        @node-selected=${(e: CustomEvent) => console.log('Element selected:', e.detail)}
        @node-configured=${(e: CustomEvent) => console.log('Configure element:', e.detail)}
      ></workflow-canvas>
    </div>
  `,
};

/**
 * ## Simple Database Schema
 *
 * A simpler database schema demonstrating basic table relationships.
 */
export const SimpleDatabaseSchema: Story = {
  parameters: {
    docs: {
      description: {
        story: 'A simple blog database schema with users, posts, and comments tables.',
      },
    },
  },
  render: (args: any) => html`
    <div style="width: 100%; height: 600px; background: #0f0f0f;">
      <workflow-canvas
        .workflow=${createSimpleDatabaseSchema()}
        canvasType="DATABASE"
        ?readonly=${args.readonly}
        ?showToolbar=${args.showToolbar}
        ?showMinimap=${args.showMinimap}
        ?showPalette=${args.showPalette}
      ></workflow-canvas>
    </div>
  `,
};

/**
 * ## Empty Database Canvas
 *
 * An empty canvas in DATABASE mode ready for designing a new schema.
 * Shows the DB designer palette with Tables, Views, Indexes, etc.
 */
export const EmptyDatabaseCanvas: Story = {
  parameters: {
    docs: {
      description: {
        story: 'An empty database designer canvas for creating new database schemas from scratch.',
      },
    },
  },
  args: {
    showPalette: true,
  },
  render: (args: any) => html`
    <div style="width: 100%; height: 600px; background: #0f0f0f;">
      <workflow-canvas
        .workflow=${{ id: 'new-schema', name: 'New Database Schema', nodes: [], edges: [] }}
        canvasType="DATABASE"
        ?readonly=${args.readonly}
        ?showToolbar=${args.showToolbar}
        ?showMinimap=${args.showMinimap}
        ?showPalette=${args.showPalette}
      ></workflow-canvas>
    </div>
  `,
};

/**
 * ## All DB Designer Node Types
 *
 * Demonstrates all available DB designer node types organized by category.
 */
export const AllDbDesignerNodeTypes: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Reference of all available DB designer node types grouped by category.',
      },
    },
  },
  render: () => {
    const dbCategories = getCategoriesForCanvasType(CanvasType.DATABASE);

    return html`
      <div style="padding: 24px; background: #1a1a1a; border-radius: 12px; max-width: 700px;">
        <h2 style="color: #e5e5e5; margin: 0 0 8px 0; font-size: 20px;">DB Designer Node Types</h2>
        <p style="color: #888; margin: 0 0 24px 0; font-size: 13px;">
          Available node types when canvas is in DATABASE mode
        </p>

        ${dbCategories.map(category => html`
          <div style="margin-bottom: 32px;">
            <h3 style="color: #888; font-size: 14px; text-transform: uppercase; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px;">
              <nr-icon name=${category.icon || 'folder'} size="small"></nr-icon>
              ${category.name}
            </h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
              ${category.nodeTypes.map(nodeType => {
                const template = NODE_TEMPLATES.find(t => t.type === nodeType);
                if (!template) return '';
                return html`
                  <div style="
                    background: #252525;
                    border-radius: 8px;
                    padding: 16px;
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                  ">
                    <div style="
                      width: 40px;
                      height: 40px;
                      border-radius: 8px;
                      background: ${template.color};
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      flex-shrink: 0;
                    ">
                      <nr-icon name=${template.icon} size="small" style="color: white;"></nr-icon>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                      <div style="color: #e5e5e5; font-size: 14px; font-weight: 500;">${template.name}</div>
                      <div style="color: #666; font-size: 11px; margin-top: 2px;">${template.type}</div>
                      <div style="color: #888; font-size: 11px; margin-top: 6px; line-height: 1.4;">${template.description}</div>
                    </div>
                  </div>
                `;
              })}
            </div>
          </div>
        `)}
      </div>
    `;
  },
};

/**
 * ## DB Designer Node Showcase
 *
 * Individual DB designer node components showing different types.
 */
export const DbDesignerNodeShowcase: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'Individual DB designer node components showing all node types.',
      },
    },
  },
  render: () => {
    const viewNode = createNodeFromTemplate(DbDesignerNodeType.VIEW, { x: 0, y: 0 });
    const indexNode = createNodeFromTemplate(DbDesignerNodeType.INDEX, { x: 0, y: 0 });
    const relationshipNode = createNodeFromTemplate(DbDesignerNodeType.RELATIONSHIP, { x: 0, y: 0 });
    const constraintNode = createNodeFromTemplate(DbDesignerNodeType.CONSTRAINT, { x: 0, y: 0 });
    const queryNode = createNodeFromTemplate(DbDesignerNodeType.QUERY, { x: 0, y: 0 });

    if (viewNode) {
      viewNode.name = 'active_users';
      viewNode.configuration = { viewName: 'active_users', materialized: false };
    }
    if (indexNode) {
      indexNode.name = 'idx_email';
      indexNode.configuration = { indexName: 'idx_email', unique: true };
    }
    if (relationshipNode) {
      relationshipNode.name = 'users → orders';
      relationshipNode.configuration = { relationshipType: 'ONE_TO_MANY' };
    }
    if (constraintNode) {
      constraintNode.name = 'uq_email';
      constraintNode.configuration = { constraintType: 'UNIQUE' };
    }
    if (queryNode) {
      queryNode.name = 'get_users';
      queryNode.configuration = { queryName: 'get_users' };
    }

    const nodes = [viewNode, indexNode, relationshipNode, constraintNode, queryNode].filter(Boolean) as WorkflowNode[];

    return html`
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px; background: #1a1a1a; border-radius: 12px;">
        <h3 style="color: #e5e5e5; margin: 0;">DB Designer Node Types (Non-Table)</h3>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
          ${nodes.map(node => html`
            <div style="position: relative; width: 200px; height: 120px;">
              <workflow-node .node=${node}></workflow-node>
            </div>
          `)}
        </div>
      </div>
    `;
  },
};

/**
 * ## DB Table Node Showcase
 *
 * Shows the ERD-style table nodes with columns displayed.
 */
export const DbTableNodeShowcase: Story = {
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        story: 'DB Table nodes displayed in ERD-style showing table name and columns with type icons.',
      },
    },
  },
  render: () => {
    // Users table
    const usersTable = createNodeFromTemplate(DbDesignerNodeType.TABLE, { x: 0, y: 0 });
    if (usersTable) {
      usersTable.name = 'users';
      usersTable.configuration = {
        tableName: 'users',
        primaryKey: 'id',
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false },
          { name: 'name', type: 'VARCHAR', nullable: false },
          { name: 'email', type: 'VARCHAR', nullable: false },
          { name: 'created_at', type: 'TIMESTAMP', nullable: true },
        ],
      };
    }

    // Posts table
    const postsTable = createNodeFromTemplate(DbDesignerNodeType.TABLE, { x: 0, y: 0 });
    if (postsTable) {
      postsTable.name = 'posts';
      postsTable.configuration = {
        tableName: 'posts',
        primaryKey: 'id',
        columns: [
          { name: 'id', type: 'INTEGER', nullable: false },
          { name: 'user_id', type: 'INTEGER', nullable: false },
          { name: 'title', type: 'VARCHAR', nullable: false },
          { name: 'content', type: 'TEXT', nullable: true },
        ],
      };
    }

    // Empty table
    const emptyTable = createNodeFromTemplate(DbDesignerNodeType.TABLE, { x: 0, y: 0 });
    if (emptyTable) {
      emptyTable.name = 'new_table';
    }

    return html`
      <div style="display: flex; flex-direction: column; gap: 24px; padding: 24px; background: #1a1a1a; border-radius: 12px;">
        <h3 style="color: #e5e5e5; margin: 0;">DB Table Nodes (ERD Style)</h3>
        <div style="display: flex; gap: 32px; flex-wrap: wrap;">
          <div style="position: relative;">
            <workflow-node .node=${usersTable}></workflow-node>
          </div>
          <div style="position: relative;">
            <workflow-node .node=${postsTable}></workflow-node>
          </div>
          <div style="position: relative;">
            <workflow-node .node=${emptyTable}></workflow-node>
          </div>
        </div>
      </div>
    `;
  },
};

/**
 * ## Database Designer Interactive Demo
 *
 * An interactive database designer demo with schema JSON and selected element details.
 */
export const DatabaseDesignerDemo: Story = {
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Interactive database designer demo with schema JSON view and element details sidebar.',
      },
    },
  },
  render: () => {
    let workflow = createDatabaseSchema();
    let selectedNode: WorkflowNode | null = null;

    const handleWorkflowChanged = (e: CustomEvent) => {
      workflow = e.detail.workflow;
      updateUI();
    };

    const handleNodeSelected = (e: CustomEvent) => {
      selectedNode = e.detail.node;
      updateUI();
    };

    const updateUI = () => {
      const jsonEl = document.getElementById('schema-json');
      const nodeEl = document.getElementById('selected-element');
      if (jsonEl) jsonEl.textContent = JSON.stringify(workflow, null, 2);
      if (nodeEl) {
        if (selectedNode) {
          const template = NODE_TEMPLATES.find(t => t.type === selectedNode!.type);
          nodeEl.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
              <div style="
                width: 40px;
                height: 40px;
                border-radius: 8px;
                background: ${template?.color || '#3b82f6'};
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <nr-icon name="${template?.icon || 'box'}" size="small" style="color: white;"></nr-icon>
              </div>
              <div>
                <div style="color: #e5e5e5; font-size: 14px; font-weight: 500;">${selectedNode.name}</div>
                <div style="color: #888; font-size: 11px;">${selectedNode.type}</div>
              </div>
            </div>
            <div style="margin-bottom: 12px;">
              <div style="color: #888; font-size: 10px; text-transform: uppercase;">ID</div>
              <div style="color: #e5e5e5; font-size: 11px; font-family: monospace;">${selectedNode.id}</div>
            </div>
            <div>
              <div style="color: #888; font-size: 10px; text-transform: uppercase;">Configuration</div>
              <pre style="color: #aaa; font-size: 10px; margin: 8px 0 0 0; background: #1a1a1a; padding: 8px; border-radius: 4px; overflow: auto; max-height: 200px;">${JSON.stringify(selectedNode.configuration, null, 2)}</pre>
            </div>
          `;
        } else {
          nodeEl.innerHTML = '<div style="color: #666; font-style: italic;">Click an element to see details</div>';
        }
      }
    };

    return html`
      <div style="display: flex; width: 100%; height: 100vh;">
        <div style="flex: 1; height: 100%;">
          <workflow-canvas
            .workflow=${workflow}
            canvasType="DATABASE"
            showToolbar
            showMinimap
            @workflow-changed=${handleWorkflowChanged}
            @node-selected=${handleNodeSelected}
          ></workflow-canvas>
        </div>
        <div style="width: 360px; height: 100%; background: #1a1a1a; border-left: 1px solid #333; overflow-y: auto; padding: 16px;">
          <div style="color: #3b82f6; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">
            Database Designer
          </div>
          <div style="color: #888; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 12px;">
            Selected Element
          </div>
          <div id="selected-element" style="background: #252525; padding: 12px; border-radius: 8px; margin-bottom: 24px;">
            <div style="color: #666; font-style: italic;">Click an element to see details</div>
          </div>

          <div style="color: #888; font-size: 11px; text-transform: uppercase; font-weight: 600; margin-bottom: 12px;">
            Schema JSON
          </div>
          <pre id="schema-json" style="background: #0f0f0f; padding: 12px; border-radius: 8px; color: #aaa; font-size: 10px; overflow: auto; max-height: 400px; white-space: pre-wrap;">${JSON.stringify(workflow, null, 2)}</pre>
        </div>
      </div>
    `;
  },
};
