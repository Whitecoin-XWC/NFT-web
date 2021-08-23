<script>
import qs from 'qs'
export default {
  asyncData({ app, route, redirect, req }) {
    const res = qs.parse(route.fullPath.split('?')[1])
    for (const key in res) {
      app.$cookies.set(`_${key}`, res[key], { expires: new Date(9999999999999) })
    }
    app.$cookies.set('_urlParams', res, { expires: new Date(9999999999999) })
    redirect('/home')
  },
}
</script>
