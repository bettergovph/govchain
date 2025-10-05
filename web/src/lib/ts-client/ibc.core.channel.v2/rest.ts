import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import { QueryNextSequenceSendResponse } from "./types/ibc/core/channel/v2/query";
import { QueryPacketCommitmentResponse } from "./types/ibc/core/channel/v2/query";
import { QueryPacketCommitmentsResponse } from "./types/ibc/core/channel/v2/query";
import { QueryPacketAcknowledgementResponse } from "./types/ibc/core/channel/v2/query";
import { QueryPacketAcknowledgementsResponse } from "./types/ibc/core/channel/v2/query";
import { QueryPacketReceiptResponse } from "./types/ibc/core/channel/v2/query";
import { QueryUnreceivedPacketsResponse } from "./types/ibc/core/channel/v2/query";
import { QueryUnreceivedAcksResponse } from "./types/ibc/core/channel/v2/query";

import { QueryNextSequenceSendRequest } from "./types/ibc/core/channel/v2/query";
import { QueryPacketCommitmentRequest } from "./types/ibc/core/channel/v2/query";
import { QueryPacketCommitmentsRequest } from "./types/ibc/core/channel/v2/query";
import { QueryPacketAcknowledgementRequest } from "./types/ibc/core/channel/v2/query";
import { QueryPacketAcknowledgementsRequest } from "./types/ibc/core/channel/v2/query";
import { QueryPacketReceiptRequest } from "./types/ibc/core/channel/v2/query";
import { QueryUnreceivedPacketsRequest } from "./types/ibc/core/channel/v2/query";
import { QueryUnreceivedAcksRequest } from "./types/ibc/core/channel/v2/query";


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
 * @title ibc.core.channel.v2
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * QueryNextSequenceSend
   *
   * @tags Query
   * @name queryNextSequenceSend
   * @request GET:/ibc/core/channel/v2/clients/{client_id}/next_sequence_send
   */
  queryNextSequenceSend = (client_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryNextSequenceSendResponse>>>({
      path: `/ibc/core/channel/v2/clients/${client_id}/next_sequence_send`,
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
   * @request GET:/ibc/core/channel/v2/clients/{client_id}/packet_commitments/{sequence}
   */
  queryPacketCommitment = (client_id: string, sequence: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketCommitmentResponse>>>({
      path: `/ibc/core/channel/v2/clients/${client_id}/packet_commitments/${sequence}`,
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
   * @request GET:/ibc/core/channel/v2/clients/{client_id}/packet_commitments
   */
  queryPacketCommitments = (client_id: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketCommitmentsRequest>>>,"client_id">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketCommitmentsResponse>>>({
      path: `/ibc/core/channel/v2/clients/${client_id}/packet_commitments`,
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
   * @request GET:/ibc/core/channel/v2/clients/{client_id}/packet_acks/{sequence}
   */
  queryPacketAcknowledgement = (client_id: string, sequence: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketAcknowledgementResponse>>>({
      path: `/ibc/core/channel/v2/clients/${client_id}/packet_acks/${sequence}`,
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
   * @request GET:/ibc/core/channel/v2/clients/{client_id}/packet_acknowledgements
   */
  queryPacketAcknowledgements = (client_id: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketAcknowledgementsRequest>>>,"client_id">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketAcknowledgementsResponse>>>({
      path: `/ibc/core/channel/v2/clients/${client_id}/packet_acknowledgements`,
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
   * @request GET:/ibc/core/channel/v2/clients/{client_id}/packet_receipts/{sequence}
   */
  queryPacketReceipt = (client_id: string, sequence: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPacketReceiptResponse>>>({
      path: `/ibc/core/channel/v2/clients/${client_id}/packet_receipts/${sequence}`,
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
   * @request GET:/ibc/core/channel/v2/clients/{client_id}/packet_commitments/{sequences}/unreceived_packets
   */
  queryUnreceivedPackets = (client_id: string, sequences: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryUnreceivedPacketsResponse>>>({
      path: `/ibc/core/channel/v2/clients/${client_id}/packet_commitments/${sequences}/unreceived_packets`,
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
   * @request GET:/ibc/core/channel/v2/clients/{client_id}/packet_commitments/{packet_ack_sequences}/unreceived_acks
   */
  queryUnreceivedAcks = (client_id: string, packet_ack_sequences: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryUnreceivedAcksResponse>>>({
      path: `/ibc/core/channel/v2/clients/${client_id}/packet_commitments/${packet_ack_sequences}/unreceived_acks`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
}