This repository is build for client call to target canister with [ICRCX batch call canisters](https://github.com/dfinity/wg-identity-authentication/pull/220)

Implementation

- Delegation
  - ✅ [Batch call parallel](src/service/method/icrcx.service.ts)
  - ❌ Sequence call with `waitFor`
  - ❌ Validate response canister
- Account Delegation
  - ❌ Batch call parallel
  - ❌ Sequence call with `waitFor`
  - ❌ Validate response canister
