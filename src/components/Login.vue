<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像部分 -->
      <div class="avatar_box">
        <img src="../assets/logo.png"
             alt="">
      </div>
      <!-- 表单部分 -->
      <el-form ref="loginFormRef"
               :model="loginForm"
               :rules="loginFormRules"
               label-width="0px"
               class="login_form">
        <!-- 用户 -->
        <el-form-item prop="username">
          <el-input v-model="loginForm.username"
                    prefix-icon="iconfont icon-user"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password"
                    prefix-icon="iconfont icon-3702mima"
                    type="password"></el-input>
        </el-form-item>
        <!-- 按钮 -->
        <el-form-item class="btns">
          <el-button @click="login"
                     type="primary">登录 </el-button>
          <el-button type="info"
                     @click="loginFormReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>
<script>
export default {
  data () {
    return {
      // 表单绑定数据对象
      loginForm: {
        username: 'alon',
        password: '123456'
      },
      // 表单规则验证对象
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名称', trigger: 'blur' },
          { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 18, message: '长度在 6 到 18 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 重置按钮事件
    loginFormReset () {
      this.$refs.loginFormRef.resetFields()
    },
    // 登录按钮事件 登录处理
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        // eslint-disable-next-line no-useless-return
        if (!valid) return
        let { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')

        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;
}
.login_box {
  height: 300px;
  width: 450px;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  .avatar_box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    img {
      height: 100%;
      width: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login_form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
