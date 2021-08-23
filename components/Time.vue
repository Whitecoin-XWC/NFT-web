<template>
  <div>
    <slot name="time" :time="time" />
  </div>
</template>
<script>
export default {
  props: {
    totalRemain: {
      type: Number,
      default: null,
    },
  },
  data() {
    return {
      time: {
        remain: 0,
        day: 0,
        hour: 0,
        minute: 0,
        second: 0,
      },
    }
  },
  mounted() {
    this.time.remain = this.totalRemain
    this.killTimer()
  },
  methods: {
    formatTimer() {
      for (const v of arguments) {
        if (Object.is(String(this.time[v]).length, 1)) {
          this.time[v] = `0${this.time[v]}`
        }
      }
    },
    killTimer() {
      const interval = setInterval(() => {
        const t = this.time.remain
        this.time.day = Math.floor(t / 1000 / 60 / 60 / 24) || '00'
        this.time.hour = Math.floor((t / 1000 / 60 / 60) % 24) || '00'
        this.time.minute = Math.floor((t / 1000 / 60) % 60) || '00'
        this.time.second = Math.floor((t / 1000) % 60) || '00'
        this.formatTimer('day', 'hour', 'minute', 'second')

        if (this.time.remain <= 0) {
          clearInterval(interval)
          this.$emit('preciseTime')
        } else {
          this.time.remain -= 1000
        }
        if (this.time.remain < 0) {
          this.time.remain = 0
        }
      }, 1000)
    },
  },
}
</script>
