import { GeneratedType } from "@cosmjs/proto-signing";
import { MsgConnectionOpenInit } from "./types/ibc/core/connection/v1/tx";
import { MsgConnectionOpenTry } from "./types/ibc/core/connection/v1/tx";
import { MsgConnectionOpenAck } from "./types/ibc/core/connection/v1/tx";
import { MsgConnectionOpenConfirm } from "./types/ibc/core/connection/v1/tx";
import { MsgUpdateParams } from "./types/ibc/core/connection/v1/tx";

const msgTypes: Array<[string, GeneratedType]>  = [
    ["/ibc.core.connection.v1.MsgConnectionOpenInit", MsgConnectionOpenInit],
    ["/ibc.core.connection.v1.MsgConnectionOpenTry", MsgConnectionOpenTry],
    ["/ibc.core.connection.v1.MsgConnectionOpenAck", MsgConnectionOpenAck],
    ["/ibc.core.connection.v1.MsgConnectionOpenConfirm", MsgConnectionOpenConfirm],
    ["/ibc.core.connection.v1.MsgUpdateParams", MsgUpdateParams],
    
];

export { msgTypes }