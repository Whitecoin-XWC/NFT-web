import http from '~/api/http'

export const state = () => ({
  isShowEditDialog: false,
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
