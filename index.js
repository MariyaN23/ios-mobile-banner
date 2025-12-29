import { currency, price, translations } from "./i18n.js";

const availableLanguages = ['de', 'en', 'es', 'fr', 'ja', 'pt']
const fallbackLanguage = 'en'

const htmlElement = document.documentElement
const form = document.getElementById('form')

form.addEventListener('submit', function (e) {
    e.preventDefault()
    const selectedSubscription = document.querySelector('input[name="subscription"]:checked').value
    if (selectedSubscription === 'yearly') {
        window.location.href = 'https://www.apple.com'
    }
    if (selectedSubscription === 'weekly') {
        window.location.href = 'https://www.google.com'
    }
})

function getFormattedPrice(locale, amount) {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency[locale]
    }).format(amount)
}

function applyTranslations() {
    const currentLang = htmlElement.lang
    const curr = currency[currentLang]
    const prices = price[curr]
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n')
        let translation = translations[currentLang]?.[key] || translations[fallbackLanguage]?.[key] || key
        const yearlyAccess = getFormattedPrice(currentLang, prices.yearlyAccess)
        const yearlyPerWeek = getFormattedPrice(currentLang, prices.yearlyPerWeek)
        const weeklyAccess = getFormattedPrice(currentLang, prices.weeklyAccess)

        translation = translation
            .replace(/{{yearlyAccess}}/g, yearlyAccess)
            .replace(/{{yearlyPerWeek}}/g, yearlyPerWeek)
            .replace(/{{weeklyAccess}}/g, weeklyAccess)
        element.innerHTML = translation
    })
}

function updateLanguage(lang) {
    const url = new URL(window.location)
    url.searchParams.set('lang', lang)
    window.history.replaceState({}, '', url)
    htmlElement.lang = lang
    applyTranslations()
}

function initializeLanguage() {
    const url = new URL(window.location)
    let currentLanguage = url.searchParams.get('lang')

    if (currentLanguage && availableLanguages.includes(currentLanguage)) {
        htmlElement.lang = currentLanguage
    } else {
        currentLanguage = fallbackLanguage
        updateLanguage(currentLanguage)
    }
    applyTranslations()
}

initializeLanguage()
