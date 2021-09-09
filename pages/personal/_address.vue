<template>
  <div class="main-container">
    <div class="user-container">
      <div v-if="nickName !== null" class="user-name">
        {{ nickName || $route.params.address }}
      </div>
      <p class="user-call">{{ introduction }}</p>
      <div v-if="$route.params.address === address" class="edituser-btn" @click="showEditDialog">{{ $t('编辑个人资料') }}</div>
    </div>
    <div class="person-btns">
      <div :class="['btn-item', source == 0 && 'tab-active']" @click="tabType(0)">{{ $t('创作') }}</div>
      <div :class="['btn-item', source == 1 && 'tab-active']" @click="tabType(1)">{{ $t('藏品') }}</div>
      <div :class="['btn-item', source == 2 && 'tab-active']" @click="tabType(2)">{{ $t('关注') }}</div>
    </div>
    <div v-if="nftList.length" class="person-items">
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
      :current-page="personalCurrentPage"
      layout="prev, pager, next"
      @current-change="pageChange"
    >
    </el-pagination>
    <DialogEdit @editComplete="editComplete" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import http from '../../api/http'
export default {
  props: {},
  data() {
    return {
      nickName: null,
      introduction: '',
      pageSize: 6,
      nftList: [],
      total: 0,
      userAddress: this.$route.params.address || this.address,
    }
  },
  computed: {
    ...mapState('personal', ['isShowEditDialog', 'personalCurrentPage', 'source']),
    ...mapState('global', ['address']),
  },
  mounted() {
    this.getUserInfoData()
    this.getUserSeleceNftList()
  },
  methods: {
    pageChange(index) {
      this.$store.commit('personal/set_state', { personalCurrentPage: index })
      this.getUserSeleceNftList()
    },
    editComplete() {
      this.getUserInfoData().then(() => {
        this.$store.commit('personal/set_state', { isShowEditDialog: false })
      })
    },
    async getUserInfoData() {
      const res = await http(this.$axios).getUserInfo({ id: this.userAddress })
      if (res.code === 200 && res.data) {
        this.nickName = res.data.nickName
        this.introduction = res.data.introduction
      }
    },
    async getUserSeleceNftList() {
      const res = await http(this.$axios).getUserSelectFiles({
        page: this.personalCurrentPage,
        pageSize: this.pageSize,
        userAddress: this.userAddress,
        source: this.source,
      })
      if (res.code === 200 && res.data) {
        this.nftList = res.data.records
        const imgUrl = res.data.imgUrl
        this.total = res.data.count
        this.nftList.forEach((item) => {
          item.fileName = `${imgUrl}${item.fileName}`
        })
      }
    },
    toDetails(item) {
      this.$router.push(`/details/${item.id}`)
    },
    showEditDialog() {
      this.$store.commit('personal/set_state', { isShowEditDialog: true })
    },
    tabType(index) {
      this.$store.commit('personal/set_state', { personalCurrentPage: 1, source: index })
      this.getUserSeleceNftList()
    },
  },
}
</script>

<style scoped lang="scss">
.main-container {
  position: relative;
  margin: 0 auto;
  width: 1200px;
  .user-container {
    min-height: 72px;
    margin-top: 55px;
    .user-portrait {
      width: 108px;
      height: 108px;
      border-radius: 50%;
      margin: 0 auto;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .user-name {
      margin: 0 auto;
      text-align: center;
      font-size: 30px;
      font-weight: 600;
      color: #333333;
      margin-top: 15px;
      margin-bottom: 4px;
      position: relative;
      .user-edit {
        display: inline-block;
        width: 28px;
        height: 28px;
        background: url('../../assets/img/personal/edit.png') no-repeat;
        background-size: 100% 100%;
        position: absolute;
        bottom: 0;
        cursor: pointer;
      }
    }
    .user-call {
      text-align: center;
      font-size: 20px;
      font-weight: 600;
      color: rgba(0, 0, 0, 0.6);
      line-height: 28px;
      margin-bottom: 10px;
    }
    .edituser-btn {
      margin: 0 auto;
      color: #333333;
      font-size: 12px;
      width: 112px;
      height: 26px;
      text-align: center;
      line-height: 24px;
      border-radius: 5px;
      border: 1px solid #333333;
      cursor: pointer;
    }
  }
  .person-btns {
    width: 1200px;
    height: 75px;
    background: #ffffff;
    margin: 0 auto;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 97px;
  }
  .person-items {
    margin: 0 auto;
    padding-top: 36px;
    display: flex;
    flex-wrap: wrap;
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
}
</style>
