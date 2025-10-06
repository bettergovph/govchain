import { GeneratedType } from "@cosmjs/proto-signing";
import { MsgTransfer } from "./types/ibc/applications/transfer/v1/tx";
import { MsgUpdateParams } from "./types/ibc/applications/transfer/v1/tx";

const msgTypes: Array<[string, any]> = [
    ["/ibc.applications.transfer.v1.MsgTransfer", MsgTransfer],
    ["/ibc.applications.transfer.v1.MsgUpdateParams", MsgUpdateParams],

];

export { msgTypes }