let currencyData = null
let pricesData = null
let translations = {}

async function loadJson(file) {
    try {
        const response = await fetch(`i18n/${file}.json`)
        return await response.json()
    } catch (error) {
        return `Failed to load file: ${error}`
    }
}

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
    const currencyCode = currencyData[locale] || currencyData[fallbackLanguage]
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currencyCode
    }).format(amount)
}

async function applyTranslations() {
    const currentLang = htmlElement.lang
    if (!currencyData) currencyData = await loadJson('currency')
    if (!pricesData) pricesData = await loadJson('price')
    if (!translations[currentLang]) {
        translations[currentLang] = await loadJson(`${currentLang}`)
    } else {
        translations[currentLang] = await loadJson(`${fallbackLanguage}`)
    }

    const currencyCode = currencyData[currentLang] || currencyData[fallbackLanguage]
    const prices = pricesData[currencyCode]

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

async function updateLanguage(lang) {
    const url = new URL(window.location)
    url.searchParams.set('lang', lang)
    window.history.replaceState({}, '', url)
    htmlElement.lang = lang
    await applyTranslations()
}

async function initializeLanguage() {
    const url = new URL(window.location)
    let currentLanguage = url.searchParams.get('lang')

    if (currentLanguage && availableLanguages.includes(currentLanguage)) {
        htmlElement.lang = currentLanguage
    } else {
        currentLanguage = fallbackLanguage
        await updateLanguage(currentLanguage)
    }
    await applyTranslations()
}

await initializeLanguage()
