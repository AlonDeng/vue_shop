<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 列表 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
        :expand-type="false"
        :selection-type="false"
        class="tree-table"
      >
        <!--  是否有效-->
        <template slot-scope="scope" slot="isok">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color:lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color:red"></i>
        </template>
        <!--排序-->
        <template slot="order" slot-scope="scope">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="handle">
          <el-button type="primary" icon="el-icon-edit">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <el-form :model="addCate" :rules="addCateRules" ref="addCateRef" label-width="100px">
        <!-- 分类名称： -->
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCate.cat_name"></el-input>
        </el-form-item>
        <!-- 父级分类： -->
        <el-form-item label="父级分类：">
          <!-- 级联选择器 -->
          <el-cascader
            expand-trigger="hover"
            :options="parentCateList"
            :props="cascaderProps"
            v-model="selectedCateId"
            @change="parentCateChange"
            clearable
            change-on-select
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateForm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求数据参数
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品列表
      cateList: [],
      total: 0,
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'handle'
        }
      ],
      // 控制添加分类对话框的显示和隐藏
      addCateDialogVisible: false,
      // 添加分类对象
      addCate: {
        cat_pid: 0,
        cat_name: '',
        cat_level: 0
      },
      // 添加分类对象规则
      addCateRules: {
        cat_name: [
          { required: true, message: '请输入分类对象', trigger: 'blur' }
        ]
      },
      // 父级分类对象列表
      parentCateList: [],
      // 级联选择器的父级分类id
      selectedCateId: [],
      // 级联选择器props配置项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name'
        // children: 'children'
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取数据列表
    async getCateList() {
      let { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表失败')
      }
      //   console.log(res.data)
      this.cateList = res.data.result
      this.total = res.data.total
      //   console.log(this.totle)
    },
    // 改变数据条数功能
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 改变当前页功能
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 分类对话框事件
    showAddCateDialog() {
      this.addCateDialogVisible = true
      this.getParentCateList()
    },
    // 获取父级商品分类
    async getParentCateList() {
      let { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级列表出错')
      }
      console.log(res.data)
      this.parentCateList = res.data
      console.log(this.parentCateList)
    },
    // 级联选择器触发事件
    parentCateChange() {
      if (this.selectedCateId.length > 0) {
        let pid = this.selectedCateId[this.selectedCateId.length - 1]
        this.addCate.cat_pid = pid
        this.addCate.cat_level = this.selectedCateId.length
      } else {
        this.addCate.cat_level = 0
        this.addCate.cat_pid = 0
      }
      console.log(this.selectedCateId)
    },
    // 添加父级分类事件
    addCateForm() {
      //   console.log(this.addCate)
      this.$refs.addCateRef.validate(async valid => {
        if (!valid) return
        let { data: res } = await this.$http.post('categories', this.addCate)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 对话框关闭事件
    addCateDialogClosed() {
      this.$refs.addCateRef.resetFields()
      this.selectedCateId = []
      this.addCate.cat_pid = 0
      this.addCate.cat_level = 0
    }
  }
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
.tree-table {
  margin-top: 15px;
}
</style>
