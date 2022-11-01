<template>
  <div>
    <span>{{ drawerShow }}</span>
    <span>{{ drawerAction }}</span>
    <n-drawer v-model:show="drawerShow" :width="502">
      <n-drawer-content :title="drawerAction == 'new' ? '新建' : '编辑'">
        <n-form ref="formRef" :model="drawerData" :rules="rules" label-placement="left" label-width="auto">
          <n-form-item label="显示名称" path="checkboxGroupValue">
            <n-checkbox-group v-model:value="drawerData.IsShowName">
              <n-checkbox value="true"> </n-checkbox>
            </n-checkbox-group>
          </n-form-item>
          <n-form-item label="显示图标" path="checkboxGroupValue">
            <n-checkbox-group v-model:value="drawerData.IsShowIcon">
              <n-checkbox value="true"> </n-checkbox>
            </n-checkbox-group>
          </n-form-item>
        </n-form>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup lang="ts">
import { reactive, PropType, ref } from 'vue'
// import { renderIcon, renderLang } from '@/utils'
import { FormInst, FormItemInst, FormItemRule, useMessage, FormRules } from 'naive-ui'
import { icon } from '@/plugins'
// import { MacOsControlBtn } from '@/components/Tips/MacOsControlBtn'
import { LargeScreenBoxType } from '../../index.d'

// interface ModelType {
//   IsShowName: string | null
//   password: string | null
//   reenteredPassword: string | null
// }

const { HammerIcon } = icon.ionicons5

const emit = defineEmits(['close', 'save'])

const props = defineProps({
  drawerShow: Boolean,
  drawerData: Object as PropType<LargeScreenBoxType>,
  drawerAction: String
})

const formRef = ref<FormInst | null>(null)

// 关闭对话框
const closeHandle = () => {
  emit('close')
}
</script>

<style lang="scss" scoped>
</style>
