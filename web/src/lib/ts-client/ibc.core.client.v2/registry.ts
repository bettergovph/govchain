import { GeneratedType } from "@cosmjs/proto-signing";
import { MsgRegisterCounterparty } from "./types/ibc/core/client/v2/tx";
import { MsgUpdateClientConfig } from "./types/ibc/core/client/v2/tx";

const msgTypes: Array<[string, GeneratedType]>  = [
    ["/ibc.core.client.v2.MsgRegisterCounterparty", MsgRegisterCounterparty],
    ["/ibc.core.client.v2.MsgUpdateClientConfig", MsgUpdateClientConfig],
    
];

export { msgTypes }