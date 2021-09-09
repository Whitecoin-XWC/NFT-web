<template>
  <div class="dialog-container">
    <el-dialog :close-on-click-modal="false" :title="$t('转移')" :visible.sync="isShowTransferNft" :before-close="handleClose">
      <el-form label-width="80px" label-position="top">
        <el-form-item :label="$t('目标地址：')">
          <el-input v-model="address" :placeholder="$t('请输入目标地址')"></el-input>
        </el-form-item>
        <div class="content2">{{ $t('余额：') }}{{ balanceObj.balances }}{{ balanceObj.name }}</div>
        <div v-if="transferPrice" class="content">{{ $t('费用：') }}{{ transferPrice }}{{ coin }}</div>

        <el-form-item class="edit-btns">
          <el-button class="cancel-btn" @click="handleClose">{{ $t('取消') }}</el-button>
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
  },
  data() {
    return {
      address: '',
      transferPrice: null,
      transferObj: {},
      coin: null,
      balanceObj: {
        balances: 0,
        name: 'XWC',
      },
    }
  },
  computed: {
    ...mapState('global', ['isShowTransferNft', 'coinList']),
  },
  mounted() {
    this.queryNftTransferPrice()
  },
  methods: {
    // 查询NFT转移费
    async queryNftTransferPrice() {
      const res = await this.$wallet.getTransferFee(this.tokenId, this.copyrightFee)
      if (res.code === '0') {
        this.transferPrice = res.data.price
        this.coin = res.data.name
        this.transferObj = res.data
        if (this.coin === '') {
          this.balanceObj = this.coinList.XWC
        } else {
          this.balanceObj = this.coinList[this.coin]
        }
      }
    },
    handleClose() {
      this.$store.commit('global/set_state', { isShowTransferNft: false })
    },
    async onSubmit() {
      if (!this.address.trim().length) {
        this.$message.error(this.$t('请输入目标地址'))
        return false
      }
      try {
        const approve = await http(this.$axios).apiApprove({
          message: JSON.stringify({
            action: 'transferNFT',
            tokenId: this.tokenId,
            userAddress: this.address,
            tractionId: '',
            price: this.transferPrice,
            name: this.coin,
          }),
        })
        if (approve) {
          const res = await this.$wallet.transferNFT(this.tokenId, this.address, this.transferObj)
          if (res.code === '0') {
            const res1 = await http(this.$axios).transferNft({
              tokenId: this.tokenId,
              userAddress: this.address,
              tractionId: res.data.trxid,
              price: this.transferPrice,
              name: this.coin,
            })
            if (res1.code === 200) {
              this.$message.success(this.$t('转移成功'))
              this.$parent.getNftDetails()
              this.$parent.getNftRecord()
              this.$parent.getAnctionRecordList()
              this.$store.commit('global/set_state', { isShowTransferNft: false })
            }
          }
        }
      } catch (err) {}
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
    line-height: 24px;
    font-size: 18px;
    font-weight: 500;
    color: #333333;
  }
  /deep/.el-dialog__header {
    border-bottom: 1px solid #d8d8d8;
    text-align: center;
  }

  /deep/.el-dialog__body {
    padding: 20px 28px 10px 28px;
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
  /deep/.el-form-item__label {
    padding-bottom: 0;
  }

  .content {
    height: 30px;
    font-size: 14px;
    font-weight: 400;
    color: #333333;
    line-height: 22px;
  }
  .content2 {
    height: 20px;
    font-size: 14px;
    font-weight: 600;
    color: #43cee2;
    line-height: 14px;
    text-align: left;
  }
}
</style>
