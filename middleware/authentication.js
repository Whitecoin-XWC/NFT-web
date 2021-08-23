export default function ({ app, store, redirect }) {
  const token = app.$cookies.get('_token')
  if (!token) {
    // redirect('/login')
  }
}
