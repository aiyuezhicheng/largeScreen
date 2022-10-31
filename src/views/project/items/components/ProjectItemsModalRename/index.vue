<template>
  <!-- mask-closable 暂时是失效的，不知道为啥 -->
  <n-modal class="go-modal-rename-box" v-model:show="modalRenameShow" @afterLeave="closeHandle" title="重命名" preset="dialog">
    <n-input type="text" v-model:value="title"  ref="renameInput"/>
    <template #action>
        <n-button type="primary" @click="renameHandle">确定</n-button>
        <n-button @click="closeHandle">取消</n-button>
    </template>
  </n-modal>  
</template>  

<script setup lang="ts">
import { ref,watchEffect, PropType } from 'vue'
import { Chartype } from '../../index.d'

const emit = defineEmits(['close', 'edit'])

const props = defineProps({
  modalRenameShow: Boolean,
  cardData: Object as PropType<Chartype>
})
const renameInputRef = ref(null)

const title = ref<string>('')
watchEffect(() => {
  title.value = props.cardData?.title || ''
})

// 编辑处理
const renameHandle = () => {
  emit('edit', props.cardData, title.value)
}

// 关闭对话框
const closeHandle = () => {
  emit('close')
}
</script>
<style lang="scss" scoped>
.go-modal-rename-box{
  width:50vw;
  height:100px;
}
</style>>
