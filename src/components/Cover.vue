<template>
  <div
    class="cover"
    :style="{ width: width - 10 + 'px', height: width - 10 + 'px' }"
  >
    <img v-if="cover" :src="proxy.$globalInfo.fileUrl + cover" />
    <img v-else src="../assets/default_cover.png" />
  </div>
</template>

<script setup>
import { getCurrentInstance } from 'vue'

const { proxy } = getCurrentInstance()
const props = defineProps({
  cover: {
    type: String
  },
  width: { type: Number, default: 100 }
})
</script>

<style lang="less" scoped>
.cover {
  display: flex;
  align-items: center;
  background-color: #ddd;
  border-radius: 3px;
  overflow: hidden;
  img {
    width: auto;
    height: auto;
    max-width: 100%;
    // max-height: 100%;
    overflow: hidden;
  }
}
</style>
