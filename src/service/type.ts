import { Agent } from "@dfinity/agent";

export interface RPCBase {
  origin: string;
  jsonrpc: string;
  id: string;
}
export interface RPCMessage extends RPCBase {
  method: string;
  params: unknown;
}

export interface RPCSuccessResponse extends RPCBase {
  result: unknown;
}

export interface RPCErrorResponse extends RPCBase {
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface CallCanisterRequest {
  canisterId: string;
  calledMethodName: string;
  parameters: string;
  agent: Agent;
}

export interface CallCanisterResponse {
  contentMap: string;
  certificate: string;
}

export interface CallCanisterRequest {
  canisterId: string;
  calledMethodName: string;
  parameters: string;
  agent: Agent;
}

export interface CallCanisterResponse {
  contentMap: string;
  certificate: string;
}
