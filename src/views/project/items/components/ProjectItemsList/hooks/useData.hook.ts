import { ref, reactive } from 'vue';
import { goDialog, httpErrorHandle } from '@/utils'
import { DialogEnum } from '@/enums/pluginEnum'
import { projectLargeScreenListApi, deleteOneProjectLargeScreenApi, changeProjectReleaseApi } from '@/api/path'
import { Chartype, ChartList } from '../../..'
import { ResultEnum } from '@/enums/httpEnum'

// 数据初始化
export const useDataListInit = () => {

  const loading = ref(true)

  const paginat = reactive({
    // 当前页数 
    page: 1,
    // 每页值
    limit: 2,
    // 总数
    count: 10,
  })

  const list = ref<ChartList>([])

  // 数据请求
  const fetchList = async () => {
    loading.value = true
    const res = await projectLargeScreenListApi() as any
    console.log(res);
    if (res) {
      const { IsOk, Response, ErrorMsg } = res
      if (IsOk) {
        paginat.count = Response && Response.length ? Response.length : 0;
        list.value = Response.map((e: any) => {
          var obj = JSON.parse(e);
          const { id, projectName, state, createTime, indexImage, createUserId, ID } = obj
          return {
            id: ID || id,
            title: projectName,
            createId: createUserId,
            time: createTime,
            image: indexImage,
            release: state !== -1
          }
        })
        setTimeout(() => {
          loading.value = false
        }, 500)
        return
      }
      httpErrorHandle(ErrorMsg)
    }
  }

  // 修改页数
  const changePage = (_page: number) => {
    paginat.page = _page
    fetchList()
  }

  // 修改大小
  const changeSize = (_size: number) => {
    paginat.limit = _size
    fetchList()
  }

  // 删除处理
  const deleteHandle = (cardData: Chartype) => {
    console.log(cardData)
    goDialog({
      type: DialogEnum.DELETE,
      promise: true,
      onPositiveCallback: () => new Promise(res => {
        res(deleteOneProjectLargeScreenApi(cardData.id as string))
      }),
      promiseResCallback: (res: any) => {
        if (res.code === ResultEnum.SUCCESS) {
          window['$message'].success(window['$t']('global.r_delete_success'))
          fetchList()
          return
        }
        httpErrorHandle()
      }
    })
  }

  // 发布处理
  const releaseHandle = async (cardData: Chartype, index: number) => {
    const { id, release } = cardData
    const res = await changeProjectReleaseApi({
      id: id,
      // [-1未发布, 1发布]
      state: !release ? 1 : -1
    }) as unknown as MyResponseType
    if (res.code === ResultEnum.SUCCESS) {
      list.value = []
      fetchList()
      // 发布 -> 未发布
      if (release) {
        window['$message'].success(window['$t']('global.r_unpublish_success'))
        return
      }
      // 未发布 -> 发布
      window['$message'].success(window['$t']('global.r_publish_success'))
      return
    }
    httpErrorHandle()
  }

  // 立即请求
  fetchList()

  return {
    loading,
    paginat,
    list,
    fetchList,
    releaseHandle,
    changeSize,
    changePage,
    deleteHandle
  }
}
