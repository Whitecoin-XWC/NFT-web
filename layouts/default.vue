<template>
  <el-container>
    <el-header class="header">
      <MainHeader />
    </el-header>
    <el-main class="main">
      <Nuxt />
    </el-main>
  </el-container>
</template>

<script>
export default {
  props: {},
  data() {
    return {}
  },
  mounted() {},
  methods: {},
}
</script>

<style scoped lang="scss">
.header {
  margin: 0;
  padding: 0;
  height: 117px !important;
}
.main {
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>
