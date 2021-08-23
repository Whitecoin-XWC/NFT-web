module.exports = {
  dev: {
    MODE: 'dev',
    PORT: 10070,
    // BASE_URL: 'http://192.168.5.114:8087',
    BASE_URL: 'http://154.209.69.121:8089',
    WS_URL: 'http://192.168.5.118:8087/server',
    LOCAL_URL: 'https://license.whitecoin.info',
  },
  qa: {
    MODE: 'qa',
    PORT: 10070,
    BASE_URL: 'http://154.209.69.121:8089',
    WS_URL: 'http://192.168.5.118:8087/server',
    LOCAL_URL: 'https://license.whitecoin.info',
  },
  prod: {
    MODE: 'prod',
    PORT: 10070,
    BASE_URL: 'https://api.xwcnft.com',
    WS_URL: 'http://192.168.5.118:8087/server',
    LOCAL_URL: 'https://license.whitecoin.info',
  },
}
