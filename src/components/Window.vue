<template>
  <div class="window" v-if="isShow">
    <div class="title">
      <span class="iconfont icon-back" @click="close"></span>
    </div>
    <div class="body">
      <slot></slot>
    </div>
    <template v-if="(buttons && buttons.length > 0) || showCancel">
      <div class="footer">
        <el-button link @click="close" v-if="showCancel">取消</el-button>
        <el-button
          v-for="btn in buttons"
          :key="btn.btnId"
          :type="btn.type"
          @click="btn.click"
        >
          {{ btn.text }}
        </el-button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 对外暴露方法
const emit = defineEmits(['close'])
const props = defineProps({
  isShow: {
    type: Boolean,
    default: false
  },
  buttons: {
    type: Array
  },
  showCancel: {
    type: Boolean,
    default: true
  }
})

// 隐藏方法
const close = () => {
  emit('close')
}
</script>

<style lang="less" scoped>
.window {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
  z-index: 3;
  background-color: #fff;
  .title {
    height: 50px;
    display: flex;
    align-items: center;
    padding: 10px;
    .icon-back {
      font-size: 30px;
      cursor: pointer;
    }
  }
  .body {
    height: calc(100vh - 70px - 50px - 50px);
    padding: 10px;
    overflow: auto;
  }
  .footer {
    height: 49px;
    text-align: center;
    line-height: 49px;
    border-top: 1px solid #ddd;
  }
}
</style>
