<template>
  <div class="project-my-template go-items-list">
    <!-- 加载 -->
    <div v-show="loading">
      <go-loading></go-loading>
    </div>
    <!-- 列表 -->
    <div v-show="!loading && list && list.length > 0">
      <n-grid :x-gap="20" :y-gap="20" cols="2 s:2 m:3 l:4 xl:4 xxl:4" responsive="screen">
        <n-grid-item v-for="(cardData, index) in list" :key="cardData.id">
          <div v-if="cardData" class="go-items-list-card">
            <n-card hoverable size="small">
              <div class="list-content">
                <!-- 顶部按钮 -->
                <div class="list-content-top">
                  <mac-os-control-btn
                    class="top-btn"
                    :hidden="['remove', 'close']"
                    @resize="resizeHandle(cardData)"
                  ></mac-os-control-btn>
                </div>
                <!-- 中间 -->
                <div class="list-content-img" @click="resizeHandle(cardData)">
                  <n-image
                    object-fit="contain"
                    height="180"
                    preview-disabled
                    :src="`${cardData.image}`"
                    :alt="cardData.projectName"
                    :fallback-src="requireErrorImg()"
                  ></n-image>
                </div>
              </div>
              <template #action>
                <div class="go-flex-items-center list-footer" justify="space-between">
                  <n-text class="go-ellipsis-1">
                    {{ cardData.projectName || cardData.id || '未命名' }}
                  </n-text>
                  <!-- 工具 -->
                  <div class="go-flex-items-center list-footer-ri">
                    <n-space>
                      <n-dropdown
                        trigger="hover"
                        placement="bottom"
                        :options="selectOptions"
                        :show-arrow="true"
                        @select="handleSelect($event, cardData)"
                      >
                        <n-button size="small">
                          <template #icon>
                            <component :is="renderIcon(EllipsisHorizontalCircleSharpIcon)"></component>
                          </template>
                        </n-button>
                      </n-dropdown>
                    </n-space>
                    <!-- end -->
                  </div>
                </div>
              </template>
            </n-card>
          </div>
        </n-grid-item>
      </n-grid>
    </div>
    <n-space vertical v-if="!list || (list && list.length == 0)">
      <n-image object-fit="contain" height="300" preview-disabled :src="requireErrorImg()"></n-image>
      <n-h3>暂时还没有东西呢</n-h3>
    </n-space>
    <!-- model -->
    <template-items-modal-card
      v-if="modalData"
      v-model:modalShow="modalShow"
      :cardData="modalData"
      @close="closeModal"
    ></template-items-modal-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, PropType } from 'vue'
import { TemplateItemsModalCard } from './components/ProjectItemsModalCard/index'
import { MacOsControlBtn } from '@/components/Tips/MacOsControlBtn'
import { icon } from '@/plugins'
import { useDataListInit } from './hooks/templateData.hook'
import { renderIcon, renderLang, requireErrorImg } from '@/utils'
import { Chartype } from './'

const { EllipsisHorizontalCircleSharpIcon, CopyIcon, DownloadIcon, BrowsersOutlineIcon } = icon.ionicons5
const { loading, list, cloneHandle, downloadHandle, previewHandle, resizeHandle, modalShow, modalData, closeModal } =
  useDataListInit()

const fnBtnList = reactive([
  {
    lable: renderLang('global.r_more'),
    key: 'select',
    icon: renderIcon(EllipsisHorizontalCircleSharpIcon)
  }
])

const selectOptions = ref([
  {
    label: renderLang('global.r_preview'),
    key: 'preview',
    icon: renderIcon(BrowsersOutlineIcon)
  },
  {
    label: renderLang('global.r_copy'),
    key: 'copy',
    icon: renderIcon(CopyIcon)
  },
  {
    label: renderLang('global.r_download'),
    key: 'download',
    icon: renderIcon(DownloadIcon)
  }
])

const handleSelect = (key: string, cardData: Chartype) => {
  switch (key) {
    case 'preview':
      previewHandle(cardData)
      break
    case 'download':
      downloadHandle(cardData)
      break
    case 'copy':
      cloneHandle(cardData)
      break
  }
}
</script>

<style lang="scss" scoped>
$contentHeight: 250px;
@include go('items-list') {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: calc(100vh - #{$--header-height} - 40px - 2px);
  .list-pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
@include go('items-list-none') {
  margin-top: 100px;
  @extend .go-flex-center;
}

$cardContentHeight: 180px;
@include go('items-list-card') {
  position: relative;
  border-radius: $--border-radius-base;
  border: 1px solid rgba(0, 0, 0, 0);
  @extend .go-transition;
  &:hover {
    @include hover-border-color('hover-border-color');
  }
  .list-content {
    margin-top: 20px;
    margin-bottom: 5px;
    cursor: pointer;
    border-radius: $--border-radius-base;
    @include background-image('background-point');
    @extend .go-point-bg;
    &-top {
      position: absolute;
      top: 10px;
      left: 10px;
      height: 22px;
    }
    &-img {
      height: $cardContentHeight;
      @extend .go-flex-center;
      @extend .go-border-radius;
      @include deep() {
        img {
          @extend .go-border-radius;
        }
      }
    }
  }
  .list-footer {
    flex-wrap: nowrap;
    justify-content: space-between;
    line-height: 30px;
    &-ri {
      justify-content: flex-end;
      min-width: 180px;
    }
  }
}
</style>
