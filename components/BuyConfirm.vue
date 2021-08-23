<template>
  <div class="dialog-container">
    <el-dialog :close-on-click-modal="false" :title="$t('确认')" :visible.sync="isShowBuyConfirm" :before-close="handleClose">
      <el-form label-width="80px" label-position="top">
        <div class="content">
          <p>{{ $t('售价') }}：&nbsp;&nbsp;&nbsp;{{ sellPrice }}{{ coin }}</p>
          <p>{{ $t('版权费') }}：&nbsp;&nbsp;&nbsp;{{ copyrightFee }}%</p>
        </div>
        <div class="content-box">
          <span>{{ $t('请确认是否购买，购买成功将成功该NFT的拥有者') }}</span>
          <div class="content2">{{ $t('余额：') }}{{ balance() }}{{ coin }}</div>
        </div>
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
    copyrightFee: {
      type: Number,
      default: null,
    },
    sellPrice: {
      type: String,
      default: null,
    },
    coin: {
      type: String,
      default: 'XWC',
    },
  },
  data() {
    return {}
  },
  computed: {
    ...mapState('global', ['isShowBuyConfirm', 'coinList', 'address']),
  },
  mounted() {},
  methods: {
    balance() {
      const unit = this.coinList[this.coin]
      return !unit.balances ? 0 : unit.balances
    },
    handleClose() {
      this.$store.commit('global/set_state', { isShowBuyConfirm: false })
    },
    async onSubmit() {
      if (Number(this.balance()) < Number(this.sellPrice)) {
        this.$message.error(this.$t('余额不足'))
        return false
      }
      const res1 = await this.$wallet.buySaleNFT(this.tokenId, this.coin, this.sellPrice)
      if (res1.code === '0' && res1.data) {
        const res2 = await http(this.$axios).buyNft({
          buyUserAddress: this.address,
          tokenId: this.tokenId,
          tractionId: res1.data.trxid,
        })
        if (res2.code === 200) {
          this.$message.success(this.$t('购买成功'))
          this.$parent.getNftDetails()
          this.$parent.getNftRecord()
          this.$parent.getAnctionRecordList()
          this.$store.commit('global/set_state', { isShowBuyConfirm: false })
        } else {
          this.$message.error(this.$t('购买失败'))
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
  .content2 {
    height: 20px;
    font-size: 14px;
    font-weight: 600;
    color: #43cee2;
    line-height: 14px;
    text-align: right;
  }
  .content {
    p {
      font-size: 16px;
      font-weight: 400;
      color: #333333;
      line-height: 22px;
      margin-bottom: 10px;
    }
    span {
      margin-top: 50px;
      display: block;
      font-size: 14px;
      font-weight: 400;
      color: rgba(0, 0, 0, 0.5);
      line-height: 22px;
    }
  }
  .content-box {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
  }
}
</style>
