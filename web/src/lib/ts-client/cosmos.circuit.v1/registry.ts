import { GeneratedType } from "@cosmjs/proto-signing";
import { MsgAuthorizeCircuitBreaker } from "./types/cosmos/circuit/v1/tx";
import { MsgTripCircuitBreaker } from "./types/cosmos/circuit/v1/tx";
import { MsgResetCircuitBreaker } from "./types/cosmos/circuit/v1/tx";

const msgTypes: Array<[string, GeneratedType]>  = [
    ["/cosmos.circuit.v1.MsgAuthorizeCircuitBreaker", MsgAuthorizeCircuitBreaker],
    ["/cosmos.circuit.v1.MsgTripCircuitBreaker", MsgTripCircuitBreaker],
    ["/cosmos.circuit.v1.MsgResetCircuitBreaker", MsgResetCircuitBreaker],
    
];

export { msgTypes }