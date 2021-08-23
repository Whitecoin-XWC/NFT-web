<template>
  <div class="main-container">
    <div>
      <p>{{ `钱包安装：${isExtInstalled}` }}</p>
      <p>{{ `钱包初始化：${isWalletInited}` }}</p>
      <p>{{ `当前钱包：${walletAddress.address}` }}</p>
    </div>
    <div class="yihang">
      <p>{{ `TokenId：` }}</p>
      <el-input v-model="inputTonkenId" style="width: 220px" placeholder="请输入TonkenId"></el-input>
      <p>{{ `拍卖Id：` }}</p>
      <el-input v-model="inputAuctionId" style="width: 220px" placeholder="请输入拍卖Id"></el-input>
    </div>
    <div class="yihang">
      <p>{{ `币种：` }}</p>
      <el-select v-model="selectCoin" placeholder="请选择">
        <el-option v-for="(obj, index) in coinList" :key="index" :value="obj.name" :label="`${obj.name}:${obj.balances}`"> </el-option>
      </el-select>
      <p>{{ `最低价：` }}</p>
      <el-input v-model="inputPrice" style="width: 220px" placeholder="请输入最低价"></el-input>
      <p>{{ `最小加价：` }}</p>
      <el-input v-model="inputMinAdd" style="width: 220px" placeholder="请输入最小加价"></el-input>
    </div>
    <div>
      <el-button @click="click('创建NFT')">创建NFT</el-button>
      <el-button @click="click('转移费')">转移费</el-button>
      <el-button @click="click('转移NFT')">转移NFT</el-button>
    </div>
    <div>
      <el-button @click="click('开始拍卖')">开始拍卖</el-button>
      <el-button @click="click('更新拍卖')">更新拍卖</el-button>
      <el-button @click="click('竞价')">竞价</el-button>
      <el-button @click="click('领取')">领取</el-button>
      <el-button @click="click('取消拍卖')">取消拍卖</el-button>
    </div>
    <div>
      <el-button @click="click('开始售卖')">开始售卖</el-button>
      <el-button @click="click('更新售卖')">更新售卖</el-button>
      <el-button @click="click('出价')">出价</el-button>
      <el-button @click="click('取消售卖')">取消售卖</el-button>
    </div>
    <div class="yihang">
      <p>{{ `调用合约` }}</p>
      <el-select v-model="offlineContract" placeholder="请选择">
        <el-option label="NFT合约" :value="NFTAddress"> </el-option>
        <el-option label="拍卖合约" :value="AuctionAddress"> </el-option>
        <el-option label="售卖合约" :value="SaleAddress"> </el-option>
      </el-select>
      <p>{{ `方法名` }}</p>
      <el-input v-model="offlineMethod" style="width: 220px" placeholder="方法名"></el-input>
      <p>{{ `方法参数` }}</p>
      <el-input v-model="offlineArgs" style="width: 220px" placeholder="方法参数"></el-input>
      <el-button type="primary" @click="clickOffline()">offline查询</el-button>
    </div>
    <div class="yihang">
      <p>{{ `调用结果:${offlineRes}` }}</p>
    </div>
  </div>
</template>

<script>
import { ContractAddress } from '~/api/wallet/walletConfig'

export default {
  props: {},
  data() {
    return {
      inputTonkenId: '123A',
      inputAuctionId: '',
      isExtInstalled: false,
      isWalletInited: false,
      walletAddress: {},
      NFTAddress: ContractAddress.NFTAddress(),
      AuctionAddress: ContractAddress.AuctionAddress(),
      SaleAddress: ContractAddress.SaleAddress(),
      coinList: null,
      selectCoin: '',
      inputPrice: '',
      inputMinAdd: '',
      resTransferFee: null,
      offlineContract: '',
      offlineMethod: '',
      offlineArgs: '',
      offlineRes: '',
    }
  },
  computed: {},
  mounted() {
    this.initWallet()
  },
  methods: {
    async initWallet() {
      this.isExtInstalled = this.$wallet.checkInstalled()
      if (this.isExtInstalled) {
        const res = await this.$wallet.connectWallet()
        if (res.code === '0') {
          this.isWalletInited = res.data.isWalletInited
          this.walletAddress = res.data.walletAddress
        }
        const CoinList = await this.$wallet.getCoinList()
        if (CoinList.code === '0') {
          this.coinList = CoinList.data
        }
      }
    },
    async click(type) {
      if (type === '创建NFT') {
        const res = await this.$wallet.issueNFT(this.inputTonkenId, '10')
        if (res.code === '0') {
          alert('创建NFT成功')
        }
      } else if (type === '转移费') {
        const res = await this.$wallet.getTransferFee(this.inputTonkenId, '10')
        if (res.code === '0') {
          this.resTransferFee = res.data
          alert(JSON.stringify(res.data))
        }
      } else if (type === '转移NFT') {
        const res = await this.$wallet.transferNFT(this.inputTonkenId, 'XWCNNQaZt74TXXiF9qZCUThn8JJLeCDtgo1DA', this.resTransferFee)
        if (res.code === '0') {
          alert(JSON.stringify(res.data))
        }
      } else if (type === '开始拍卖') {
        const res = await this.$wallet.createAuctionNFT(this.inputTonkenId, this.selectCoin, this.inputPrice, this.inputMinAdd)
        if (res.code === '0') {
          alert(JSON.stringify(res.data))
        }
      } else if (type === '更新拍卖') {
        const res = await this.$wallet.editAuctionNFT(this.inputAuctionId, this.selectCoin, this.inputPrice, this.inputMinAdd)
        if (res.code === '0') {
          alert(JSON.stringify(res.data))
        }
      } else if (type === '竞价') {
        const res = await this.$wallet.bidAuctionNFT(this.inputAuctionId, this.selectCoin, this.inputPrice)
        if (res.code === '0') {
          alert(JSON.stringify(res.data))
        }
      } else if (type === '取消拍卖') {
        const res = await this.$wallet.cancelAuctionNFT(this.inputAuctionId)
        if (res.code === '0') {
          alert(JSON.stringify(res.data))
        }
      } else if (type === '开始售卖') {
        const res = await this.$wallet.sellSaleNFT(this.inputTonkenId, this.selectCoin, this.inputPrice)
        if (res.code === '0') {
          alert(JSON.stringify(res.data))
        }
      } else if (type === '更新售卖') {
        const res = await this.$wallet.editSaleNFT(this.inputTonkenId, this.selectCoin, this.inputPrice)
        if (res.code === '0') {
          alert(JSON.stringify(res.data))
        }
      } else if (type === '出价') {
        const res = await this.$wallet.buySaleNFT(this.inputTonkenId, this.selectCoin, this.inputPrice)
        if (res.code === '0') {
          alert(JSON.stringify(res.data))
        }
      } else if (type === '取消售卖') {
        const res = await this.$wallet.cancelSaleNFT(this.inputTonkenId)
        if (res.code === '0') {
          alert(JSON.stringify(res.data))
        }
      }
    },
    clickOffline() {
      this.$wallet.invokeContractOffline(this.offlineContract, this.offlineMethod, this.offlineArgs).then(
        (res) => {
          this.offlineRes = res
        },
        (err) => {
          this.offlineRes = JSON.stringify(err)
        },
      )
    },
  },
}
</script>

<style scoped lang="scss">
.main-container {
  position: relative;

  .yihang {
    display: flex;
    align-items: center;
  }
}
</style>
