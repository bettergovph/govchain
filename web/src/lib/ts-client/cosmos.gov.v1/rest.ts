import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import { QueryConstitutionResponse } from "./types/cosmos/gov/v1/query";
import { QueryProposalResponse } from "./types/cosmos/gov/v1/query";
import { QueryProposalsResponse } from "./types/cosmos/gov/v1/query";
import { QueryVoteResponse } from "./types/cosmos/gov/v1/query";
import { QueryVotesResponse } from "./types/cosmos/gov/v1/query";
import { QueryParamsResponse } from "./types/cosmos/gov/v1/query";
import { QueryDepositResponse } from "./types/cosmos/gov/v1/query";
import { QueryDepositsResponse } from "./types/cosmos/gov/v1/query";
import { QueryTallyResultResponse } from "./types/cosmos/gov/v1/query";

import { QueryConstitutionRequest } from "./types/cosmos/gov/v1/query";
import { QueryProposalRequest } from "./types/cosmos/gov/v1/query";
import { QueryProposalsRequest } from "./types/cosmos/gov/v1/query";
import { QueryVoteRequest } from "./types/cosmos/gov/v1/query";
import { QueryVotesRequest } from "./types/cosmos/gov/v1/query";
import { QueryParamsRequest } from "./types/cosmos/gov/v1/query";
import { QueryDepositRequest } from "./types/cosmos/gov/v1/query";
import { QueryDepositsRequest } from "./types/cosmos/gov/v1/query";
import { QueryTallyResultRequest } from "./types/cosmos/gov/v1/query";


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
 * @title cosmos.gov.v1
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * QueryConstitution
   *
   * @tags Query
   * @name queryConstitution
   * @request GET:/cosmos/gov/v1/constitution
   */
  queryConstitution = (
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryConstitutionResponse>>>({
      path: `/cosmos/gov/v1/constitution`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryProposal
   *
   * @tags Query
   * @name queryProposal
   * @request GET:/cosmos/gov/v1/proposals/{proposal_id}
   */
  queryProposal = (proposal_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryProposalResponse>>>({
      path: `/cosmos/gov/v1/proposals/${proposal_id}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryProposals
   *
   * @tags Query
   * @name queryProposals
   * @request GET:/cosmos/gov/v1/proposals
   */
  queryProposals = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryProposalsRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryProposalsResponse>>>({
      path: `/cosmos/gov/v1/proposals`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryVote
   *
   * @tags Query
   * @name queryVote
   * @request GET:/cosmos/gov/v1/proposals/{proposal_id}/votes/{voter}
   */
  queryVote = (proposal_id: string, voter: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryVoteResponse>>>({
      path: `/cosmos/gov/v1/proposals/${proposal_id}/votes/${voter}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryVotes
   *
   * @tags Query
   * @name queryVotes
   * @request GET:/cosmos/gov/v1/proposals/{proposal_id}/votes
   */
  queryVotes = (proposal_id: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryVotesRequest>>>,"proposal_id">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryVotesResponse>>>({
      path: `/cosmos/gov/v1/proposals/${proposal_id}/votes`,
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
   * @request GET:/cosmos/gov/v1/params/{params_type}
   */
  queryParams = (params_type: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryParamsResponse>>>({
      path: `/cosmos/gov/v1/params/${params_type}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDeposit
   *
   * @tags Query
   * @name queryDeposit
   * @request GET:/cosmos/gov/v1/proposals/{proposal_id}/deposits/{depositor}
   */
  queryDeposit = (proposal_id: string, depositor: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDepositResponse>>>({
      path: `/cosmos/gov/v1/proposals/${proposal_id}/deposits/${depositor}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryDeposits
   *
   * @tags Query
   * @name queryDeposits
   * @request GET:/cosmos/gov/v1/proposals/{proposal_id}/deposits
   */
  queryDeposits = (proposal_id: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDepositsRequest>>>,"proposal_id">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryDepositsResponse>>>({
      path: `/cosmos/gov/v1/proposals/${proposal_id}/deposits`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryTallyResult
   *
   * @tags Query
   * @name queryTallyResult
   * @request GET:/cosmos/gov/v1/proposals/{proposal_id}/tally
   */
  queryTallyResult = (proposal_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryTallyResultResponse>>>({
      path: `/cosmos/gov/v1/proposals/${proposal_id}/tally`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
}