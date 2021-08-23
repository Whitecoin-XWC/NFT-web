export default (axios) => {
  return {
    // 发行NFT接口
    fileUpload: (params) => {
      return axios.post(`${process.env.BASE_URL}/fileUpload/save`, params)
    },
    // 通知服务端发布成功
    nftPub: (params) => {
      return axios.post(`${process.env.BASE_URL}/nft/pub`, params)
    },
    // 查询首页文件列表
    getSelectIndexList: (params) => {
      return axios.post(`${process.env.BASE_URL}/nft/selectIndexList`, params)
    },
    // 搜索
    getSearchNftList: (params) => {
      return axios.post(`${process.env.BASE_URL}/nft/search`, params)
    },
    // 查询用户资料
    getUserInfo: (params) => {
      return axios.post(`${process.env.BASE_URL}/userInfo/getUserInfo`, params)
    },
    // 查询当前用户上传的文件
    getUserSelectFiles: (params) => {
      return axios.post(`${process.env.BASE_URL}/userInfo/selectFiles`, params)
    },
    // 修改用户昵称
    upDateUserInfo: (params) => {
      return axios.post(`${process.env.BASE_URL}/userInfo/updateUserInfo`, params)
    },
    // 查询NFT详情
    getFileDetail: (params) => {
      return axios.post(`${process.env.BASE_URL}/nft/getFileDetail`, params)
    },
    // 查询NFT历史纪录
    getFileLog: (params) => {
      return axios.post(`${process.env.BASE_URL}/nft/getFileLog`, params)
    },
    // 查询NFT拍卖纪录
    getAuctionLog: (param) => {
      return axios.get(`${process.env.BASE_URL}/auction/history/query`, { params: { mediaId: param } })
    },
    // 设置售价/更新售价
    setNftSell: (params) => {
      return axios.post(`${process.env.BASE_URL}/nftSell/sell`, params)
    },
    // 取消售卖
    cancelNftSell: (params) => {
      return axios.post(`${process.env.BASE_URL}/nftSell/delSell`, params)
    },
    // nft转移
    transferNft: (params) => {
      return axios.post(`${process.env.BASE_URL}/nft/fileUserChange`, params)
    },
    // 创建新增拍卖
    createAnctionNft: (params) => {
      return axios.post(`${process.env.BASE_URL}/auction/create`, params)
    },
    // 修改拍卖价格
    updateAnction: (params) => {
      return axios.post(`${process.env.BASE_URL}/auction/update`, params)
    },
    // 获取拍卖详情
    getAnctionDetail: (params) => {
      return axios.post(`${process.env.BASE_URL}/auction/query`, params)
    },
    // 取消拍卖
    cancelAnctionNft: (params) => {
      return axios.post(`${process.env.BASE_URL}/auction/cancel`, params)
    },
    // 竞拍nft
    biddingNft: (params) => {
      return axios.post(`${process.env.BASE_URL}/auction/history/create`, params)
    },
    // 关注nft
    followNft: (params) => {
      return axios.post(`${process.env.BASE_URL}/nft/follow`, params)
    },
    // 取消关注nft
    onFollowNft: (params) => {
      return axios.post(`${process.env.BASE_URL}/nft/delFollow`, params)
    },
    // 购买nft
    buyNft: (params) => {
      return axios.post(`${process.env.BASE_URL}/nftSell/buySuccess`, params)
    },
    // 领取NFT
    receiveAnction: (params) => {
      return axios.post(`${process.env.BASE_URL}/auction/receive`, params)
    },
    // 获取通知数量
    getNoticeCount: (params) => {
      return axios.post(`${process.env.BASE_URL}/notice/noticeCount`, params)
    },
    // 获取通知列表
    getNoticeList: (params) => {
      return axios.post(`${process.env.BASE_URL}/notice/notice`, params)
    },
    // 获取文件内容
    getFileContet: (url) => {
      return axios.get(url)
    },
  }
}
