import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, ResponseType } from "axios";
import { QueryGroupInfoResponse } from "./types/cosmos/group/v1/query";
import { QueryGroupPolicyInfoResponse } from "./types/cosmos/group/v1/query";
import { QueryGroupMembersResponse } from "./types/cosmos/group/v1/query";
import { QueryGroupsByAdminResponse } from "./types/cosmos/group/v1/query";
import { QueryGroupPoliciesByGroupResponse } from "./types/cosmos/group/v1/query";
import { QueryGroupPoliciesByAdminResponse } from "./types/cosmos/group/v1/query";
import { QueryProposalResponse } from "./types/cosmos/group/v1/query";
import { QueryProposalsByGroupPolicyResponse } from "./types/cosmos/group/v1/query";
import { QueryVoteByProposalVoterResponse } from "./types/cosmos/group/v1/query";
import { QueryVotesByProposalResponse } from "./types/cosmos/group/v1/query";
import { QueryVotesByVoterResponse } from "./types/cosmos/group/v1/query";
import { QueryGroupsByMemberResponse } from "./types/cosmos/group/v1/query";
import { QueryTallyResultResponse } from "./types/cosmos/group/v1/query";
import { QueryGroupsResponse } from "./types/cosmos/group/v1/query";

import { QueryGroupInfoRequest } from "./types/cosmos/group/v1/query";
import { QueryGroupPolicyInfoRequest } from "./types/cosmos/group/v1/query";
import { QueryGroupMembersRequest } from "./types/cosmos/group/v1/query";
import { QueryGroupsByAdminRequest } from "./types/cosmos/group/v1/query";
import { QueryGroupPoliciesByGroupRequest } from "./types/cosmos/group/v1/query";
import { QueryGroupPoliciesByAdminRequest } from "./types/cosmos/group/v1/query";
import { QueryProposalRequest } from "./types/cosmos/group/v1/query";
import { QueryProposalsByGroupPolicyRequest } from "./types/cosmos/group/v1/query";
import { QueryVoteByProposalVoterRequest } from "./types/cosmos/group/v1/query";
import { QueryVotesByProposalRequest } from "./types/cosmos/group/v1/query";
import { QueryVotesByVoterRequest } from "./types/cosmos/group/v1/query";
import { QueryGroupsByMemberRequest } from "./types/cosmos/group/v1/query";
import { QueryTallyResultRequest } from "./types/cosmos/group/v1/query";
import { QueryGroupsRequest } from "./types/cosmos/group/v1/query";


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
 * @title cosmos.group.v1
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  /**
   * QueryGroupInfo
   *
   * @tags Query
   * @name queryGroupInfo
   * @request GET:/cosmos/group/v1/group_info/{group_id}
   */
  queryGroupInfo = (group_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupInfoResponse>>>({
      path: `/cosmos/group/v1/group_info/${group_id}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryGroupPolicyInfo
   *
   * @tags Query
   * @name queryGroupPolicyInfo
   * @request GET:/cosmos/group/v1/group_policy_info/{address}
   */
  queryGroupPolicyInfo = (address: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupPolicyInfoResponse>>>({
      path: `/cosmos/group/v1/group_policy_info/${address}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryGroupMembers
   *
   * @tags Query
   * @name queryGroupMembers
   * @request GET:/cosmos/group/v1/group_members/{group_id}
   */
  queryGroupMembers = (group_id: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupMembersRequest>>>,"group_id">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupMembersResponse>>>({
      path: `/cosmos/group/v1/group_members/${group_id}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryGroupsByAdmin
   *
   * @tags Query
   * @name queryGroupsByAdmin
   * @request GET:/cosmos/group/v1/groups_by_admin/{admin}
   */
  queryGroupsByAdmin = (admin: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupsByAdminRequest>>>,"admin">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupsByAdminResponse>>>({
      path: `/cosmos/group/v1/groups_by_admin/${admin}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryGroupPoliciesByGroup
   *
   * @tags Query
   * @name queryGroupPoliciesByGroup
   * @request GET:/cosmos/group/v1/group_policies_by_group/{group_id}
   */
  queryGroupPoliciesByGroup = (group_id: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupPoliciesByGroupRequest>>>,"group_id">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupPoliciesByGroupResponse>>>({
      path: `/cosmos/group/v1/group_policies_by_group/${group_id}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryGroupPoliciesByAdmin
   *
   * @tags Query
   * @name queryGroupPoliciesByAdmin
   * @request GET:/cosmos/group/v1/group_policies_by_admin/{admin}
   */
  queryGroupPoliciesByAdmin = (admin: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupPoliciesByAdminRequest>>>,"admin">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupPoliciesByAdminResponse>>>({
      path: `/cosmos/group/v1/group_policies_by_admin/${admin}`,
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
   * @request GET:/cosmos/group/v1/proposal/{proposal_id}
   */
  queryProposal = (proposal_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryProposalResponse>>>({
      path: `/cosmos/group/v1/proposal/${proposal_id}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryProposalsByGroupPolicy
   *
   * @tags Query
   * @name queryProposalsByGroupPolicy
   * @request GET:/cosmos/group/v1/proposals_by_group_policy/{address}
   */
  queryProposalsByGroupPolicy = (address: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryProposalsByGroupPolicyRequest>>>,"address">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryProposalsByGroupPolicyResponse>>>({
      path: `/cosmos/group/v1/proposals_by_group_policy/${address}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryVoteByProposalVoter
   *
   * @tags Query
   * @name queryVoteByProposalVoter
   * @request GET:/cosmos/group/v1/vote_by_proposal_voter/{proposal_id}/{voter}
   */
  queryVoteByProposalVoter = (proposal_id: string, voter: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryVoteByProposalVoterResponse>>>({
      path: `/cosmos/group/v1/vote_by_proposal_voter/${proposal_id}/${voter}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryVotesByProposal
   *
   * @tags Query
   * @name queryVotesByProposal
   * @request GET:/cosmos/group/v1/votes_by_proposal/{proposal_id}
   */
  queryVotesByProposal = (proposal_id: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryVotesByProposalRequest>>>,"proposal_id">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryVotesByProposalResponse>>>({
      path: `/cosmos/group/v1/votes_by_proposal/${proposal_id}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryVotesByVoter
   *
   * @tags Query
   * @name queryVotesByVoter
   * @request GET:/cosmos/group/v1/votes_by_voter/{voter}
   */
  queryVotesByVoter = (voter: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryVotesByVoterRequest>>>,"voter">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryVotesByVoterResponse>>>({
      path: `/cosmos/group/v1/votes_by_voter/${voter}`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryGroupsByMember
   *
   * @tags Query
   * @name queryGroupsByMember
   * @request GET:/cosmos/group/v1/groups_by_member/{address}
   */
  queryGroupsByMember = (address: string,
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupsByMemberRequest>>>,"address">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupsByMemberResponse>>>({
      path: `/cosmos/group/v1/groups_by_member/${address}`,
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
   * @request GET:/cosmos/group/v1/proposals/{proposal_id}/tally
   */
  queryTallyResult = (proposal_id: string,
    query?: Record<string, any>,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryTallyResultResponse>>>({
      path: `/cosmos/group/v1/proposals/${proposal_id}/tally`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
  /**
   * QueryGroups
   *
   * @tags Query
   * @name queryGroups
   * @request GET:/cosmos/group/v1/groups
   */
  queryGroups = (
    query?: Omit<FlattenObject<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupsRequest>>>,"">,
    params: RequestParams = {},
  ) =>
    this.request<SnakeCasedPropertiesDeep<ChangeProtoToJSPrimitives<QueryGroupsResponse>>>({
      path: `/cosmos/group/v1/groups`,
      method: "GET",
      query: query,
      format: "json",
      ...params,
    });
  
}