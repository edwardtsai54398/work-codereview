import { createI18n } from 'vue-i18n'
// import { LocaleMessages } from 'vue-i18n'
import Cookies from 'js-cookie'

// 由window取設定，稍後我們會在main.js設置一些相關設定
// const config = window['config']


// 預設語言
const languageKey = 'lang'
const getCookieLanguage = () => Cookies.get(languageKey)
const setCookieLanguage = (language) => Cookies.set(languageKey, language)

const defaultLang = 'zh_tw'
setCookieLanguage(defaultLang)

const loadedLanguages = []

// 啟用i18N
const i18n = createI18n({
  locale: '',
  fallbackLocale: defaultLang,
  messages: {},
//   silentTranslationWarn: true
})

// 取得現在的語言設定
export const getLocale = () => {
  const cookieLanguage = getCookieLanguage()
  // from cookie
  if (cookieLanguage) {
    return cookieLanguage
  }

  // from default config
  // if (config.LOCALE) {
  //   return config.LOCALE
  // }
  return defaultLang
}

const locale = getLocale()

// 設置語言的事件

const setI18nLanguage = (lang) => {
  i18n.global.locale = lang
  console.log('i18n.locale:',i18n.locale);
  console.log('i18n.message:', i18n.global.getLocaleMessage(lang));
  setCookieLanguage(lang)
  return lang
}

export const loadLanguageAsync = async (lang) => {
  // 如果配置到同樣的語言value時
  if (i18n.locale === lang) {
    return setI18nLanguage(lang)
  }

  // 如果已經載入該語言時
  if (loadedLanguages.includes(lang)) {
    return setI18nLanguage(lang)
  }

  // 如果沒有載入語言時
  const messages = await getMessages(lang)
  // console.log(messages);
  i18n.global.setLocaleMessage(lang, messages)
  loadedLanguages.push(lang)
  return setI18nLanguage(lang)
}

// Fetch對應的json語言包

const getMessages = async (locale) => {
  // ElementUI中使用的locale key稍微不同，格式必須正確
//   const elementUILocMap = {
//     en: 'en',
//     zh_tw: 'zh-TW',
//     jp: 'ja',
//   }
  
  let langFile
  const path = './locale/'
  if (locale === 'zh_tw') {
    langFile = await (await fetch(`${path}zh_tw.json`)).json()
  } else if (locale === 'en') {
    langFile = await (await fetch(`${path}en.json`)).json()
  } else if (locale === 'jp') {
    langFile = await (await fetch(`${path}jp.json`)).json()
  }

//   const elLangFile = await import(/* webpackChunkName: "lang-elementui-[request]" */`element-ui/lib/locale/lang/${elementUILocMap[locale]}`)
//   return { ...langFile, ...elLangFile.default}
  return { ...langFile}
}

loadLanguageAsync(locale)

export default i18n