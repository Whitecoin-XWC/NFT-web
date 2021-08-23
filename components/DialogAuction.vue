<template>
  <div class="dialog-container">
    <el-dialog
      :close-on-click-modal="false"
      :title="(isCreateAnction === 1 && $t('拍卖')) || $t('更新价格')"
      :visible.sync="isShowDialogAuction"
      :before-close="handleClose"
    >
      <el-form ref="ruleForm" label-width="80px" label-position="top" :model="nftCreateData" :rules="rules">
        <div v-if="isCreateAnction === 1" class="content">
          {{ $t('选择拍卖使用的代币,一旦有用户开始竞拍你的商品,将会开启24小时倒计时,拍卖无法取消,倒计时结束最高出价将竞拍成功.') }}
        </div>
        <el-form-item :label="$t('代币：')" prop="coin">
          <el-select v-model="nftCreateData.coin" :disabled="isCreateAnction === 2" :placeholder="$t('请选择')">
            <el-option v-for="item in coinList" :key="item.name" :label="item.name" :value="item.name"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('最低价：')" prop="price">
          <el-input v-model="nftCreateData.price" :placeholder="$t('请输入最低价')"></el-input>
        </el-form-item>
        <el-form-item :label="$t('最低加价幅度：')" prop="minAdd">
          <el-input v-model="nftCreateData.minAdd" :placeholder="$t('请输入最低加价幅度')"></el-input>
        </el-form-item>
        <el-form-item class="edit-btns">
          <el-button @click="handleClose">{{ $t('取消') }}</el-button>
          <el-button class="submit-btn" type="primary" @click="onSubmit('ruleForm')">{{ $t('确定') }}</el-button>
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
    isCreateAnction: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      nftCreateData: {
        coin: '', // 币种
        price: '', // 最低价
        minAdd: '', // 最小加价
      },
      rules: {
        coin: [{ required: true, message: this.$t('请选择币种'), trigger: 'change' }],
        price: [{ required: true, message: this.$t('请输入最低价'), trigger: 'blur' }],
        minAdd: [{ required: true, message: this.$t('请输入最低加价幅度'), trigger: 'blur' }],
      },
    }
  },
  computed: {
    ...mapState('global', ['isShowDialogAuction', 'coinList', 'address']),
    ...mapState('anction', ['coin', 'anctionPrice', 'minAdd', 'anctionId', 'id']),
  },
  mounted() {
    if (this.isCreateAnction === 2) {
      this.nftCreateData.coin = this.coin
      this.nftCreateData.price = this.anctionPrice
      this.nftCreateData.minAdd = this.minAdd
    }
  },
  methods: {
    handleClose() {
      this.$store.commit('global/set_state', { isShowDialogAuction: false })
    },
    // 创建拍卖
    async createAnction() {
      const { coin, price, minAdd } = this.nftCreateData
      const res = await this.$wallet.createAuctionNFT(this.tokenId, coin, price, minAdd)
      if (res.code === '0' && res.data) {
        const res1 = await http(this.$axios).createAnctionNft({
          auctionCoin: coin,
          auctionMinMarkup: minAdd,
          auctionRetainPrice: price,
          auctionCreater: this.address,
          auctionId: res.data.api_result,
          tradeId: res.data.trxid,
          auctionStatus: 0,
          fileTokenId: this.tokenId,
        })
        this.submitSuccess(res1)
      }
    },
    // 修改拍卖
    async updateAnctionPriice() {
      const { coin, price, minAdd } = this.nftCreateData
      const res = await this.$wallet.editAuctionNFT(this.anctionId, coin, price, minAdd)
      if (res.code === '0') {
        const res1 = await http(this.$axios).updateAnction({
          auctionMinMarkup: minAdd,
          auctionRetainPrice: price,
          auctionId: this.anctionId,
          id: this.id,
        })
        this.submitSuccess(res1)
      }
    },
    submitSuccess(res) {
      if (res.code === 200) {
        this.$message.success(this.$t('设置成功'))
        this.$parent.getNftDetails()
        this.$parent.getAnctionRecordList()
        this.$parent.getNftRecord()
        this.$store.commit('global/set_state', { isShowDialogAuction: false })
      } else {
        this.$message.success(this.$t('设置失败'))
      }
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.isCreateAnction === 1) {
            this.createAnction()
          } else {
            this.updateAnctionPriice()
          }
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
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.5);
    line-height: 22px;
  }
  /deep/.el-form-item__label {
    padding-bottom: 0;
  }
  /deep/.el-select {
    width: 100%;
  }
}
</style>
