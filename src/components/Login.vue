<template>
  <div class="login_container">
    <div class="login_box">
        <div class="avatar_box">
          <img src="../assets/img/tx.png" alt="">
        </div>
        <!-- 登陆表单 -->
        <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login_form">
          <!-- 用户名 -->
          <el-form-item prop="username">
             <el-input v-model="loginForm.username" prefix-icon="el-icon-user-solid"></el-input>
          </el-form-item>
          <!-- 密码 -->
          <el-form-item prop="password">
             <el-input v-model="loginForm.password" prefix-icon="el-icon-s-cooperation" type="password"></el-input>
          </el-form-item>
          <!-- 登陆按钮 -->
          <el-form-item class="btns">
            <el-button :plain="true" type="primary" @click="login">登陆</el-button>
            <el-button type="info" @click="resetLoginForm">重置</el-button>
          </el-form-item>
        </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data(){
    return{
      //登陆表单的数据绑定对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      //表单验证规则
      loginFormRules: {
        //验证用户名是否合法
        username: [
          {required: true, message: '请输入登陆名称', trigger: 'blur'},
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        //验证密码是否合法
        password: [
          {required: true, message: '请输入密码', trigger: 'blur'},
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    //点击按钮重置表单
    resetLoginForm(){
      this.$refs.loginFormRef.resetFields();
    },
    //点击按钮验证表单是否能通过
    login(){
      this.$refs.loginFormRef.validate(async valid => {
       // console.log(valid);
       //连接外部接口验证返回等操作
        if(!valid) return;
        const {data: res} = await this.$http.post("login",this.loginForm);
        if(res.meta.status !== 200) return this.$message.error('登陆失败');
        // console.log("登陆成功");
        this.$message.success("登陆成功");
        window.sessionStorage.setItem("token",res.data.token);
        this.$router.push("/home");
      })
    }
  }
};
</script>

<style lang="less" scoped>
.login_container{
  background-image: url("../assets/img/bj.png");
  background-size: 100% 100%;
  height: 100%;
}

.login_box{
  width: 500px;
  height: 300px;
  background-color: #fff;
  border-radius: 30px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%,-50%);
  
  .avatar_box{
    height: 100px;
    width: 100px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%,-50%);
    background-color: #fff;
    img{
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login_form{
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
  }
.btns{
  display: flex;
  justify-content: center;
  
}
</style>