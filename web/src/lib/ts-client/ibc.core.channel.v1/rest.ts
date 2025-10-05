import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import { QueryChannelResponse } from "./types/ibc/core/channel/v1/query";
import { QueryChannelsResponse } from "./types/ibc/core/channel/v1/query";
import { QueryConnectionChannelsResponse } from "./types/ibc/core/channel/v1/query";
import { QueryChannelClientStateResponse } from "./types/ibc/core/channel/v1/query";
import { QueryChannelConsensusStateResponse } from "./types/ibc/core/channel/v1/query";
import { QueryPacketCommitmentResponse } from "./types/ibc/core/channel/v1/query";
import { QueryPacketCommitmentsResponse } from "./types/ibc/core/channel/v1/query";
import { QueryPacketReceiptResponse } from "./types/ibc/core/channel/v1/query";
import { QueryPacketAcknowledgementResponse } from "./types/ibc/core/channel/v1/query";
import { QueryPacketAcknowledgementsResponse } from "./types/ibc/core/channel/v1/query";
import { QueryUnreceivedPacketsResponse } from "./types/ibc/core/channel/v1/query";
import { QueryUnreceivedAcksResponse } from "./types/ibc/core/channel/v1/query";
import { QueryNextSequenceReceiveResponse } from "./types/ibc/core/channel/v1/query";
import { QueryNextSequenceSendResponse } from "./types/ibc/core/channel/v1/query";

import { QueryChannelRequest } from "./types/ibc/core/channel/v1/query";
import { QueryChannelsRequest } from "./types/ibc/core/channel/v1/query";
import { QueryConnectionChannelsRequest } from "./types/ibc/core/channel/v1/query";
import { QueryChannelClientStateRequest } from "./types/ibc/core/channel/v1/query";
import { QueryChannelConsensusStateRequest } from "./types/ibc/core/channel/v1/query";
import { QueryPacketCommitmentRequest } from "./types/ibc/core/channel/v1/query";
import { QueryPacketCommitmentsRequest } from "./types/ibc/core/channel/v1/query";
import { QueryPacketReceiptRequest } from "./types/ibc/core/channel/v1/query";
import { QueryPacketAcknowledgementRequest } from "./types/ibc/core/channel/v1/query";
import { QueryPacketAcknowledgementsRequest } from "./types/ibc/core/channel/v1/query";
import { QueryUnreceivedPacketsRequest } from "./types/ibc/core/channel/v1/query";
import { QueryUnreceivedAcksRequest } from "./types/ibc/core/channel/v1/query";
import { QueryNextSequenceReceiveRequest } from "./types/ibc/core/channel/v1/query";
import { QueryNextSequenceSendRequest } from "./types/ibc/core/channel/v1/query";


import type {SnakeCasedPropertiesDeep} from 'type-fest';

export type QueryParamsType = Record<string | number, any>;

export type FlattenObject<TValue> = CollapseEntries<CreateObjectEntries<TValue, TValue>>;

type Entry = { key: string; value: unknown };
type EmptyEntry<TValue> = { key: ''; value: TValue };
type ExcludedTypes = Date | Set<unknown> | Map<unknown, unknown>;
type ArrayEncoder = `[${bigint}]`;

type EscapeArrayKey<TKey extends string> = TKey extends `${infer TKeyBefore}.${ArrayEncoder}${infer TKeyAfter}`
  ? EscapeArrayKey<`${TKeyBefore}${ArrayEncoder}${TKeyAfter}`>
  : TKey;

// Transforms entries to one flattened type
type CollapseEntries<TEntry extends Entry> = {
  [E in TEntry as EscapeArrayKey<E['key']>]: E['value'];
};

// Transforms array type to object
type CreateArrayEntry<TValue, TValueInitial> = OmitItself<
  TValue extends unknown[] ? { [k: ArrayEncoder]: TValue[number] } : TValue,
  TValueInitial
>;

// Omit the type that references itself
type OmitItself<TValue, TValueInitial> = TValue extends TValueInitial
  ? EmptyEntry<TValue>
  : OmitExcludedTypes<TValue, TValueInitial>;

// Omit the type that is listed in ExcludedTypes union
type OmitExcludedTypes<TValue, TValueInitial> = TValue extends ExcludedTypes
  ? EmptyEntry<TValue>
  : CreateObjectEntries<TValue, TValueInitial>;

type CreateObjectEntries<TValue, TValueInitial> = TValue extends object
  ? {
      // Checks that Key is of type string
      [TKey in keyof TValue]-?: TKey extends string
        ? // Nested key can be an object, run recursively to the bottom
          CreateArrayEntry<TValue[TKey], TValueInitial> extends infer TNestedValue
          ? TNestedValue extends Entry
            ? TNestedValue['key'] extends ''
              ? {
                  key: TKey;
                  value: TNestedValue['value'];
                }
              :
                  | {
                      key: `${TKey}.${TNestedValue['key']}`;
                      value: TNestedValue['value'];
                    }
                  | {
                      key: TKey;
                      value: TValue[TKey];
                    }
            : never
          : never
        : never;
    }[keyof TValue] // Builds entry for each key
  : EmptyEntry<TValue>;

export type ChangeProtoToJSPrimitives<T extends object> = {
  [key in keyof T]: T[key] extends Uint8Array | Date ? string :  T[key] extends object ? ChangeProtoToJSPrimitives<T[key]>: T[key];
  // ^^^^ This line is used to convert Uint8Array to string, if you want to keep Uint8Array as is, you can remove this line
}

export interface FullRequestParams extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<FullRequestParams, "body" | "method" | "query" | "path">;

export interface ApiConfig<SecurityDataType = unknown> extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({ securityWorker, secure, format, ...axiosConfig }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({ ...axiosConfig, baseURL: axiosConfig.baseURL || "" });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  private mergeRequestParams(params1: AxiosRequestConfig, params2?: AxiosRequestConfig): AxiosRequestConfig {
    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.instance.defaults.headers ),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    } as AxiosRequestConfig;
  }

  private createFormData(input: Record<string, unknown>): FormData {
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      formData.append(
        key,
        property instanceof Blob
          ? property
          : typeof property === "object" && property !== null
          ? JSON.stringify(property)
          : `${property}`,
      );
      return formData;
    }, new FormData());
  }

  public request = async <T = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = (format && this.format) || void 0;

    if (type === ContentType.FormData && body && body !== null && typeof body === "object") {
      requestParams.headers.common = { Accept: "*/*" };
      requestParams.headers.post = {};
      requestParams.headers.put = {};

      body = this.createFormData(body as Record<string, unknown>);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(type && type !== ContentType.FormData ? { "Content-Type": type } : {}),
        ...(requestParams.headers || {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title ibc.core.channel.v1
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * QueryChannel
   *
   * @tags Query
   * @name queryChannel
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}
   */
  queryChannel = (channel_id: string, port_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryChannelResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryChannels
   *
   * @tags Query
   * @name queryChannels
   * @request GET:/ibc/core/channel/v1/channels
   */
  queryChannels = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryChannelsRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryChannelsResponse>>>({
      path: `/ibc/core/channel/v1/channels`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryConnectionChannels
   *
   * @tags Query
   * @name queryConnectionChannels
   * @request GET:/ibc/core/channel/v1/connections/{connection}/channels
   */
  queryConnectionChannels = (connection: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryConnectionChannelsRequest>>>,"connection">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryConnectionChannelsResponse>>>({
      path: `/ibc/core/channel/v1/connections/${connection}/channels`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryChannelClientState
   *
   * @tags Query
   * @name queryChannelClientState
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/client_state
   */
  queryChannelClientState = (channel_id: string, port_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryChannelClientStateResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/client_state`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryChannelConsensusState
   *
   * @tags Query
   * @name queryChannelConsensusState
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/consensus_state/revision/{revision_number}/height/{revision_height}
   */
  queryChannelConsensusState = (channel_id: string, port_id: string, revision_number: string, revision_height: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryChannelConsensusStateResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/consensus_state/revision/${revision_number}/height/${revision_height}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryPacketCommitment
   *
   * @tags Query
   * @name queryPacketCommitment
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/packet_commitments/{sequence}
   */
  queryPacketCommitment = (channel_id: string, port_id: string, sequence: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketCommitmentResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/packet_commitments/${sequence}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryPacketCommitments
   *
   * @tags Query
   * @name queryPacketCommitments
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/packet_commitments
   */
  queryPacketCommitments = (channel_id: string, port_id: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketCommitmentsRequest>>>,"channel_id" | "port_id">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketCommitmentsResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/packet_commitments`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryPacketReceipt
   *
   * @tags Query
   * @name queryPacketReceipt
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/packet_receipts/{sequence}
   */
  queryPacketReceipt = (channel_id: string, port_id: string, sequence: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketReceiptResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/packet_receipts/${sequence}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryPacketAcknowledgement
   *
   * @tags Query
   * @name queryPacketAcknowledgement
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/packet_acks/{sequence}
   */
  queryPacketAcknowledgement = (channel_id: string, port_id: string, sequence: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketAcknowledgementResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/packet_acks/${sequence}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryPacketAcknowledgements
   *
   * @tags Query
   * @name queryPacketAcknowledgements
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/packet_acknowledgements
   */
  queryPacketAcknowledgements = (channel_id: string, port_id: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketAcknowledgementsRequest>>>,"channel_id" | "port_id">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketAcknowledgementsResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/packet_acknowledgements`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryUnreceivedPackets
   *
   * @tags Query
   * @name queryUnreceivedPackets
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/packet_commitments/{packet_commitment_sequences}/unreceived_packets
   */
  queryUnreceivedPackets = (channel_id: string, port_id: string, packet_commitment_sequences: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryUnreceivedPacketsResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/packet_commitments/${packet_commitment_sequences}/unreceived_packets`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryUnreceivedAcks
   *
   * @tags Query
   * @name queryUnreceivedAcks
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/packet_commitments/{packet_ack_sequences}/unreceived_acks
   */
  queryUnreceivedAcks = (channel_id: string, port_id: string, packet_ack_sequences: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryUnreceivedAcksResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/packet_commitments/${packet_ack_sequences}/unreceived_acks`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryNextSequenceReceive
   *
   * @tags Query
   * @name queryNextSequenceReceive
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/next_sequence
   */
  queryNextSequenceReceive = (channel_id: string, port_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryNextSequenceReceiveResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/next_sequence`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryNextSequenceSend
   *
   * @tags Query
   * @name queryNextSequenceSend
   * @request GET:/ibc/core/channel/v1/channels/{channel_id}/ports/{port_id}/next_sequence_send
   */
  queryNextSequenceSend = (channel_id: string, port_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryNextSequenceSendResponse>>>({
      path: `/ibc/core/channel/v1/channels/${channel_id}/ports/${port_id}/next_sequence_send`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
}