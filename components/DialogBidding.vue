<template>
  <div class="dialog-container">
    <el-dialog :close-on-click-modal="false" :title="$t('竞拍')" :visible.sync="isShowDialogBidding" :before-close="handleClose">
      <el-form ref="ruleForm" label-width="80px" label-position="top" :model="anctionForm" :rules="rules">
        <el-form-item :label="$t('出价：')" prop="price">
          <div class="offer-box">
            <el-input v-model="anctionForm.price" :placeholder="$t('请输入价格')"></el-input>
            <span>{{ coin }}</span>
          </div>
        </el-form-item>
        <div class="content">{{ $t('余额：') }}{{ balance }}{{ coin }}</div>
        <div class="content2">
          <P>{{ $t('最低出价金额') }}{{ anctionPrice }}{{ coin }} </P>
          <P>{{ $t('下一次加价必须比最高价高') }}{{ minAdd }}{{ coin }}</P>
        </div>
        <el-form-item class="edit-btns">
          <el-button class="cancel-btn" @click="handleClose">{{ $t('取消') }}</el-button>
          <el-button class="submit-btn" type="primary" @click="onSubmit('ruleForm')">{{ $t('确定') }}</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import http from '../api/http'
import Tools from '~/api/wallet/walletTools'
export default {
  props: {
    tokenId: {
      type: String,
      default: null,
    },
    id: {
      type: String,
      default: null,
    },
    anctionId: {
      type: String,
      default: null,
    },
    coin: {
      type: String,
      default: 'XWC',
    },
    anctionPrice: {
      type: String,
      default: null,
    },
    minAdd: {
      type: String,
      default: null,
    },
    anctionStatus: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      anctionForm: {
        price: '',
      },
      rules: {
        price: [{ required: true, message: this.$t('请输入价格'), trigger: 'blur' }],
      },
    }
  },
  computed: {
    ...mapState('global', ['isShowDialogBidding', 'address', 'coinList']),
    balance() {
      const unit = this.coinList[this.coin]
      return !unit.balances ? 0 : unit.balances
    },
  },
  mounted() {},
  methods: {
    handleClose() {
      this.$store.commit('global/set_state', { isShowDialogBidding: false })
    },
    onSubmit(formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          if (Number(this.anctionForm.price) > Number(this.balance)) {
            this.$message.error(this.$t('余额不足'))
            return false
          }
          let num = null
          if (!this.anctionStatus) {
            num = this.anctionPrice
          } else {
            num = Tools.accAdd(this.anctionPrice, this.minAdd)
          }
          if (Number(this.anctionForm.price) < num) {
            this.$message.error(this.$t('不能低于最低加价'))
            return false
          }
          try {
            const approve = await http(this.$axios).apiApprove({
              message: JSON.stringify({
                action: 'bidAuctionNFT',
                auctionId: this.id,
                auctionPrice: this.anctionForm.price,
                auctioneer: this.address,
                fileId: this.tokenId,
                tradeId: '',
              }),
            })
            if (approve) {
              const res1 = await this.$wallet.bidAuctionNFT(this.anctionId, this.coin, this.anctionForm.price)
              if (res1.code === '0' && res1.data) {
                const res2 = await http(this.$axios).biddingNft({
                  auctionId: this.id,
                  auctionPrice: this.anctionForm.price,
                  auctioneer: this.address,
                  fileId: this.tokenId,
                  tradeId: res1.data.trxid,
                })
                if (res2.code === 200) {
                  this.$message.success(this.$t('竞拍成功'))
                  this.$parent.getNftDetails()
                  this.$parent.getAnctionRecordList()
                  this.$parent.getNftRecord()
                  this.$store.commit('global/set_state', { isShowDialogBidding: false })
                } else {
                  this.$message.error(this.$t('竞拍失败'))
                }
              }
            }
          } catch (err) {}
        } else {
          return false
        }
      })
    },
  },
}
</script>

<style scoped lang="scss">
.dialog-container {
  position: relative;

  /deep/ .el-dialog {
    border-radius: 6px !important;
    width: 27% !important;
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
    height: 40px;
    font-size: 14px;
    font-weight: 600;
    color: #43cee2;
    line-height: 22px;
  }
  .content2 {
    p {
      font-size: 14px;
      font-weight: 400;
      color: #00000080;
      line-height: 22px;
    }
  }

  .offer-box {
    position: relative;
    span {
      position: absolute;
      right: 10px;
      font-size: 14px;
      font-weight: 400;
      color: #333333;
    }
  }
}
</style>
