import { ref } from 'vue'
import { ChartEnum } from '@/enums/pageEnum'
import { fetchPathByName, routerTurnByPath, openNewWindow, previewPath, downloadTextFile, httpErrorHandle, routerTurnByPathAndParams } from '@/utils'
import { Chartype } from '../../../index.d'
// 接口
import { saveOneProjectLargeScreenApi } from '@/api/path'

export const useModalDataInit = () => {
  const modalShow = ref<boolean>(false)
  const modalData = ref<Chartype | null>(null)

  const modalRenameShow = ref<boolean>(false)

  // 关闭 modal
  const closeModal = () => {
    modalShow.value = false
    modalData.value = null
  }

  // 缩放处理
  const resizeHandle = (cardData: Chartype) => {
    if (!cardData) return
    modalShow.value = true
    modalData.value = cardData
  }

  // 编辑处理
  const editHandle = (cardData: Chartype) => {
    if (!cardData) return
    const path = fetchPathByName(ChartEnum.CHART_HOME_NAME, 'fullPath')
    const id = cardData.id + '?action=edit'
    routerTurnByPathAndParams(path, [id])
    if (modalShow.value) {
      closeModal()
    }
  }

  // 预览处理
  const previewHandle = (cardData: Chartype) => {
    openNewWindow(previewPath(cardData.id))
  }

  // 下载json处理
  const downloadHandle = (cardDate: Chartype) => {
    downloadTextFile(cardDate.content, cardDate.title, 'json')
  }

  // 拷贝处理
  const cloneHandle = (cardData: Chartype) => {
    if (!cardData) return
    const path = fetchPathByName(ChartEnum.CHART_HOME_NAME, 'fullPath')
    const id = cardData.id + '?action=copy';
    routerTurnByPathAndParams(path, [id])
  }

  const openRenameModal = (cardData: Chartype) => {
    if (!cardData) return
    modalRenameShow.value = true
    modalData.value = cardData
  }

  // 关闭 modal
  const closeRenameModal = () => {
    modalRenameShow.value = false
    modalData.value = null
  }

  const renameHandle = async (cardData: Chartype, renameTtile: string) => {
    console.log('重命名')
    if (!cardData) return
    console.log(cardData)
    const params = {
      id: cardData.id,
      ID: cardData.id,
      projectName: renameTtile,
      lastModifyTime: new Date().getTime(),
      indexImage: cardData.image
    }
    const res = await saveOneProjectLargeScreenApi(params) as unknown as ApiResponseType

    if (res && res.IsOk) {
      window['$message'].success('保存成功!')
      closeRenameModal()
    } else {
      httpErrorHandle(res?.ErrorMsg)
    }
  }



  return {
    modalData,
    modalShow,
    modalRenameShow,
    closeModal,
    resizeHandle,
    editHandle,
    previewHandle,
    downloadHandle,
    cloneHandle,
    openRenameModal,
    closeRenameModal,
    renameHandle
  }
}
