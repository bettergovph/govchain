import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import { QueryConnectionResponse } from "./types/ibc/core/connection/v1/query";
import { QueryConnectionsResponse } from "./types/ibc/core/connection/v1/query";
import { QueryClientConnectionsResponse } from "./types/ibc/core/connection/v1/query";
import { QueryConnectionClientStateResponse } from "./types/ibc/core/connection/v1/query";
import { QueryConnectionConsensusStateResponse } from "./types/ibc/core/connection/v1/query";
import { QueryConnectionParamsResponse } from "./types/ibc/core/connection/v1/query";

import { QueryConnectionRequest } from "./types/ibc/core/connection/v1/query";
import { QueryConnectionsRequest } from "./types/ibc/core/connection/v1/query";
import { QueryClientConnectionsRequest } from "./types/ibc/core/connection/v1/query";
import { QueryConnectionClientStateRequest } from "./types/ibc/core/connection/v1/query";
import { QueryConnectionConsensusStateRequest } from "./types/ibc/core/connection/v1/query";
import { QueryConnectionParamsRequest } from "./types/ibc/core/connection/v1/query";


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
 * @title ibc.core.connection.v1
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * QueryConnection
   *
   * @tags Query
   * @name queryConnection
   * @request GET:/ibc/core/connection/v1/connections/{connection_id}
   */
  queryConnection = (connection_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryConnectionResponse>>>({
      path: `/ibc/core/connection/v1/connections/${connection_id}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryConnections
   *
   * @tags Query
   * @name queryConnections
   * @request GET:/ibc/core/connection/v1/connections
   */
  queryConnections = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryConnectionsRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryConnectionsResponse>>>({
      path: `/ibc/core/connection/v1/connections`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryClientConnections
   *
   * @tags Query
   * @name queryClientConnections
   * @request GET:/ibc/core/connection/v1/client_connections/{client_id}
   */
  queryClientConnections = (client_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryClientConnectionsResponse>>>({
      path: `/ibc/core/connection/v1/client_connections/${client_id}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryConnectionClientState
   *
   * @tags Query
   * @name queryConnectionClientState
   * @request GET:/ibc/core/connection/v1/connections/{connection_id}/client_state
   */
  queryConnectionClientState = (connection_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryConnectionClientStateResponse>>>({
      path: `/ibc/core/connection/v1/connections/${connection_id}/client_state`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryConnectionConsensusState
   *
   * @tags Query
   * @name queryConnectionConsensusState
   * @request GET:/ibc/core/connection/v1/connections/{connection_id}/consensus_state/revision/{revision_number}/height/{revision_height}
   */
  queryConnectionConsensusState = (connection_id: string, revision_number: string, revision_height: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryConnectionConsensusStateResponse>>>({
      path: `/ibc/core/connection/v1/connections/${connection_id}/consensus_state/revision/${revision_number}/height/${revision_height}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryConnectionParams
   *
   * @tags Query
   * @name queryConnectionParams
   * @request GET:/ibc/core/connection/v1/params
   */
  queryConnectionParams = (
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryConnectionParamsResponse>>>({
      path: `/ibc/core/connection/v1/params`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
}