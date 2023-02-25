<template>
  <div class="settings-panel">
    <el-form
      ref="formDataRef"
      :style="{ width: '50%' }"
      :model="formData"
      :rules="formDataRules"
      label-width="200px"
      :disabled="store.state.userInfo.roleType !== 0"
    >
      <el-form-item label="是否开启评论/留言板" prop="openCommentType">
        <el-radio-group v-model="formData.openCommentType">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
        <!-- <a href="javascript:void(0)" class="info-link link-style">如何开启？</a> -->
      </el-form-item>
      <el-form-item label="是否开启Git Pages" prop="gitPagesType">
        <el-radio-group v-model="formData.gitPagesType">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
        <!-- <a href="javascript:void(0)" class="info-link link-style">如何开启？</a> -->
      </el-form-item>
      <el-form-item label="开启公安备案和ICP备案信息" prop="showICP">
        <el-radio-group v-model="formData.showICP">
          <el-radio :label="1">是</el-radio>
          <el-radio :label="0">否</el-radio>
        </el-radio-group>
      </el-form-item>
      <template v-if="formData.showICP === 1">
        <el-form-item label="ICP备案备案域名" prop="icpDomain">
          <el-input :maxLength="200" v-model="formData.icpDomain" />
        </el-form-item>
        <el-form-item label="ICP备案号" prop="icpNo">
          <el-input :maxLength="100" v-model="formData.icpNo" />
        </el-form-item>
        <el-form-item label="公安备案省份" prop="policeProvince">
          <el-select v-model="formData.policeProvince" clearable showSearch>
            <el-option
              v-for="(item, index) in provinceList"
              :key="index"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="公安备案号" prop="policeNo">
          <el-input :maxLength="100" v-model="formData.policeNo" />
        </el-form-item>
      </template>
      <!-- <el-form-item label="下载静态页面">
        <div>
          <a href="javascript:void(0)" @click="createZip" class="link-style">
            点击下载
          </a>
        </div>
      </el-form-item> -->
      <el-form-item>
        <el-button type="danger" @click="submitForm">保存</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { useStore } from 'vuex'
import { ref, reactive, getCurrentInstance, onMounted } from 'vue'

const store = useStore()
const { proxy } = getCurrentInstance()
const formDataRef = ref(null)
const formData = reactive({})
const formDataRules = {
  openCommentType: [{ required: true, message: '请选择是否开启评论/留言板' }],
  gitPagesType: [{ required: true, message: '请选择是否开启Git Pages' }],
  showICP: [{ required: true, message: '请选择是否展示公安备和ICP备案信息' }],
  icpDomin: [{ required: true, message: '域名不能为空' }],
  icpNo: [{ required: true, message: 'ICP备案号不能为空' }],
  policeProvince: [{ required: true, message: '公安备案省份不能为空' }],
  policeNo: [{ required: true, message: '公安备案号不能为空' }]
}

const provinceList =
  '京,津,冀,晋,蒙,辽,吉,黑,沪,苏,浙,皖,闽,赣,鲁,豫,鄂,湘,粤,桂,琼,川,贵,云,渝,藏,陕,甘,青,宁,新,港,澳'.split(
    ','
  )
const api = {
  settingsEdit: '/settings',
  createZip: '/settings/createZip'
}

onMounted(async () => {
  // 获取设置信息
  const result = await proxy.$request({
    url: api.settingsEdit,
    method: 'GET'
  })
  if (!result) return
  Object.assign(formData, result.data)
})

const submitForm = () => {
  formDataRef.value.validate(async (valid) => {
    if (!valid) return
    const result = await proxy.$request({
      url: api.settingsEdit,
      method: 'PUT',
      params: formData
    })
    if (!result) return
    proxy.$message.success(result.message)
    Object.assign(formData, result.data)
  })
}

// 下载静态页面
const createZip = async () => {
  const result = await proxy.$request({
    url: api.createZip,
    method: 'GET'
  })
  if (!result) return
  document.location.href =
    '/api/file/download/' + result.data + '/' + encodeURI('webpages.zip')
}
</script>

<style lang="less" scoped>
.settings-panel {
  margin: 30px 50px;

  .info-link {
    margin-left: 20px;
  }
  .link-style {
    font-size: 14px;
    text-decoration: none;
    color: #5090ff;
  }
}
</style>
