// import { add, subtract, divide, multiply, curry } from 'ramda'
import Tools from '~/api/wallet/walletTools'
import { ContractAddress, walletAddress, walletGas, coinList } from '~/api/wallet/walletConfig'

export default class Wallet {
  xwcpay = null
  nodeClient = null
  AuctionCycle = 14400

  constructor() {
    const XwcPay = window.require('xwcpay')
    this.xwcpay = new XwcPay()
  }

  /**
   * 判断是否安装钱包插件
   * @returns 是否安装插件
   */
  checkInstalled() {
    if (typeof XwcExtWallet !== 'undefined') {
      return true
    } else {
      return false
    }
  }

  /**
   * 连接钱包
   * @returns 钱包地址
   */
  connectWallet() {
    return new Promise((resolve) => {
      this.xwcpay.onConnectedWallet().then(
        () => {
          this.xwcpay.getConfig().then(
            (config) => {
              if (config) {
                try {
                  window.xwc_js.ChainConfig.setChainId(config.chainId)
                  const apisInstance = window.xwc_js.Apis.instance(config.network, true)
                  this.nodeClient = new window.xwc_js.NodeClient(apisInstance)
                  this.xwcpay.getUserAddress().then(
                    ({ address, pubKey, pubKeyString }) => {
                      walletAddress.address = address
                      walletAddress.pubKey = pubKey
                      walletAddress.pubKeyString = pubKeyString
                      if (address) {
                        this.nodeClient.afterInited().then(() => {
                          this.balanceOf(ContractAddress.NFTAddress(), walletAddress.address).then(
                            () => {
                              const payload = {
                                isWalletInited: true,
                                walletAddress,
                              }
                              resolve(Tools.doResultData('0', payload, '', '连接钱包'))
                            },
                            () => {
                              const payload = {
                                isWalletInited: false,
                                walletAddress: null,
                              }
                              resolve(Tools.doResultData('6', payload, '钱包连接异常', '连接钱包'))
                            },
                          )
                        })
                      } else {
                        const payload = {
                          isWalletInited: false,
                          walletAddress: null,
                        }
                        resolve(Tools.doResultData('5', payload, '钱包连接异常', '连接钱包'))
                      }
                    },
                    () => {
                      const payload = {
                        isWalletInited: false,
                        walletAddress: null,
                      }
                      resolve(Tools.doResultData('4', payload, '钱包连接异常', '连接钱包'))
                    },
                  )
                } catch (error) {
                  const payload = {
                    isWalletInited: false,
                    walletAddress: null,
                  }
                  resolve(Tools.doResultData('7', payload, '钱包连接异常', '连接钱包'))
                }
              } else {
                const payload = {
                  isWalletInited: false,
                  walletAddress: null,
                }
                resolve(Tools.doResultData('3', payload, '钱包连接异常', '连接钱包'))
              }
            },
            () => {
              const payload = {
                isWalletInited: false,
                walletAddress: null,
              }
              resolve(Tools.doResultData('2', payload, '钱包连接异常', '连接钱包'))
            },
          )
        },
        () => {
          const payload = {
            isWalletInited: false,
            walletAddress: null,
          }
          resolve(Tools.doResultData('1', payload, '钱包连接异常', '连接钱包'))
        },
      )
    })
  }

  /**
   * 获取支持的币种列表
   * @returns 币种列表
   */
  getCoinList() {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        const xwcRes = await this.getAddrBalances(walletAddress.address)
        for (const item in xwcRes) {
          if (xwcRes[item].asset_id === '1.3.0') {
            const xwcA = Tools.accSub(xwcRes[item].amount, 10000000)
            coinList.XWC.amount = xwcA > 0 ? `${xwcA}` : 0
            coinList.XWC.balances = Tools.accDiv(coinList.XWC.amount, coinList.XWC.precision)
          } else if (xwcRes[item].asset_id === '1.3.1') {
            coinList.BTC.amount = `${xwcRes[item].amount || 0}`
            coinList.BTC.balances = Tools.accDiv(coinList.BTC.amount, coinList.BTC.precision)
          } else if (xwcRes[item].asset_id === '1.3.2') {
            coinList.LTC.amount = `${xwcRes[item].amount || 0}`
            coinList.LTC.balances = Tools.accDiv(coinList.LTC.amount, coinList.LTC.precision)
          } else if (xwcRes[item].asset_id === '1.3.3') {
            coinList.ETH.amount = `${xwcRes[item].amount || 0}`
            coinList.ETH.balances = Tools.accDiv(coinList.ETH.amount, coinList.ETH.precision)
          } else if (xwcRes[item].asset_id === '1.3.4') {
            coinList.USDT.amount = `${xwcRes[item].amount || 0}`
            coinList.USDT.balances = Tools.accDiv(coinList.USDT.amount, coinList.USDT.precision)
          } else if (xwcRes[item].asset_id === '1.3.5') {
            coinList.DOGE.amount = `${xwcRes[item].amount || 0}`
            coinList.DOGE.balances = Tools.accDiv(coinList.DOGE.amount, coinList.DOGE.precision)
          }
        }
        resolve(Tools.doResultData('0', coinList, '', '币种列表'))
      })
    })
  }

  /**
   * 执行发行NFT
   * @param {*} _tokenId 资源的tokenId，由后端生成
   * @param {*} _copyright 版权费（百分比）
   * @returns 是否成功
   */
  issueNFT(_tokenId, _copyright) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        const res = await this.safeMint(`${walletAddress.address},${_tokenId},${_copyright}`)
        resolve(Tools.doResultData('0', res, '', '执行发行NFT'))
      })
    })
  }

  /**
   * 查询转移费用
   * @param {*} _tokenId 资源的tokenId，由后端生成
   * @param {*} _copyright 版权费（百分比）
   * @returns 转移费用（不带精度）
   */
  getTransferFee(_tokenId, _copyright) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        let lastTradePrice = await this.queryLastTradePrice(`${_tokenId}`)
        lastTradePrice = JSON.parse(lastTradePrice)
        if (lastTradePrice[0] === '') {
          const res = {
            name: '',
            symbol: '',
            amount: '0',
            price: '0',
          }
          resolve(Tools.doResultData('0', res, '', '查询转移费用'))
        } else {
          const copyrightRate = Tools.accDiv(_copyright, 100)
          const price = Tools.accDiv(Tools.accMul(lastTradePrice[1], copyrightRate), coinList[lastTradePrice[0]].precision)
          const res = {
            name: lastTradePrice[0],
            symbol: coinList[lastTradePrice[0]].symbol,
            amount: lastTradePrice[1],
            price,
          }
          resolve(Tools.doResultData('0', res, '', '查询转移费用'))
        }
      })
    })
  }

  /**
   * 执行转移NFT
   * @param {*} _tokenId 资源的tokenId，由后端生成
   * @param {*} _targetAddress 目标地址
   * @param {*} _transferFee 转移费用-查询转移费用接口返回（对象）
   * @returns
   */
  transferNFT(_tokenId, _targetAddress, _transferFee) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        const queryUserAssets = await this.queryUserAssets(`${walletAddress.address}`)
        const userAssets = queryUserAssets === '[]' ? 0 : queryUserAssets[_transferFee.symbol]
        const rechargeAmount = Tools.accSub(_transferFee.amount, userAssets)
        if (rechargeAmount > 0) {
          await this.transferToContract(coinList[_transferFee.name].assetId, ContractAddress.NFTAddress(), _transferFee.price, '')
        }
        const res = await this.safeTransferFrom(`${walletAddress.address},${_targetAddress},${_tokenId}`)
        resolve(Tools.doResultData('0', res, '', '执行转移NFT'))
      })
    })
  }

  /**
   * 创建拍卖NFT
   * @param {*} _tokenId 资源的tokenId，由后端生成
   * @param {*} _coin 币种名称
   * @param {*} _price 最低价（不带精度）
   * @param {*} _minAdd 最小加价（不带精度）
   */
  createAuctionNFT(_tokenId, _coin, _price, _minAdd) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(() => {
        // this.approve(ContractAddress.AuctionAddress(), _tokenId).then(async () => {
        this.approveAll(walletAddress.address, ContractAddress.AuctionAddress()).then(async () => {
          const price = parseInt(Tools.accMul(_price, coinList[_coin].precision))
          const minAdd = parseInt(Tools.accMul(_minAdd, coinList[_coin].precision))
          const res = await this.createAuction(`${_tokenId},${ContractAddress.NFTAddress()},${this.AuctionCycle},${price},${coinList[_coin].symbol},${minAdd}`)
          res.trxid = res.trx_id
          resolve(Tools.doResultData('0', res, '', '拍卖NFT-创建'))
        })
      })
    })
  }

  /**
   * 修改拍卖NFT
   * @param {*} _auctionId 拍卖id，创建拍卖后生成
   * @param {*} _price 最小加价（不带精度）
   * @param {*} _minAdd 最小加价（不带精度）
   */
  editAuctionNFT(_auctionId, _coin, _price, _minAdd) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        const auctionInfo = await this.getAuction(`${_auctionId}`)
        const price = parseInt(Tools.accMul(_price, coinList[_coin].precision)).toString()
        if (auctionInfo.reservePrice !== price) {
          await this.setAuctionReservePrice(`${_auctionId},${price}`)
        }
        const minAdd = parseInt(Tools.accMul(_minAdd, coinList[_coin].precision)).toString()
        if (auctionInfo.minDeltaPrice !== minAdd) {
          await this.setAuctionMinDeltaPrice(`${_auctionId},${minAdd}`)
        }
        resolve(Tools.doResultData('0', null, '', '修改拍卖NFT'))
      })
    })
  }

  /**
   * 竞价NFT
   * @param {*} _auctionId 拍卖id，创建拍卖后生成
   * @param {*} _coin 币种名称
   * @param {*} _price 出售价格（不带精度）
   * @returns
   */
  bidAuctionNFT(_auctionId, _coin, _price) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        const res = await this.transferToContract(coinList[_coin].assetId, ContractAddress.AuctionAddress(), _price, `${_auctionId}`)
        resolve(Tools.doResultData('0', res, '', '拍卖NFT-竞价'))
      })
    })
  }

  /**
   * 拍卖完成触发领取NFT和资产
   * @param {*} _auctionId 拍卖id，创建拍卖后生成
   * @returns
   */
  endAuctionNFT(_auctionId) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        const res = await this.endAuction(`${_auctionId}`)
        resolve(Tools.doResultData('0', res, '', '拍卖NFT-领取'))
      })
    })
  }

  /**
   * 取消拍卖，只能在拍卖未开始时调用
   * @param {*} _auctionId 拍卖id，创建拍卖后生成
   * @returns
   */
  cancelAuctionNFT(_auctionId) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        const res = await this.cancelAuction(`${_auctionId}`)
        resolve(Tools.doResultData('0', res, '', '拍卖NFT-取消'))
      })
    })
  }

  /**
   * 出售NFT
   * @param {*} _tokenId 资源的tokenId，由后端生成
   * @param {*} _coin 币种名称
   * @param {*} _price 出售价格（不带精度）
   * @returns 是否成功
   */
  sellSaleNFT(_tokenId, _coin, _price) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(() => {
        // this.approve(ContractAddress.SaleAddress(), _tokenId).then(async () => {
        this.approveAll(walletAddress.address, ContractAddress.SaleAddress()).then(async () => {
          const price = parseInt(Tools.accMul(_price, coinList[_coin].precision))
          const res = await this.sellNft(`${_tokenId},${ContractAddress.NFTAddress()},${price},${coinList[_coin].symbol}`)
          resolve(Tools.doResultData('0', res, '', '售卖NFT-挂单'))
        })
      })
    })
  }

  /**
   * 修改售卖NFT
   * @param {*} _tokenId 资源的tokenId，由后端生成
   * @param {*} _coin 币种名称
   * @param {*} _price 出售价格（不带精度）
   * @returns
   */
  editSaleNFT(_tokenId, _coin, _price) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        const price = parseInt(Tools.accMul(_price, coinList[_coin].precision))
        const res = await this.changeSellParam(`${_tokenId},${ContractAddress.NFTAddress()},${price},${coinList[_coin].symbol}`)
        resolve(Tools.doResultData('0', res, '', '售卖NFT-修改价格'))
      })
    })
  }

  /**
   * 购买NFT
   * @param {*} _tokenId 资源的tokenId，由后端生成
   * @param {*} _coin 币种名称
   * @param {*} _price 出售价格（不带精度）
   * @returns 是否成功
   */
  buySaleNFT(_tokenId, _coin, _price) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        const res = await this.transferToContract(coinList[_coin].assetId, ContractAddress.SaleAddress(), _price, `${ContractAddress.NFTAddress()},${_tokenId}`)
        resolve(Tools.doResultData('0', res, '', '售卖NFT-购买'))
      })
    })
  }

  /**
   * 取消售卖NFT
   * @param {*} _tokenId 资源的tokenId，由后端生成
   * @returns
   */
  cancelSaleNFT(_tokenId) {
    return new Promise((resolve) => {
      this.nodeClient.afterInited().then(async () => {
        const res = await this.revokeSellNft(`${_tokenId},${ContractAddress.NFTAddress()}`)
        resolve(Tools.doResultData('0', res, '', '售卖NFT-取消'))
      })
    })
  }

  /// ======================================================================================================================================= ////
  /// ======================================================================================================================================= ////
  /// ======================================================================================================================================= ////
  /// =================================================================分割线================================================================= ////
  /// ======================================================================================================================================= ////
  /// ======================================================================================================================================= ////
  /// ======================================================================================================================================= ////

  /**
   * 调用合约内的写方法-上链
   * @param {*} _contractAddress 调用合约地址
   * @param {*} _method 方法名
   * @param {*} _args 方法参数
   * @returns
   */
  simulateCall(_contractAddress, _method, _args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, _contractAddress, '0', _method, _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, _method))
              },
              (err) => {
                reject(Tools.coreLog(err.message), _method)
              },
            )
          }
        },
      })
    })
  }

  /**
   * 调用合约内的offline方法
   * @param {*} _contractAddress 调用合约地址
   * @param {*} _method 方法名
   * @param {*} _args 方法参数
   * @returns
   */
  invokeContractOffline(_contractAddress, _method, _args) {
    return new Promise((resolve, reject) => {
      this.nodeClient.invokeContractOffline(walletAddress.pubKey, _contractAddress, _method, _args).then(
        (res) => {
          resolve(Tools.coreLog(res, _method))
        },
        (err) => {
          reject(Tools.coreLog(err.message), _method)
        },
      )
    })
  }

  /**
   * 获取原生资产
   * @returns 原生资产
   */
  getAddrBalances(_walletAddress) {
    return new Promise((resolve, reject) => {
      this.nodeClient.getAddrBalances(_walletAddress).then(
        (res) => {
          resolve(Tools.coreLog(res, 'getAddrBalances'))
        },
        (err) => {
          reject(Tools.coreLog(err.message), 'getAddrBalances')
        },
      )
    })
  }

  /**
   * NTF授权
   * @param {*} _contractAddress 需要授权的合约地址
   * @param {*} _tokenId 资源的tokenId，由后端生成
   * @returns
   */
  approve(_contractAddress, _tokenId) {
    return new Promise((resolve, reject) => {
      this.nodeClient.invokeContractOffline(walletAddress.pubKey, ContractAddress.NFTAddress(), 'getApproved', `${_tokenId}`).then((res) => {
        if (res === _contractAddress) {
          resolve(Tools.coreLog('不需要授权', 'approve'))
        } else {
          this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.NFTAddress(), '0', 'approve', `${_contractAddress},${_tokenId}`, {
            gasPrice: walletGas.minGasPrice,
            gasLimit: walletGas.gasLimit,
            listener: (serialNumber, txid, name) => {
              if (name === 'txhash') {
                this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
                  (wres) => {
                    resolve(Tools.coreLog(wres, 'approve'))
                  },
                  (err) => {
                    reject(Tools.coreLog(err.message), 'approve')
                  },
                )
              }
            },
          })
        }
      })
    })
  }

  /**
   * 全部NTF授权
   * @param {*} _walletAddress 钱包地址
   * @param {*} _contractAddress 需要授权给的合约地址
   * @returns
   */
  approveAll(_walletAddress, _contractAddress) {
    return new Promise((resolve, reject) => {
      this.nodeClient
        .invokeContractOffline(walletAddress.pubKey, ContractAddress.NFTAddress(), 'isApprovedForAll', `${_walletAddress},${_contractAddress}`)
        .then((res) => {
          if (res === true || res === 'true') {
            resolve(Tools.coreLog('不需要授权', 'approveAll'))
          } else {
            this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.NFTAddress(), '0', 'setApprovalForAll', `${_contractAddress},true`, {
              gasPrice: walletGas.minGasPrice,
              gasLimit: walletGas.gasLimit,
              listener: (serialNumber, txid, name) => {
                if (name === 'txhash') {
                  this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
                    (wres) => {
                      resolve(Tools.coreLog(wres, 'approveAll'))
                    },
                    (err) => {
                      reject(Tools.coreLog(err.message), 'approveAll')
                    },
                  )
                }
              },
            })
          }
        })
    })
  }

  /**
   * 出价，拍卖或售卖
   * @param {*} _assetId 出价的币种assetId
   * @param {*} _contractAddress 转入的合约地址
   * @param {*} _amount 币种的数量(不带精度)
   * @param {*} _args 拍卖：（拍卖id）售卖：（NFT合约地址，tokenId）
   * @returns
   */
  transferToContract(_assetId, _contractAddress, _amount, _args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.transferToContract(_assetId, _contractAddress, _amount, _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, 'transferToContract'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'transferToContract')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 铸造一个新的NFT代币
   * @param {*} _args 钱包地址，tokenId，版权费（百分比）
   * @returns
   */
  safeMint(_args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.NFTAddress(), '0', 'safeMint', _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, 'safeMint'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'safeMint')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 转移NFT代币给其他用户
   * @param {*} _args 拥有者，接收者，tokenId
   * @returns
   */
  safeTransferFrom(_args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.NFTAddress(), '0', 'safeTransferFrom', _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, 'safeTransferFrom'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'safeTransferFrom')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 创建拍卖
   * @param {*} _args tokenId，NFT合约地址，拍卖周期，保留价，币种符号，最小加价
   */
  createAuction(_args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.AuctionAddress(), '0', 'createAuction', _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransactionWithAuction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres[0], 'createAuction'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'createAuction')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 当拍卖未开始时，重新设置保留价
   * @param {*} _args 拍卖id，保留价
   */
  setAuctionReservePrice(_args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.AuctionAddress(), '0', 'setAuctionReservePrice', _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, 'setAuctionReservePrice'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'setAuctionReservePrice')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 当拍卖未开始时，重新设置保最小加价
   * @param {*} _args 拍卖id，最小加价
   */
  setAuctionMinDeltaPrice(_args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.AuctionAddress(), '0', 'setAuctionMinDeltaPrice', _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, 'setAuctionMinDeltaPrice'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'setAuctionMinDeltaPrice')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 当拍卖未开始时，取消拍卖
   * @param {*} _args 拍卖id
   */
  cancelAuction(_args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.AuctionAddress(), '0', 'cancelAuction', _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, 'cancelAuction'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'cancelAuction')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 拍完结束后，领取NFT和币
   * @param {*} _args 拍卖id
   */
  endAuction(_args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.AuctionAddress(), '0', 'endAuction', _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, 'endAuction'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'endAuction')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 卖方调用该方法出售NFT
   * @param {*} _args tokenId，NFT合约地址，价格（带精度），币种符号
   * @returns
   */
  sellNft(_args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.SaleAddress(), '0', 'sellNft', _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, 'sellNft'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'sellNft')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 修改出售NFT参数
   * @param {*} _args tokenId，NFT合约地址，价格（带精度），币种符号
   * @returns
   */
  changeSellParam(_args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.SaleAddress(), '0', 'changeSellParam', _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, 'changeSellParam'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'changeSellParam')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 撤销售卖NFT
   * @param {*} _args tokenId，NFT合约地址
   * @returns
   */
  revokeSellNft(_args) {
    return new Promise((resolve, reject) => {
      this.xwcpay.simulateCall(walletGas.assetId, ContractAddress.SaleAddress(), '0', 'revokeSellNft', _args, {
        gasPrice: walletGas.minGasPrice,
        gasLimit: walletGas.gasLimit,
        listener: (serialNumber, txid, name) => {
          if (name === 'txhash') {
            this.xwcpay.waitTransaction(this.nodeClient, txid, 60000).then(
              (wres) => {
                resolve(Tools.coreLog(wres, 'revokeSellNft'))
              },
              (err) => {
                reject(Tools.coreLog(err.message), 'revokeSellNft')
              },
            )
          }
        },
      })
    })
  }

  /**
   * 查询指定合约余额
   * @param {*} _contractAddress 需要查询的合约地址
   * @param {*} _args 钱包地址
   * @returns 钱包内余额
   */
  balanceOf(_contractAddress, _args) {
    return new Promise((resolve, reject) => {
      this.nodeClient.invokeContractOffline(walletAddress.pubKey, _contractAddress, 'balanceOf', _args).then(
        (res) => {
          resolve(Tools.coreLog(res, 'balanceOf'))
        },
        (err) => {
          reject(Tools.coreLog(err.message), 'balanceOf')
        },
      )
    })
  }

  /**
   * 获取某个NFT的拥有者地址
   * @param {*} _args tokenid
   * @returns
   */
  ownerOf(_args) {
    return new Promise((resolve, reject) => {
      this.nodeClient.invokeContractOffline(walletAddress.pubKey, ContractAddress.NFTAddress(), 'ownerOf', _args).then(
        (res) => {
          resolve(Tools.coreLog(res, 'ownerOf'))
        },
        (err) => {
          reject(Tools.coreLog(err.message), 'ownerOf')
        },
      )
    })
  }

  /**
   * 根据序号获取用户的NFT代币
   * @param {*} _args 拥有者地址，序号
   * @returns
   */
  tokenOfOwnerByIndex(_args) {
    return new Promise((resolve, reject) => {
      this.nodeClient.invokeContractOffline(walletAddress.pubKey, ContractAddress.NFTAddress(), 'tokenOfOwnerByIndex', _args).then(
        (res) => {
          resolve(Tools.coreLog(res, 'tokenOfOwnerByIndex'))
        },
        (err) => {
          reject(Tools.coreLog(err.message), 'tokenOfOwnerByIndex')
        },
      )
    })
  }

  /**
   * 查询用户在NFT合约内的资产
   * @param {*} _args 用户钱包地址
   * @returns
   */
  queryUserAssets(_args) {
    return new Promise((resolve, reject) => {
      this.nodeClient.invokeContractOffline(walletAddress.pubKey, ContractAddress.NFTAddress(), 'queryUserAssets', _args).then(
        (res) => {
          resolve(Tools.coreLog(JSON.parse(res), 'queryUserAssets'))
        },
        (err) => {
          reject(Tools.coreLog(err.message), 'queryUserAssets')
        },
      )
    })
  }

  /**
   * 查询NFT最近成交价
   * @param {*} _args tokenid
   * @returns
   */
  queryLastTradePrice(_args) {
    return new Promise((resolve, reject) => {
      this.nodeClient.invokeContractOffline(walletAddress.pubKey, ContractAddress.NFTAddress(), 'queryLastTradePrice', _args).then(
        (res) => {
          resolve(Tools.coreLog(res, 'queryLastTradePrice'))
        },
        (err) => {
          reject(Tools.coreLog(err.message), 'queryLastTradePrice')
        },
      )
    })
  }

  /**
   * 查询拍卖信息
   * @param {*} _args 拍卖id
   */
  getAuction(_args) {
    return new Promise((resolve, reject) => {
      this.nodeClient.invokeContractOffline(walletAddress.pubKey, ContractAddress.AuctionAddress(), 'getAuction', _args).then(
        (res) => {
          resolve(Tools.coreLog(JSON.parse(res), 'getAuction'))
        },
        (err) => {
          reject(Tools.coreLog(err.message), 'getAuction')
        },
      )
    })
  }
}
