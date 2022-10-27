/**
 * * 请求失败统一处理
 */
export const httpErrorHandle = (errDetailMsg?:string) => {
  window['$message'].error(window['$t']('http.error_message') + errDetailMsg)
}