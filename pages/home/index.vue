<template>
  <div class="main-container">
    <div class="main-btns">
      <div :class="['btn-item', tabIndex == 6 && 'tab-active']" @click="tabType(6)">{{ $t('出售') }}</div>
      <i></i>
      <div :class="['btn-item', tabIndex == 5 && 'tab-active']" @click="tabType(5)">{{ $t('全部') }}</div>
      <div :class="['btn-item', tabIndex == 2 && 'tab-active']" @click="tabType(2)">{{ $t('视频') }}</div>
      <div :class="['btn-item', tabIndex == 3 && 'tab-active']" @click="tabType(3)">{{ $t('音频') }}</div>
      <div :class="['btn-item', tabIndex == 1 && 'tab-active']" @click="tabType(1)">{{ $t('图像') }}</div>
      <div :class="['btn-item', tabIndex == 4 && 'tab-active']" @click="tabType(4)">{{ $t('动图') }}</div>
      <div :class="['btn-item', tabIndex == 0 && 'tab-active']" @click="tabType(0)">{{ $t('文本') }}</div>
    </div>
    <div v-if="nftList.length" class="main-items">
      <div v-for="(item, index) in nftList" :key="index" class="album-item" @click="toDetails(item)">
        <img v-if="item.mediaType === 1 || item.mediaType === 4" :src="item.fileName" alt="" />
        <video v-if="item.mediaType === 2" :src="item.fileName" controls controlslist="nodownload"></video>
        <div v-if="item.mediaType === 3" class="audio">
          <audio :src="item.fileName" controls controlslist="nodownload"></audio>
        </div>
        <div v-if="item.mediaType === 0" class="file-text">{{ item.txtContent }}</div>
        <p class="album-title">{{ item.fileTitle }}</p>
        <p class="album-author">{{ $t('创作者') }}：{{ item.userName }}</p>
        <div class="album-price">
          <div v-if="(item.pmPrice && !item.price && !item.auctionMaxPrice) || (!item.pmPrice && !item.price)">
            <p>{{ $t('保留价') }}</p>
            <p v-if="item.pmPrice && !item.price">{{ item.pmPrice }}{{ item.coinType }}</p>
            <p v-if="!item.pmPrice && !item.price">- -</p>
          </div>
          <div v-if="!item.price && item.auctionMaxPrice">
            <p>{{ $t('当前最高价') }}</p>
            <p>{{ item.auctionMaxPrice }}{{ item.coinType }}</p>
          </div>
          <div v-if="item.pmPrice && !item.price">
            <p>{{ $t('拍卖结束时间') }}</p>
            <p v-if="item.remainingTime">
              <Time :total-remain="item.remainingTime">
                <template #time="slotProps">
                  <span>{{ slotProps.time.hour }}h{{ slotProps.time.minute }}m{{ slotProps.time.second }}s</span>
                </template>
              </Time>
            </p>
            <p v-if="!item.remainingTime">- -</p>
          </div>
          <div v-if="(!item.pmPrice && item.price) || (!item.pmPrice && !item.price)">
            <p>{{ $t('售价') }}</p>
            <p v-if="!item.pmPrice && item.price">{{ item.price }}{{ item.unit }}</p>
            <p v-if="!item.pmPrice && !item.price">- -</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="!nftList.length" class="not-data">
      <div class="not-img"></div>
      <p>{{ $t('暂无数据') }}</p>
    </div>
    <el-pagination
      v-if="nftList.length"
      class="pagination"
      :total="total"
      :page-size="pageSize"
      :pager-count="5"
      layout="prev, pager, next"
      @current-change="pageChange"
    >
    </el-pagination>
  </div>
</template>

<script>
import { mapState } from 'vuex'
import http from '../../api/http'
export default {
  props: {},
  data() {
    return {
      tabIndex: 5,
      currentPage: 1,
      pageSize: 8,
      nftList: [],
      total: 0,
      mediaType: null,
      status: null,
    }
  },
  computed: {
    ...mapState('global', ['address']),
  },
  mounted() {
    this.getNftList()
  },

  methods: {
    toDetails(item) {
      this.$router.push(`/details/${item.id}`)
    },
    pageChange(index) {
      this.currentPage = index
      this.getNftList()
    },
    async getNftList() {
      const res = await http(this.$axios).getSelectIndexList({
        page: this.currentPage,
        pageSize: this.pageSize,
        mediaType: this.mediaType,
        status: this.status,
      })
      if (res.code === 200 && res.data) {
        this.nftList = res.data.records
        this.total = res.data.count
        const url = res.data.imgUrl
        this.nftList.forEach((item) => {
          return (item.fileName = `${url}${item.fileName}`)
        })
      }
    },
    tabType(index) {
      if (index < 5) {
        this.mediaType = index
        this.status = null
        this.getNftList()
      } else if (index === 5) {
        this.mediaType = null
        this.status = null
        this.getNftList()
      } else if (index === 6) {
        this.mediaType = null
        this.status = 4
        this.getNftList()
      }
      this.tabIndex = index
    },
  },
}
</script>

<style scoped lang="scss">
.main-container {
  position: relative;
  margin: 0 auto;
  width: 1200px;
  .main-btns {
    display: flex;
    margin-top: 22px;

    i {
      height: 50px;
      width: 1px;
      background: #e6e6e6;
      margin-right: 20px;
    }
  }
  .main-items {
    margin: 0 auto;
    padding-top: 30px;
    display: flex;
    flex-wrap: wrap;
  }
  .pagination {
    text-align: center;
  }
  .not-data {
    text-align: center;
    margin-top: 159px;
    margin-bottom: 159px;
    .not-img {
      margin: 0 auto;
      width: 257px;
      height: 200px;
      background: url('../../assets/img/personal/not-data.png');
      background-size: 100% 100%;
    }
    p {
      margin-top: 12px;
      font-size: 20px;
      font-weight: 500;
      color: rgba(0, 0, 0, 0.5);
      line-height: 28px;
    }
  }
}
</style>
