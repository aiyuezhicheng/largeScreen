import axios, { AxiosResponse, AxiosRequestConfig } from 'axios'
import { ResultEnum } from "@/enums/httpEnum"
import { PageEnum, ErrorPageNameMap } from "@/enums/pageEnum"
import { StorageEnum } from '@/enums/storageEnum'
import { axiosPre } from '@/settings/httpSetting'
import { SystemStoreEnum, SystemStoreUserInfoEnum } from '@/store/modules/systemStore/systemStore.d'
import { redirectErrorPage, getLocalStorage, routerTurnByName, httpErrorHandle } from '@/utils'
import { fetchAllowList } from './axios.config'
import includes from 'lodash/includes'

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.PROD ? import.meta.env.VITE_PRO_PATH : ''}${axiosPre}`,
  timeout: ResultEnum.TIMEOUT,
})

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    // 白名单校验
    if (includes(fetchAllowList, config.url)) return config
    // 获取 token
    const info = getLocalStorage(StorageEnum.GO_SYSTEM_STORE)
    // 重新登录
    if (!info) {
      routerTurnByName(PageEnum.BASE_LOGIN_NAME)
      return config
    }
    const userInfo = info[SystemStoreEnum.USER_INFO]
    config.headers = {
      ...config.headers,
      Authorization: userInfo[SystemStoreUserInfoEnum.USER_TOKEN] ? 'Bearer ' + userInfo[SystemStoreUserInfoEnum.USER_TOKEN] : ''
    }
    return config
  },
  (err: AxiosRequestConfig) => {
    Promise.reject(err)
  }
)

// 响应拦截器
axiosInstance.interceptors.response.use(
  (res: AxiosResponse) => {
    const { status, data } = res;
    if (status == 200) {
      if(typeof data !="object"){
        res.data = {
          IsOk: true,
          Response: data,
          code: 200
        }
      }else{
        res.data.code = status
      }
    }

    const { code } = res.data as { code: number }

    // 成功
    if (code === ResultEnum.SUCCESS) {
      return Promise.resolve(res.data)
    }

    // 登录过期
    if (code === ResultEnum.TOKEN_OVERDUE) {
      window['$message'].error(window['$t']('http.token_overdue_message'))
      routerTurnByName(PageEnum.BASE_LOGIN_NAME)
      return Promise.resolve(res.data)
    }

    // 固定错误码重定向
    if (ErrorPageNameMap.get(code)) {
      redirectErrorPage(code)
      return Promise.resolve(res.data)
    }

    // 提示错误
    window['$message'].error(window['$t']((res.data as any).msg))
    return Promise.resolve(res.data)
  },
  (err: AxiosResponse & { "response"?: AxiosResponse }) => {
    const { response } = err;
    // // 提示错误
    // if (response && response.data && response.data.Message) {
    //   window['$message'].error(response.data.Message)
    // }
    Promise.reject(response && response.data || err)
  }
)

export default axiosInstance
