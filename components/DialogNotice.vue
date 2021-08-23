<template>
  <div class="notice-container">
    <el-tabs v-model="activeName" @tab-click="handleClick">
      <el-tab-pane :label="$t('您的竞标')" name="your">
        <div class="your-scroll">
          <p v-if="!yourList.length" class="not-data">{{ $t('暂无数据') }}</p>
          <div v-if="yourList.length" class="your-container">
            <div v-for="(item, index) in yourList" :key="index" class="your-item" @click="goToDetails(item)">
              <div class="your-l">
                <p class="your-name">{{ $t(item.auctionResult) }}</p>
                <div class="your-detail">
                  <!-- <img :src="item.filePath" alt="" /> -->
                  <div class="your-info">
                    <p>{{ item.nFTName }}</p>
                    <p v-if="item.remainingTime">
                      <Time :total-remain="item.remainingTime">
                        <template #time="slotProps">
                          <span>{{ slotProps.time.hour }}h{{ slotProps.time.minute }}m{{ slotProps.time.second }}s</span>
                        </template>
                      </Time>
                    </p>
                    <p v-if="!item.remainingTime">{{ $t('拍卖结束') }}</p>
                  </div>
                </div>
              </div>
              <div class="your-r">
                <p>{{ item.auctionPrice }} {{ item.coinType }}</p>
                <p class="your-p">${{ item.auctionPriceUsdt }}</p>
                <i class="el-icon-right icon-right"></i>
              </div>
            </div>
            <div v-if="yourCount >= pageSize" class="more" @click="loadMore">{{ $t('加载更多') }}</div>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane :label="$t('版权费')" name="royalties">
        <div class="your-scroll">
          <p v-if="!royaltiesList.length" class="not-data">{{ $t('暂无数据') }}</p>
          <div v-if="royaltiesList.length" class="your-container">
            <div v-for="(item, index) in royaltiesList" :key="index" class="your-item" @click="goToDetails(item)">
              <div class="your-l">
                <div class="your-detail">
                  <!-- <img :src="item.filePath" alt="" /> -->
                  <div class="your-info">
                    <p>{{ item.nftname }}</p>
                    <p class="name-p2" :title="item.provider">{{ $t('创作者') }}：{{ item.provider }}</p>
                  </div>
                </div>
              </div>
              <div class="your-r">
                <p>{{ item.copyrightFee }} {{ item.coinType }}</p>
                <p class="your-p">${{ item.copyrightFeeUsdt }}</p>
                <i class="el-icon-right icon-right"></i>
              </div>
            </div>
            <div v-if="royaltiesCount >= pageSize" class="more" @click="loadMore">{{ $t('加载更多') }}</div>
          </div>
        </div></el-tab-pane
      >
    </el-tabs>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import http from '../api/http'
export default {
  props: {
    msgNum: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      activeName: 'your',
      yourPage: 1,
      royaltiesPage: 1,
      pageSize: 10,
      noticeType: 1,
      yourList: [],
      royaltiesList: [],
      yourCount: 0,
      royaltiesCount: 0,
    }
  },
  computed: {
    ...mapState('global', ['address']),
  },
  mounted() {},
  methods: {
    goToDetails(item) {
      this.$router.push(`/details/${item.tokenId}`)
      document.querySelector('.msg-box').click()
    },
    loadMore() {
      if (this.noticeType === 1) {
        this.yourPage += 1
      } else {
        this.royaltiesPage += 1
      }
      this.getNoticeData()
    },
    async getNoticeData() {
      const res = await http(this.$axios).getNoticeList({
        pageNo: this.noticeType === 1 ? this.yourPage : this.royaltiesPage,
        pageSize: this.pageSize,
        type: this.noticeType,
        userAddress: this.address,
      })
      if (res.code === 200) {
        const imgUrl = res.data.imgUrl
        if (this.noticeType === 1) {
          const myAnction = res.data.myAuction
          myAnction.forEach((item) => {
            item.filePath = `${imgUrl}${item.filePath}`
            this.yourList.push(item)
          })
          this.yourCount = res.data.count
        } else {
          const copyrightFee = res.data.copyrightFee
          copyrightFee.forEach((item) => {
            item.filePath = `${imgUrl}${item.filePath}`
            this.royaltiesList.push(item)
          })
          this.royaltiesCount = res.data.count
        }
      }
    },
    handleClick(tab) {
      if (tab.name === 'your') {
        this.noticeType = 1
        if (!this.yourList.length) {
          this.getNoticeData()
        }
      } else {
        this.noticeType = 2
        if (!this.royaltiesList.length) {
          this.getNoticeData()
        }
      }
    },
  },
}
</script>

<style scoped lang="scss">
.notice-container {
  position: absolute;
  z-index: 9;
  width: 386px;
  height: 460px;
  background: #ffffff;
  box-shadow: 0 9px 28px 8px rgba(0, 0, 0, 0.05), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12);
  top: 0;
  left: -180px;
  &::before {
    position: absolute;
    display: inline-block;
    content: '';
    border-top: 8px solid transparent;
    border-bottom: 8px solid #ffffff;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    top: -16px;
    left: 50%;
    transform: translateX(-50%);
  }
  /deep/.el-tabs__active-bar {
    background-color: #000000ff;
  }
  /deep/.el-tabs__item {
    padding: 0 20% !important;
    font-size: 16px;
    font-weight: 400;
    color: #00000040;
    &.is-active {
      font-weight: 600;
      color: #000000d9;
    }
  }
  .your-scroll {
    width: 100%;
    height: 400px;
    overflow: hidden;
  }
  .not-data {
    line-height: 400px;
    text-align: center;
    font-weight: 400;
    color: #00000080;
    font-size: 20px;
  }
  .your-container {
    width: 100%;
    height: 100%;
    padding: 18px 20px;
    box-sizing: border-box;
    overflow: scroll;
    .more {
      font-weight: bold;
      line-height: 50px;
      text-align: center;
      cursor: pointer;
    }
    .your-item {
      height: 100px;
      border-bottom: 1px solid #0000000f;
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      padding-right: 35px;
      position: relative;
      .icon-right {
        position: absolute;
        right: 5px;
        font-size: 18px;
        color: #999999;
        font-weight: 700;
        top: 41px;
      }

      .your-l {
        display: flex;
        flex-direction: column;
        justify-content: center;
        .your-name {
          font-size: 14px;
          font-weight: 700;
          color: #000000a6;
          line-height: 22px;
          margin-bottom: 9px;
        }
        .your-detail {
          display: flex;
          align-items: center;
          img {
            width: 40px;
            height: 40px;
            margin-right: 14px;
          }
          .your-info {
            p {
              &:first-child {
                font-size: 14px;
                font-weight: 400;
                color: #666666;
                line-height: 20px;
              }
              &:last-child {
                font-size: 14px;
                color: #666666;
                line-height: 19px;
              }
            }
            .name-p2 {
              font-size: 14px !important;
              font-weight: 400 !important;
              color: #999999 !important;
              line-height: 20px !important;
              width: 170px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
        }
      }
      .your-r {
        padding-top: 31px;
        font-size: 16px;
        color: #333333;
        line-height: 19px;
        .your-p {
          color: #666666;
        }
      }
    }
  }
}
</style>
