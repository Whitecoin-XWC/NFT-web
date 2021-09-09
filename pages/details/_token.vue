<template>
  <div class="main-container">
    <div class="detail-top">
      <div class="top-left">
        <div class="preview-box">
          <viewer v-if="nftDetails.mediaType === 1 || nftDetails.mediaType === 4" class="viewer" :images="[nftDetails.fileName]">
            <img v-for="(src, index) in [nftDetails.fileName]" :key="index" :src="src" />
          </viewer>
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
        </div>
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
    <div v-if="nftDetails.fileStatus === 4 || nftDetails.fileStatus === 5" class="detailinfo-container">
      <div v-if="nftDetails.fileStatus === 4" class="sell-info">
        <p class="sell-item">{{ $t('售价') }}</p>
        <p class="sell-item">{{ nftDetails.price }} {,;{ nftDetails.unit }}</p>
        <p class="sell-item">≈${{ nftDetails.priceUsdt }}</p>
      </div>
      <div v-if="nftDetails.fileStatus === 5" class="anction-info">
        <div v-if="anctionDetail.remainingTime || anctionDetail.auctionStatus === 2" class="price-info">
          <p class="ancton-item">{{ $t('拍卖结束') }}</p>
          <p class="ancton-item">
            <Time v-if="anctionDetail.remainingTime" ref="Time" :total-remain="anctionDetail.remainingTime" @preciseTime="getAnctionDetailData">
              <template #time="slotProps">
                <span>{{ slotProps.time.hour }}h{{ slotProps.time.minute }}m{{ slotProps.time.second }}s</span>
              </template>
            </Time>
            <span v-if="!anctionDetail.remainingTime">--</span>
          </p>
        </div>
        <div v-if="!anctionDetail.remainingTime && anctionDetail.auctionStatus === 0" class="price-info">
          <p class="ancton-item">{{ $t('保留价') }}</p>
          <p class="ancton-item">{{ anctionDetail.auctionRetainPrice }} {{ anctionDetail.auctionCoin }}</p>
          <p class="ancton-item">≈${{ anctionDetail.auctionRetainPriceUsdt }}</p>
        </div>
        <div v-if="!anctionDetail.remainingTime && anctionDetail.auctionStatus === 0" class="price-info">
          <p class="ancton-item">{{ $t('最低加价') }}</p>
          <p class="ancton-item">{{ anctionDetail.auctionMinMarkup }} {{ anctionDetail.auctionCoin }}</p>
          <p class="ancton-item">≈${{ anctionDetail.auctionMinMarkupUsdt }}</p>
        </div>

        <div v-if="anctionDetail.remainingTime || anctionDetail.auctionStatus === 2" class="price-info">
          <p class="ancton-item">{{ $t('最高出价') }}</p>
          <p class="ancton-item">{{ anctionDetail.auctionMaxPrice }} {{ anctionDetail.auctionCoin }}</p>
          <p class="ancton-item">≈${{ anctionDetail.auctionMaxPriceUsdt }}</p>
        </div>
        <div v-if="(anctionDetail.remainingTime || anctionDetail.auctionStatus === 2) && anctionDetail.auctionStatus < 2" class="price-info">
          <p class="ancton-item">{{ $t('最低加价') }}</p>
          <p class="ancton-item">{{ anctionDetail.auctionMinMarkup }} {{ anctionDetail.auctionCoin }}</p>
          <p class="ancton-item">≈${{ anctionDetail.auctionMinMarkupUsdt }}</p>
        </div>
        <div v-if="anctionDetail.remainingTime" class="bidding">
          <p class="bidding-item">{{ $t('竞拍人') }}</p>
          <p class="bidding-item" :title="anctionDetail.userName || anctionDetail.auctionMaxEr">
            {{ anctionDetail.userName || anctionDetail.auctionMaxEr }}
          </p>
        </div>
      </div>
    </div>
    <div class="detail-record">
      <p class="record-title">{{ $t('历史记录') }}</p>
      <el-table :data="nftRecordList" style="width: 100%" height="203">
        <el-table-column prop="userId" :label="$t('用户')" width="270"> </el-table-column>
        <el-table-column :label="$t('操作')" width="200">
          <template slot-scope="scope">
            <p>{{ $t(scope.row.logInfo) }}</p>
          </template>
        </el-table-column>
        <el-table-column :label="$t('金额')">
          <template slot-scope="scope">
            <p>{{ formatAmount(scope.row) }}</p>
          </template>
        </el-table-column>
        <el-table-column :label="$t('交易ID')" width="350">
          <template slot-scope="scope">
            <p style="cursor: pointer" @click="toWhitecoin(scope.row)">{{ formatTrade(scope.row) }}</p>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" :label="$t('时间')" width="270"> </el-table-column>
      </el-table>
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
    <!-- 留言板 -->
    <div class="comments-container">
      <div class="comments-title">{{ $t('留言板') }}</div>
      <div v-if="commentsList.length" class="comments-box">
        <div v-for="(item, index) in commentsList" :key="index" class="comments-item">
          <div class="comments-user">
            <p>{{ item.nickName || item.userAddress }}:</p>
            <p :title="item.messageContext">
              {{ item.messageContext }}
            </p>
          </div>
          <div class="comments-time">{{ item.createTime }}</div>
        </div>
      </div>
      <div v-if="commentsList.length && commentsList.length < commentsCount" class="comments-loading">
        <span class="comments-loadingtext" @click="loadingMessage">{{ $t('加载更多') }}</span>
        <i></i>
      </div>
      <el-input v-model="remark" class="comments-textarea" :placeholder="$t('输出你想留言的信息')" type="textarea" maxlength="1000" show-word-limit></el-input>
      <div class="comments-submit" @click="submitMessage">{{ $t('提交') }}</div>
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
      remark: '',
      commentsList: [],
      commentsCount: 0,
      msgPageSize: 5,
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
    this.queryMessageList()
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
    toWhitecoin(item) {
      if (item.other !== '') {
        const other = JSON.parse(item.other)
        window.open(`https://explorer.whitecoin.info/#/transfer_details/${other.tractionId}/0?txHash=${other.tractionId}`)
      }
    },
    formatTrade(item) {
      if (item.other !== '') {
        const other = JSON.parse(item.other)
        return other.tractionId
      } else {
        return '- -'
      }
    },
    formatAmount(item) {
      if (item.other !== '') {
        const other = JSON.parse(item.other)
        if (other.price) {
          return other.price + other.coinType
        } else {
          return '- -'
        }
      } else {
        return '- -'
      }
    },
    loadingMessage() {
      this.msgPageSize += 100
      this.queryMessageList()
    },
    // 留言列表
    async queryMessageList() {
      const res = await http(this.$axios).getMessageList({
        page: 1,
        pageSize: this.msgPageSize,
        tokenId: this.tokenId,
      })
      if (res.code === 200) {
        this.commentsList = res.data.records
        this.commentsCount = res.data.count
      }
    },
    // 新增留言
    async submitMessage() {
      if (!this.remark.length) {
        this.$message.error(this.$t('留言信息不能为空'))
        return false
      }
      const res = await http(this.$axios).addMessage({
        messageContext: this.remark,
        tokenId: this.tokenId,
        userAddress: this.address,
      })
      if (res.code === 200) {
        this.queryMessageList()
        this.remark = ''
        this.$message.success(this.$t('留言成功'))
      } else {
        this.$message.error(this.$t('留言失败'))
      }
    },
    // 格式化时间
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
      try {
        const approve = await http(this.$axios).apiApprove({
          message: JSON.stringify({
            action: 'endAuctionNFT',
            fileTokenId: this.tokenId,
            userAddress: this.address,
          }),
        })
        if (approve) {
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
        }
      } catch (err) {}
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
    async getCoinData() {
      const result = await this.$wallet.getCoinList()
      if (result.code === '0' && result.data) {
        this.$store.commit('global/set_state', { coinList: result.data })
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
    margin-bottom: 70px;
    display: flex;
  }

  .top-left {
    margin-right: 34px;
  }
  .preview-box {
    width: 385px;
    height: 406px;
    border-radius: 20px;
    border: 2px solid #ebebeb;
    box-sizing: border-box;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    .file-text,
    .audio,
    video {
      width: 100%;
      height: 100%;
    }
    .viewer {
      cursor: pointer;
      min-width: 0;
      max-width: 385px;
      min-height: 0;
      max-height: 406px;

      img {
        min-width: 0;
        max-width: 385px;
        min-height: 0;
        max-height: 406px;
      }
    }
    .audio {
      display: flex;
      align-items: center;
    }
    .file-text {
      line-height: 27px;
      overflow: hidden;
      display: -webkit-box;
      text-overflow: ellipsis;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 15;
      word-break: break-all;
    }
  }
  .top-right {
    width: 100%;
    height: 406px;
    padding: 27px 43px 20px 43px;
    background: #ffffff;
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
        width: 64px;
        height: 29px;
        background: #595eff;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 400;
        color: #ffffff;
        line-height: 29px;
        text-align: center;
        cursor: pointer;
        user-select: none;
        &.unfollow {
          background: #ffffff;
          color: #666666ff;
          border: 1px solid #979797;
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
      margin-top: 26px;
      margin-bottom: 26px;
      padding: 27px 20px;
      width: 100%;
      height: 96px;
      background: #ffffff;
      border-radius: 4px;
      border: 1px solid #8c8e9b;
      font-size: 14px;
      font-weight: 400;
      color: #00000080;
      line-height: 22px;
    }
    .details-btns {
      text-align: left;
      height: 50px;
      div {
        display: inline-block;
        width: 115px;
        height: 32px;
        background: #e92727;
        border-radius: 6px;
        line-height: 32px;
        font-size: 18px;
        font-weight: 500;
        color: #ffffff;
        text-align: center;
        cursor: pointer;
        user-select: none;
        margin-right: 10px;
        &.transfer {
          background: #595effff;
        }
        &.cancel {
          background: #ffffff;
          color: #666666;
          border: 1px solid #979797;
        }
      }
    }
  }
  .detail-record {
    width: 100%;
    height: 254px;
    background: #ffffff;
    border: 1px solid #ebeefd;
    margin-bottom: 20px;
    overflow: hidden;
    .record-title {
      font-size: 18px;
      font-weight: 500;
      color: #666666;
      padding-left: 39px;
      height: 50px;
      line-height: 50px;
    }

    /deep/.el-table td {
      border-style: none;
      padding-left: 30px;
      font-size: 14px;
      font-weight: 400;
      color: #333333;
    }
    /deep/.el-table th.is-leaf {
      font-size: 14px;
      font-weight: 400;
      color: #666666;
      padding-left: 30px;
      border-bottom: 1px solid #dde1f4;
    }
    /deep/.el-table__body tr:hover > td {
      background: transparent;
    }
    /deep/.el-table th {
      background: #ffffff !important;
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
  .detailinfo-container {
    width: 1200px;
    margin-right: 0 auto;
    margin-bottom: 30px;
    height: 115px;
    background: #ffffff;
    border: 1px solid #ebeefd;
    .sell-info {
      width: 170px;
      padding-left: 39px;
      padding-top: 17px;
      display: flex;
      flex-direction: column;
      .sell-item {
        text-align: left;
        &:nth-child(1) {
          font-size: 12px;
          font-weight: 400;
          color: #666666;
          line-height: 17px;
          line-height: 20px;
        }
        &:nth-child(2) {
          font-size: 16px;
          font-weight: 500;
          color: #333333;
          line-height: 22px;
        }
        &:nth-child(3) {
          font-size: 12px;
          font-weight: 400;
          color: #999999;
          line-height: 17px;
        }
      }
    }
    .anction-info {
      display: flex;

      .price-info {
        width: 170px;
        padding-left: 39px;
        padding-top: 17px;
        display: flex;
        flex-direction: column;
        .ancton-item {
          text-align: left;
          &:nth-child(1) {
            font-size: 12px;
            font-weight: 400;
            color: #666666;
            line-height: 17px;
            line-height: 20px;
          }
          &:nth-child(2) {
            font-size: 16px;
            font-weight: 500;
            color: #333333;
            line-height: 22px;
          }
          &:nth-child(3) {
            font-size: 12px;
            font-weight: 400;
            color: #999999;
            line-height: 17px;
          }
        }
      }
      .bidding {
        padding-top: 17px;
        padding-right: 39px;
        display: flex;
        flex-direction: column;
        width: 350px;
        .bidding-item {
          text-align: left;
          &:nth-child(1) {
            font-size: 12px;
            font-weight: 400;
            color: #666666;
            line-height: 17px;
            line-height: 20px;
          }
          &:nth-child(2) {
            font-size: 16px;
            font-weight: 500;
            color: #333333;
            line-height: 22px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
          }
        }
      }
    }
  }
  .comments-container {
    width: 1200px;
    background: #ffffff;
    border: 1px solid #ebeefd;
    padding-bottom: 69px;
    .comments-title {
      text-indent: 39px;
      font-size: 18px;
      font-weight: 500;
      color: #666666;
      line-height: 47px;
      border-bottom: 1px solid #dde1f4;
    }
    .comments-box {
      .comments-item {
        width: 1122px;
        height: 91px;
        border-bottom: 1px solid #dde1f4;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        .comments-user {
          p {
            &:first-child {
              font-size: 14px;
              font-weight: 400;
              color: #666666;
              line-height: 20px;
              margin-top: 20px;
              margin-bottom: 10px;
            }
            &:last-child {
              width: 860px;
              font-size: 14px;
              font-weight: 400;
              color: #333333;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              line-height: 20px;
            }
          }
        }
        .comments-time {
          font-size: 14px;
          font-weight: 400;
          color: #666666;
          line-height: 20px;
          margin-top: 48px;
        }
      }
    }
    .comments-loading {
      text-align: center;
      width: 100px;
      cursor: pointer;
      margin: 0 auto;
      margin-top: 30px;

      .comments-loadingtext {
        font-size: 15px;
        font-weight: 400;
        color: #595eff;
        line-height: 20px;
        vertical-align: middle;
      }
      i {
        display: inline-block;
        width: 24px;
        height: 14px;
        background: url('../../assets/img/details/loading.png');
        background-size: 100% 100%;
        vertical-align: middle;
      }
    }
    .comments-textarea {
      width: 1122px;
      background: #ffffff;
      margin-left: 50%;
      transform: translateX(-50%);
      margin-top: 30px;
      margin-bottom: 30px;
      /deep/textarea {
        height: 115px;
        border-radius: 6px;
        border: 1px solid #8c8e9b;
      }
    }
    .comments-submit {
      margin: 0 auto;
      width: 146px;
      height: 32px;
      background: #595eff;
      border-radius: 6px;
      font-size: 18px;
      font-weight: 400;
      color: #ffffff;
      line-height: 32px;
      text-align: center;
      cursor: pointer;
      user-select: none;
    }
  }
}
</style>
