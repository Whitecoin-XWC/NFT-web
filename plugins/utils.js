import Vue from 'vue'
import utils from '~/assets/js/utils.js'
export default function ({ store, redirect, app, req }) {
  Vue.prototype.$utils = utils
}
