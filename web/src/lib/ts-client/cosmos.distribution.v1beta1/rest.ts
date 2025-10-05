import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import { QueryParamsResponse } from "./types/cosmos/distribution/v1beta1/query";
import { QueryValidatorDistributionInfoResponse } from "./types/cosmos/distribution/v1beta1/query";
import { QueryValidatorOutstandingRewardsResponse } from "./types/cosmos/distribution/v1beta1/query";
import { QueryValidatorCommissionResponse } from "./types/cosmos/distribution/v1beta1/query";
import { QueryValidatorSlashesResponse } from "./types/cosmos/distribution/v1beta1/query";
import { QueryDelegationRewardsResponse } from "./types/cosmos/distribution/v1beta1/query";
import { QueryDelegationTotalRewardsResponse } from "./types/cosmos/distribution/v1beta1/query";
import { QueryDelegatorValidatorsResponse } from "./types/cosmos/distribution/v1beta1/query";
import { QueryDelegatorWithdrawAddressResponse } from "./types/cosmos/distribution/v1beta1/query";
import { QueryCommunityPoolResponse } from "./types/cosmos/distribution/v1beta1/query";

import { QueryParamsRequest } from "./types/cosmos/distribution/v1beta1/query";
import { QueryValidatorDistributionInfoRequest } from "./types/cosmos/distribution/v1beta1/query";
import { QueryValidatorOutstandingRewardsRequest } from "./types/cosmos/distribution/v1beta1/query";
import { QueryValidatorCommissionRequest } from "./types/cosmos/distribution/v1beta1/query";
import { QueryValidatorSlashesRequest } from "./types/cosmos/distribution/v1beta1/query";
import { QueryDelegationRewardsRequest } from "./types/cosmos/distribution/v1beta1/query";
import { QueryDelegationTotalRewardsRequest } from "./types/cosmos/distribution/v1beta1/query";
import { QueryDelegatorValidatorsRequest } from "./types/cosmos/distribution/v1beta1/query";
import { QueryDelegatorWithdrawAddressRequest } from "./types/cosmos/distribution/v1beta1/query";
import { QueryCommunityPoolRequest } from "./types/cosmos/distribution/v1beta1/query";


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
 * @title cosmos.distribution.v1beta1
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * QueryParams
   *
   * @tags Query
   * @name queryParams
   * @request GET:/cosmos/distribution/v1beta1/params
   */
  queryParams = (
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryParamsResponse>>>({
      path: `/cosmos/distribution/v1beta1/params`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryValidatorDistributionInfo
   *
   * @tags Query
   * @name queryValidatorDistributionInfo
   * @request GET:/cosmos/distribution/v1beta1/validators/{validator_address}
   */
  queryValidatorDistributionInfo = (validator_address: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorDistributionInfoResponse>>>({
      path: `/cosmos/distribution/v1beta1/validators/${validator_address}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryValidatorOutstandingRewards
   *
   * @tags Query
   * @name queryValidatorOutstandingRewards
   * @request GET:/cosmos/distribution/v1beta1/validators/{validator_address}/outstanding_rewards
   */
  queryValidatorOutstandingRewards = (validator_address: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorOutstandingRewardsResponse>>>({
      path: `/cosmos/distribution/v1beta1/validators/${validator_address}/outstanding_rewards`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryValidatorCommission
   *
   * @tags Query
   * @name queryValidatorCommission
   * @request GET:/cosmos/distribution/v1beta1/validators/{validator_address}/commission
   */
  queryValidatorCommission = (validator_address: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorCommissionResponse>>>({
      path: `/cosmos/distribution/v1beta1/validators/${validator_address}/commission`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryValidatorSlashes
   *
   * @tags Query
   * @name queryValidatorSlashes
   * @request GET:/cosmos/distribution/v1beta1/validators/{validator_address}/slashes
   */
  queryValidatorSlashes = (validator_address: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorSlashesRequest>>>,"validator_address">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryValidatorSlashesResponse>>>({
      path: `/cosmos/distribution/v1beta1/validators/${validator_address}/slashes`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDelegationRewards
   *
   * @tags Query
   * @name queryDelegationRewards
   * @request GET:/cosmos/distribution/v1beta1/delegators/{delegator_address}/rewards/{validator_address}
   */
  queryDelegationRewards = (delegator_address: string, validator_address: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegationRewardsResponse>>>({
      path: `/cosmos/distribution/v1beta1/delegators/${delegator_address}/rewards/${validator_address}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDelegationTotalRewards
   *
   * @tags Query
   * @name queryDelegationTotalRewards
   * @request GET:/cosmos/distribution/v1beta1/delegators/{delegator_address}/rewards
   */
  queryDelegationTotalRewards = (delegator_address: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegationTotalRewardsResponse>>>({
      path: `/cosmos/distribution/v1beta1/delegators/${delegator_address}/rewards`,
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
   * @request GET:/cosmos/distribution/v1beta1/delegators/{delegator_address}/validators
   */
  queryDelegatorValidators = (delegator_address: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegatorValidatorsResponse>>>({
      path: `/cosmos/distribution/v1beta1/delegators/${delegator_address}/validators`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDelegatorWithdrawAddress
   *
   * @tags Query
   * @name queryDelegatorWithdrawAddress
   * @request GET:/cosmos/distribution/v1beta1/delegators/{delegator_address}/withdraw_address
   */
  queryDelegatorWithdrawAddress = (delegator_address: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDelegatorWithdrawAddressResponse>>>({
      path: `/cosmos/distribution/v1beta1/delegators/${delegator_address}/withdraw_address`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryCommunityPool
   *
   * @tags Query
   * @name queryCommunityPool
   * @request GET:/cosmos/distribution/v1beta1/community_pool
   */
  queryCommunityPool = (
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryCommunityPoolResponse>>>({
      path: `/cosmos/distribution/v1beta1/community_pool`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
}