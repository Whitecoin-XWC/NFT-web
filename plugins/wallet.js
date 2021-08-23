import Vue from 'vue'
import Wallet from '~/api/wallet/walletCore'

export default function ({ store }) {
  const wallet = new Wallet()
  Vue.prototype.$wallet = wallet
}
