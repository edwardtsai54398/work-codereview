import {createI18n} from "vue-i18n";
import Cookies from 'js-cookie'

// Cookie
const languageKey = 'lang'
const getCookieLanguage = () => Cookies.get(languageKey)
const setCookieLanguage = (language) => Cookies.set(languageKey, language)

//載入預設語言
const defaultLang = 'zh_tw'
// const userLanguage = navigator.language

//載入json
const path = './locale/'
const en = await (await fetch(`${path}en.json`)).json()
const jp = await (await fetch(`${path}jp.json`)).json()
const zh_tw = await (await fetch(`${path}zh_tw.json`)).json()

const messages = {
    en,
    zh_tw,
    jp,
};

const i18n = createI18n({
    locale: defaultLang,
    fallbackLocale: "en",
    messages,
});

export const loadLocaleMessgae = (lang)=>{
    i18n.global.locale = lang
    setCookieLanguage(lang)
}

//頁面重新載入抓cookie
if(getCookieLanguage()){
    loadLocaleMessgae(getCookieLanguage())
}else{
    setCookieLanguage(defaultLang)
}

export default i18n