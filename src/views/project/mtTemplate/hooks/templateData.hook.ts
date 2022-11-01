import { ref } from 'vue';
import { fetchPathByName, routerTurnByPathAndParams, downloadTextFile, openNewWindow, previewPath } from '@/utils'
import { Chartype, ChartList } from '..'
import largeScreenTemplate from '../../../../../public/static/largeScreenTemplate.json'
import { ChartEnum } from '@/enums/pageEnum'

// 数据初始化
export const useDataListInit = () => {
  const loading = ref(true)
  const list = ref<ChartList>([])
  const modalShow = ref<boolean>(false)
  const modalData = ref<Chartype | null>(null)

  // 数据请求
  const fetchList = async () => {
    loading.value = true
    if (largeScreenTemplate && largeScreenTemplate.length > 0) {
      list.value = largeScreenTemplate.map((obj: any) => {
        const { id, projectName, indexImage, content } = obj
        return {
          id: id,
          projectName: projectName,
          image: indexImage,
          content: JSON.stringify(content),
        }
      })
      setTimeout(() => {
        loading.value = false
      }, 500)
      return
    }
  }

  //克隆
  const cloneHandle = (cardData: Chartype) => {
    if (!cardData) return
    const path = fetchPathByName(ChartEnum.CHART_HOME_NAME, 'fullPath')
    const id = cardData.id + '?action=copy';
    routerTurnByPathAndParams(path, [id])
  }

  // 下载json处理
  const downloadHandle = (cardDate: Chartype) => {
    downloadTextFile(JSON.stringify(cardDate.content), cardDate.projectName, 'json')
  }

  // 预览
  const previewHandle = (cardData: Chartype) => {
    openNewWindow(previewPath(cardData.id))
  }

  // 缩放处理
  const resizeHandle = (cardData: Chartype) => {
    if (!cardData) return
    modalShow.value = true
    modalData.value = cardData
  }

  // 关闭 modal
  const closeModal = () => {
    modalShow.value = false
    modalData.value = null
  }
  // 立即请求
  fetchList()

  return {
    loading,
    list,
    modalShow,
    modalData,
    fetchList,
    cloneHandle,
    downloadHandle,
    previewHandle,
    resizeHandle,
    closeModal
  }
}
