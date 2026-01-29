/**
 * Function Editor State Store
 *
 * Manages the state for the function editor including:
 * - Current function being edited
 * - Payload for invocation
 * - Output/result from invocation
 * - Action statuses (build, deploy, invoke)
 * - Auto-deploy setting
 */

import { atom } from 'nanostores';

export type ActionStatus = 'idle' | 'running' | 'success' | 'error';

export interface FunctionEditorState {
  functionId: string | null;
  functionName: string;
  payload: any;
  payloadString: string;
  lastResult: string;
  buildStatus: ActionStatus;
  deployStatus: ActionStatus;
  invokeStatus: ActionStatus;
  autoDeploy: boolean;
  lastError: string | null;
}

const defaultState: FunctionEditorState = {
  functionId: null,
  functionName: '',
  payload: { data: "Hello World" },
  payloadString: '{\n  "data": "Hello World"\n}',
  lastResult: '',
  buildStatus: 'idle',
  deployStatus: 'idle',
  invokeStatus: 'idle',
  autoDeploy: true,
  lastError: null,
};

export const $functionEditorState = atom<FunctionEditorState>({ ...defaultState });

// Actions
export function setCurrentFunction(functionId: string | null, functionName: string = '') {
  const current = $functionEditorState.get();
  $functionEditorState.set({
    ...current,
    functionId,
    functionName,
    lastResult: '',
    lastError: null,
  });
}

export function setPayload(payload: any, payloadString: string) {
  const current = $functionEditorState.get();
  $functionEditorState.set({
    ...current,
    payload,
    payloadString,
  });
}

export function setPayloadString(payloadString: string) {
  const current = $functionEditorState.get();
  try {
    const payload = JSON.parse(payloadString);
    $functionEditorState.set({
      ...current,
      payload,
      payloadString,
    });
  } catch {
    // Invalid JSON, just update the string
    $functionEditorState.set({
      ...current,
      payloadString,
    });
  }
}

export function setLastResult(result: string) {
  const current = $functionEditorState.get();
  $functionEditorState.set({
    ...current,
    lastResult: result,
  });
}

export function setBuildStatus(status: ActionStatus) {
  const current = $functionEditorState.get();
  $functionEditorState.set({
    ...current,
    buildStatus: status,
  });
}

export function setDeployStatus(status: ActionStatus) {
  const current = $functionEditorState.get();
  $functionEditorState.set({
    ...current,
    deployStatus: status,
  });
}

export function setInvokeStatus(status: ActionStatus) {
  const current = $functionEditorState.get();
  $functionEditorState.set({
    ...current,
    invokeStatus: status,
  });
}

export function setAutoDeploy(autoDeploy: boolean) {
  const current = $functionEditorState.get();
  $functionEditorState.set({
    ...current,
    autoDeploy,
  });
}

export function setLastError(error: string | null) {
  const current = $functionEditorState.get();
  $functionEditorState.set({
    ...current,
    lastError: error,
  });
}

export function resetFunctionEditorState() {
  $functionEditorState.set({ ...defaultState });
}
