import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
// 导入路由
import Router from '@/router'
// 引入自定义 icon
import '@/assets/icon/iconfont.css'
// 导入封装的请求实例，作为全局调用
import Request from '@/utils/Request'
// 导入自定义的message弹出框
import Message from '@/utils/Message'
// 导入封装的表格组件
import Table from '@/components/Table.vue'
// 导入封装的封面组件
import Cover from '@/components/Cover.vue'
// 导入封装的弹出框组件
import Dialog from '@/components/Dialog.vue'
// 导入封装的封面上传组件
import CoverUpload from '@/components/CoverUpload.vue'
// 导入封装的消息盒子组件
import Confirm from '@/utils/Confirm'
// 导入封装的面板对象
import Window from '@/components/Window.vue'
// 导入封装的 markdown 编辑器
import MarkdownEditor from '@/components/MarkdownEditor.vue'
// 导入封装的 html 编辑器
import HtmlEditor from '@/components/HtmlEditor.vue'
// 导入自定义函数
import * as Func from '@/utils/func'
// vuex
import store from '@/store'

const app = createApp(App)
app.use(Router)
app.use(store)
// 将请求实例绑定到全局组件上
app.config.globalProperties.$request = Request
// 将弹出框组件挂载到全局中
app.config.globalProperties.$message = Message
// 将封装的消息盒子挂载到全局
app.config.globalProperties.$confirm = Confirm
// 定义全局变量
app.config.globalProperties.$globalInfo = {
  fileUrl: '/files'
}
// 将自定义函数挂载到全局
app.config.globalProperties.$func = Func
// 将封装的表格组件挂载到全局
app.component('Table', Table)
// 将封装的封面组件挂载到全局
app.component('Cover', Cover)
// 将封装的弹出框挂载到全局
app.component('Dialog', Dialog)
// 将封面上传组件挂载到全局
app.component('CoverUpload', CoverUpload)
// 将封装的面板挂载到全局
app.component('Window', Window)
// 将 markdown 编辑器挂载到全局
app.component('MarkdownEditor', MarkdownEditor)
// 将 html 编辑器挂载到全局
app.component('HtmlEditor', HtmlEditor)
app.mount('#app')
