/* eslint-disable require-await */
<template>
  <div class="dialog-container">
    <el-dialog
      :close-on-click-modal="false"
      :title="(isCreatePrice === 1 && $t('售价')) || $t('更新售价')"
      :visible.sync="isShowSetPrice"
      :before-close="handleClose"
    >
      <el-form ref="ruleForm" label-width="80px" label-position="top" :model="sellAlign" :rules="rules">
        <div v-if="isCreatePrice === 1" class="content">{{ $t('设置你想出售的代币和金额') }}</div>
        <el-form-item :label="$t('代币：')" prop="coin">
          <el-select v-model="sellAlign.coin" :placeholder="$t('请选择')" :disabled="isCreatePrice === 2">
            <el-option v-for="item in coinList" :key="item.name" :label="item.name" :value="item.name"> </el-option>
          </el-select>
        </el-form-item>
        <el-form-item :label="$t('金额：')" prop="price">
          <el-input v-model="sellAlign.price" :placeholder="$t('请输入金额')"></el-input>
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
    isCreatePrice: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      sellAlign: {
        price: '',
        coin: '',
      },
      rules: {
        coin: [{ required: true, message: this.$t('请选择币种'), trigger: 'change' }],
        price: [{ required: true, message: this.$t('请输入金额'), trigger: 'blur' }],
      },
    }
  },

  computed: {
    ...mapState('global', ['isShowSetPrice', 'coinList', 'address']),
    ...mapState('price', ['nftPrice', 'coin']),
  },
  mounted() {
    if (this.isCreatePrice === 2) {
      this.sellAlign.coin = this.coin
      this.sellAlign.price = this.nftPrice
    }
  },
  methods: {
    handleClose() {
      this.$store.commit('global/set_state', { isShowSetPrice: false })
    },
    // 更新/设置售价
    async setNftPrice(trxid) {
      const res2 = await http(this.$axios).setNftSell({
        price: this.sellAlign.price,
        tokenId: this.tokenId,
        tractionId: trxid,
        unit: this.sellAlign.coin,
        userAddress: this.address,
      })
      if (res2.code === 200) {
        this.$message.success(this.$t('设置成功'))
        this.$parent.getNftDetails()
        this.$parent.getNftRecord()
        this.$parent.getAnctionRecordList()
        this.$store.commit('global/set_state', { isShowSetPrice: false })
      } else {
        this.$message.success(this.$t('设置失败'))
      }
    },
    // 创建出售
    async createSell() {
      const res1 = await this.$wallet.sellSaleNFT(this.tokenId, this.sellAlign.coin, this.sellAlign.price)
      if (res1.code === '0' && res1.data) {
        this.setNftPrice(res1.data.trxid)
      }
    },
    // 更新出售价
    async updatePricce() {
      const res1 = await this.$wallet.editSaleNFT(this.tokenId, this.sellAlign.coin, this.sellAlign.price)
      if (res1.code === '0' && res1.data) {
        this.setNftPrice(res1.data.trxid)
      }
    },
    onSubmit(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (this.isCreatePrice === 1) {
            this.createSell()
          } else {
            this.updatePricce()
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
  /deep/.el-form-item__label {
    padding-bottom: 0;
  }
  /deep/.el-select {
    width: 100%;
  }
  .content {
    height: 50px;
    font-size: 14px;
    font-weight: 400;
    color: rgba(0, 0, 0, 0.5);
    line-height: 22px;
  }
}
</style>
