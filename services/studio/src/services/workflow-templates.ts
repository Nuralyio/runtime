/**
 * Workflow Template Definitions
 * Each template defines a real workflow structure with nodes, edges, and description.
 * The backend create endpoint accepts nodes/edges, so we send the full definition.
 */

export interface WorkflowTemplateNode {
  tempId: string; // temporary ID for wiring edges — backend generates real UUIDs
  name: string;
  type: string;
  positionX: number;
  positionY: number;
  configuration: string; // JSON string
  ports: string; // JSON string
}

export interface WorkflowTemplateEdge {
  sourceTempId: string;
  sourcePortId: string;
  targetTempId: string;
  targetPortId: string;
  label?: string;
}

export interface WorkflowTemplateDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  nodes: WorkflowTemplateNode[];
  edges: WorkflowTemplateEdge[];
}

// ─── Helper: standard ports ────────────────────────────────

const portsStartOnly = JSON.stringify({
  inputs: [],
  outputs: [{ id: 'out', type: 'OUTPUT', label: 'Output' }],
});

const portsEndOnly = JSON.stringify({
  inputs: [{ id: 'in', type: 'INPUT', label: 'Input' }],
  outputs: [],
});

const portsBoth = JSON.stringify({
  inputs: [{ id: 'in', type: 'INPUT', label: 'Input' }],
  outputs: [{ id: 'out', type: 'OUTPUT', label: 'Output' }],
});

const portsCondition = JSON.stringify({
  inputs: [{ id: 'in', type: 'INPUT', label: 'Input' }],
  outputs: [
    { id: 'true', type: 'CONDITIONAL_TRUE', label: 'True' },
    { id: 'false', type: 'CONDITIONAL_FALSE', label: 'False' },
  ],
});

// ─── Templates ─────────────────────────────────────────────

export const WORKFLOW_TEMPLATES: WorkflowTemplateDefinition[] = [
  // 1. Webhook Handler
  {
    id: 'webhook-handler',
    name: 'Webhook Handler',
    description: 'Receive HTTP requests, process the payload with a function, and return a response',
    icon: 'webhook',
    category: 'Integrations',
    nodes: [
      {
        tempId: 'http-start',
        name: 'HTTP Trigger',
        type: 'HTTP_START',
        positionX: 250,
        positionY: 100,
        configuration: JSON.stringify({
          httpPath: '/webhook',
          httpMethods: ['POST'],
          httpAuth: 'none',
          httpCors: true,
        }),
        ports: portsStartOnly,
      },
      {
        tempId: 'transform',
        name: 'Process Payload',
        type: 'TRANSFORM',
        positionX: 250,
        positionY: 250,
        configuration: JSON.stringify({
          transformExpression: '$.body',
          language: 'jsonata',
        }),
        ports: portsBoth,
      },
      {
        tempId: 'http-end',
        name: 'HTTP Response',
        type: 'HTTP_END',
        positionX: 250,
        positionY: 400,
        configuration: JSON.stringify({
          httpStatusCode: 200,
          httpContentType: 'application/json',
          httpResponseBody: '{"status": "ok"}',
        }),
        ports: portsEndOnly,
      },
    ],
    edges: [
      { sourceTempId: 'http-start', sourcePortId: 'out', targetTempId: 'transform', targetPortId: 'in' },
      { sourceTempId: 'transform', sourcePortId: 'out', targetTempId: 'http-end', targetPortId: 'in' },
    ],
  },

  // 2. Email Automation
  {
    id: 'email-automation',
    name: 'Email Automation',
    description: 'Trigger on an event, evaluate a condition, and send an email when matched',
    icon: 'mail',
    category: 'Communication',
    nodes: [
      {
        tempId: 'start',
        name: 'Start',
        type: 'START',
        positionX: 250,
        positionY: 80,
        configuration: '{}',
        ports: portsStartOnly,
      },
      {
        tempId: 'condition',
        name: 'Check Condition',
        type: 'CONDITION',
        positionX: 250,
        positionY: 230,
        configuration: JSON.stringify({
          expression: 'input.shouldNotify === true',
          language: 'javascript',
        }),
        ports: portsCondition,
      },
      {
        tempId: 'email',
        name: 'Send Email',
        type: 'EMAIL',
        positionX: 100,
        positionY: 400,
        configuration: JSON.stringify({
          to: '',
          subject: 'Notification',
          body: 'Hello, this is an automated notification.',
        }),
        ports: portsBoth,
      },
      {
        tempId: 'end',
        name: 'End',
        type: 'END',
        positionX: 250,
        positionY: 560,
        configuration: '{}',
        ports: portsEndOnly,
      },
    ],
    edges: [
      { sourceTempId: 'start', sourcePortId: 'out', targetTempId: 'condition', targetPortId: 'in' },
      { sourceTempId: 'condition', sourcePortId: 'true', targetTempId: 'email', targetPortId: 'in', label: 'true' },
      { sourceTempId: 'condition', sourcePortId: 'false', targetTempId: 'end', targetPortId: 'in', label: 'false' },
      { sourceTempId: 'email', sourcePortId: 'out', targetTempId: 'end', targetPortId: 'in' },
    ],
  },

  // 3. Data Sync Pipeline
  {
    id: 'data-sync',
    name: 'Data Sync Pipeline',
    description: 'Fetch data from an external API, transform it, and write to a database',
    icon: 'refresh-cw',
    category: 'Data',
    nodes: [
      {
        tempId: 'start',
        name: 'Start',
        type: 'START',
        positionX: 250,
        positionY: 80,
        configuration: '{}',
        ports: portsStartOnly,
      },
      {
        tempId: 'fetch',
        name: 'Fetch Data',
        type: 'HTTP',
        positionX: 250,
        positionY: 230,
        configuration: JSON.stringify({
          method: 'GET',
          url: 'https://api.example.com/data',
          headers: { 'Accept': 'application/json' },
          timeout: 30000,
        }),
        ports: portsBoth,
      },
      {
        tempId: 'transform',
        name: 'Transform',
        type: 'TRANSFORM',
        positionX: 250,
        positionY: 380,
        configuration: JSON.stringify({
          transformExpression: '$.response.body',
          language: 'jsonata',
        }),
        ports: portsBoth,
      },
      {
        tempId: 'db-write',
        name: 'Write to DB',
        type: 'DATABASE',
        positionX: 250,
        positionY: 530,
        configuration: JSON.stringify({
          operation: 'INSERT',
        }),
        ports: portsBoth,
      },
      {
        tempId: 'end',
        name: 'End',
        type: 'END',
        positionX: 250,
        positionY: 680,
        configuration: '{}',
        ports: portsEndOnly,
      },
    ],
    edges: [
      { sourceTempId: 'start', sourcePortId: 'out', targetTempId: 'fetch', targetPortId: 'in' },
      { sourceTempId: 'fetch', sourcePortId: 'out', targetTempId: 'transform', targetPortId: 'in' },
      { sourceTempId: 'transform', sourcePortId: 'out', targetTempId: 'db-write', targetPortId: 'in' },
      { sourceTempId: 'db-write', sourcePortId: 'out', targetTempId: 'end', targetPortId: 'in' },
    ],
  },

  // 4. Scheduled Task
  {
    id: 'scheduled-task',
    name: 'Scheduled Task',
    description: 'Start a workflow, run a function, and log the result with a debug node',
    icon: 'clock',
    category: 'Automation',
    nodes: [
      {
        tempId: 'start',
        name: 'Start',
        type: 'START',
        positionX: 250,
        positionY: 80,
        configuration: '{}',
        ports: portsStartOnly,
      },
      {
        tempId: 'function',
        name: 'Run Task',
        type: 'FUNCTION',
        positionX: 250,
        positionY: 230,
        configuration: JSON.stringify({
          functionId: '',
        }),
        ports: portsBoth,
      },
      {
        tempId: 'debug',
        name: 'Log Result',
        type: 'DEBUG',
        positionX: 250,
        positionY: 380,
        configuration: '{}',
        ports: portsBoth,
      },
      {
        tempId: 'end',
        name: 'End',
        type: 'END',
        positionX: 250,
        positionY: 530,
        configuration: '{}',
        ports: portsEndOnly,
      },
    ],
    edges: [
      { sourceTempId: 'start', sourcePortId: 'out', targetTempId: 'function', targetPortId: 'in' },
      { sourceTempId: 'function', sourcePortId: 'out', targetTempId: 'debug', targetPortId: 'in' },
      { sourceTempId: 'debug', sourcePortId: 'out', targetTempId: 'end', targetPortId: 'in' },
    ],
  },

  // 5. API Integration
  {
    id: 'api-integration',
    name: 'API Integration',
    description: 'Expose an HTTP endpoint that calls an external API and returns the result',
    icon: 'link',
    category: 'Integrations',
    nodes: [
      {
        tempId: 'http-start',
        name: 'API Endpoint',
        type: 'HTTP_START',
        positionX: 250,
        positionY: 80,
        configuration: JSON.stringify({
          httpPath: '/integrate',
          httpMethods: ['GET', 'POST'],
          httpAuth: 'none',
          httpCors: true,
        }),
        ports: portsStartOnly,
      },
      {
        tempId: 'http-call',
        name: 'Call External API',
        type: 'HTTP',
        positionX: 250,
        positionY: 250,
        configuration: JSON.stringify({
          method: 'GET',
          url: 'https://api.example.com/resource',
          headers: { 'Accept': 'application/json' },
          timeout: 15000,
        }),
        ports: portsBoth,
      },
      {
        tempId: 'transform',
        name: 'Format Response',
        type: 'TRANSFORM',
        positionX: 250,
        positionY: 400,
        configuration: JSON.stringify({
          transformExpression: '$.response.body',
          language: 'jsonata',
        }),
        ports: portsBoth,
      },
      {
        tempId: 'http-end',
        name: 'Return Response',
        type: 'HTTP_END',
        positionX: 250,
        positionY: 550,
        configuration: JSON.stringify({
          httpStatusCode: 200,
          httpContentType: 'application/json',
        }),
        ports: portsEndOnly,
      },
    ],
    edges: [
      { sourceTempId: 'http-start', sourcePortId: 'out', targetTempId: 'http-call', targetPortId: 'in' },
      { sourceTempId: 'http-call', sourcePortId: 'out', targetTempId: 'transform', targetPortId: 'in' },
      { sourceTempId: 'transform', sourcePortId: 'out', targetTempId: 'http-end', targetPortId: 'in' },
    ],
  },

  // 6. Report Generator
  {
    id: 'report-generator',
    name: 'Report Generator',
    description: 'Query a database, transform the results into a report, and send it via email',
    icon: 'chart-bar',
    category: 'Reporting',
    nodes: [
      {
        tempId: 'start',
        name: 'Start',
        type: 'START',
        positionX: 250,
        positionY: 80,
        configuration: '{}',
        ports: portsStartOnly,
      },
      {
        tempId: 'db-query',
        name: 'Query Data',
        type: 'DATABASE',
        positionX: 250,
        positionY: 230,
        configuration: JSON.stringify({
          operation: 'FIND_MANY',
        }),
        ports: portsBoth,
      },
      {
        tempId: 'transform',
        name: 'Build Report',
        type: 'TRANSFORM',
        positionX: 250,
        positionY: 380,
        configuration: JSON.stringify({
          transformExpression: '$',
          language: 'jsonata',
        }),
        ports: portsBoth,
      },
      {
        tempId: 'email',
        name: 'Email Report',
        type: 'EMAIL',
        positionX: 250,
        positionY: 530,
        configuration: JSON.stringify({
          to: '',
          subject: 'Automated Report',
          body: 'Please find the report attached.',
        }),
        ports: portsBoth,
      },
      {
        tempId: 'end',
        name: 'End',
        type: 'END',
        positionX: 250,
        positionY: 680,
        configuration: '{}',
        ports: portsEndOnly,
      },
    ],
    edges: [
      { sourceTempId: 'start', sourcePortId: 'out', targetTempId: 'db-query', targetPortId: 'in' },
      { sourceTempId: 'db-query', sourcePortId: 'out', targetTempId: 'transform', targetPortId: 'in' },
      { sourceTempId: 'transform', sourcePortId: 'out', targetTempId: 'email', targetPortId: 'in' },
      { sourceTempId: 'email', sourcePortId: 'out', targetTempId: 'end', targetPortId: 'in' },
    ],
  },
];
