import * as calc from '@lzwme/asmd-calc'

const tools = {
  coreLog(msg, name) {
    if (name) {
      console.log(`core-${name}:`, msg)
    }
    return msg
  },
  walletLog(msg, name) {
    if (name) {
      console.log(`wallet-${name}:`, msg)
    }
  },
  doResultData(_code, _data, _msg, _name) {
    const res = {
      code: _code,
      data: _data,
      msg: _msg,
    }
    this.walletLog(res, _name)
    return res
  },
  isNative(coin) {
    if (coin === 'XWC' || coin === 'LTC' || coin === 'ETH' || coin === 'USDT') {
      return true
    } else {
      return false
    }
  },
  getCoinNameBySymbol(symbol) {
    if (symbol === 'ERCUSDT') {
      return 'USDT'
    } else {
      return symbol
    }
  },
  accAdd(arg1, arg2) {
    return calc.toNonExponential(calc.add(arg1, arg2))
  },
  accSub(arg1, arg2) {
    return calc.toNonExponential(calc.sub(arg1, arg2))
  },
  accMul(arg1, arg2) {
    return calc.toNonExponential(calc.mul(arg1, arg2))
  },
  accDiv(arg1, arg2) {
    return calc.toNonExponential(calc.div(arg1, arg2))
  },
}

export default tools
