<template>
  <div class="dialog-container">
    <el-dialog :close-on-click-modal="false" :title="$t('确认')" :visible.sync="isShowCancelAuction" :before-close="handleClose">
      <el-form label-width="80px" label-position="top">
        <div class="content">{{ $t('请确认是否取消拍卖') }}</div>
        <el-form-item class="edit-btns">
          <el-button @click="handleClose">{{ $t('取消') }}</el-button>
          <el-button class="submit-btn" type="primary" @click="onSubmit">{{ $t('确定') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import http from '../api/http'
export default {
  props: {
    tokenId: {
      type: String,
      default: null,
    },
  },
  data() {
    return {}
  },
  computed: {
    ...mapState('global', ['isShowCancelAuction']),
    ...mapState('anction', ['anctionId', 'id']),
  },
  mounted() {},
  methods: {
    handleClose() {
      this.$store.commit('global/set_state', { isShowCancelAuction: false })
    },
    async onSubmit() {
      const res = await this.$wallet.cancelAuctionNFT(this.anctionId)
      if (res.code === '0') {
        const res1 = await http(this.$axios).cancelAnctionNft({ fileTokenId: this.tokenId })
        if (res1.code === 200) {
          this.$message.success(this.$t('取消拍卖成功'))
          this.$parent.getNftDetails()
          this.$parent.getAnctionRecordList()
          this.$parent.getNftRecord()
          this.$store.commit('global/set_state', { isShowCancelAuction: false })
        } else {
          this.$message.success(this.$t('取消拍卖失败'))
        }
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
  /deep/.el-dialog__title {
    font-size: 16px;
    font-weight: 700;
    color: #000000d9;
    line-height: 24px;
  }
  /deep/.el-dialog__header {
    border-bottom: 1px solid #0000000f;
  }

  /deep/.el-dialog__body {
    padding: 20px 28px 10px 28px;
  }
  .edit-btns {
    text-align: right;
    margin-top: 38px;
    margin-bottom: 0;
    padding-top: 10px;
    &::before {
      display: inline-block;
      content: '';
      height: 1px;
      width: 100%;
      position: absolute;
      background: #0000000f;
      bottom: 58px;
      left: 0;
    }
    .submit-btn {
      color: #ffffff;
      background-color: #333333;
      border-color: #333333;
    }
  }
  .content {
    text-align: center;
    line-height: 60px;
    font-size: 14px;
    font-weight: 400;
    color: #333333;
  }
}
</style>
