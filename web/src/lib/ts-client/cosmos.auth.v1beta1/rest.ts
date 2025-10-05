import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import { QueryAccountsResponse } from "./types/cosmos/auth/v1beta1/query";
import { QueryAccountResponse } from "./types/cosmos/auth/v1beta1/query";
import { QueryAccountAddressByIDResponse } from "./types/cosmos/auth/v1beta1/query";
import { QueryParamsResponse } from "./types/cosmos/auth/v1beta1/query";
import { QueryModuleAccountsResponse } from "./types/cosmos/auth/v1beta1/query";
import { QueryModuleAccountByNameResponse } from "./types/cosmos/auth/v1beta1/query";
import { Bech32PrefixResponse } from "./types/cosmos/auth/v1beta1/query";
import { AddressBytesToStringResponse } from "./types/cosmos/auth/v1beta1/query";
import { AddressStringToBytesResponse } from "./types/cosmos/auth/v1beta1/query";
import { QueryAccountInfoResponse } from "./types/cosmos/auth/v1beta1/query";

import { QueryAccountsRequest } from "./types/cosmos/auth/v1beta1/query";
import { QueryAccountRequest } from "./types/cosmos/auth/v1beta1/query";
import { QueryAccountAddressByIDRequest } from "./types/cosmos/auth/v1beta1/query";
import { QueryParamsRequest } from "./types/cosmos/auth/v1beta1/query";
import { QueryModuleAccountsRequest } from "./types/cosmos/auth/v1beta1/query";
import { QueryModuleAccountByNameRequest } from "./types/cosmos/auth/v1beta1/query";
import { Bech32PrefixRequest } from "./types/cosmos/auth/v1beta1/query";
import { AddressBytesToStringRequest } from "./types/cosmos/auth/v1beta1/query";
import { AddressStringToBytesRequest } from "./types/cosmos/auth/v1beta1/query";
import { QueryAccountInfoRequest } from "./types/cosmos/auth/v1beta1/query";


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
 * @title cosmos.auth.v1beta1
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * QueryAccounts
   *
   * @tags Query
   * @name queryAccounts
   * @request GET:/cosmos/auth/v1beta1/accounts
   */
  queryAccounts = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryAccountsRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryAccountsResponse>>>({
      path: `/cosmos/auth/v1beta1/accounts`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryAccount
   *
   * @tags Query
   * @name queryAccount
   * @request GET:/cosmos/auth/v1beta1/accounts/{address}
   */
  queryAccount = (address: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryAccountResponse>>>({
      path: `/cosmos/auth/v1beta1/accounts/${address}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryAccountAddressByID
   *
   * @tags Query
   * @name queryAccountAddressById
   * @request GET:/cosmos/auth/v1beta1/address_by_id/{id}
   */
  queryAccountAddressById = (id: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryAccountAddressByIDRequest>>>,"id">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryAccountAddressByIDResponse>>>({
      path: `/cosmos/auth/v1beta1/address_by_id/${id}`,
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
   * @request GET:/cosmos/auth/v1beta1/params
   */
  queryParams = (
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryParamsResponse>>>({
      path: `/cosmos/auth/v1beta1/params`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryModuleAccounts
   *
   * @tags Query
   * @name queryModuleAccounts
   * @request GET:/cosmos/auth/v1beta1/module_accounts
   */
  queryModuleAccounts = (
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryModuleAccountsResponse>>>({
      path: `/cosmos/auth/v1beta1/module_accounts`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryModuleAccountByName
   *
   * @tags Query
   * @name queryModuleAccountByName
   * @request GET:/cosmos/auth/v1beta1/module_accounts/{name}
   */
  queryModuleAccountByName = (name: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryModuleAccountByNameResponse>>>({
      path: `/cosmos/auth/v1beta1/module_accounts/${name}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryBech32Prefix
   *
   * @tags Query
   * @name queryBech32Prefix
   * @request GET:/cosmos/auth/v1beta1/bech32
   */
  queryBech32Prefix = (
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<Bech32PrefixResponse>>>({
      path: `/cosmos/auth/v1beta1/bech32`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryAddressBytesToString
   *
   * @tags Query
   * @name queryAddressBytesToString
   * @request GET:/cosmos/auth/v1beta1/bech32/{address_bytes}
   */
  queryAddressBytesToString = (address_bytes: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<AddressBytesToStringResponse>>>({
      path: `/cosmos/auth/v1beta1/bech32/${address_bytes}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryAddressStringToBytes
   *
   * @tags Query
   * @name queryAddressStringToBytes
   * @request GET:/cosmos/auth/v1beta1/bech32/{address_string}
   */
  queryAddressStringToBytes = (address_string: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<AddressStringToBytesResponse>>>({
      path: `/cosmos/auth/v1beta1/bech32/${address_string}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryAccountInfo
   *
   * @tags Query
   * @name queryAccountInfo
   * @request GET:/cosmos/auth/v1beta1/account_info/{address}
   */
  queryAccountInfo = (address: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryAccountInfoResponse>>>({
      path: `/cosmos/auth/v1beta1/account_info/${address}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
}