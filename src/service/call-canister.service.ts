/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Agent,
  bufFromBufLike,
  Cbor,
  Certificate,
  v3ResponseBody,
  blsVerify,
  lookupResultToBuffer,
  UpdateCallRejectedError,
  pollForResponse,
  v2ResponseBody,
} from "@dfinity/agent";
import { AgentError } from "@dfinity/agent/lib/cjs/errors";
import { Principal } from "@dfinity/principal";
import { fromBase64 } from "@nfid/identitykit";
import { CallCanisterRequest, CallCanisterResponse } from "./type";

export const toBase64 = (bytes: ArrayBuffer): string => {
  if (typeof globalThis.Buffer !== "undefined") {
    return globalThis.Buffer.from(bytes).toString("base64");
  }
  if (typeof globalThis.btoa !== "undefined") {
    return btoa(String.fromCharCode(...new Uint8Array(bytes)));
  }
  throw Error("Could not encode base64 string");
};

export class CallCanisterService {
  public async call(
    request: CallCanisterRequest
  ): Promise<CallCanisterResponse> {
    try {
      const response = await this.poll(
        request.canisterId,
        request.calledMethodName,
        request.agent,
        fromBase64(request.parameters)
      );
      const certificate: string = toBase64(response.certificate);
      const contentMap: string = toBase64(response.contentMap!);

      return {
        certificate,
        contentMap,
      };
    } catch (error) {
      console.error("The canister call cannot be executed:", error);

      if (error instanceof Error) {
        throw new Error(error.message);
      }

      throw new Error("The canister call cannot be executed");
    }
  }

  private async poll(
    canisterId: string,
    methodName: string,
    agent: Agent,
    arg: ArrayBuffer
  ): Promise<{ certificate: Uint8Array; contentMap: ArrayBuffer | undefined }> {
    const cid = Principal.from(canisterId);

    if (agent.rootKey == null)
      throw new AgentError("Agent root key not initialized before making call");

    const { requestId, response } = await agent.call(cid, {
      methodName,
      arg,
      effectiveCanisterId: cid,
    });

    console.log("response", response);

    let certificate: Certificate | undefined;

    if (response.body && (response.body as v3ResponseBody).certificate) {
      const cert = (response.body as v3ResponseBody).certificate;
      certificate = await Certificate.create({
        certificate: bufFromBufLike(cert),
        rootKey: agent.rootKey,
        canisterId: Principal.from(canisterId),
        blsVerify,
      });
      const path = [new TextEncoder().encode("request_status"), requestId];
      const status = new TextDecoder().decode(
        lookupResultToBuffer(
          certificate.lookup([...(path as unknown as any), "status"])
        )
      );

      switch (status) {
        case "replied":
          break;
        case "rejected": {
          // Find rejection details in the certificate
          const rejectCode = new Uint8Array(
            lookupResultToBuffer(
              certificate.lookup([...(path as unknown as any), "reject_code"])
            )!
          )[0];
          const rejectMessage = new TextDecoder().decode(
            lookupResultToBuffer(
              certificate.lookup([
                ...(path as unknown as any),
                "reject_message",
              ])
            )!
          );
          const error_code_buf = lookupResultToBuffer(
            certificate.lookup([...(path as unknown as any), "error_code"])
          );
          const error_code = error_code_buf
            ? new TextDecoder().decode(error_code_buf)
            : undefined;
          throw new UpdateCallRejectedError(
            cid,
            methodName,
            requestId,
            response,
            rejectCode,
            rejectMessage,
            error_code
          );
        }
      }
    } else if (response.body && "reject_message" in response.body) {
      // handle v2 response errors by throwing an UpdateCallRejectedError object
      const { reject_code, reject_message, error_code } =
        response.body as v2ResponseBody;
      throw new UpdateCallRejectedError(
        cid,
        methodName,
        requestId,
        response,
        reject_code,
        reject_message,
        error_code
      );
    }

    // Fall back to polling if we receive an Accepted response code
    // Contains the certificate and the reply from the boundary node
    const poolResponse = await pollForResponse(agent, cid, requestId);
    console.log("poolResponse", poolResponse);
    certificate = poolResponse.certificate;
    const reply = poolResponse.reply;

    return {
      contentMap: reply,
      certificate: new Uint8Array(Cbor.encode((certificate as any).cert)),
    };
  }
}

export const callCanisterService = new CallCanisterService();
