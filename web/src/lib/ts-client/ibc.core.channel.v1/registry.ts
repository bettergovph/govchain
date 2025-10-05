import { GeneratedType } from "@cosmjs/proto-signing";
import { MsgChannelOpenInit } from "./types/ibc/core/channel/v1/tx";
import { MsgChannelOpenTry } from "./types/ibc/core/channel/v1/tx";
import { MsgChannelOpenAck } from "./types/ibc/core/channel/v1/tx";
import { MsgChannelOpenConfirm } from "./types/ibc/core/channel/v1/tx";
import { MsgChannelCloseInit } from "./types/ibc/core/channel/v1/tx";
import { MsgChannelCloseConfirm } from "./types/ibc/core/channel/v1/tx";
import { MsgRecvPacket } from "./types/ibc/core/channel/v1/tx";
import { MsgTimeout } from "./types/ibc/core/channel/v1/tx";
import { MsgTimeoutOnClose } from "./types/ibc/core/channel/v1/tx";
import { MsgAcknowledgement } from "./types/ibc/core/channel/v1/tx";

const msgTypes: Array<[string, GeneratedType]>  = [
    ["/ibc.core.channel.v1.MsgChannelOpenInit", MsgChannelOpenInit],
    ["/ibc.core.channel.v1.MsgChannelOpenTry", MsgChannelOpenTry],
    ["/ibc.core.channel.v1.MsgChannelOpenAck", MsgChannelOpenAck],
    ["/ibc.core.channel.v1.MsgChannelOpenConfirm", MsgChannelOpenConfirm],
    ["/ibc.core.channel.v1.MsgChannelCloseInit", MsgChannelCloseInit],
    ["/ibc.core.channel.v1.MsgChannelCloseConfirm", MsgChannelCloseConfirm],
    ["/ibc.core.channel.v1.MsgRecvPacket", MsgRecvPacket],
    ["/ibc.core.channel.v1.MsgTimeout", MsgTimeout],
    ["/ibc.core.channel.v1.MsgTimeoutOnClose", MsgTimeoutOnClose],
    ["/ibc.core.channel.v1.MsgAcknowledgement", MsgAcknowledgement],
    
];

export { msgTypes }