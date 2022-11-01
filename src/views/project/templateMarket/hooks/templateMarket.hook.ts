import { ref } from 'vue';
import { fetchLargeScreenBoxListApi } from '@/api/path'
import { httpErrorHandle } from '@/utils'
import { fetchPathByName, routerTurnByPathAndParams, downloadTextFile, openNewWindow, previewPath } from '@/utils'
import { LargeScreenBoxType, LargeScreenBoxList } from '..'
import { ChartEnum } from '@/enums/pageEnum'

// 数据初始化
export const useDataListInit = () => {
  // const loading = ref(true)
  const loading = ref(false)
  const list = ref<LargeScreenBoxList>([])
  const drawerShow = ref<boolean>(false)
  const drawerData = ref<LargeScreenBoxType | null>(null)
  const drawerAction = ref<string>('')
  // 数据请求
  const fetchList = async () => {
    loading.value = true
    const res = await fetchLargeScreenBoxListApi() as any
    if (res) {
      const { IsOk, Response, ErrorMsg } = res
      if (IsOk) {
        list.value = Response.map((item: any) => {
          return item
        })
        setTimeout(() => {
          loading.value = false
        }, 500)
        return
      }
      loading.value = false
      httpErrorHandle(ErrorMsg)
      return
    }
    loading.value = false
    httpErrorHandle('无权限或超时')
  }

  // 打开抽屉
  const openDrawer = (action: string, data: LargeScreenBoxType | null) => {
    console.log(123)
    if (!action) return
    drawerShow.value = true
    drawerAction.value = action
    drawerData.value = {
      NavItems: [],
      IsShowName: false,
      IsShowIcon: true,
      LeftWidth: 20,
    } as LargeScreenBoxType//action data
  }

  // 关闭 modal
  const closeDrawer = () => {
    drawerShow.value = false
    drawerData.value = null
    drawerAction.value = ''
  }

  // 立即请求
  // fetchList()

  return {
    loading,
    list,
    drawerShow,
    drawerData,
    drawerAction,
    fetchList,
    closeDrawer,
    openDrawer
  }
}
