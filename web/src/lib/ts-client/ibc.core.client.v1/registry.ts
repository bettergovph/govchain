import { GeneratedType } from "@cosmjs/proto-signing";
import { MsgCreateClient } from "./types/ibc/core/client/v1/tx";
import { MsgUpdateClient } from "./types/ibc/core/client/v1/tx";
import { MsgUpgradeClient } from "./types/ibc/core/client/v1/tx";
import { MsgSubmitMisbehaviour } from "./types/ibc/core/client/v1/tx";
import { MsgRecoverClient } from "./types/ibc/core/client/v1/tx";
import { MsgIBCSoftwareUpgrade } from "./types/ibc/core/client/v1/tx";
import { MsgUpdateParams } from "./types/ibc/core/client/v1/tx";
import { MsgDeleteClientCreator } from "./types/ibc/core/client/v1/tx";

const msgTypes: Array<[string, GeneratedType]>  = [
    ["/ibc.core.client.v1.MsgCreateClient", MsgCreateClient],
    ["/ibc.core.client.v1.MsgUpdateClient", MsgUpdateClient],
    ["/ibc.core.client.v1.MsgUpgradeClient", MsgUpgradeClient],
    ["/ibc.core.client.v1.MsgSubmitMisbehaviour", MsgSubmitMisbehaviour],
    ["/ibc.core.client.v1.MsgRecoverClient", MsgRecoverClient],
    ["/ibc.core.client.v1.MsgIBCSoftwareUpgrade", MsgIBCSoftwareUpgrade],
    ["/ibc.core.client.v1.MsgUpdateParams", MsgUpdateParams],
    ["/ibc.core.client.v1.MsgDeleteClientCreator", MsgDeleteClientCreator],
    
];

export { msgTypes }