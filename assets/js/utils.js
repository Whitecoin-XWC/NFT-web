/* eslint-disable no-unused-expressions */
const util = {
  toNonExponential(num) {
    const m = num.toExponential().match(/\d(?:\.(\d*))?e([+-]\d+)/)
    return num.toFixed(Math.max(0, (m[1] || '').length - m[2]))
  },
  getDateTime(timestamp, format) {
    const pad = function (val, len) {
      val = String(val)
      len = len || 2
      while (val.length < len) {
        val = '0' + val
      }
      return val
    }
    const date = new Date(parseFloat(timestamp))
    const year = date.getFullYear()
    const month = pad(date.getMonth() + 1)
    const day = pad(date.getDate())
    const hour = pad(date.getHours())
    const minutes = pad(date.getMinutes())
    const second = pad(date.getSeconds())
    switch (format) {
      case 'MM-DD HH:MM:SS':
        return [month, day].join('-') + ' ' + [hour, minutes, second].join(':')
      case 'YYYY-MM-DD HH:MM':
        return [year, month, day].join('-') + ' ' + [hour, minutes].join(':')
      case 'YYYY-MM-DD':
        return [year, month, day].join('-')
      case 'YYYY-MM':
        return [year, month].join('-')
      case 'HH:MM:SS':
        return [hour, minutes, second].join(':')
      case 'HH:MM':
        return [hour, minutes].join(':')
      case 'array':
        return [year, month, day, hour, minutes, second]
      case 'YYYY-MM-DD HH:MM:SS':
        return [year, month, day].join('-') + ' ' + [hour, minutes, second].join(':')
      case 'YYYYMMDD HH:MM':
        return [year, month, day].join('') + ' ' + [hour, minutes].join(':')
      default:
        return [year, month, day].join('') + ' ' + [hour, minutes].join(':')
    }
  },
  getCountdownTime(seconds) {
    if (seconds < 0) {
      return {
        day: '00',
        hour: '00',
        minute: '00',
        second: '00',
      }
    }
    let day = parseInt(seconds / 86400)
    const hour = parseInt(seconds / 3600) % 24
    const minute = parseInt(seconds / 60) % 60
    const second = seconds % 60
    if (day > 99) {
      day = 99
    }
    const res = {
      day: day < 10 ? `0${day}` : `${day}`,
      hour: hour < 10 ? `0${hour}` : `${hour}`,
      minute: minute < 10 ? `0${minute}` : `${minute}`,
      second: second < 10 ? `0${second}` : `${second}`,
    }
    return res
  },
  postIframeMessage(postType, pars) {
    top.postMessage(
      JSON.stringify({
        from: 'xt-activity',
        type: postType,
        params: pars,
        extra: {},
      }),
      '*',
    )
  },
  getTreeData(data) {
    for (let i = 0; i < data.length; i++) {
      if (data[i].children.length < 1) {
        // children若为空数组，则将children设为undefined
        data[i].children = undefined
      } else {
        // children若不为空数组，则继续 递归调用 本方法
        this.getTreeData(data[i].children)
      }
    }
    return data
  },
  hasNumber(str) {
    for (const i in str) {
      const asc = str.charCodeAt(i)
      if (asc >= 49 && asc <= 57) {
        return true
      }
    }
    return false
  },
  isNull(val) {
    if (val === '' || val === null || val === undefined || val === false) {
      return true
    } else {
      return false
    }
  },
  divisionHiddle(balance, precision) {
    return (balance / precision).toString().replace(/^(.*\..{8}).*$/, '$1')
  },
  multiplicationHiddle(balance, precision) {
    return (balance * precision).toString().replace(/^(.*\..{8}).*$/, '$1')
  },
  fluidityRateHiddle(item) {
    return item.toString().replace(/^(.*\..{2}).*$/, '$1')
  },
  precisionNmber() {
    return 100000000
  },
}

export default util
