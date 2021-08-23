<template>
  <div class="main-container">
    <div class="detail-top">
      <div class="top-left">
        <!-- <img :src="nftDetails.fileName" alt="" /> -->
        <img v-if="nftDetails.mediaType === 1 || nftDetails.mediaType === 4" :src="nftDetails.fileName" alt="" />
        <video
          v-if="nftDetails.mediaType === 2"
          :src="nftDetails.fileName"
          controls
          :controlslist="nftDetails.userAddress === address ? 'nodownload' : ''"
        ></video>
        <div v-if="nftDetails.mediaType === 3" class="audio">
          <audio :src="nftDetails.fileName" controls :controlslist="nftDetails.userAddress === address ? 'nodownload' : ''"></audio>
        </div>
        <div v-if="nftDetails.mediaType === 0" class="file-text">{{ nftDetails.txtContent }}</div>
        <!-- <div class="price-b">
            <div class="price-info">
              <p>{{ $t('版权费') }}</p>
              <p>{{ nftDetails.copyrightFee }} %</p>
            </div>
            <div class="price-info">
              <p>{{ $t('平台费') }}</p>
              <p>5 %</p>
            </div>
          </div> -->
        <div v-if="nftDetails.fileStatus === 4" class="price-container">
          <div class="price-t">
            <div class="price-info">
              <p>{{ $t('售价') }}</p>
              <p>{{ nftDetails.price }} {{ nftDetails.unit }}</p>
              <p>≈${{ nftDetails.priceUsdt }}</p>
            </div>
          </div>
        </div>
        <div v-if="nftDetails.fileStatus === 5" class="price-container">
          <div v-if="!anctionDetail.remainingTime && anctionDetail.auctionStatus === 0" class="price-t">
            <div class="price-info">
              <p>{{ $t('保留价') }}</p>
              <p>{{ anctionDetail.auctionRetainPrice }} {{ anctionDetail.auctionCoin }}</p>
              <p>≈${{ anctionDetail.auctionRetainPriceUsdt }}</p>
            </div>
            <div class="price-info">
              <p>{{ $t('最低加价') }}</p>
              <p>{{ anctionDetail.auctionMinMarkup }} {{ anctionDetail.auctionCoin }}</p>
              <p>≈${{ anctionDetail.auctionMinMarkupUsdt }}</p>
            </div>
          </div>
          <div v-if="anctionDetail.remainingTime || anctionDetail.auctionStatus === 2" class="price-t">
            <div class="price-info">
              <p>{{ $t('拍卖结束') }}</p>
              <p>
                <Time v-if="anctionDetail.remainingTime" ref="Time" :total-remain="anctionDetail.remainingTime" @preciseTime="getAnctionDetailData">
                  <template #time="slotProps">
                    <span>{{ slotProps.time.hour }}h{{ slotProps.time.minute }}m{{ slotProps.time.second }}s</span>
                  </template>
                </Time>
                <span v-if="!anctionDetail.remainingTime">--</span>
              </p>
            </div>
          </div>
          <div v-if="anctionDetail.remainingTime || anctionDetail.auctionStatus === 2" class="price-b">
            <div class="price-info">
              <p>{{ $t('最高出价') }}</p>
              <p>{{ anctionDetail.auctionMaxPrice }} {{ anctionDetail.auctionCoin }}</p>
              <p>≈${{ anctionDetail.auctionMaxPriceUsdt }}</p>
            </div>
            <div v-if="anctionDetail.auctionStatus < 2" class="price-info">
              <p>{{ $t('最低加价') }}</p>
              <p>{{ anctionDetail.auctionMinMarkup }} {{ anctionDetail.auctionCoin }}</p>
              <p>≈${{ anctionDetail.auctionMinMarkupUsdt }}</p>
            </div>
          </div>
          <div v-if="anctionDetail.remainingTime" class="price-t">
            <div class="price-info">
              <p>{{ $t('竞拍人') }}</p>
              <p :title="anctionDetail.auctionCreater" class="auctionCreater">
                {{ anctionDetail.userName.lenth ? anctionDetail.userName : anctionDetail.anctionMaxEr }}
              </p>g
            </div>
          </div>
        </div>
        <!-- <div v-if="nftDetails.fileStatus === 5 && anctionDetail.remainingTime" class="price-container"> -->
        <!-- <div class="price-container"></div> -->
      </div>
      <div class="top-right">
        <div class="title-container">
          <h2>{{ nftDetails.fileTitle }}</h2>

          <div v-if="nftDetails.userAddress != address && !nftDetails.collect && !followStatus" class="focus" @click="follow">{{ $t('关注') }}</div>
          <div v-if="nftDetails.userAddress != address && nftDetails.collect && followStatus" class="focus unfollow" @click="unFollow">
            {{ $t('取消关注') }}
          </div>
        </div>
        <p class="create">
          <span>{{ $t('创作者') }}</span> <span>{{ nftDetails.createrNickName || nftDetails.creater }}</span>
        </p>
        <p class="all">
          <span>{{ $t('所有者') }}</span> <span>{{ nftDetails.userAddressNickName || nftDetails.userAddress }}</span>
        </p>
        <div class="copyrightFee-box">
          <span style="margin-right: 80px">
            <span class="copyrightFee-label">{{ $t('版权费') }}</span
            ><span class="copyrightFee-text">{{ nftDetails.copyrightFee }}%</span>
          </span>
          <span>
            <span class="copyrightFee-label">{{ $t('平台费') }}</span
            ><span class="copyrightFee-text">5%</span></span
          >
        </div>
        <div class="describe">
          {{ nftDetails.fileDes }}
        </div>
        <!-- 拥有者 -->
        <!-- 拍卖前 -->
        <div v-if="nftDetails.userAddress === address && nftDetails.fileStatus === 2" class="details-btns">
          <div @click="openDialog('isShowDialogAuction')">{{ $t('创建拍卖') }}</div>
          <div @click="openDialog('isShowSetPrice')">{{ $t('设置售价') }}</div>
          <div class="transfer" @click="openDialog('isShowTransferNft')">{{ $t('转移NFT') }}</div>
        </div>
        <!-- 拍卖中 -->
        <div v-if="nftDetails.userAddress === address && nftDetails.fileStatus === 5 && anctionDetail.auctionStatus === 0" class="details-btns">
          <div @click="openDialog('isShowDialogAuction')">{{ $t('更新价格') }}</div>
          <div class="cancel" @click="openDialog('isShowCancelAuction')">{{ $t('取消拍卖') }}</div>
        </div>
        <!-- 出售中 -->
        <div v-if="nftDetails.userAddress === address && nftDetails.fileStatus === 4" class="details-btns">
          <div @click="openDialog('isShowSetPrice')">{{ $t('更新售价') }}</div>
          <div class="cancel" @click="openDialog('isShowCancelSell')">{{ $t('取消出售') }}</div>
        </div>
        <!-- 最高价 -->
        <div v-if="anctionDetail.auctionMaxEr === address && nftDetails.fileStatus === 5 && anctionDetail.auctionStatus === 1" class="details-btns">
          <div>{{ $t('当前最高价') }}</div>
        </div>
        <!-- 竞拍 -->
        <div v-if="isOwner() || isOthers()" class="details-btns">
          <div @click="openDialog('isShowDialogBidding')">{{ $t('竞拍') }}</div>
        </div>
        <!-- 购买 -->
        <div v-if="nftDetails.userAddress !== address && nftDetails.fileStatus === 4" class="details-btns">
          <div @click="openDialog('isShowBuyConfirm')">{{ $t('购买') }}</div>
        </div>

        <!-- 拍卖完成后领取NFT -->
        <div v-if="nftDetails.fileStatus === 5 && anctionDetail.auctionStatus === 2 && anctionDetail.auctionMaxEr === address" class="details-btns">
          <div @click="toReceiveNft">{{ $t('领取NFT') }}</div>
        </div>
      </div>
    </div>
    <div class="detail-record">
      <p class="record-title">{{ $t('历史记录') }}</p>
      <div class="record-box">
        <div v-for="(item, index) in nftRecordList" :key="index" class="record-item">
          <div class="record-info">{{ item.userId }} {{ $t(item.logInfo) }}</div>
          <div class="record-time">{{ item.createTime }}</div>
        </div>
      </div>
    </div>
    <div v-if="nftDetails.fileStatus === 5 && anctionRecordList.length" class="detail-record">
      <p class="record-title">{{ $t('拍卖记录') }}</p>
      <div class="record-box">
        <div v-for="(item, index) in anctionRecordList" :key="index" class="record-item">
          <div class="record-info">{{ item.auctioneer }} {{ $t('竞拍出价') }}&nbsp;{{ item.auctionPrice }}{{ anctionDetail.auctionCoin }}</div>
          <div class="record-time">{{ item.auctionTime }}</div>
        </div>
      </div>
    </div>
    <CancelSell v-if="isShowCancelSell" :token-id="tokenId" />
    <CancelAuction v-if="isShowCancelAuction" :token-id="tokenId" />
    <DialogAuction v-if="isCreateAnction" :token-id="tokenId" :is-create-anction="isCreateAnction" />
    <DialogSetPrice v-if="isCreatePrice" :token-id="tokenId" :is-create-price="isCreatePrice" />
    <TransferNft v-if="isShowTransferNft" :token-id="tokenId" :copyright-fee="nftDetails.copyrightFee" />
    <BuyConfirm
      v-if="isShowBuyConfirm"
      :token-id="tokenId"
      :copyright-fee="nftDetails.copyrightFee"
      :sell-price="nftDetails.price"
      :coin="(!nftDetails.unit && 'XWC') || nftDetails.unit"
    />
    <DialogBidding
      v-if="isShowDialogBidding"
      :id="anctionDetail.id.toString()"
      :anction-id="anctionDetail.auctionId"
      :token-id="tokenId"
      :coin="anctionDetail.auctionCoin"
      :anction-price="anctionMaxPrice"
      :anction-status="anctionDetail.auctionStatus"
      :min-add="anctionDetail.auctionMinMarkup"
    />
    <DialogDownload v-if="isShowDownloadDialog" />
    <DialogRelink v-if="isShowRelinkDialog" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import moment from 'moment'
import http from '../../api/http'
export default {
  props: {},
  asyncData({ route, redirect }) {
    if (!route.params.token) {
      redirect('/home')
    }
  },
  data() {
    return {
      nftDetails: {},
      currentPage: 1,
      pageSize: 10,
      nftRecordList: [],
      tokenId: this.$route.params.token,
      isCreatePrice: 0, // 是否为创建售卖 1售卖 2售卖中 0无状态
      isCreateAnction: 0, // 是否为创建拍卖 1拍卖 2拍卖中 0无状态
      anctionDetail: {},
      anctionRecordList: [],
      followStatus: 0,
    }
  },

  computed: {
    ...mapState('global', [
      'isShowCancelSell',
      'isShowBuyConfirm',
      'isShowDialogAuction',
      'isShowSetPrice',
      'isShowDialogBidding',
      'isShowTransferNft',
      'isShowCancelAuction',
      'coinList',
      'address',
      'isExtInstalled',
      'isWalletInited',
      'isShowDownloadDialog',
      'isShowRelinkDialog',
    ]),
    anctionMaxPrice() {
      const details = this.anctionDetail
      return (!details.auctionStatus && details.auctionRetainPrice) || details.auctionMaxPrice
    },
  },
  mounted() {
    this.getNftDetails()
    this.getNftRecord()
    this.getAnctionRecordList()
  },
  destroyed() {
    this.$store.commit('global/set_state', {
      isShowCancelSell: false,
      isShowBuyConfirm: false,
      isShowDialogAuction: false,
      isShowSetPrice: false,
      isShowDialogBidding: false,
      isShowTransferNft: false,
      isShowCancelAuction: false,
    })
  },
  methods: {
    formatTime(time) {
      return moment(time).format('YYYY-MM-DD h:mm:ss')
    },
    // 是否链接钱包公共方法
    async isExtInstalledFunc(funcName, key) {
      if (!this.isExtInstalled) {
        // 弹窗提示下载钱包插件
        this.$store.commit('global/set_state', { isShowDownloadDialog: true })
        return false
      }
      if (!this.isWalletInited) {
        const res = await this.$wallet.connectWallet()
        if (res.code === '0') {
          this.$store.commit('global/set_state', { address: res.data.walletAddress.address, isWalletInited: res.data.isWalletInited })
          ;(key && this[funcName](key)) || this[funcName]()
        } else {
          // 提示重新链接钱包
          this.$store.commit('global/set_state', { isShowRelinkDialog: true })
        }
      } else {
        ;(key && this[funcName](key)) || this[funcName]()
      }
    },
    //  领取NFT接口
    async toReceiveNftFunc() {
      const res1 = await this.$wallet.endAuctionNFT(this.anctionDetail.auctionId)
      if (res1.code === '0') {
        const res2 = await http(this.$axios).receiveAnction({
          fileTokenId: this.tokenId,
          userAddress: this.address,
        })
        if (res2.code === 200) {
          this.getNftDetails()
          this.getNftRecord()
          this.getAnctionRecordList()
          this.$message.success(this.$t('领取成功'))
        } else {
          this.$message.error(this.$t('领取失败'))
        }
      }
    },
    // 领取NFT
    toReceiveNft() {
      this.isExtInstalledFunc('toReceiveNftFunc')
    },
    isOwner() {
      return (
        this.nftDetails.userAddress === this.address &&
        this.anctionDetail.auctionMaxEr !== this.address &&
        this.nftDetails.fileStatus === 5 &&
        this.anctionDetail.auctionStatus === 1
      )
    },
    isOthers() {
      return (
        this.nftDetails.userAddress !== this.address &&
        this.anctionDetail.auctionMaxEr !== this.address &&
        this.nftDetails.fileStatus === 5 &&
        this.anctionDetail.auctionStatus <= 1
      )
    },
    // 关注接口
    async followFunc() {
      const res1 = await http(this.$axios).followNft({
        userAddress: this.address,
        tokenId: this.tokenId,
      })
      if (res1.code === 200) {
        this.getNftDetails()
        this.followStatus = 1
        this.$message.success(this.$t('关注成功'))
      } else {
        this.$message.error(this.$t('关注失败'))
      }
    },
    // 关注
    follow() {
      this.isExtInstalledFunc('followFunc')
    },

    // 取消关注
    async unFollow() {
      const res = await http(this.$axios).onFollowNft({
        userAddress: this.address,
        tokenId: this.tokenId,
      })
      if (res.code === 200) {
        this.getNftDetails()
        this.followStatus = 0
        this.$message.success(this.$t('取消关注成功'))
      } else {
        this.$message.error(this.$t('取消关注失败'))
      }
    },
    // 获取拍卖纪录
    async getAnctionRecordList() {
      const res = await http(this.$axios).getAuctionLog(this.tokenId)
      if (res.code === 200 && res.data) {
        this.anctionRecordList = res.data
      }
    },
    // 获取历史记录
    async getNftRecord() {
      const res = await http(this.$axios).getFileLog({ tokenId: this.tokenId, page: this.currentPage, pageSize: this.pageSize })
      if (res.code === 200 && res.data) {
        this.nftRecordList = res.data.records
      }
    },
    // 获取拍卖详情
    async getAnctionDetailData() {
      const res = await http(this.$axios).getAnctionDetail({ fileTokenId: this.tokenId })
      if (res.code === 200 && res.data) {
        this.anctionDetail = res.data
        this.$store.commit('anction/set_state', {
          coin: this.anctionDetail.auctionCoin,
          anctionPrice: this.anctionDetail.auctionRetainPrice,
          minAdd: this.anctionDetail.auctionMinMarkup,
          anctionId: this.anctionDetail.auctionId,
          id: this.anctionDetail.id,
        })
        this.isCreateAnction = 2
      } else {
        this.isCreateAnction = 2
      }
    },
    // 获取nft详情
    async getNftDetails() {
      const res = await http(this.$axios).getFileDetail({ tokenId: this.tokenId, userAddress: this.address })
      if (res.code === 200 && res.data && res.data.filePO) {
        const dataObj = res.data
        this.nftDetails = dataObj.filePO
        this.nftDetails.fileName = `${dataObj.imgUrl}${this.nftDetails.fileName}`
        this.followStatus = this.nftDetails.collect
        if (this.nftDetails.fileStatus === 4) {
          this.isCreatePrice = 2
          this.$store.commit('price/set_state', { coin: this.nftDetails.unit, nftPrice: this.nftDetails.price })
        } else {
          this.isCreatePrice = 1
          this.$store.commit('price/set_state', { coin: '', nftPrice: '' })
        }
        if (this.nftDetails.fileStatus === 5) {
          this.getAnctionDetailData()
        } else {
          this.isCreateAnction = 1
          this.$store.commit('anction/set_state', {
            coin: 'XWC',
            anctionPrice: '',
            minAdd: '',
          })
        }
      }
    },
    // 获取币种字典表
    async getCoinData(key) {
      const result = await this.$wallet.getCoinList()
      if (result.code === '0' && result.data) {
        const coinObj = result.data
        this.$store.commit('global/set_state', { coinList: coinObj })
      }
    },
    // 打开弹窗方法
    openDialogFunc(key) {
      if (!Object.keys(this.coinList).length) {
        this.getCoinData().then(() => {
          this.$store.commit('global/set_state', { [key]: true })
        })
      } else {
        this.$store.commit('global/set_state', { [key]: true })
      }
    },
    // 打开弹窗公共方法
    openDialog(key) {
      this.isExtInstalledFunc('openDialogFunc', key)
    },
  },
}
</script>

<style scoped lang="scss">
.main-container {
  position: relative;
  width: 1200px;
  margin: 0 auto;
  padding-bottom: 60px;
  .detail-top {
    margin-top: 48px;
    display: flex;
    margin-bottom: 39px;
  }
  .price-container {
    width: 396px;
    background: #ffffff;
    border-radius: 4px;
    border: 1px solid #ebebeb;
    border-bottom: none;
    &.price-position {
      margin-top: 24px;
    }
    .price-t,
    .price-b {
      height: 100px;
      display: flex;
      box-sizing: border-box;
    }
    .price-b {
      padding: 30px 0 26px 26px;
      border-bottom: 1px solid #ebebeb;
    }
    .price-t {
      border-bottom: 1px solid #ebebeb;
      padding: 16px 0 20px 26px;
    }
    .price-info {
      width: 50%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      p {
        &:nth-child(1) {
          font-size: 14px;
          font-weight: 400;
          color: #999999;
          line-height: 20px;
        }
        &:nth-child(2) {
          font-size: 18px;
          color: #333333;
          line-height: 22px;
        }
        &:nth-child(3) {
          font-size: 16px;
          color: #999999;
          line-height: 19px;
        }
      }
      .auctionCreater {
        width: 350px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
    }
  }
  .top-left {
    margin-right: 62px;
    .file-text,
    .audio,
    video,
    img {
      width: 396px;
      height: 396px;
      border-radius: 4px;
      border: 2px solid #ebebeb;
      margin-bottom: 20px;
    }
    .audio {
      display: flex;
      align-items: center;
    }
    .file-text {
      overflow: hidden;
      display: -webkit-box;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 24;
      word-break: break-all;
    }
  }
  .top-right {
    width: 100%;
    .title-container {
      width: 100%;
      display: flex;
      justify-content: space-between;
      h2 {
        font-size: 30px;
        font-weight: 600;
        color: #333333;
        line-height: 42px;
      }
      .focus {
        width: 110px;
        height: 40px;
        background: #333333;
        border-radius: 4px;
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        line-height: 40px;
        text-align: center;
        cursor: pointer;
        user-select: none;
        &.unfollow {
          background: #ffffff;
          color: #333333;
          border: 1px solid #333333;
        }
      }
    }
    .create,
    .all {
      display: flex;
      span {
        &:nth-child(1) {
          font-size: 14px;
          width: 45px;
          font-weight: 400;
          color: #999999;
          line-height: 20px;
          margin-right: 21px;
        }
        &:nth-child(2) {
          font-size: 14px;
          color: #333333;
          line-height: 22px;
        }
      }
    }
    .create {
      margin-top: 25px;
      margin-bottom: 20px;
    }
    .describe {
      margin-top: 38px;
      margin-bottom: 42px;
      padding: 27px 20px;
      width: 100%;
      height: 259px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #ebebeb;
      font-size: 14px;
      font-weight: 400;
      color: #00000080;
      line-height: 22px;
    }
    .details-btns {
      text-align: right;
      height: 50px;
      div {
        display: inline-block;
        width: 182px;
        height: 50px;
        background: linear-gradient(180deg, #333333 0%, #333333 100%);
        border-radius: 4px;
        line-height: 50px;
        font-size: 18px;
        font-weight: 600;
        color: #ffffff;
        text-align: center;
        cursor: pointer;
        user-select: none;
        margin-left: 18px;
        &.transfer {
          background: #43cee2;
        }
        &.cancel {
          background: #fd3434;
        }
      }
    }
  }
  .detail-record {
    width: 100%;
    min-height: 130px;
    max-height: 450px;
    border: 1px solid #ebebeb;
    margin-bottom: 20px;
    overflow: hidden;
    // padding: 0 31px 0 25px;
    .record-title {
      height: 50px;
      line-height: 50px;
      font-size: 14px;
      font-weight: bold;
      color: #999999;
      padding: 0 31px 0 25px;
      border-bottom: 1px solid #ebebeb;
    }
    .record-box {
      min-height: 80px;
      max-height: 400px;
      overflow-y: scroll;
    }
    .record-item {
      height: 40px;
      line-height: 40px;
      padding: 0 31px 0 25px;
      display: flex;
      justify-content: space-between;
      img {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        vertical-align: middle;
        margin-right: 16px;
      }

      .record-info {
        font-size: 16px;
        font-weight: 400;
        color: #666666;
      }
      .record-time {
        font-size: 16px;
        font-weight: 400;
        color: #666666;
      }
    }
  }
  .copyrightFee-box {
    margin-top: 20px;
    .copyrightFee-label {
      font-size: 12px;
      width: 41px;
      font-weight: 400;
      color: #999999;
      line-height: 20px;
      margin-right: 21px;
    }
    .copyrightFee-text {
      font-size: 12px;
      color: #333333;
      line-height: 22px;
    }
  }
}
</style>
