import { IDL } from "@dfinity/candid";

export class ParserService {
  // IDL functions can have multiple return values, so decoding always
  // produces an array. Ensure that functions with single or zero return
  // values behave as expected.
  public decodeReturnValue(types: IDL.Type[], msg: ArrayBuffer) {
    const returnValues = IDL.decode(types, Buffer.from(msg));
    switch (returnValues.length) {
      case 0:
        return undefined;
      case 1:
        return returnValues[0];
      default:
        return returnValues;
    }
  }
}
