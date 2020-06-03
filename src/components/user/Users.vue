<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索框和添加 -->
      <el-row :gutter="20">
        <el-col :span=" 8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)"></el-switch>
            <!-- {{scope.row}} -->
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            ></el-button>
            <!-- 提示文字 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRoles(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesiz"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- dialog对对话框添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogClosed">重 置</el-button>
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户的对话框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>

        <el-form-item label="手机号" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogClick">重 置</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUsereInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配用户角色对话框 -->
    <el-dialog title="提示" :visible.sync="setRoleDialogVisible" width="50%"
    @close="setRoleDialogClosed">
      <p>当前的用户:{{userInfo.username}}</p>
      <p>当前的角色:{{userInfo.role_name}}</p>
      <p>
        分配角色：
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id"
          ></el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="savaRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
<script>
export default {
  data() {
    //验证邮箱的规则
    var chekEmail = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;

      if (regEmail.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    //验证手机号
    var chekMobile = (rule, value, cb) => {
      const regMobile = /^[1][3,4,5,7,8][0-9]{9}$/;

      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };
    return {
      //获取用户参数对象
      queryInfo: {
        query: "",
        //当前的页数
        pagenum: 1,
        //当前每页显示的数据
        pagesize: 10
      },
      userlist: [],
      total: 0,

      //添加框的显示与隐藏
      addDialogVisible: false,
      //用户分配角色的显示与隐藏
      setRoleDialogVisible: false,
      //需要被分配角色的用户信息
      userInfo: {},
      //所有角色的数据列表
      rolesList: [],
      //已选中的角色id值
      selectedRoleId:'',



      //添加用户的表单数据
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      //添加表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "用户的长度在3-10个字符之间",
            trigger: "blur"
          }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "密码的长度在6-15个字符之间",
            trigger: "blur"
          }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: chekEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机号", trigger: "blur" },
          { validator: chekMobile, trigger: "blur" }
        ]
      },
      //控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      //查询到的id用户消息
      editForm: {},
      //修改表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: "请输入用户邮箱", trigger: "blur" },
          { validator: chekEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入用户的手机号", trigger: "blur" },
          { validator: chekMobile, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      const { data: res } = await this.$http("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.erroe("获取用户列表失败!");
      }
      this.userlist = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    //分页
    handleSizeChange(newSize) {
      console.log(newSize);
      this.queryInfo.pagesize = newSize;
      this.getUserList();
    },
    //监听页码值的改变
    handleCurrentChange(newPage) {
      console.log(newPage);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    //监听switch开关状态的改变
    async userStateChanged(userinfo) {
      console.log(userinfo);
      const { data: res } = await this.$http.put(
        `users/${userinfo.id}/state/${userinfo.mg_state}`
      );
      if (res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state;
        return this.$message.error("更新用户状态失败");
      }
      this.$message.success("更新用户成功！");
    },
    //监听添加用户对话框的重置事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields();
    },
    //点击按钮添加新用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return;
        //可以发起添加用户的网络请求
        const { data: res } = await this.$http.post("users", this.addForm);

        if (res.meta.status !== 201) {
          this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        //隐藏添加用户的对话框
        this.addDialogVisible = false;
        //重新获取用户列表(刷新的列表)
        this.getUserList();
      });
    },
    //展示编辑用户的对话框
    async showEditDialog(id) {
      // console.log(id)
      const { data: res } = await this.$http.get("users/" + id);

      if (res.meta.status != 200) {
        return this.$message.error("查询用户消息失败！");
      }
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //监听修改用户对话框重置功能
    editDialogClick() {
      this.$refs.editFormRef.resetFields();
    },
    //修改用户信息并提交
    editUsereInfo() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "users/" + this.editForm.id,
          {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("更新用户信息失败");
        }
        //关闭对话框
        this.editDialogVisible = false;
        //刷新数据列表
        this.getUserList();
        //提示修改成功
        this.$message.success("更新用户成功！");
      });
    },
    //根据id删除对应的用户信息
    async removeUserById(id) {
      // console.log(id)
      //弹框提示是否删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该用户, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      //如果用户确认删除则返回值为字符串confirm
      //如果用户取消了删除则返回值为字符串cancel
      // console.log(confirmResult)
      if (confirmResult !== "confirm") {
        return this.$message.info("已经取消了删除");
      }
      // console.log('确认了删除')
      const { data: res } = await this.$http.delete("users/" + id);
      if (res.meta.status !== 200) {
        return this.$message.erroe("删除失败");
      }
      this.$message.success("删除用户成功");
      this.getUserList();
    },
    //分配用户角色
    async setRoles(userInfo) {
      this.userInfo = userInfo;

      //在展示对话框之前，获取所有角色的列表
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("获取角色信息失败");
      }

      this.rolesList = res.data;
      this.setRoleDialogVisible = true;
    },
    //点击分配角色
    async savaRoleInfo(){
      if(!this.selectedRoleId){
        return this.$message.error('请选择要分配的角色')
      }
      const {data:res} = await this.$http.put(`users/${this.userInfo.id}/role`,
      {
        rid: this.selectedRoleId
      })

      if(res.meta.status !==200){
        return this.$message.error('更新失败')
      }
      this.$message.success('更新成功')
      this.getUserList()
      this.setRoleDialogVisible = false
    },
    //分配角色对话框的关闭事件
    setRoleDialogClosed(){
      this.selectedRoleId = '',
      this.userInfo = {}
    }
  }
};
</script>


<style lang="less" scoped>
.el-breadcrumb {
  margin-bottom: 15px;
  font-size: 12px;
}
.el-table {
  margin-top: 15px;
  font-size: 15px;
}
</style>