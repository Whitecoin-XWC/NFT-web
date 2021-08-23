class ContractAddress {
  // NFT合约
  static NFTAddress() {
    if (process.env.MODE === 'prod') {
      return 'XWCCcJJpM6V9YQL3583dkbaEWmK3eddScfkRj'
    } else {
      return 'XWCCa83qXCWmxhmoegJYXHRFHfipfygJfYKzj'
    }
  }

  // 拍卖合约
  static AuctionAddress() {
    if (process.env.MODE === 'prod') {
      return 'XWCCe6DVhboFNg1Lk6XcP5hw2d9zH4ce3ngvV'
    } else {
      return 'XWCCTGuD3NQPMW1ZgfB2vwKJtUaouPtJLM4b4'
    }
  }

  // 售卖合约
  static SaleAddress() {
    if (process.env.MODE === 'prod') {
      return 'XWCCYU2cWWdq9UN9hbDzT6bAxV6eh7YjnN81u'
    } else {
      return 'XWCCcyddh5qG8Uk3kRGUWeBVxbY4eLdJ2RN3p'
    }
  }
}
const walletAddress = {
  address: '',
  pubKey: '',
  pubKeyString: '',
}

const walletGas = {
  assetId: '1.3.0',
  minGasPrice: '0.001',
  gasLimit: 100000,
}

const coinList = {
  XWC: {
    name: 'XWC',
    assetId: '1.3.0',
    symbol: 'XWC',
    precision: 100000000,
    balances: '',
    amount: '',
  },
  BTC: {
    name: 'BTC',
    assetId: '1.3.1',
    symbol: 'BTC',
    precision: 100000000,
    balances: '',
    amount: '',
  },
  LTC: {
    name: 'LTC',
    assetId: '1.3.2',
    symbol: 'LTC',
    precision: 100000000,
    balances: '',
    amount: '',
  },
  ETH: {
    name: 'ETH',
    assetId: '1.3.3',
    symbol: 'ETH',
    precision: 100000000,
    balances: '',
    amount: '',
  },
  USDT: {
    name: 'USDT',
    assetId: '1.3.4',
    symbol: 'ERCUSDT',
    precision: 1000000,
    balances: '',
    amount: '',
  },
  DOGE: {
    name: 'DOGE',
    assetId: '1.3.5',
    symbol: 'DOGE',
    precision: 100000000,
    balances: '',
    amount: '',
  },
}

export { ContractAddress, walletAddress, walletGas, coinList }
