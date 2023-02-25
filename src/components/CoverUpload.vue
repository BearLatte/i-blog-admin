<template>
  <el-upload
    name="file"
    :show-file-list="false"
    accept=".png,.PNG,.jpg,.JPG,.jpeg,.JPEG,.git,.GIF,.bmp,.BMP"
    :multiple="false"
    :http-request="uploadImage"
  >
    <el-button class="cover-upload-btn" @click="chooseImgBtnClicked">
      <template v-if="modelValue">
        <img :src="proxy.$globalInfo.fileUrl + modelValue" class="coverImage" />
      </template>
      <span class="iconfont icon-add-bold" v-else></span>
    </el-button>
  </el-upload>
</template>

<script setup>
import { getCurrentInstance, ref } from 'vue'
// 传参
const props = defineProps({
  modelValue: String,
  default: null
})

const uploadBtnRef = ref()

const emit = defineEmits()

const { proxy } = getCurrentInstance()
const uploadImage = async (fileData) => {
  const result = await proxy.$request({
    url: 'file/upload',
    method: 'POST',
    dataType: 'file',
    params: {
      file: fileData.file
    }
  })
  proxy.$message.success(result.message)
  emit('update:modelValue', result.data)
  emit('callback')
}

const chooseImgBtnClicked = (event) => {
  proxy.$func.unFocus(event)
}
</script>

<style lang="less" scoped>
.cover-upload-btn {
  width: 150px;
  height: 150px;
  background-image: url(../assets/cover_bg.jpg);
  background-size: cover;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  overflow: hidden;

  .coverImage {
    width: 100%;
  }
  .iconfont {
    font-size: 50px;
    color: #555;
  }
}
</style>
