import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import { QueryBalanceResponse } from "./types/cosmos/bank/v1beta1/query";
import { QueryAllBalancesResponse } from "./types/cosmos/bank/v1beta1/query";
import { QuerySpendableBalancesResponse } from "./types/cosmos/bank/v1beta1/query";
import { QuerySpendableBalanceByDenomResponse } from "./types/cosmos/bank/v1beta1/query";
import { QueryTotalSupplyResponse } from "./types/cosmos/bank/v1beta1/query";
import { QuerySupplyOfResponse } from "./types/cosmos/bank/v1beta1/query";
import { QueryParamsResponse } from "./types/cosmos/bank/v1beta1/query";
import { QueryDenomsMetadataResponse } from "./types/cosmos/bank/v1beta1/query";
import { QueryDenomMetadataResponse } from "./types/cosmos/bank/v1beta1/query";
import { QueryDenomMetadataByQueryStringResponse } from "./types/cosmos/bank/v1beta1/query";
import { QueryDenomOwnersResponse } from "./types/cosmos/bank/v1beta1/query";
import { QueryDenomOwnersByQueryResponse } from "./types/cosmos/bank/v1beta1/query";
import { QuerySendEnabledResponse } from "./types/cosmos/bank/v1beta1/query";

import { QueryBalanceRequest } from "./types/cosmos/bank/v1beta1/query";
import { QueryAllBalancesRequest } from "./types/cosmos/bank/v1beta1/query";
import { QuerySpendableBalancesRequest } from "./types/cosmos/bank/v1beta1/query";
import { QuerySpendableBalanceByDenomRequest } from "./types/cosmos/bank/v1beta1/query";
import { QueryTotalSupplyRequest } from "./types/cosmos/bank/v1beta1/query";
import { QuerySupplyOfRequest } from "./types/cosmos/bank/v1beta1/query";
import { QueryParamsRequest } from "./types/cosmos/bank/v1beta1/query";
import { QueryDenomsMetadataRequest } from "./types/cosmos/bank/v1beta1/query";
import { QueryDenomMetadataRequest } from "./types/cosmos/bank/v1beta1/query";
import { QueryDenomMetadataByQueryStringRequest } from "./types/cosmos/bank/v1beta1/query";
import { QueryDenomOwnersRequest } from "./types/cosmos/bank/v1beta1/query";
import { QueryDenomOwnersByQueryRequest } from "./types/cosmos/bank/v1beta1/query";
import { QuerySendEnabledRequest } from "./types/cosmos/bank/v1beta1/query";


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
 * @title cosmos.bank.v1beta1
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * QueryBalance
   *
   * @tags Query
   * @name queryBalance
   * @request GET:/cosmos/bank/v1beta1/balances/{address}/by_denom
   */
  queryBalance = (address: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryBalanceRequest>>>,"address">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryBalanceResponse>>>({
      path: `/cosmos/bank/v1beta1/balances/${address}/by_denom`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryAllBalances
   *
   * @tags Query
   * @name queryAllBalances
   * @request GET:/cosmos/bank/v1beta1/balances/{address}
   */
  queryAllBalances = (address: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryAllBalancesRequest>>>,"address">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryAllBalancesResponse>>>({
      path: `/cosmos/bank/v1beta1/balances/${address}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QuerySpendableBalances
   *
   * @tags Query
   * @name querySpendableBalances
   * @request GET:/cosmos/bank/v1beta1/spendable_balances/{address}
   */
  querySpendableBalances = (address: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QuerySpendableBalancesRequest>>>,"address">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QuerySpendableBalancesResponse>>>({
      path: `/cosmos/bank/v1beta1/spendable_balances/${address}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QuerySpendableBalanceByDenom
   *
   * @tags Query
   * @name querySpendableBalanceByDenom
   * @request GET:/cosmos/bank/v1beta1/spendable_balances/{address}/by_denom
   */
  querySpendableBalanceByDenom = (address: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QuerySpendableBalanceByDenomRequest>>>,"address">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QuerySpendableBalanceByDenomResponse>>>({
      path: `/cosmos/bank/v1beta1/spendable_balances/${address}/by_denom`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryTotalSupply
   *
   * @tags Query
   * @name queryTotalSupply
   * @request GET:/cosmos/bank/v1beta1/supply
   */
  queryTotalSupply = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryTotalSupplyRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryTotalSupplyResponse>>>({
      path: `/cosmos/bank/v1beta1/supply`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QuerySupplyOf
   *
   * @tags Query
   * @name querySupplyOf
   * @request GET:/cosmos/bank/v1beta1/supply/by_denom
   */
  querySupplyOf = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QuerySupplyOfRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QuerySupplyOfResponse>>>({
      path: `/cosmos/bank/v1beta1/supply/by_denom`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryParams
   *
   * @tags Query
   * @name queryParams
   * @request GET:/cosmos/bank/v1beta1/params
   */
  queryParams = (
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryParamsResponse>>>({
      path: `/cosmos/bank/v1beta1/params`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDenomsMetadata
   *
   * @tags Query
   * @name queryDenomsMetadata
   * @request GET:/cosmos/bank/v1beta1/denoms_metadata
   */
  queryDenomsMetadata = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDenomsMetadataRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDenomsMetadataResponse>>>({
      path: `/cosmos/bank/v1beta1/denoms_metadata`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDenomMetadata
   *
   * @tags Query
   * @name queryDenomMetadata
   * @request GET:/cosmos/bank/v1beta1/denoms_metadata/{denom=**}
   */
  queryDenomMetadata = (denom: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDenomMetadataResponse>>>({
      path: `/cosmos/bank/v1beta1/denoms_metadata/${denom}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDenomMetadataByQueryString
   *
   * @tags Query
   * @name queryDenomMetadataByQueryString
   * @request GET:/cosmos/bank/v1beta1/denoms_metadata_by_query_string
   */
  queryDenomMetadataByQueryString = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDenomMetadataByQueryStringRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDenomMetadataByQueryStringResponse>>>({
      path: `/cosmos/bank/v1beta1/denoms_metadata_by_query_string`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDenomOwners
   *
   * @tags Query
   * @name queryDenomOwners
   * @request GET:/cosmos/bank/v1beta1/denom_owners/{denom=**}
   */
  queryDenomOwners = (denom: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDenomOwnersRequest>>>,"denom">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDenomOwnersResponse>>>({
      path: `/cosmos/bank/v1beta1/denom_owners/${denom}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDenomOwnersByQuery
   *
   * @tags Query
   * @name queryDenomOwnersByQuery
   * @request GET:/cosmos/bank/v1beta1/denom_owners_by_query
   */
  queryDenomOwnersByQuery = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDenomOwnersByQueryRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDenomOwnersByQueryResponse>>>({
      path: `/cosmos/bank/v1beta1/denom_owners_by_query`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QuerySendEnabled
   *
   * @tags Query
   * @name querySendEnabled
   * @request GET:/cosmos/bank/v1beta1/send_enabled
   */
  querySendEnabled = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QuerySendEnabledRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QuerySendEnabledResponse>>>({
      path: `/cosmos/bank/v1beta1/send_enabled`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
}