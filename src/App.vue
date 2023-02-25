<template>
  <el-config-provider :locale="local" :message="config">
    <router-view />
  </el-config-provider>
</template>

<script setup>
import { reactive } from 'vue'
import zhCn from 'element-plus/lib/locale/lang/zh-cn'
const local = zhCn
const config = reactive({ max: 1 })
</script>

<style scoped></style>
