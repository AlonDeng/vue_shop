<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 信息提示 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="内容"></el-step>
      </el-steps>
      <!-- tabs栏区域 -->
      <!-- 表单标签 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeLeave"
          @tab-click="tabClicked"
        >
          <!-- 基本信息 -->
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input type="number" v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input type="number" v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input type="number" v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <!-- 级联选择器 -->
              <el-cascader
                expand-trigger="hover"
                v-model="addForm.goods_cat"
                :options="cateList"
                :props="CateProps"
                @change="cateHandleChange"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品参数 -->
          <el-tab-pane label="商品参数" name="1">
            <!-- 参数列表渲染 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in manyParamsList"
              :key="item.attr_id"
            >
              <!-- 复选框渲染 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="name" v-for="(name,i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品属性 -->
          <el-tab-pane label="商品属性" name="2">
            <!-- 参数列表渲染 -->
            <el-form-item
              :label="item.attr_name"
              v-for="item in onlyParamsList"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <!-- 商品图片 -->
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <!-- 商品内容 -->
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewURL" alt class="previewImg" />
    </el-dialog>
  </div>
</template>
<script>
import _ from 'lodash'

export default {
  data() {
    return {
      // tabs栏标签属性
      activeIndex: '0',
      // 添加表单数据
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 添加表单规则对象
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        goods_cat: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      cateList: [],

      CateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 动态参数列表数组
      manyParamsList: [],
      // 静态参数列表数组
      onlyParamsList: [],
      // 图片上传路径
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置图片上传的请求头
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览对话框的显示与隐藏
      previewDialogVisible: false,
      // 图片预览路径
      previewURL: ''
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      let { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表失败')
      }
      this.$message.success('获取商品分类列表成功')
      this.cateList = res.data
      //   console.log(res.data)
    },
    // cascader选择器规定选择第三类事件
    cateHandleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
      //   console.log(this.addForm.goods_cat)
    },
    // tags 标签切换事件
    beforeLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品')
        return false
      }
    },
    // tabs 标签切换点击触发事件
    async tabClicked() {
      if (this.activeIndex === '1') {
        let { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'many' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类参数列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals =
            item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyParamsList = res.data
        // console.log(this.manyParamsList)
      } else if (this.activeIndex === '2') {
        let { data: res } = await this.$http.get(
          `categories/${this.cateId}/attributes`,
          {
            params: { sel: 'only' }
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('获取分类参数列表失败')
        }
        this.onlyParamsList = res.data
      }
    },
    // 图片预览处理事件
    handlePreview(file) {
      this.previewURL = file.response.data.url
      this.previewDialogVisible = true
    },
    // 图片删除处理事件
    handleRemove(file) {
      let filePath = file.response.data.tmp_path
      let index = this.addForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      this.addForm.pics.splice(index, 1)
    },
    // 图片上传成功的事件
    handleSuccess(response) {
      let pictureUrl = { pic: response.data.tmp_path }
      this.addForm.pics.push(pictureUrl)
    },
    // 添加商品按钮事件
    add() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('请填写正确的信息')
        }
        let form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 动态参数
        this.manyParamsList.forEach(item => {
          let newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })
        // 静态属性
        this.onlyParamsList.forEach(item => {
          let newInfo = {
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs

        // 添加商品请求
        let { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  },
  computed: {
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>
<style lang="less" scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
