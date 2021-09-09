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
        <div v-if="item.mediaType === 1 || item.mediaType === 4" class="img-preview">
          <img :src="item.fileName" alt="" />
        </div>
        <div v-if="item.mediaType === 2" class="video-preview">
          <video :src="item.fileName" controls controlslist="nodownload"></video>
        </div>
        <div v-if="item.mediaType === 3" class="audio-preview">
          <div class="audio">
            <audio :src="item.fileName" controls controlslist="nodownload"></audio>
          </div>
        </div>
        <div v-if="item.mediaType === 0" class="text-preview">
          <div class="file-text">{{ item.txtContent }}</div>
        </div>
        <div class="album-user">
          <p class="album-title">{{ item.fileTitle }}</p>
          <p class="album-author">{{ $t('创作者') }}：{{ item.userName || item.userAddress }}</p>
        </div>
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
      :current-page="homeCurrentPage"
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
      pageSize: 6,
      nftList: [],
      total: 0,
    }
  },
  computed: {
    ...mapState('global', ['address', 'homeCurrentPage', 'tabIndex', 'mediaType', 'status']),
  },
  mounted() {
    this.getNftList()
  },

  methods: {
    toDetails(item) {
      this.$router.push(`/details/${item.id}`)
    },
    pageChange(index) {
      this.$store.commit('global/set_state', { homeCurrentPage: index })
      this.getNftList()
    },
    async getNftList() {
      const res = await http(this.$axios).getSelectIndexList({
        page: this.homeCurrentPage,
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
      this.$store.commit('global/set_state', { homeCurrentPage: 1, tabIndex: index })
      if (index < 5) {
        this.$store.commit('global/set_state', { mediaType: index, status: null })
      } else if (index === 5) {
        this.$store.commit('global/set_state', { mediaType: null, status: null })
      } else if (index === 6) {
        this.$store.commit('global/set_state', { mediaType: null, status: 4 })
      }
      this.getNftList()
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
    width: 1200px;
    height: 75px;
    background: #ffffff;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 22px;

    i {
      height: 50px;
      width: 1px;
      background: #e6e6e6;
      margin-right: 40px;
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
    /deep/.el-pager li {
      background: transparent;
    }
    /deep/ .btn-prev,
    /deep/ .btn-next {
      background: transparent;
    }
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
