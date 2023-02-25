<template>
  <el-button
    type="danger"
    @click="showDialog('add')"
    v-if="store.state.userInfo.roleType !== 2"
  >
    新增分类
  </el-button>
  <Table
    :columns="columns"
    :showPagination="false"
    :dataSource="tableData"
    :fetch="loadDataList"
    class="category-table"
  >
    <template #cover="{ row }">
      <Cover :cover="row.cover"></Cover>
    </template>
    <template #op="{ index, row }">
      <template v-if="store.state.userInfo.roleType !== 2">
        <a
          href="javascript:void(0)"
          :class="[row.id === 1 ? 'not-allow' : 'a-link']"
          @click="showDialog('update', row)"
        >
          修改
        </a>
        <el-divider direction="vertical" />
        <a
          href="javascript:void(0)"
          :class="[row.id === 1 ? 'not-allow' : 'a-link']"
          @click="deleteCategory(row)"
        >
          删除
        </a>
        <el-divider direction="vertical" />
        <a
          href="javascript:void(0)"
          :class="[index === 0 ? 'not-allow' : 'a-link']"
          @click="changeSort(row, index, 'up')"
        >
          上移
        </a>
        <el-divider direction="vertical" />
        <a
          href="javascript:void(0)"
          :class="[
            index === tableData.list.length - 1 ? 'not-allow' : 'a-link'
          ]"
          @click="changeSort(row, index, 'down')"
        >
          下移
        </a>
      </template>
      <template v-else> --- </template>
    </template>
  </Table>
  <Dialog
    width="500px"
    :isShow="dialogConfig.isShow"
    :title="dialogConfig.title"
    :buttons="dialogConfig.buttons"
    @close="dialogConfig.isShow = false"
  >
    <el-form
      label-width="80"
      :model="categoryFormData"
      :rules="categoryFormRules"
      ref="categoryFormRef"
      @submit.prevent
    >
      <el-form-item label="名称" prop="categoryName">
        <el-input
          v-model="categoryFormData.categoryName"
          placeholder="请输入分类名称"
          @keyup.enter="null"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="封面" prop="cover">
        <CoverUpload v-model="categoryFormData.cover"></CoverUpload>
      </el-form-item>
      <el-form-item label="简介" prop="categoryDesc">
        <el-input
          type="textarea"
          :autosize="{ minRows: 4, maxRows: 4 }"
          placeholder="请输入分类简介"
          v-model="categoryFormData.categoryDesc"
        >
        </el-input>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script setup>
import { useStore } from 'vuex'
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'

const store = useStore()
const { proxy } = getCurrentInstance()
// 接口
const api = {
  category: '/category',
  sort: 'category/sort'
}

// 表格列数据
const columns = [
  {
    label: '封面',
    prop: 'cover',
    width: 116,
    scopedSlots: 'cover'
  },
  {
    label: '名称',
    prop: 'categoryName',
    width: 200
  },
  {
    label: '简介',
    prop: 'categoryDesc'
  },
  {
    label: '用户',
    prop: 'nickName',
    width: 100
  },
  {
    label: '博客数量',
    prop: 'blogCount',
    width: 100
  },
  {
    label: '操作',
    prop: '',
    width: 200,
    scopedSlots: 'op'
  }
]

// 分类数据
const tableData = reactive({})
// 表格 ui 配置选项
// const tableOptions = { extHeight: 10 }
// 分类表单数据
const categoryFormData = reactive({})
// 分类表单验证对象
const categoryFormRules = {
  categoryName: [{ required: true, message: '请输入分类名称' }],
  categoryDesc: [{ required: true, message: '请输入分类描述信息' }]
}
const categoryFormRef = ref()
const operationType = ref()

// 方法
const showDialog = async (type, data) => {
  if (type === 'update') {
    if (data.id === 1) return
  }
  dialogConfig.isShow = true
  nextTick(() => {
    categoryFormRef.value.resetFields()
    operationType.value = type
    type === 'add'
      ? (dialogConfig.title = '新增分类')
      : (dialogConfig.title = '修改分类')
    Object.assign(categoryFormData, data)
  })
}

// 加载表格数据方法
const loadDataList = async () => {
  const result = await proxy.$request({
    url: api.category,
    method: 'GET',
    errorCallback: () => {
      proxy.$message.error('获取分类信息失败')
    }
  })
  tableData.list = result.data
}

const dialogConfig = reactive({
  isShow: false,
  buttons: [
    {
      btnId: '1',
      type: 'danger',
      text: '确定',
      click: (e) => {
        proxy.$func.unFocus(e)
        submitForm()
      }
    }
  ]
})

// 发送新增或者修改的网络请求
const submitForm = () => {
  categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      let params = {}
      Object.assign(params, categoryFormData)
      switch (operationType.value) {
        case 'add': {
          const result = await proxy.$request({
            url: api.category,
            method: 'POST',
            params: params
          })
          dialogConfig.isShow = false
          proxy.$message.success(result.message)
          loadDataList()
          break
        }
        case 'update': {
          const result = await proxy.$request({
            url: api.category,
            method: 'PUT',
            params: params
          })
          if (!result) return
          proxy.$message.success(result.message)
          dialogConfig.isShow = false
          loadDataList()
          break
        }
      }
    }
  })
}

// 删除分类方法实现
const deleteCategory = (cate) => {
  if (cate.id === 1) return
  proxy.$confirm(`确定删除名为${cate.categoryName}的分类吗?`, async () => {
    const result = await proxy.$request({
      url: api.category + '/' + cate.id,
      method: 'DELETE'
    })
    if (!result) return
    proxy.$message.success(result.message)
    tableData.list = tableData.list.filter((item) => item.id !== result.data.id)
  })
}

// 排序方法
const changeSort = async (data, index, type) => {
  const categoryList = tableData.list
  if (
    (type === 'down' && index === categoryList.length - 1) ||
    (type === 'up' && index === 0)
  ) {
    return
  }

  let number = type === 'down' ? 1 : -1
  categoryList[index].sort = categoryList[index].sort + number
  categoryList[index + number].sort = categoryList[index + number].sort - number

  const result = await proxy.$request({
    url: api.sort,
    method: 'PUT',
    dataType: 'json',
    params: categoryList
  })
  proxy.$message.success(result.message)
  loadDataList()
}
</script>

<style lang="less" scoped>
.category-table {
  margin-top: 10px;
  height: calc(100vh - 150px);
}
</style>
