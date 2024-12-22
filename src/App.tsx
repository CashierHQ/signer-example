import "./App.css";
import { ConnectWallet, useAgent, useAuth } from "@nfid/identitykit/react";
import { IcrcXCallBatchCanister } from "./service/method/icrcx.service";

const params = [
  {
    id: "1",
    canisterId: "2wdkf-viaaa-aaaam-ackqq-cai",
    method: "greet_no_consent",
    arg: "RElETAABcQJtZQ==",
  },
  {
    id: "2",
    canisterId: "2wdkf-viaaa-aaaam-ackqq-cai",
    method: "greet_no_consent",
    arg: "RElETAABcQJtZQ==",
  },
  {
    id: "3",
    canisterId: "2wdkf-viaaa-aaaam-ackqq-cai",
    method: "greet_no_consent",
    arg: "RElETAABcQJtZQ==",
  },
];

function App() {
  const { user } = useAuth();
  const agent = useAgent({
    host: "https://ic0.app",
  });

  const executeMockReq = async () => {
    if (!user) {
      console.log("User not found");
      return;
    }

    if (!agent) {
      console.log("Agent not found");
      return;
    }

    const service = new IcrcXCallBatchCanister();

    const rpcRequest = {
      origin: "https://cashier.io",
      jsonrpc: "2.0",
      id: "1",
      method: "icrcX_batch_call_canisters",
      params: {
        sender: user.principal.toText(),
        requests: params,
      },
    };

    const response = await service.onApprove(rpcRequest, agent);

    console.log("Response", response);
  };
  return (
    <>
      <div className="card">
        <ConnectWallet />
        {user && (
          <div>
            <h3>Principal: {user.principal.toText()}</h3>
            <button onClick={executeMockReq}>Execute Mock Request</button>
          </div>
        )}

        <button onClick={executeMockReq}>Execute Mock Request</button>
      </div>
    </>
  );
}

export default App;
