<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数" show-icon :closable="false" type="warning"></el-alert>
      <!-- 级联选择器 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 级联选择框 -->
          <el-cascader
            v-model="selectedCateId"
            :options="cateList"
            :props="{ expandTrigger: 'hover',label: 'cat_name',value: 'cat_id',hildren: 'children'}"
            @change="cascaderChange"
            popper-class="pop"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tabs标签页 -->
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <!-- 动态参数标签页 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >动态参数</el-button>
          <!-- 动态参数列表 -->
          <el-table :data="manyParamsList" border stripe>
            <el-table-column type="expand">
              <!-- <el-tag v-for="(item,in) in manyParamsList.attr_vals" :key="in"></el-tag> -->
              <!-- 循环渲染tag标签 -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClosed(i,scope.row)"
                >{{item}}</el-tag>
                <!-- tag标签与文本框的切换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!--静态属性标签页  -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            @click="addDialogVisible = true"
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
          >静态属性</el-button>
          <!-- 静态属性列表 -->
          <el-table :data="onlyParamsList" border stripe>
            <el-table-column type="expand">
              <!-- 循环渲染tag标签 -->
              <template slot-scope="scope">
                <el-tag
                  v-for="(item,i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClosed(i,scope.row)"
                >{{item}}</el-tag>
                <!-- tag标签与文本框的切换 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  size="mini"
                  type="primary"
                  icon="el-icon-edit"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  size="mini"
                  type="danger"
                  icon="el-icon-delete"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addFormData">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑对话框  -->
    <el-dialog
      :title="'编辑' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editFormData">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 商品分类列表
      cateList: [],
      // 级联选择框的参数配置
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定id
      selectedCateId: [],
      // tabs标签页选择数据
      activeName: 'many',
      // 动态参数列表
      manyParamsList: [],
      // 静态属性列表
      onlyParamsList: [],
      // 对话框显示与隐藏
      addDialogVisible: false,
      // 添加参数对象
      addForm: {
        attr_name: ''
      },
      // 添加参数规则对象
      addFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 编辑对话框显示与隐藏
      editDialogVisible: false,
      // 编辑参数对象
      editForm: {},
      // 编辑参数规则对象
      editFormRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    // 获取商品分类列表
    this.getCateList()
  },
  methods: {
    async getCateList() {
      let { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.cateList = res.data
    },
    // 级联选择框数据改变事件
    async cascaderChange() {
      this.getParamsList()
    },
    // tabs标签页选择事件
    handleClick() {
      this.getParamsList()
      console.log(this.activeName)
    },
    // 获取参数列表事件
    async getParamsList() {
      //   console.log(this.selectedCateId)
      if (this.selectedCateId.length !== 3) {
        this.selectedCateId = []
        this.manyParamsList = []
        this.onlyParamsList = []
        // eslint-disable-next-line no-useless-return
        return
      }
      let { data: res } = await this.$http.get(
        `categories/${this.getCateID}/attributes`,
        {
          params: { sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      }
      //   console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // tag标签与文本框的切换
        item.inputVisible = false
        // 文本框传值
        item.inputValue = ''
      })
      //   console.log(res.data)
      if (this.activeName === 'many') {
        this.manyParamsList = res.data
        // console.log(this.manyParamsList.attr_vals)
      } else {
        this.onlyParamsList = res.data
        // console.log(this.onlyParamsList.attr_vals)
      }
    },
    // 添加参数事件
    addFormData() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        let { data: res } = await this.$http.post(
          `categories/${this.getCateID}/attributes`,
          {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.getParamsList()
        this.addDialogVisible = false
      })
    },
    // 添加对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 编辑对话框展示
    async showEditDialog(id) {
      let { data: res } = await this.$http.get(
        `categories/${this.getCateID}/attributes/${id}`,
        {
          params: { attr_sel: this.activeName }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑参数列表事件
    editFormData() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        let { data: res } = await this.$http.put(
          `categories/${this.getCateID}/attributes/${this.editForm.attr_id}`,
          {
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeName
          }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('编辑提交参数失败')
        }
        this.$message.success('编辑提交参数成功')
        this.getParamsList()
        this.editDialogVisible = false
      })
    },
    // 删除参数事件
    async removeParams(id) {
      let confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)

      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      let { data: res } = await this.$http.delete(
        `categories/${this.getCateID}/attributes/${id}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getParamsList()
    },
    // 显示文本框
    showInput(row) {
      row.inputVisible = true
      // 文本框自动获得焦点
      // $nextTick在DOM对象杯渲染以后触发,会调用回调函数的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 焦点离开和键盘按事件
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        // eslint-disable-next-line no-useless-return
        return
      }
      row.attr_vals.push(row.inputValue)
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVlas(row)
    },
    // 保存attr_vals
    async saveAttrVlas(row) {
      let { data: res } = await this.$http.put(
        `categories/${this.getCateID}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('参数提交失败')
      }
      return this.$message.success('参数提交成功')
    },
    // tag标签关闭事件
    handleClosed(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVlas(row)
    }
    //
  },
  computed: {
    isBtnDisabled() {
      if (this.selectedCateId.length !== 3) {
        return true
      }
      return false
    },
    getCateID() {
      if (this.selectedCateId.length === 3) {
        return this.selectedCateId[2]
      }
      return null
    },
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-tag {
  margin: 15px;
}
.pop {
  height: 204px;
}
.input-new-tag {
  width: 180px;
}
</style>
