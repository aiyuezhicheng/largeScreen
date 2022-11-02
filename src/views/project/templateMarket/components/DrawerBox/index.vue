<template>
  <div>
    <span>{{ drawerShow }}</span>
    <span>{{ drawerAction }}</span>
    <n-drawer v-model:show="drawerShow" :width="502">
      <n-drawer-content :title="drawerAction == 'new' ? '新建' : '编辑'">
        <n-form ref="formRef" :model="drawerData" :rules="rules" label-placement="left" label-width="auto">
          <n-form-item v-for="(item, index) in drawerData.NavItems" :key="index" :label="`左侧导航${index + 1}`" class="dynamicLeftNavItem">
            <br/>
            来源<n-select
              v-model:value="value"
              :options="[
                { label: '画面', value: 'Graph' },
                { label: '大屏', value: 'BigScreen' },
                { label: '面板', value: 'Panel' }
              ]"
            />
            <n-input v-model:value="item.hobby" clearable />
            <br/>
            <n-button style="margin-left: 12px" @click="removeItem(index)"> 删除 </n-button>
          </n-form-item>
          <n-form-item>
            <n-button attr-type="button" @click="addOneLeftNavItem"> 增加左侧导航 </n-button>
          </n-form-item>
          <n-form-item label="左侧导航是否显示名称" path="checkboxGroupValue">
            <n-checkbox-group v-model:value="drawerData.IsShowName">
              <n-checkbox value="true"> </n-checkbox>
            </n-checkbox-group>
          </n-form-item>
          <n-form-item label="左侧导航是否显示图标" path="checkboxGroupValue">
            <n-checkbox-group v-model:value="drawerData.IsShowIcon">
              <n-checkbox value="true"> </n-checkbox>
            </n-checkbox-group>
          </n-form-item>
          <n-form-item label="左侧导航宽度" path="inputNumberValue">
            <n-input-number v-model:value="drawerData.LeftWidth" />
          </n-form-item>
          <n-form-item label="数据更新间隔（单位：分钟）" path="inputNumberValue">
            <n-input-number v-model:value="drawerData.DataUpdateTime" />
          </n-form-item>
          <n-form-item label="是否发布（如果发布将消耗授权）" path="inputNumberValue">
            <n-input-number v-model:value="drawerData.PageSwitchingTime" />
          </n-form-item>
          <n-form-item label="是否有授权" path="checkboxGroupValue">
            <n-checkbox-group v-model:value="drawerData.HasLicense">
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

// 新增一个左导航项
const addOneLeftNavItem = () => {
  props.drawerData?.NavItems?.push({ hobby: '' })
}
</script>

<style lang="scss" scoped>
</style>
