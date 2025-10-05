import { GeneratedType } from "@cosmjs/proto-signing";
import { MsgUpdateParams } from "./types/govchain/datasets/v1/tx";
import { MsgCreateEntry } from "./types/govchain/datasets/v1/tx";
import { MsgUpdateEntry } from "./types/govchain/datasets/v1/tx";
import { MsgDeleteEntry } from "./types/govchain/datasets/v1/tx";

const msgTypes: Array<[string, GeneratedType]>  = [
    ["/govchain.datasets.v1.MsgUpdateParams", MsgUpdateParams],
    ["/govchain.datasets.v1.MsgCreateEntry", MsgCreateEntry],
    ["/govchain.datasets.v1.MsgUpdateEntry", MsgUpdateEntry],
    ["/govchain.datasets.v1.MsgDeleteEntry", MsgDeleteEntry],
    
];

export { msgTypes }