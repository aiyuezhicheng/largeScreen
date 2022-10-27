export enum SystemStoreUserInfoEnum {
  USER_TOKEN = 'userToken',
  USER_ID = 'userId',
  USER_NAME = 'userName',
  USER_LOGINNAME = 'loginName',
  USER_PROJECTID = 'projectID',
}

export interface UserInfoType {
  [SystemStoreUserInfoEnum.USER_TOKEN]?: string,
  [SystemStoreUserInfoEnum.USER_ID]?: string,
  [SystemStoreUserInfoEnum.USER_NAME]?: string,
  [SystemStoreUserInfoEnum.USER_LOGINNAME]?: string,
  [SystemStoreUserInfoEnum.USER_PROJECTID]?: string,
}

export interface FetchInfoType {
  OSSUrl?: string,
}

export enum SystemStoreEnum {
  // 用户
  USER_INFO = 'userInfo',
  // 请求
  FETCH_INFO = 'fetchInfo'
}

export interface SystemStoreType {
  [SystemStoreEnum.USER_INFO]: UserInfoType
  [SystemStoreEnum.FETCH_INFO]: FetchInfoType
}