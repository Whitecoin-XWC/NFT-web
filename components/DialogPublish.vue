<template>
  <div class="dialog-container">
    <el-dialog v-loading="loading" :close-on-click-modal="false" :title="$t('确认')" :visible.sync="isShowPublishDialog" :before-close="handleClose">
      <p class="p1">{{ $t('您即将发行') }}{{ publishName }} ，{{ $t('每次售出您将获得售价的') }}{{ copyrightFee }}%。{{ $t('一旦行成功将无法修改；') }}</p>
      <p>{{ $t('本次上传需要支付一定数量的XWC用于支付存储及网络带宽费用，由于是内测阶段将免费上传。') }}</p>
      <div class="edit-btns">
        <el-button class="cancel-btn" @click="handleClose">{{ $t('取消') }}</el-button>
        <el-button class="submit-btn" type="primary" @click="onSubmit">{{ $t('确定') }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import http from '../api/http'
export default {
  props: {
    uploadData: {
      type: FormData,
      default: null,
    },
  },
  data() {
    return {
      formLabelAlign: {
        name: '',
        region: '',
        type: '',
      },
      loading: false,
    }
  },
  computed: {
    ...mapState('publish', ['isShowPublishDialog', 'copyrightFee', 'publishName', 'tokenId', 'isShowPublishContent']),
    ...mapState('global', ['address', 'coinList']),
  },
  mounted() {},
  methods: {
    handleClose() {
      this.$store.commit('publish/set_state', { isShowPublishDialog: false })
    },
    async onSubmit() {
      if (Number(this.coinList.XWC.balances) < 0.01) {
        this.$message.error(this.$t('您的余额不足,手续费需要0.01XWC'))
        return false
      }
      this.loading = true
      const res1 = await http(this.$axios).fileUpload(this.uploadData)
      if (res1.code === 200 && res1.data) {
        this.loading = false
        this.$store.commit('publish/set_state', { tokenId: res1.data.tokenId })
        const res2 = await this.$wallet.issueNFT(res1.data.tokenId, this.copyrightFee)
        if (res2.code === '0') {
          const res3 = await http(this.$axios).nftPub({ tokenId: res1.data.tokenId, userAddress: this.address, tractionId: res2.data.trxid })
          if (res3.code === 200) {
            this.$message.success(this.$t('发布成功'))
            this.$store.commit('publish/set_state', { isShowPublishDialog: false, isShowPublishContent: true })
          } else {
            this.$message.error(this.$t(res3.info))
          }
        }
      } else {
        this.loading = false
        this.$message.error(this.$t(res1.info))
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
    margin-top: 84px;
    margin-bottom: 40;
    display: flex;
    justify-content: center;
    .cancel-btn {
      width: 106px;
      background: #ffffff;
      border-radius: 6px;
      border: 1px solid #979797;
      font-size: 16px;
      font-weight: 400;
      color: #666666;
      margin-right: 40px;
    }
    .submit-btn {
      width: 106px;
      color: #ffffff;
      background: #595eff;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 400;
    }
  }
  p {
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.65);
    line-height: 22px;
  }
  .p1 {
    margin-bottom: 20px;
  }
}
</style>
