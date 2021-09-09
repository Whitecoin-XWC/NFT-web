import http from '~/api/http'

export const state = () => ({
  locales: ['cn', 'en'],
  locale: 'cn',
  address: '',
  isShowEditDialog: false,
  isShowPublishDialog: false,
  isShowDownloadDialog: false,
  isShowRelinkDialog: false,
  isShowCancelSell: false,
  isShowBuyConfirm: false,
  isShowDialogAuction: false,
  isShowSetPrice: false,
  isShowDialogBidding: false,
  isShowTransferNft: false,
  isShowCancelAuction: false,
  coinList: {},
  isExtInstalled: false, // 是否下载钱包插件
  isWalletInited: false, // 是否链接钱包
  homeCurrentPage: 1,
  tabIndex: 5,
  mediaType: null,
  status: null,
})

export const mutations = {
  set_state(state, obj) {
    for (const i in obj) {
      state[i] = obj[i]
    }
  },
  set_locale: (state, locale) => {
    // state.locale = locale
    if (state.locales.includes(locale)) {
      state.locale = locale
    }
  },
}

export const actions = {
  async get_NocticeList({ commit }, payload) {
    const res = await http(this.$axios).request_nocticeList(payload)
    if (res.code === '0') {
      commit('set_NocticeList', res.data)
      const par = []
      for (let i = 0; i < res.data.records.length; i++) {
        if (res.data.records[i].status === 0) {
          par.push(res.data.records[i].id)
        }
      }
      if (par.length > 0) {
        http(this.$axios).request_nocticeRead(par)
      }
    }
    return res
  },
}
