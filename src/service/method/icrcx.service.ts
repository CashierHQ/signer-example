import { Agent } from "@dfinity/agent";
import { RPCMessage } from "../type";
import {
  CallCanisterResponse,
  callCanisterService,
} from "../call-canister.service";

export interface CallCanisterComponentData {
  origin: string;
  methodName: string;
  canisterId: string;
  sender: string;
  args: string;
}

export interface IcrcXRequest {
  id: string;
  canisterId: string;
  method: string;
  arg: string;
  waitFor?: string[];
  validate?: {
    canisterId: string;
    method: string;
  };
}

export interface IcrcXDto {
  sender: string;
  requests: IcrcXRequest[];
}
export interface SuccessResponse {
  id: string;
  result: CallCanisterResponse;
}

export interface ErrorResponse {
  id: string;
  error: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export type IcrcXResponseItem = SuccessResponse | ErrorResponse;

export interface IcrcXResponse {
  responses: IcrcXResponseItem[];
}

export class IcrcXCallBatchCanister {
  public getMethod(): string {
    return "icrcX_batch_call_canisters";
  }

  /**
   *
   * This method only use for delegation
   * account delegation is not implemented yet
   */
  public async onApprove(
    message: RPCMessage,
    agent: Agent
  ): Promise<IcrcXResponse> {
    console.log("onApprove", message);
    const icrcxDto = message.params as unknown as IcrcXDto;

    console.log("icrcxDto", icrcxDto);

    const responses: Map<
      string,
      | { result: CallCanisterResponse }
      | {
          error: {
            code: number;
            message: string;
            data?: unknown;
          };
        }
    > = new Map();

    // create a new array to store requests
    const requests = [...icrcxDto.requests];

    // this flag use for stop execute left requests when have error
    let isError = false;

    // run until response size equal requests size
    while (responses.size < icrcxDto.requests.length) {
      console.log("requests", requests);
      // store task
      const pTasks = [];
      // store id of request map with index of pTasks
      const idsTask = [];

      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        if (isError) {
          responses.set(request.id, {
            error: {
              code: 1001,
              message: "Not processed due to batch request failure",
            },
          });
          continue;
        }

        const isHaveResponse = !!responses.get(request.id);

        if (!isHaveResponse) {
          const task = callCanisterService.call({
            canisterId: request.canisterId,
            calledMethodName: request.method,
            parameters: request.arg,
            agent,
          });
          pTasks.push(task);
          idsTask.push(request.id);
        }
      }
      const results = await Promise.allSettled(pTasks);

      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === "fulfilled") {
          const responseItem = result.value;

          responses.set(idsTask[i], {
            result: responseItem,
          });
        }

        if (result.status === "rejected") {
          const error = result.reason;
          responses.set(idsTask[i], {
            error: {
              code: 1000,
              message: error.message,
            },
          });
          isError = true;
        }
      }
      sleep(60 * 1000);
    }

    const response: IcrcXResponse = {
      responses: Array.from(responses).map(([id, response]) => {
        if ("result" in response) {
          return {
            id,
            result: response.result,
          };
        }

        return {
          id,
          error: response.error,
        };
      }),
    };

    return response;
  }
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
