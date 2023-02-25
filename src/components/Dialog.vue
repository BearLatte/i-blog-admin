<template>
  <div>
    <el-dialog
      v-model="isShowDeialog"
      class="cust-dialog"
      :show-close="isShowClose"
      :draggable="isDialogDraggable"
      :close-on-click-modal="false"
      :title="title"
      :top="top"
      :width="width"
      :showCancel="isShowCancel"
      @close="close"
    >
      <div class="dialog-body">
        <slot></slot>
      </div>
      <template #footer v-if="(buttons && buttons.length > 0) || isShowCancel">
        <el-button link @click="close"> 取消 </el-button>
        <el-button
          v-for="btn in buttons"
          :key="btn.btnId"
          :type="btn.type"
          @click="btn.click"
          size="small"
        >
          {{ btn.text }}
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  // 是否显示对话框
  isShow: { type: Boolean, default: false },
  // 是否显示右上角的退出按钮
  isShowClose: { type: Boolean, default: true },
  // 是否显示底部取消按钮
  isShowCancel: { type: Boolean, default: true },
  // 标题
  title: { type: String, default: '' },
  // 是否可以拖拽对话框
  isDialogDraggable: { type: Boolean, default: false },
  // 顶部距离
  top: { type: String, default: '50px' },
  // 对话框宽度
  width: { type: String, default: '50%' },
  // 对话框底部按钮
  buttons: { type: Array },
  closeCallback: {
    type: Function
  }
})

const emit = defineEmits()

const isShowDeialog = computed({
  get() {
    return props.isShow
  },
  set(val) {
    emit('update:isShow', val)
  }
})

const close = () => {
  emit('close')
  if (props.closeCallback) {
    props.closeCallback()
  }
}
</script>

<style lang="less">
.cust-dialog {
  .el-dialog__body {
    border-top: 1px solid #ddd;
  }
  .el-dialog__footer {
    border-top: 1px solid #ddd;
  }
}
</style>
