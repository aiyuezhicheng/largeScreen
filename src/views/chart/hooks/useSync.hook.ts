import { onUnmounted } from 'vue';
import html2canvas from 'html2canvas'
import { defaultTheme, globalThemeJson } from '@/settings/chartThemes/index'
import { requestInterval, previewScaleType, requestIntervalUnit } from '@/settings/designSetting'
import { getUUID, httpErrorHandle, fetchRouteParamsLocation, base64toFile, fetchRouteParams, isNotEmptyGuid, fetchPathByName, routerTurnByPathAndParams } from '@/utils'
import { useChartEditStore } from '@/store/modules/chartEditStore/chartEditStore'
import { EditCanvasTypeEnum, ChartEditStoreEnum, ProjectInfoEnum, ChartEditStorage } from '@/store/modules/chartEditStore/chartEditStore.d'
import { useChartHistoryStore } from '@/store/modules/chartHistoryStore/chartHistoryStore'
import { useSystemStore } from '@/store/modules/systemStore/systemStore'
import { fetchChartComponent, fetchConfigComponent, createComponent } from '@/packages/index'
import { saveInterval } from '@/settings/designSetting'
import throttle from 'lodash/throttle'
// 接口状态
import { ResultEnum } from '@/enums/httpEnum'
// 接口
import { saveOneProjectLargeScreenApi, fetchOneProjectLargeScreenApi, uploadFile, updateProjectApi, createProjectLargeScreenApi } from '@/api/path'
// 画布枚举
import { SyncEnum } from '@/enums/editPageEnum'
import { CreateComponentType, CreateComponentGroupType, ConfigType } from '@/packages/index.d'
import { PublicGroupConfigClass } from '@/packages/public/publicConfig'
import merge from 'lodash/merge'
import { ChartEnum } from '@/enums/pageEnum'

/**
 * 合并处理
 * @param object 模板数据
 * @param sources 新拿到的数据
 * @returns object
 */
const componentMerge = (object: any, sources: any, notComponent = false) => {
  // 非组件不处理
  if (notComponent) return merge(object, sources)
  // 组件排除 options
  const option = sources.option
  if (!option) return merge(object, sources)

  // 为 undefined 的 sources 来源对象属性将被跳过详见 https://www.lodashjs.com/docs/lodash.merge
  sources.option = undefined
  if (option) {
    return {
      ...merge(object, sources),
      option: option
    }
  }
}

// 请求处理
export const useSync = () => {
  const chartEditStore = useChartEditStore()
  const chartHistoryStore = useChartHistoryStore()
  const systemStore = useSystemStore()

  /**
   * * 组件动态注册
   * @param projectData 项目数据
   * @param isReplace 是否替换数据
   * @returns
   */
  const updateComponent = async (projectData: ChartEditStorage, isReplace = false, changeId = false) => {
    if (isReplace) {
      // 清除列表
      chartEditStore.componentList = []
      // 清除历史记录
      chartHistoryStore.clearBackStack()
      chartHistoryStore.clearForwardStack()
    }
    // 列表组件注册
    projectData.componentList.forEach(async (e: CreateComponentType | CreateComponentGroupType) => {
      const intComponent = (target: CreateComponentType) => {
        if (!window['$vue'].component(target.chartConfig.chartKey)) {
          window['$vue'].component(target.chartConfig.chartKey, fetchChartComponent(target.chartConfig))
          window['$vue'].component(target.chartConfig.conKey, fetchConfigComponent(target.chartConfig))
        }
      }

      if (e.isGroup) {
        (e as CreateComponentGroupType).groupList.forEach(groupItem => {
          intComponent(groupItem)
        })
      } else {
        intComponent(e as CreateComponentType)
      }
    })

    // 创建函数-重新创建是为了处理类种方法消失的问题
    const create = async (
      _componentInstance: CreateComponentType,
      callBack?: (componentInstance: CreateComponentType) => void
    ) => {
      // 补充 class 上的方法
      let newComponent: CreateComponentType = await createComponent(_componentInstance.chartConfig)
      if (callBack) {
        if (changeId) {
          callBack(componentMerge(newComponent, { ..._componentInstance, id: getUUID() }))
        } else {
          callBack(componentMerge(newComponent, _componentInstance))
        }
      } else {
        if (changeId) {
          chartEditStore.addComponentList(
            componentMerge(newComponent, { ..._componentInstance, id: getUUID() }),
            false,
            true
          )
        } else {
          chartEditStore.addComponentList(componentMerge(newComponent, _componentInstance), false, true)
        }
      }
    }

    // 数据赋值
    for (const key in projectData) {
      // 组件
      if (key === ChartEditStoreEnum.COMPONENT_LIST) {
        for (const comItem of projectData[key]) {
          if (comItem.isGroup) {
            // 创建分组
            let groupClass = new PublicGroupConfigClass()
            if (changeId) {
              groupClass = componentMerge(groupClass, { ...comItem, id: getUUID() })
            } else {
              groupClass = componentMerge(groupClass, comItem)
            }

            // 异步注册子应用
            const targetList: CreateComponentType[] = []
            for (const groupItem of (comItem as CreateComponentGroupType).groupList) {
              await create(groupItem, e => {
                targetList.push(e)
              })
            }
            groupClass.groupList = targetList

            // 分组插入到列表
            chartEditStore.addComponentList(groupClass, false, true)
          } else {
            await create(comItem as CreateComponentType)
          }
        }
      } else {
        // 非组件(顺便排除脏数据)
        if (key !== 'editCanvasConfig' && key !== 'requestGlobalConfig') return
        componentMerge(chartEditStore[key], projectData[key], true)
      }
    }
  }

  /**
   * * 赋值全局数据
   * @param projectData 项目数据
   * @returns
   */
  const updateStoreInfo = (projectData: {
    id: string,
    projectName: string,
    indexImage: string,
    remarks: string,
    state: number,
    createTime: string
    createUserId: string
  }) => {
    const { id, projectName, remarks, indexImage, state, createTime, createUserId } = projectData
    // ID
    chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_ID, id)
    // 名称
    chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_NAME, projectName)
    // 描述
    chartEditStore.setProjectInfo(ProjectInfoEnum.REMARKS, remarks)
    // 缩略图
    chartEditStore.setProjectInfo(ProjectInfoEnum.THUMBNAIL, indexImage)
    // 发布
    chartEditStore.setProjectInfo(ProjectInfoEnum.RELEASE, state === 1)
    // 创建时间
    chartEditStore.setProjectInfo(ProjectInfoEnum.CREATETIME, createTime)
    // 创建人ID
    chartEditStore.setProjectInfo(ProjectInfoEnum.CREATEUSERID, createUserId)
  }


  // * 数据获取
  const dataSyncFetch = async () => {
    chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.START)
    try {
      const params = fetchRouteParams();
      let id = params?.id[0];
      let action = 'edit';
      const path = fetchRouteParamsLocation()
      if (path.indexOf('?action=') > -1) {
        const index = path.indexOf('?action=')
        action = path.substring(index + 8)
        id = path.substring(0, index)
      }

      const projectid = action == 'edit' ? id : getUUID();
      if (id && isNotEmptyGuid(id)) { // 编辑和克隆
        const res = await fetchOneProjectLargeScreenApi(id) as unknown as ApiResponseType
        if (res && res.IsOk) {
          const { Response } = res
          if (Response) {
            const result = JSON.parse(Response)
            updateStoreInfo({ ...result, id: projectid })
            // 更新全局数据
            if (result && result.content)
              await updateComponent(JSON.parse(result.content), true)
            return
          } else {
            chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_ID, projectid as string)
          }
          setTimeout(() => {
            chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.SUCCESS)
          }, 1000)
          return
        }
        chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.FAILURE)
      } else {
        const emptyConfig: ChartEditStorage = {
          // 默认新建配置
          editCanvasConfig: {
            // 默认宽度
            width: 1920,
            // 默认高度
            height: 1080,
            // 启用滤镜
            filterShow: false,
            // 色相
            hueRotate: 0,
            // 饱和度
            saturate: 1,
            // 对比度
            contrast: 1,
            // 亮度
            brightness: 1,
            // 透明度
            opacity: 1,
            // 变换（暂不更改）
            rotateZ: 0,
            rotateX: 0,
            rotateY: 0,
            skewX: 0,
            skewY: 0,
            // 混合模式
            blendMode: 'normal',
            // 默认背景色
            background: undefined,
            backgroundImage: undefined,
            // 是否使用纯颜色
            selectColor: true,
            // chart 主题色
            chartThemeColor: defaultTheme || 'dark',
            // 全局配置
            chartThemeSetting: globalThemeJson,
            // 预览方式
            previewScaleType: previewScaleType
          },
          requestGlobalConfig: {
            requestOriginUrl: '',
            requestInterval: requestInterval,
            requestIntervalUnit: requestIntervalUnit,
            requestParams: {
              Body: {
                'form-data': {},
                'x-www-form-urlencoded': {},
                json: '',
                xml: ''
              },
              Header: {},
              Params: {}
            }
          },
          //列表
          componentList: []
        }
        await updateComponent(emptyConfig, true);
        chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_ID, projectid as string)
        chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_NAME, projectid as string)
      }
    } catch (error) {
      chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.FAILURE)
      httpErrorHandle()
    }
  }

  // * 数据保存
  const dataSyncUpdate = throttle(async () => {
    if (!fetchRouteParamsLocation()) return

    let projectId = chartEditStore.getProjectInfo[ProjectInfoEnum.PROJECT_ID];
    if (projectId === null || projectId === '') {
      window['$message'].error('数据初未始化成功,请刷新页面！')
      return
    }

    chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.START)

    // 获取缩略图片
    const range = document.querySelector('.go-edit-range') as HTMLElement
    // 生成图片
    const canvasImage: HTMLCanvasElement = await html2canvas(range, {
      backgroundColor: null,
      allowTaint: true,
      useCORS: true
    })

    // 上传预览图
    // let uploadParams = new FormData()
    // uploadParams.append('object', base64toFile(canvasImage.toDataURL(), `${fetchRouteParamsLocation()}_index_preview.png`))
    // const uploadRes = await uploadFile(systemStore.getFetchInfo.OSSUrl, uploadParams) as unknown as MyResponseType
    // 保存预览图
    // if (uploadRes.code === ResultEnum.SUCCESS) {
    // await updateProjectApi({
    //   id: fetchRouteParamsLocation(),
    //   indexImage: uploadRes.data.objectContent.httpRequest.uri
    // })
    // }

    // 保存数据
    // let params = new FormData()
    // params.append('projectId', projectId)
    // params.append('content', JSON.stringify(chartEditStore.getStorageInfo || {}))

    const routParams = fetchRouteParams();
    let id = routParams?.id[0];
    let action = 'edit';
    const path = fetchRouteParamsLocation()
    if (path.indexOf('?action=') > -1) {
      const index = path.indexOf('?action=')
      action = path.substring(index + 8)
      id = path.substring(0, index)
    }

    let params = {
      content: JSON.stringify(chartEditStore.getStorageInfo || {}),
      projectName: chartEditStore.getProjectInfo[ProjectInfoEnum.PROJECT_NAME],
      lastModifyTime: new Date().getTime(),
      indexImage: canvasImage.toDataURL(),
      state: chartEditStore.getProjectInfo[ProjectInfoEnum.RELEASE],
    }
    if (id && isNotEmptyGuid(id) && action == 'edit') {
      const createTime = chartEditStore.getProjectInfo[ProjectInfoEnum.CREATETIME]
      const createUserId = chartEditStore.getProjectInfo[ProjectInfoEnum.CREATEUSERID]
      // 创建人ID
      const res = await saveOneProjectLargeScreenApi({ ...params, ID: projectId, id: projectId, createTime, createUserId }) as unknown as ApiResponseType
      if (res && res.IsOk) {
        // 成功状态
        setTimeout(() => {
          chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.SUCCESS)
        }, 1000)
        window['$message'].success('保存成功!')
        return
      }
      // 失败状态
      chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.FAILURE)
      window['$message'].error('保存失败!')
    } else { // 克隆和新建
      const userid = systemStore.getUserInfo.userId
      const res = await createProjectLargeScreenApi({ ...params, createTime: new Date().getTime() + '', createUserId: userid }) as unknown as ApiResponseType
      if (res && res.IsOk) {
        chartEditStore.setProjectInfo(ProjectInfoEnum.PROJECT_ID, res.Response)
        // 成功状态
        setTimeout(() => {
          chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.SUCCESS)
        }, 1000)
        window['$message'].success('创建成功!')
        const path = fetchPathByName(ChartEnum.CHART_HOME_NAME, 'fullPath')
        const id = res.Response + '?action=edit'
        routerTurnByPathAndParams(path, [id], true)
        return
      }
      // 失败状态
      chartEditStore.setEditCanvas(EditCanvasTypeEnum.SAVE_STATUS, SyncEnum.FAILURE)
      window['$message'].error('保存失败!')
    }
  }, 3000)

  // * 定时处理
  const intervalDataSyncUpdate = () => {
    // 定时获取数据
    const syncTiming = setInterval(() => {
      dataSyncUpdate()
    }, saveInterval * 1000)

    // 销毁
    onUnmounted(() => {
      clearInterval(syncTiming)
    })
  }

  return {
    updateComponent,
    updateStoreInfo,
    dataSyncFetch,
    dataSyncUpdate,
    intervalDataSyncUpdate
  }
}
