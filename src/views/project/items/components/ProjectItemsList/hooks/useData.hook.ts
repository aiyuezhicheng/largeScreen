import { ref, reactive } from 'vue';
import { goDialog, httpErrorHandle } from '@/utils'
import { DialogEnum } from '@/enums/pluginEnum'
import { projectLargeScreenListApi, deleteOneProjectLargeScreenApi, changeProjectReleaseApi, saveOneProjectLargeScreenApi } from '@/api/path'
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
    if (res) {
      const { IsOk, Response, ErrorMsg } = res
      if (IsOk) {
        paginat.count = Response && Response.length ? Response.length : 0;
        list.value = Response.map((e: any) => {
          var obj = JSON.parse(e);
          const { id, projectName, state, createTime, indexImage, createUserId, ID, content, lastModifyTime } = obj
          return {
            id: ID || id,
            title: projectName,
            createId: createUserId,
            time: createTime,
            image: indexImage,
            release: state,
            content: content,
            lastModifyTime: lastModifyTime
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
    if (!cardData) return
    const params = {
      id: cardData.id,
      ID: cardData.id,
      projectName: cardData.title,
      lastModifyTime: new Date().getTime() + '',
      indexImage: cardData.image,
      createTime: cardData.createTime,
      createUserId: cardData.createId,
      content: cardData.content,
      state: !cardData.release
    }
    const res = await saveOneProjectLargeScreenApi(params) as unknown as ApiResponseType
    if (res && res.IsOk) {
      window['$message'].success('修改成功!')
      fetchList()
    } else {
      httpErrorHandle(res?.ErrorMsg)
    }
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
