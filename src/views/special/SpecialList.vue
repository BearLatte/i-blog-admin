<template>
  <el-button
    type="danger"
    @click="showDialog('add')"
    v-if="store.state.userInfo.roleType !== 2"
  >
    新增专题
  </el-button>
  <el-row :gutter="10" :style="{ 'margin-top': '10px' }">
    <el-col :span="14">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>专题</span>
          </div>
        </template>
        <Table
          :columns="columns"
          :showPagination="true"
          :dataSource="tableData"
          :fetch="loadSpecialList"
          :options="tableOptions"
          @rowClick="rowClick"
          ref="specialLisTableRef"
          class="special-list-table"
        >
          <template #cover="{ node, row }">
            <Cover :cover="row.cover" :width="80"></Cover>
          </template>
          <template #op="{ row }">
            <!-- <div class="op">
             
            </div> -->
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
                @click="deleteSpecial(row)"
              >
                删除
              </a>
            </template>
            <template v-else> ---- </template>
          </template>
        </Table>
      </el-card>
    </el-col>
    <el-col :span="10">
      <el-card class="box-card">
        <template #header>
          <div class="card-header">
            <span>专题文章</span>
          </div>
        </template>
        <div style="margin-bottom: 5px">
          <el-alert
            title="温馨提示：拖动文章修改排序, 红色标识表示该博客为草稿状态"
            type="info"
            show-icon
            :closable="false"
            class="el-alert-min-width"
          >
          </el-alert>
        </div>
        <el-tree
          class="tree-panel"
          ref="treeRef"
          :data="treeList"
          defaultExpandAll
          node-key="id"
          :expand-on-click-node="false"
          :props="treeProps"
          :highlight-current="true"
          draggable
          @node-drop="blogDrag"
        >
          <template #default="{ data }">
            <span class="custom-node-style">
              <span class="node-title">
                {{ data.title }}
                <i class="draft-identify" v-show="data.publishStatus === 0">
                </i>
              </span>
              <span class="node-op">
                <template v-if="data.id === -1">
                  <a
                    href="javascript:void(0)"
                    class="a-link"
                    @click="editBlog('add', data)"
                  >
                    新增文章
                  </a>
                </template>
                <template v-else>
                  <a
                    href="javascript:void(0)"
                    class="a-link"
                    @click="showBlogDetail(data)"
                  >
                    预览
                  </a>
                  <el-divider direction="vertical"></el-divider>
                  <template
                    v-if="
                      store.state.userInfo.roleType === 2 &&
                      data.userId !== store.state.userInfo.id
                    "
                  >
                    ----
                  </template>
                  <template v-else>
                    <a
                      href="javascript:void(0)"
                      class="a-link"
                      @click="editBlog('edit', data)"
                    >
                      修改
                    </a>
                    <el-divider direction="vertical"></el-divider>
                    <a
                      href="javascript:void(0)"
                      class="a-link"
                      @click="delBlog(data)"
                    >
                      删除
                    </a>
                  </template>
                  <el-divider direction="vertical"></el-divider>
                  <a
                    href="javascript:void(0)"
                    class="a-link"
                    @click="editBlog('add', data)"
                  >
                    新增下级文章
                  </a>
                </template>
              </span>
            </span>
          </template>
        </el-tree>
      </el-card>
    </el-col>
  </el-row>

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
        ></el-input>
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

  <!-- 编辑页面 -->
  <SpecialBlogEdit ref="specialBlogEditRef" @callback="saveBlogCallback" />
  <SpecialBlogDetail ref="blogDetailRef" />
</template>

<script setup>
import { useStore } from 'vuex'
import { getCurrentInstance, nextTick, reactive, ref } from 'vue'
import SpecialBlogEdit from './SpecialBlogEdit.vue'
import SpecialBlogDetail from './SpecialBlogDetail.vue'

const { proxy } = getCurrentInstance()
const store = useStore()
// 接口
const api = {
  // 专题分类的增删改查
  specialEdit: '/special',
  // 获取树结构的博客列表
  loadSpecialBlogList: '/special/blogs',
  // 专题博客的增删改查，用 restful 区分
  specialBlog: '/special/blog',
  specialBlogSort: '/special/blog/sort'
}

// 表格列数据
const columns = [
  {
    label: '封面',
    prop: 'cover',
    width: 80,
    scopedSlots: 'cover'
  },
  {
    label: '名称',
    prop: 'categoryName',
    width: 100
  },
  {
    label: '简介',
    prop: 'categoryDesc'
  },
  {
    label: '用户',
    prop: 'nickName',
    width: 80
  },
  {
    label: '文章数量',
    prop: 'blogCount',
    width: 100
  },
  {
    label: '操作',
    prop: '',
    width: 90,
    scopedSlots: 'op'
  }
]

// 分类数据
const tableData = reactive({})
// 表格 ui 配置选项
const tableOptions = { extHeight: 130 }
// 主题表格表单数据
const categoryFormData = reactive({})
// 主题表格引用
const specialLisTableRef = ref(null)
// 主题表单验证对象
const categoryFormRules = {
  categoryName: [{ required: true, message: '请输入分类名称' }],
  categoryDesc: [{ required: true, message: '请输入分类描述信息' }]
}
const categoryFormRef = ref(null)
// 区分当前操作是新增还是修改
const operationType = ref()

// 文章树数据
const treeList = ref([])
// 默认选中的主题id
const currentSpecialId = ref(null)
// 属性展示专题
const treeProps = {
  children: 'children',
  label: 'title',
  value: 'blogId'
}
// 主题博客编辑窗口引用
const specialBlogEditRef = ref(null)
// 详情窗口的引用
const blogDetailRef = ref(null)

// 方法
const showDialog = async (type, data) => {
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

// 主题表格行点击响应事件
const rowClick = (row) => {
  currentSpecialId.value = row.id
  loadBlogList()
}

// 加载专题表格数据
const loadSpecialList = async () => {
  const { list, totalCount, status, ...params } = tableData
  const result = await proxy.$request({
    url: api.specialEdit,
    method: 'GET',
    params,
    errorCallback: () => {
      proxy.$message.error('获取分类信息失败')
    }
  })
  if (!result) return

  Object.assign(tableData, result.data)
  if (currentSpecialId.value === null && result.data.list.length > 0) {
    currentSpecialId.value = result.data.list[0].id
    loadBlogList()
  }

  nextTick(() => {
    specialLisTableRef.value.setCurrentRow('id', currentSpecialId.value)
  })
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
        submitEditSpecialForm()
      }
    }
  ]
})

// 发送新增或者修改的网络请求
const submitEditSpecialForm = () => {
  categoryFormRef.value.validate(async (valid) => {
    if (valid) {
      let params = {}
      Object.assign(params, categoryFormData)
      switch (operationType.value) {
        case 'add': {
          const result = await proxy.$request({
            url: api.specialEdit,
            method: 'POST',
            params
          })
          dialogConfig.isShow = false
          proxy.$message.success(result.message)
          loadSpecialList()
          break
        }
        case 'update': {
          const result = await proxy.$request({
            url: api.specialEdit,
            method: 'PUT',
            params
          })
          proxy.$message.success(result.message)
          dialogConfig.isShow = false
          loadSpecialList()
          break
        }
      }
    }
  })
}

// 删除专题方法实现
const deleteSpecial = (data) => {
  if (data.id === 1) return
  proxy.$confirm(
    `确定删除名为<strong style="color: orange">${data.categoryName}</strong>的专题吗?`,
    async () => {
      const result = await proxy.$request({
        url: api.specialEdit + '/' + data.id,
        method: 'DELETE'
      })
      proxy.$message.success(result.message)
      currentSpecialId.value = null
      loadSpecialList()
    }
  )
}

// 树的方法
// 获取专题文章列表
const loadBlogList = async () => {
  const result = await proxy.$request({
    url: api.loadSpecialBlogList + '/' + currentSpecialId.value,
    method: 'GET'
  })
  console.log(result)
  treeList.value = result.data
}

// 编辑专题博客的方法实现
const editBlog = (type, data) => {
  specialBlogEditRef.value.init(type, data)
}

const saveBlogCallback = () => {
  loadBlogList()
}

// 删除单条博客
const delBlog = async (data) => {
  proxy.$confirm(
    `确定删除名为<strong style="color: orange">${data.title}</strong>的专题吗?`,
    async () => {
      const result = await proxy.$request({
        url: api.specialBlog + '/' + data.id,
        method: 'DELETE'
      })

      if (!result) return
      proxy.$message.success(result.message)
      loadBlogList()
    }
  )
}

// 显示博客详情
const showBlogDetail = (data) => {
  blogDetailRef.value.showDetail(data)
}

// 拖动改变排序，修改父级
const blogDrag = async (draggingNode, dropNode, dropType, ev) => {
  let parentNode = null
  if (dropType === 'inner') {
    // 拖入某个节点内，修改父级节点为目标节点，同时修改目标节点下的所有子节点的排序
    parentNode = dropNode
  } else {
    // 拖入之前，修改被拖动的节点的父节点为目标节点，同时修改目标节点父节点下所有的子节点的排序
    parentNode = dropNode.parent
  }

  // 操作节点的id
  const blogId = draggingNode.data.id
  // 父节点的id
  const pBlogId = parentNode.data.id
  // 父节点的所有子节点的id
  const blogIds = []
  parentNode.childNodes.forEach((element) => {
    blogIds.push(element.data.id)
  })

  if (blogIds.indexOf(-1) !== -1) {
    proxy.$message.error('必须保证有且仅有一个根节点')
    loadBlogList()
    return
  }

  let params = {
    blogId,
    pBlogId,
    blogIds: blogIds.join(',')
  }
  const result = await proxy.$request({
    url: api.specialBlogSort,
    method: 'PUT',
    params
  })
  if (!result) return
  proxy.$message.success(result.message)
  loadBlogList()
}
</script>

<style lang="less" scoped>
.special-list-table {
  height: calc(100vh - 244px);
}

.el-alert-min-width {
  min-width: 440px;
}

:deep(.el-alert__title) {
  line-height: 30px;
}

.tree-panel {
  height: calc(100vh - 295px);
  overflow: auto;
  .custom-node-style {
    display: flex;
    flex: 1;
    justify-content: space-between;
    .node-title {
      position: relative;
      font-size: 12px;
      line-height: 20px;
      .draft-identify {
        position: absolute;
        top: 2px;
        right: -7px;
        content: '';
        width: 6px;
        height: 6px;
        border: 1px solid #ddd;
        border-radius: 50%;
        background-color: rgb(245, 94, 94);
      }
    }

    .el-divider--vertical {
      margin: 0 3px;
    }
  }
}
</style>
