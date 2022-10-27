import { http } from '@/api/http'
import { httpErrorHandle } from '@/utils'
import { RequestHttpEnum, ModuleTypeEnum } from '@/enums/httpEnum'

// * 登录
export const loginApi = async (data: { username: string, password: string }) => {
  const params = {
    Project: '',
    LoginID: data.username,
    Password: data.password,
    ModuleID: ''
  }
  try {
    const res = await http(RequestHttpEnum.POST)(`User/GetToken?expiresHours=24`, params);
    return res;
  } catch (err) {
    httpErrorHandle();
  }
}

// * 登出
export const logoutApi = async () => {
  try {
    const res = await http(RequestHttpEnum.GET)(`${ModuleTypeEnum.SYSTEM}/logout`);
    return res;
  } catch (err) {
    httpErrorHandle();
  }
}

// * 获取 oss 上传接口
export const ossUrlApi = async (data: object) => {
  try {
    const res = await http(RequestHttpEnum.GET)(`${ModuleTypeEnum.SYSTEM}/getOssInfo`, data);
    return res;
  } catch (err) {
    httpErrorHandle();
  }
}

// * 获取用户基本信息
export const getUserInfoApi = async () => {
  try {
    const res = await http(RequestHttpEnum.GET)(`UserConfig/TokenUser`);
    return res;
  } catch (err) {
    httpErrorHandle();
  }
}