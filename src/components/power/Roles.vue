<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible= true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1 ===0?'bdtop' : '','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染er级权限 -->
                <el-row
                  :class="[i2 === 0 ? '':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <!-- {{scope.row.id}} -->
            <!-- 修改功能 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <!-- 删除功能 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeRolesById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 弹出添加框 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="50%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogClick">重 置</el-button>
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改角色 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogClick">重 置</el-button>
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%"
    @colse="setRightDialogClosed">
        <!-- 树形控件 -->
      <el-tree :data="rightslist" :props="treeProps" show-checkbox
      node-key="id" default-expand-all :default-checked-keys="defkeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogClick">重 置</el-button>
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //所有角色列表数据
      rolelist: [],
      //添加框的显示与隐藏
      addDialogVisible: false,
      //控制权限分配对话框的隐藏和保存
      setRightDialogVisible: false,
      //所有权限的数据
      rightslist: [],
      //树型控件的属性绑定对象
      treeProps: {
          label: 'authName',
          children: 'children'
      },
      //默认选中的节点id的值数组
      defkeys: [],
      //当前即将分配权限的角色id
      roleId:'',
      //添加角色
      addForm: {
        roleName: "",
        roleDesc: ""
      },
      //添加表单验证规则
      addFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" }
        ],
        roleDesc: [{ required: true, message: "不能为空", trigger: "blur" }]
      },
      //控制修改用户对话框的显示与隐藏
      editDialogVisible: false,
      //查询到角色id
      editForm: {},
      editFormRules: {
        roleName: [
          { required: true, message: "请输入角色名", trigger: "blur" }
        ],
        roleDesc: [{ required: true, message: "不能为空", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getRolesList();
  },
  methods: {
    //获取所有角色的列表
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");

      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败！");
      }
      this.rolelist = res.data;

      console.log(this.rolelist);
    },
    //删除功能
    async removeRolesById(id) {
      // console.log(id)
      const confirmResult = await this.$confirm(
        "此操作将删除这项权限，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      //   console.log(confirmResult)
      if (confirmResult !== "confirm") {
        return this.$message.info("已经取消了删除");
      }
      const { data: res } = await this.$http.delete("roles/" + id);
      if (res.meta.status !== 200) {
        return this.$message.error("删除失败");
      }
      this.$message.success("删成功");
      this.getRolesList();
    },
    //点击重置功能
    addDialogClick() {
      this.$refs.addFormRef.resetFields();
    },
    editDialogClick() {
      this.$refs.editFormRef.resetFields();
    },
    //点击添加角色
    addRoles() {
      this.$refs.addFormRef.validate(async valid => {
        // console.log(valid)
        if (!valid) return;

        const { data: res } = await this.$http.post("roles", this.addForm);

        if (res.meta.status !== 201) {
          this.$message.error("添加角色失败");
        }
        this.$message.success("添加角色成功");
        this.addDialogVisible = false;
        this.getRolesList();
      });
    },
    //展示修改用户对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get("roles/" + id);

      if (res.meta.status !== 200) {
        return this.$message.error("查询角色消息失败");
      }
      this.$message.success("查询成功");
      this.editForm = res.data;
      this.editDialogVisible = true;
    },
    //修改角色信息并且提交
    editRolesInfo() {
      this.$refs.editFormRef.validate(async valid => {
        // console.log(valid)
        const { data: res } = await this.$http.put(
          "roles/" + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        );

        if (res.meta.status !== 200) {
          return this.$message.error("更新失败");
        }
        this.editDialogVisible = false;
        this.getRolesList();
        this.$message.success("更新成功");
      });
    },
    //根据id删除对应的权限
    async removeRightById(role, rightId) {
      //弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限，是否继续？",
        "提示",
        {
          confirmButtonText: "确定",
          concelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);

      if (confirmResult !== "confirm") {
        return this.$message.info("取消了删除");
      }
      // console.log("确认了删除")
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      );

      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }

      role.children = res.data;
    },
    //分配权限的功能
    async showSetRightDialog(role) {
        this.roleId = role.id
        //获取所有权限的数据
        const {data:res} = await this.$http.get('rights/tree')

        if(res.meta.status !==200){
            return this.$message.error('获取权限数据失败')
        }
        //把获取到的权限数据保存到data中
            this.rightslist = res.data
            // console.log(this.rightslist)
            //递归获取三级节点的id
            this.getLeafKeys(role,
            this.defkeys)

      this.setRightDialogVisible = true;
    },
    //通过递归的形式，获取角色所有三级权限的id，并保存到defkeys
    getLeafKeys(node,arr){
        //如果当前node节点不包含children属性，则是三级节点
        if(!node.children){
            return arr.push(node.id)
        }
        node.children.forEach(item =>
        this.getLeafKeys(item,arr))
    },
    //监听分配权限对话框的关闭事件
    setRightDialogClosed(){
        this.defkeys = []
    },
    //点击为角色分配权限
    async allotRights(){
        const keys = [
            ...this.$refs.treeRef.getCheckedKeys(),
            ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        // console.log(keys)
        const idStr = keys.join(',')

       const {data:res} = 
       await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})

       if(res.meta.status !==200){
           return this.$message.error('分配权限失败')
       }

       this.$message.success('分配权限成功')

       this.getRolesList()
       this.setRightDialogVisible = false

    }
  }
};
</script>

<style lang="less" scoped>
.el-card {
  margin-top: 20px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.el-tag {
  margin: 7px;
}
.el-table {
  margin-top: 15px;
  font-size: 15px;
}
//纵向居中
.vcenter {
  display: flex;
  align-items: center;
}
</style>