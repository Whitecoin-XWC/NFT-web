import env from './env'

export default {
  head: {
    title: 'NFT',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=no' },
      { hid: 'description', name: 'description', content: 'Tokenswap - DEX Based on Whitecoin Crosschain Ecology' },
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
    script: [
      { src: '/xwc/xwcjs.js', type: 'text/javascript', charset: 'utf-8' },
      { src: '/xwc/xwcPay.js', type: 'text/javascript', charset: 'utf-8' },
      // { src: 'https://pv.sohu.com/cityjson?ie=utf-8', type: 'text/javascript', charset: 'utf-8' },
    ],
  },
  css: [
    // 全局样式
    // { src: 'element-ui/lib/theme-chalk/index.css' },
    { src: '~/assets/css/main.scss', lang: 'scss' },
  ],

  plugins: [
    // 第三方插件
    { src: '~/plugins/axios' },
    { src: '~/plugins/element-ui' },
    { src: '~/plugins/i18n' },
    // { src: '~/plugins/sockjs' },
    { src: '~/plugins/utils' },
    { src: '~/plugins/viewer' },
    { src: '~/plugins/wallet', ssr: false },
  ],

  router: {
    middleware: [
      // 中间件
      'authentication',
      'language',
    ],
  },

  env: {
    MODE: env[process.env.MODE].MODE,
    WS_URL: env[process.env.MODE].WS_URL,
    BASE_URL: env[process.env.MODE].BASE_URL,
  },

  server: {
    port: env[process.env.MODE].PORT,
    host: '0.0.0.0',
  },
  loading: false,

  components: true,

  buildModules: [
    // https://go.nuxtjs.dev/eslint
    '@nuxtjs/eslint-module',
    // https://go.nuxtjs.dev/stylelint
    '@nuxtjs/stylelint-module',
  ],

  modules: [
    // modules
    '@nuxtjs/axios',
    'cookie-universal-nuxt',
  ],

  // Axios module configuration: https://go.nuxtjs.dev/config-axios
  // axios: {},

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {
    transpile: [/^element-ui/],
  },
}
