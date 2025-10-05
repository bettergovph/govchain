import { GeneratedType } from "@cosmjs/proto-signing";
import { MsgSend } from "./types/cosmos/bank/v1beta1/tx";
import { MsgMultiSend } from "./types/cosmos/bank/v1beta1/tx";
import { MsgUpdateParams } from "./types/cosmos/bank/v1beta1/tx";
import { MsgSetSendEnabled } from "./types/cosmos/bank/v1beta1/tx";

const msgTypes: Array<[string, GeneratedType]>  = [
    ["/cosmos.bank.v1beta1.MsgSend", MsgSend],
    ["/cosmos.bank.v1beta1.MsgMultiSend", MsgMultiSend],
    ["/cosmos.bank.v1beta1.MsgUpdateParams", MsgUpdateParams],
    ["/cosmos.bank.v1beta1.MsgSetSendEnabled", MsgSetSendEnabled],
    
];

export { msgTypes }