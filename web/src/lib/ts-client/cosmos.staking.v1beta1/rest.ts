import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import { QueryValidatorsResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryValidatorResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryValidatorDelegationsResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryValidatorUnbondingDelegationsResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryDelegationResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryUnbondingDelegationResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryDelegatorDelegationsResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryDelegatorUnbondingDelegationsResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryRedelegationsResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryDelegatorValidatorsResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryDelegatorValidatorResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryHistoricalInfoResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryPoolResponse } from "./types/cosmos/staking/v1beta1/query";
import { QueryParamsResponse } from "./types/cosmos/staking/v1beta1/query";

import { QueryValidatorsRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryValidatorRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryValidatorDelegationsRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryValidatorUnbondingDelegationsRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryDelegationRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryUnbondingDelegationRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryDelegatorDelegationsRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryDelegatorUnbondingDelegationsRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryRedelegationsRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryDelegatorValidatorsRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryDelegatorValidatorRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryHistoricalInfoRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryPoolRequest } from "./types/cosmos/staking/v1beta1/query";
import { QueryParamsRequest } from "./types/cosmos/staking/v1beta1/query";


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
 * @title cosmos.staking.v1beta1
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * QueryValidators
   *
   * @tags Query
   * @name queryValidators
   * @request GET:/cosmos/staking/v1beta1/validators
   */
  queryValidators = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorsRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorsResponse>>>({
      path: `/cosmos/staking/v1beta1/validators`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryValidator
   *
   * @tags Query
   * @name queryValidator
   * @request GET:/cosmos/staking/v1beta1/validators/{validator_addr}
   */
  queryValidator = (validator_addr: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorResponse>>>({
      path: `/cosmos/staking/v1beta1/validators/${validator_addr}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryValidatorDelegations
   *
   * @tags Query
   * @name queryValidatorDelegations
   * @request GET:/cosmos/staking/v1beta1/validators/{validator_addr}/delegations
   */
  queryValidatorDelegations = (validator_addr: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorDelegationsRequest>>>,"validator_addr">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorDelegationsResponse>>>({
      path: `/cosmos/staking/v1beta1/validators/${validator_addr}/delegations`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryValidatorUnbondingDelegations
   *
   * @tags Query
   * @name queryValidatorUnbondingDelegations
   * @request GET:/cosmos/staking/v1beta1/validators/{validator_addr}/unbonding_delegations
   */
  queryValidatorUnbondingDelegations = (validator_addr: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorUnbondingDelegationsRequest>>>,"validator_addr">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorUnbondingDelegationsResponse>>>({
      path: `/cosmos/staking/v1beta1/validators/${validator_addr}/unbonding_delegations`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDelegation
   *
   * @tags Query
   * @name queryDelegation
   * @request GET:/cosmos/staking/v1beta1/validators/{validator_addr}/delegations/{delegator_addr}
   */
  queryDelegation = (validator_addr: string, delegator_addr: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegationResponse>>>({
      path: `/cosmos/staking/v1beta1/validators/${validator_addr}/delegations/${delegator_addr}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryUnbondingDelegation
   *
   * @tags Query
   * @name queryUnbondingDelegation
   * @request GET:/cosmos/staking/v1beta1/validators/{validator_addr}/delegations/{delegator_addr}/unbonding_delegation
   */
  queryUnbondingDelegation = (validator_addr: string, delegator_addr: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryUnbondingDelegationResponse>>>({
      path: `/cosmos/staking/v1beta1/validators/${validator_addr}/delegations/${delegator_addr}/unbonding_delegation`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDelegatorDelegations
   *
   * @tags Query
   * @name queryDelegatorDelegations
   * @request GET:/cosmos/staking/v1beta1/delegations/{delegator_addr}
   */
  queryDelegatorDelegations = (delegator_addr: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegatorDelegationsRequest>>>,"delegator_addr">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegatorDelegationsResponse>>>({
      path: `/cosmos/staking/v1beta1/delegations/${delegator_addr}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDelegatorUnbondingDelegations
   *
   * @tags Query
   * @name queryDelegatorUnbondingDelegations
   * @request GET:/cosmos/staking/v1beta1/delegators/{delegator_addr}/unbonding_delegations
   */
  queryDelegatorUnbondingDelegations = (delegator_addr: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegatorUnbondingDelegationsRequest>>>,"delegator_addr">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegatorUnbondingDelegationsResponse>>>({
      path: `/cosmos/staking/v1beta1/delegators/${delegator_addr}/unbonding_delegations`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryRedelegations
   *
   * @tags Query
   * @name queryRedelegations
   * @request GET:/cosmos/staking/v1beta1/delegators/{delegator_addr}/redelegations
   */
  queryRedelegations = (delegator_addr: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryRedelegationsRequest>>>,"delegator_addr">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryRedelegationsResponse>>>({
      path: `/cosmos/staking/v1beta1/delegators/${delegator_addr}/redelegations`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDelegatorValidators
   *
   * @tags Query
   * @name queryDelegatorValidators
   * @request GET:/cosmos/staking/v1beta1/delegators/{delegator_addr}/validators
   */
  queryDelegatorValidators = (delegator_addr: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegatorValidatorsRequest>>>,"delegator_addr">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegatorValidatorsResponse>>>({
      path: `/cosmos/staking/v1beta1/delegators/${delegator_addr}/validators`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDelegatorValidator
   *
   * @tags Query
   * @name queryDelegatorValidator
   * @request GET:/cosmos/staking/v1beta1/delegators/{delegator_addr}/validators/{validator_addr}
   */
  queryDelegatorValidator = (delegator_addr: string, validator_addr: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegatorValidatorResponse>>>({
      path: `/cosmos/staking/v1beta1/delegators/${delegator_addr}/validators/${validator_addr}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryHistoricalInfo
   *
   * @tags Query
   * @name queryHistoricalInfo
   * @request GET:/cosmos/staking/v1beta1/historical_info/{height}
   */
  queryHistoricalInfo = (height: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryHistoricalInfoResponse>>>({
      path: `/cosmos/staking/v1beta1/historical_info/${height}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryPool
   *
   * @tags Query
   * @name queryPool
   * @request GET:/cosmos/staking/v1beta1/pool
   */
  queryPool = (
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryPoolResponse>>>({
      path: `/cosmos/staking/v1beta1/pool`,
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
   * @request GET:/cosmos/staking/v1beta1/params
   */
  queryParams = (
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryParamsResponse>>>({
      path: `/cosmos/staking/v1beta1/params`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
}