<template>
  <el-container class="home-container">
    <!-- 头部 -->
    <el-header>
      <div>
        <img src="../assets/img/lf.png" alt />
        <el-link :underline="false" @click="toWelcome" type="primary">后台管理系统</el-link>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 主页 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse? '64px':'200px'">
        <div class="zhangkai" @click="toggleCollapse">|||</div>

        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          router
          :default-active="activePath"
        >
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="inconsObj[item.id]"></i>
              <span>{{item.authName}}</span>
            </template>
            <!-- 二级菜单 -->
            <el-menu-item
              :index="'/'+subItem.path"
              v-for="subItem in item.children"
              :key="subItem.id"
              @click="saveNavState('/' + subItem.path)"
            >
              <template slot="title">
                <i class="el-icon-ice-cream-round"></i>
                <span>{{subItem.authName}}</span>
              </template>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 右侧内容 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      //左侧菜单栏
      menulist: [],
      //侧边栏图标
      inconsObj: {
        "125": "el-icon-user-solid",
        "103": "el-icon-s-custom",
        "101": "el-icon-s-goods",
        "102": "el-icon-s-order",
        "145": "el-icon-s-data"
      },
      //是否折叠
      isCollapse: false,
      //动态绑定被激活的activePath
      activePath: ""
    };
  },
  created() {
    this.getMenuList();
    this.aactivePath = window.sessionStorage.getItem("activePath");
  },
  methods: {
    //退出登陆功能
    logout() {
      //清空token
      window.sessionStorage.clear();
      //跳转到登陆页面
      this.$router.push("/login");
    },
    //获取所有的菜单
    async getMenuList() {
      const { data: res } = await this.$http.get("menus");
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg);
      this.menulist = res.data;
      console.log(res);
    },
    //点击按钮，切换菜单的折叠与展开
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
    },
    //保存链接的激活状态
    saveNavState(activePath) {
      window.sessionStorage.setItem("activePath", activePath);
      //高亮
      this.activePath = activePath;
    },
    //点击跳转首页
    toWelcome() {
      this.$router.push({ path: "/welcome" });
    }
  }
};
</script>

<style lang="stylus" scoped>
.home-container {
  height: 100%;
}

.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: #fff;
  font-size: 20px;

  > div {
    display: flex;
    align-items: center;

    img {
      width: 15%;
      height: 15%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.el-aside {
  background-color: #333744;

  .el-menu {
    border-right: none;
  }
}

.el-main {
  background-color: #FFF;
}

.zhangkai {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: 0.2em;
}

.el-link {
  margin-left: 15px;
}
</style>