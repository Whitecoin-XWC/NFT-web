export default function ({ app, store, redirect }) {
  const lang = app.$cookies.get('_lang') || 'en'
  let locale = ''
  if (lang) {
    locale = lang
  } else if (app.i18n.locale) {
    locale = app.i18n.locale
  } else {
    locale = app.i18n.fallbackLocale
  }
  store.commit('global/set_locale', locale)
  app.i18n.locale = locale
}
