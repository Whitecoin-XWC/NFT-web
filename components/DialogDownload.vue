<template>
  <div class="dialog-container">
    <el-dialog :close-on-click-modal="false" title="" :visible.sync="isShowDownloadDialog" :before-close="handleClose">
      <div class="down-msg"><span></span>{{ $t('未检测到钱包，请下载最新钱包插件并开启钱包插件') }}</div>
      <div class="down-btn">
        <a href="https://xwcwebwallet.oss-cn-hongkong.aliyuncs.com/xwcWebWallet.zip">{{ $t('本地下载') }}</a>
      </div>
      <div class="down-btn">
        <a href="https://chrome.google.com/webstore/detail/xwcextwallet/ohofidejidplafebkaphkkjpnajednjn">
          {{ $t('Chrome Web Store') }}
        </a>
      </div>
      <div class="down-btn" @click="reload">{{ $t('刷新') }}</div>
    </el-dialog>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  props: {},
  data() {
    return {}
  },
  computed: {
    ...mapState('global', ['isShowDownloadDialog']),
  },
  mounted() {},
  methods: {
    reload() {
      location.reload()
    },
    handleClose() {
      this.$store.commit('global/set_state', { isShowDownloadDialog: false })
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
    text-align: center;
  }
  /deep/.el-icon-close {
    &::before {
      content: '';
    }
  }
  .down-msg {
    font-size: 20px;
    font-weight: 500;
    color: rgba(0, 0, 0, 0.85);
    line-height: 24px;
    margin-bottom: 60px;
    span {
      display: inline-block;
      width: 24px;
      height: 24px;
      background: url('../assets/img/personal/down-msg.png') no-repeat;
      background-size: 100% 100%;
      vertical-align: bottom;
      margin-right: 16px;
    }
  }
  .down-btn {
    width: 70%;
    height: 50px;
    margin: 0 auto;
    background: #333333;
    border-radius: 2px;
    line-height: 50px;
    text-align: center;
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    font-weight: 400;
    margin-bottom: 40px;
    color: #ffffff;
    a {
      display: inline-block;
      width: 100%;
      height: 100%;
      color: #ffffff;
    }
  }
}
</style>
