<template>
  <div class="go-project-template-market">
    <n-button ghost type="primary" @click="openDrawer('new')">
      <template #icon>
        <n-icon>
          <DuplicateOutlineIcon v-show="designStore.getDarkTheme"></DuplicateOutlineIcon>
          <DuplicateIcon v-show="!designStore.getDarkTheme"></DuplicateIcon>
        </n-icon>
      </template>
      <span>
        {{ $t('project.create_btn') }}
      </span>
    </n-button>
    <!-- 加载 -->
    <div v-show="loading">
      <go-loading></go-loading>
    </div>
    <!-- 表格 -->
    <!-- <n-data-table
    :columns="columns"
    :data="list"
    :pagination="pagination"
    :row-key="rowKey"
    @update:checked-row-keys="handleCheck"
  /> -->
    <!-- <n-space vertical>
      <n-image object-fit="contain" height="300" preview-disabled :src="requireErrorImg()"></n-image>
      <n-h3>暂时还没有东西呢</n-h3>
    </n-space> -->
    <!-- model -->
    <drawer-box
      v-model:drawerShow="drawerShow"
      :drawerData="drawerData"
      :drawerAction="drawerAction"
      @close="closeDrawer"
    ></drawer-box>
  </div>
</template>

<script setup lang="ts">
import { requireErrorImg } from '@/utils'
import { DrawerBox } from './components/DrawerBox/index'

import { useDataListInit } from './hooks/templateMarket.hook'
import { useDesignStore } from '@/store/modules/designStore/designStore'
import { icon } from '@/plugins'

const { DuplicateIcon, DuplicateOutlineIcon } = icon.ionicons5
const { loading, list, drawerShow, drawerData, drawerAction, closeDrawer, openDrawer } = useDataListInit()

const designStore = useDesignStore()
</script>

<style lang="scss" scoped>
@include go('project-template-market') {
  margin-top: 100px;
  @extend .go-flex-center;
}
</style>
