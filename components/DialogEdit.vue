<template>
  <div class="dialog-container">
    <el-dialog :close-on-click-modal="false" :title="$t('编辑资料')" :visible.sync="isShowEditDialog" :before-close="handleClose">
      <el-form label-width="90px" :model="formLabelAlign">
        <el-form-item :label="$t('用户名')">
          <el-input v-model="formLabelAlign.nickName"></el-input>
        </el-form-item>
        <el-form-item :label="$t('描述')">
          <el-input v-model="formLabelAlign.introduction" type="textarea"></el-input>
        </el-form-item>
        <el-form-item class="edit-btns">
          <el-button @click="handleClose">{{ $t('取消') }}</el-button>
          <el-button class="submit-btn" type="primary" @click="onSubmit">{{ $t('保存') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import http from '../api/http'
export default {
  props: {},
  data() {
    return {
      formLabelAlign: {
        nickName: '',
        introduction: '',
      },
    }
  },
  computed: {
    ...mapState('personal', ['isShowEditDialog']),
    ...mapState('global', ['address']),
  },
  mounted() {},
  methods: {
    handleClose() {
      this.$store.commit('personal/set_state', { isShowEditDialog: false })
    },
    async onSubmit() {
      if (!this.formLabelAlign.nickName.trim().length) {
        this.$message.error(this.$t('请输入昵称'))
        return false
      }
      this.formLabelAlign.id = this.address
      const res = await http(this.$axios).upDateUserInfo(this.formLabelAlign)
      if (res.code === 200) {
        this.$message.success(this.$t('更新成功'))
        this.$emit('editComplete')
      } else {
        this.$message.error(this.$t('更新失败'))
      }
    },
  },
}
</script>

<style scoped lang="scss">
.dialog-container {
  position: relative;

  /deep/ .el-dialog {
    border-radius: 6px !important;
    width: 25% !important;
  }
  /deep/.el-dialog__header {
    border-bottom: 1px solid #0000000f;
  }
  /deep/.el-textarea__inner {
    min-height: 126px !important;
  }
  .edit-btns {
    text-align: right;
    margin-top: 38px;
    .submit-btn {
      color: #ffffff;
      background-color: #333333;
      border-color: #333333;
    }
  }
}
</style>
