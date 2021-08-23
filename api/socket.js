export default (socket) => {
  return {
    /** 订阅首页消息 */
    subscribe_homepageInfo: (callback) => {
      return socket.subscribe('/topic/homepageInfo', (msg) => {
        if (msg.body) {
          const responseJSON = JSON.parse(msg.body)
          callback(responseJSON)
        }
      })
    },
  }
}
