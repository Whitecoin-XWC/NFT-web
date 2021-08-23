import Vue from 'vue'
import SockJS from 'sockjs-client'
import Stomp from 'stompjs'

const sockJS = new SockJS(process.env.WS_URL)
const stompClient = Stomp.over(sockJS)
const headers = {}
stompClient.heartbeat.outgoing = 20000 // 发送心跳
stompClient.heartbeat.incoming = 0 // 接受心跳

stompClient.connect(
  headers,
  (frame) => {
    console.log('socket-connect:', frame)
  },
  (error) => {
    console.log('socket-connect:', error)
  },
)
export default function ({ store, redirect, app, req }) {
  Vue.prototype.$socket = stompClient
}

// const socket = {
//   connect() {
//     stompClient.connect(
//       headers,
//       (frame) => {
//         console.log('socket-connect:', frame)
//       },
//       (error) => {
//         console.log('socket-connect:', error)
//       },
//     )
//   },
//   disconnect() {
//     stompClient.disconnect(() => {
//       console.log('socket-disconnect:', '断开连接')
//     })
//   },
//   send(url, msg) {
//     stompClient.send(url, headers, JSON.stringify(msg))
//   },
//   subscribe(url, onFun) {
//     stompClient.subscribe(
//       url,
//       (msg) => {
//         console.log('socket-subscribe:', msg.body)
//         if (msg.body) {
//           const responseJSON = JSON.parse(msg.body)
//           onFun(responseJSON)
//         }
//       },
//       headers,
//     )
//   },
// }
