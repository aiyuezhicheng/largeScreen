<template>
  <n-modal v-model:show="modelShow" preset="dialog" :mask-closable="true" @afterLeave="closeHandle"  title="快捷键">
    <n-data-table
    :columns="columns"
    :data="shortcutKeyOptions"
    :max-height="500"
    class="model-content"
  />
     
  </n-modal>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { NIcon ,NButton} from 'naive-ui'
import { icon } from '@/plugins'
import { WinKeyboard, MacKeyboard } from '@/enums/editPageEnum'

const { CloseIcon } = icon.ionicons5

const emit = defineEmits(['update:modelShow'])

defineProps({
  modelShow: Boolean
})
const columns = [
  {
    title: '功能',
    key: 'label'
  },
  {
    title: 'Win 快捷键',
    key: 'win'
  },
  {
    key: 'mac',
    title:'Mac 快捷键'
  }
]

// 快捷键
const shortcutKeyOptions = [
  {
    label: '向上移动',
    win: `${WinKeyboard.CTRL.toUpperCase()} + ↑ `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + ↑ `
  },
  {
    label: '向右移动',
    win: `${WinKeyboard.CTRL.toUpperCase()} + → `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + → `
  },
  {
    label: '向下移动',
    win: `${WinKeyboard.CTRL.toUpperCase()} + ↓ `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + ↓ `
  },
  {
    label: '向左移动',
    win: `${WinKeyboard.CTRL.toUpperCase()} + ← `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + ← `
  },
  {
    label: '锁定',
    win: `${WinKeyboard.CTRL.toUpperCase()} + L `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + L `
  },
  {
    label: '解锁',
    win: `${WinKeyboard.CTRL.toUpperCase()} + ${WinKeyboard.SHIFT.toUpperCase()}+ L `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + ${MacKeyboard.SHIFT.toUpperCase()} + L `
  },
  {
    label: '展示',
    win: `${WinKeyboard.CTRL.toUpperCase()} + H `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + H `
  },
  {
    label: '隐藏',
    win: `${WinKeyboard.CTRL.toUpperCase()} + ${WinKeyboard.SHIFT.toUpperCase()} + H `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + ${MacKeyboard.SHIFT.toUpperCase()} + H `
  },
  {
    label: '删除',
    win: 'Delete'.toUpperCase(),
    mac: `${MacKeyboard.CTRL.toUpperCase()} + Backspace `
  },
  {
    label: '复制',
    win: `${WinKeyboard.CTRL.toUpperCase()} + C `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + C `
  },
  {
    label: '剪切',
    win: `${WinKeyboard.CTRL.toUpperCase()} + X `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + X `
  },
  {
    label: '粘贴',
    win: `${WinKeyboard.CTRL.toUpperCase()} + V `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + V `
  },
  {
    label: '后退',
    win: `${WinKeyboard.CTRL.toUpperCase()} + Z `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + Z `
  },
  {
    label: '前进',
    win: `${WinKeyboard.CTRL.toUpperCase()} + ${WinKeyboard.SHIFT.toUpperCase()} + Z `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + ${MacKeyboard.SHIFT.toUpperCase()} + Z `
  },
  {
    label: '保存',
    win: `${WinKeyboard.CTRL.toUpperCase()} + S `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + S `
  },
  {
    label: '多选',
    win: `${WinKeyboard.CTRL.toUpperCase()} + 🖱️ `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + 🖱️ `
  },
  {
    label: '创建分组',
    win: `${WinKeyboard.CTRL.toUpperCase()} + G / 🖱️ `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + G / 🖱️`
  },
  {
    label: '解除分组',
    win: `${WinKeyboard.CTRL.toUpperCase()} + ${WinKeyboard.SHIFT.toUpperCase()} + G `,
    mac: `${MacKeyboard.CTRL.toUpperCase()} + ${WinKeyboard.SHIFT.toUpperCase()} + G `
  }
]
const closeHandle = () => {
  emit('update:modelShow', false)
}
</script>

<style lang="scss" scoped>
</style>
