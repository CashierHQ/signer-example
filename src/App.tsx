import "./App.css";
import { ConnectWallet, useAgent, useAuth } from "@nfid/identitykit/react";
import { IcrcXCallBatchCanister } from "./service/method/icrcx.service";

const params = [
  {
    canisterId: "x5qut-viaaa-aaaar-qajda-cai",
    method: "icrc1_transfer",
    arg: "RElETAZsBvvKAQHG/LYCBLqJ5cIEAqLelOsGAoLz85EMBdijjKgNfWwCs7DawwNorYbKgwUCbgNte259bngBAAEdXdZAg85gOc3s6DkTiv7FBn9RDHSPT6rgmlsBGgIAAAAAAICt4gQ=",
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

    const service = new IcrcXCallBatchCanister(agent);

    const response = await service.icrcxExecute([params]);

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
