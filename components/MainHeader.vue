<template>
  <div>
    <div class="header">
      <div class="header-l">
        <!-- 头像 -->
        <div class="head-portrait" @click="toHome">
          <img src="../assets/img/header/portrait.png" alt="" />
        </div>
        <!-- 搜索框 -->
        <div class="search-container">
          <el-popover ref="popover" width="406" placement="bottom-start" trigger="click">
            <div ref="serarchBox" slot="reference" class="search">
              <el-input v-model="searchMsg" :placeholder="$t('搜索')" @keyup.13.native="searchList(1)"> </el-input>
              <i slot="reference" class="search-icon el-icon-search" @click="searchList(2)"></i>
            </div>
            <div class="search-box">
              <el-tabs v-model="activeName">
                <el-tab-pane :label="$t('创作者')" name="Artist">
                  <div class="pane-scroll">
                    <p v-if="!usersList.length" class="not-data">{{ $t('暂无数据') }}</p>
                    <div v-if="usersList.length" class="pane-box">
                      <p v-for="(item, index) in usersList" :key="index" class="artist-text" @click="toOthersPersonal(item)">{{ item.nickName }}</p>
                    </div>
                  </div>
                </el-tab-pane>
                <el-tab-pane :label="$t('名称')" name="Name">
                  <div class="pane-scroll">
                    <p v-if="!filesList.length" class="not-data">{{ $t('暂无数据') }}</p>
                    <div v-if="filesList.length" class="pane-box">
                      <div v-for="(item, index) in filesList" :key="index" class="name-item" @click="toDetails(item)">
                        <img class="name-img" :src="item.fileName" alt="" />
                        <div>
                          <p class="name-p1">{{ item.fileTitle }}</p>
                          <p class="name-p2">{{ $t('创作者') }}：{{ item.userName }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </el-popover>
        </div>
      </div>
      <div class="header-r">
        <!-- 消息通知图标 -->
        <el-popover width="386" placement="bottom-start" class="notice-popover" trigger="click" @hide="hiddenDialogNotice" @show="showDialogNotice">
          <div slot="reference" class="msg-box">
            <span v-if="msgNum" class="msg-num">{{ msgNum }}</span>
            <img src="../assets/img/header/notice.png" alt="" />
          </div>
          <DialogNotice ref="DialogNotice" :msg-num="msgNum" />
        </el-popover>
        <!-- 国际化 -->
        <div class="dropDownLang">
          <div class="nowLang" @mouseover="dropDownIsShow = true" @mouseout="dropDownIsShow = false">
            <a v-cloak src="javaScript:void(0)"><img src="../assets/img/header/i18n.png" alt="" /></a>
            <div v-show="dropDownIsShow" class="lang-menu">
              <li :class="nowLang == '简体中文' ? 'active' : ''" @click="switchLang('cn', '简体中文')">简体中文</li>
              <li :class="nowLang == 'English' ? 'active' : ''" @click="switchLang('en', 'English')">English</li>
            </div>
          </div>
        </div>
        <!-- 账户 -->
        <div v-if="isExtInstalled && isWalletInited" class="user-box" @click="toPersonal">
          <i></i>
          <span :title="address">{{ address.substring(0, 3) }}...{{ address.substring(address.length - 3, address.length) }}</span>
        </div>
        <div v-if="!isExtInstalled || !isWalletInited" class="user-box" @click="openDownloadDialog">
          <i></i>
          <span :title="$t('未连接')">{{ $t('未连接') }}</span>
        </div>
        <div class="issue-btn" @click="toPublish">{{ $t('发行') }}</div>
      </div>
    </div>
    <DialogDownload v-if="isShowDownloadDialog" />
    <DialogRelink v-if="isShowRelinkDialog" />
  </div>
</template>

<script>
import { mapState } from 'vuex'
import http from '../api/http'
export default {
  props: {},
  data() {
    return {
      edition: '',
      msgNum: 0,
      nowLang: '简体中文',
      dropDownIsShow: false,
      activeName: 'Artist',
      filesList: [],
      usersList: [],
      searchMsg: '',
    }
  },
  computed: {
    ...mapState('global', ['isShowDownloadDialog', 'isShowRelinkDialog', 'address', 'isExtInstalled', 'isWalletInited']),
  },
  watch: {
    searchMsg(newVal, oldVal) {
      if (!newVal.trim().length) {
        this.activeName = 'Artist'
        this.filesList = []
        this.usersList = []
      }
    },
  },
  mounted() {
    this.nowLang = this.$cookies.get('_lang') === 'cn' ? '简体中文' : 'English'
    this.initWallet().then(() => {
      this.getUnreadNotice()
      this.getCoinData()
    })
  },
  methods: {
    // 获取币种字典表
    async getCoinData() {
      const result = await this.$wallet.getCoinList()
      if (result.code === '0' && result.data) {
        this.$store.commit('global/set_state', { coinList: result.data })
      }
    },
    hiddenDialogNotice() {
      this.$refs.DialogNotice.yourList = []
      this.$refs.DialogNotice.royaltiesList = []
    },
    showDialogNotice() {
      this.$refs.DialogNotice.getNoticeData()
    },
    // 获取是否有新的未读通知
    getUnreadNotice() {
      setInterval(async () => {
        const res = await http(this.$axios).getNoticeCount({ userAddress: this.address })
        if (res.code === 200) {
          this.msgNum = res.data
        }
      }, 5000)
    },
    toDetails(item) {
      document.querySelector('.search').click()
      this.$router.push(`/details/${item.id}`)
    },
    toOthersPersonal(item) {
      document.querySelector('.search').click()
      this.$router.push(`/personal/${item.id}`)
    },
    async searchList(index) {
      if (!this.searchMsg.length) {
        return false
      }
      if ((this.$refs.popover.showPopper && index === 2) || (!this.$refs.popover.showPopper && index === 1)) {
        this.$refs.serarchBox.click()
      }
      const res = await http(this.$axios).getSearchNftList({ keyWord: this.searchMsg })
      if (res.code === 200 && res.data) {
        this.usersList = res.data.users
        this.filesList = res.data.files
        this.filesList.forEach((item) => {
          item.fileName = `${res.data.imagUrl}${item.fileName}`
        })
        if (!this.usersList.length && this.filesList.length) {
          this.activeName = 'Name'
        } else {
          this.activeName = 'Artist'
        }
      }
      // }
    },
    async initWallet() {
      this.$store.commit('global/set_state', { isExtInstalled: this.$wallet.checkInstalled() })
      if (this.isExtInstalled) {
        const res = await this.$wallet.connectWallet()
        if (res.code === '0') {
          this.$store.commit('global/set_state', { address: res.data.walletAddress.address, isWalletInited: res.data.isWalletInited })
        }
      }
    },
    async openDownloadDialog() {
      if (!this.isExtInstalled) {
        // 弹窗提示下载钱包插件
        this.$store.commit('global/set_state', { isShowDownloadDialog: true })
        return false
      }
      if (!this.isWalletInited) {
        const res = await this.$wallet.connectWallet()
        if (res.code === '0') {
          this.$store.commit('global/set_state', { address: res.data.walletAddress.address, isWalletInited: res.data.isWalletInited })
        } else {
          // 提示重新链接钱包
          this.$store.commit('global/set_state', { isShowRelinkDialog: true })
        }
      }
    },
    switchLang(lang, type) {
      if (this.$cookies.get('_lang') !== lang) {
        this.$cookies.set('_lang', lang)
        this.$store.commit('global/set_locale', lang)
        this.$i18n.locale = lang
        this.nowLang = type
        location.reload()
      }
    },
    async toPublish() {
      if (this.isExtInstalled) {
        if (!this.isWalletInited) {
          const res = await this.$wallet.connectWallet()
          if (res.code === '0') {
            this.$store.commit('global/set_state', { address: res.data.walletAddress.address, isWalletInited: res.data.isWalletInited })
            this.$router.push('/publish')
          } else {
            // 提示重新链接钱包
            this.$store.commit('global/set_state', { isShowRelinkDialog: true })
          }
        } else {
          this.$router.push('/publish')
        }
      } else {
        // 弹窗提示下载钱包插件
        this.$store.commit('global/set_state', { isShowDownloadDialog: true })
      }
      this.searchMsg = ''
    },
    toHome() {
      this.searchMsg = ''
      if (this.$route.path === '/home') {
        this.$store.commit('global/set_state', { tabIndex: 5, mediaType: null, status: null, homeCurrentPage: 1 })
        this.$parent.$parent.$children[1].$children[0].$children[0].getNftList()
      }
      this.$router.push('/home')
    },
    toPersonal() {
      this.searchMsg = ''
      this.$router.push(`/personal/${this.address}`)
    },
  },
}
</script>

<style scoped lang="scss">
.header {
  position: relative;
  width: 1200px;
  height: 60px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.search-box {
  position: absolute;
  z-index: 4;
  left: 0;
  top: 0;
  width: 406px;
  height: 202px;
  box-shadow: 0 9px 28px 8px rgba(0, 0, 0, 0.05), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12);
  background: #ffffff;
  .pane-scroll {
    width: 100%;
    height: 140px;
    overflow: hidden;
    .not-data {
      line-height: 140px;
      text-align: center;
      font-weight: 400;
      color: #00000080;
      font-size: 20px;
    }
    .pane-box {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      overflow-y: scroll;
      .artist-text {
        font-size: 14px;
        font-weight: 400;
        color: #000000a6;
        line-height: 20px;
        cursor: pointer;
        text-indent: 38px;
        &:hover {
          background-color: #c1909040;
        }
      }
      .name-item {
        height: 60px;
        padding: 10px 38px;
        display: flex;
        .name-img {
          width: 40px;
          height: 40px;
          margin-right: 14px;
        }
        .name-p1 {
          font-size: 16px;
          font-weight: 600;
          color: #333333;
          line-height: 22px;
        }
        .name-p2 {
          font-size: 14px;
          font-weight: 400;
          color: #999999;
          line-height: 20px;
        }
        &:hover {
          background-color: #c1909040;
        }
      }
    }
  }
  /deep/.el-tabs__active-bar {
    background-color: #000000ff;
  }
  /deep/.el-tabs__item {
    padding: 0 75px;
    font-size: 16px;
    font-weight: 400;
    color: #00000040;
    &.is-active {
      font-weight: 600;
      color: #000000d9;
    }
  }
  /deep/.el-tabs__nav-scroll {
    padding: 0 38px;
  }
}
.header-r,
.header-l {
  display: flex;
  align-items: center;
}
.head-portrait {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  img {
    width: 100%;
    height: 100%;
  }
}
.search-container {
  width: 406px;
  height: 30px;
  border: 1px solid #b3b6c6;
  margin-left: 24px;
}
.search {
  width: 100%;
  height: 100%;
  position: relative;
  /deep/.el-input {
    width: 100%;
    height: 100%;
    .el-input__inner {
      height: 100%;
      border-radius: 0;
      border-style: none;
    }
  }
  .search-icon {
    display: inline-block;
    width: 14px;
    height: 14px;
    position: absolute;
    right: 22px;
    top: 8px;
    color: #b3b6c6ff;
    cursor: pointer;
  }
}
.msg-box {
  position: relative;
  cursor: pointer;
  .msg-num {
    position: absolute;
    display: inline-block;
    height: 18px;
    min-width: 18px;
    max-width: 26px;
    line-height: 18px;
    font-size: 8px;
    background: #ff6262;
    border-radius: 50%;
    color: #ffffff;
    text-align: center;
    top: -10px;
    right: -11px;
  }
  img {
    width: 20px;
    height: 22px;
    margin-top: 2px;
  }
}
.user-box {
  width: 102px;
  height: 29px;
  background: #595eff;
  border-radius: 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  i {
    margin-left: 10px;
    display: block;
    width: 16px;
    height: 16px;
    background: url('../assets/img/header/link-iocn.png');
    background-size: 100% 100%;
  }
  span {
    width: 62px;
    font-size: 12px;
    font-weight: 400;
    color: #ffffff;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: center;
    margin-right: 10px;
  }
}
.issue-btn {
  width: 102px;
  height: 29px;
  background: #595eff;
  border-radius: 15px;
  font-size: 12px;
  font-weight: 400;
  line-height: 29px;
  color: #ffffff;
  text-align: center;
  margin-left: 35.5px;
  cursor: pointer;
}
.dropDownLang {
  position: relative;
  margin-right: 10px;
  .nowLang {
    cursor: pointer;

    a {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 95px;
      height: 32px;
      border-radius: 16px;
      font-size: 14px;
      font-weight: 400;
      color: #606266;
      img {
        width: 24px;
        height: 24px;
      }
    }
  }
  .lang-menu {
    position: absolute;
    z-index: 999;
    background-color: #1d1d4d;
    width: 100%;
    border-radius: 10px;
    padding: 8px 0;
    margin-top: 6px;
    &::after {
      display: block;
      content: '';
      height: 6px;
      width: 100%;
      position: absolute;
      top: -6px;
      left: 0;
    }

    &::before {
      display: block;
      width: 0;
      content: '';
      border-width: 6px 6px 6px 6px;
      border-style: solid;
      border-color: transparent transparent #1d1d4d transparent;
      position: absolute;
      left: 50%;
      top: -12px;
      transform: translateX(-50%);
    }
    li {
      padding: 5px 6px;
      text-align: center;
      color: white;
      list-style: none;
      font-size: 16px;
      &:hover {
        background-color: #101032;
        color: #7777bc;
      }

      &.active {
        background-color: #16163f;
        color: #7777bc;
      }
    }
  }
}
</style>
<style lang="scss">
.popper__arrow {
  display: none !important;
}
</style>
