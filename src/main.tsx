import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

import "@nfid/identitykit/react/styles.css";

import { IdentityKitProvider } from "@nfid/identitykit/react";
import { IdentityKitAuthType } from "@nfid/identitykit";

import "isomorphic-fetch";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <IdentityKitProvider
      authType={IdentityKitAuthType.DELEGATION}
      signerClientOptions={{
        targets: ["2wdkf-viaaa-aaaam-ackqq-cai"],
      }}
    >
      <App />
    </IdentityKitProvider>
  </StrictMode>
);
