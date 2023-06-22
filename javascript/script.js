// helper function that polyfills forEach in older browsers
function nodeListForEach (nodes, callback) {
	if (window.NodeList.prototype.forEach) {
		return nodes.forEach(callback)
	}
	for (var i = 0; i < nodes.length; i++) {
		callback.call(window, nodes[i], i, nodes)
	}
}

function Cookies () {
	this.cookieName = 'platform_cookies_policy'
	this.cookieDuration = 365
	this.trackingId = 'GTM-NFZGSX8'
	this.gaCookies = {
		main: '_ga',
		ga4Id: '_ga_LGKT9WEGY2'
	}

	// getter for acccess to these private variables from the CookiesPage function
	this.getCookieDuration = function() {
		return this.cookieDuration;
	}

	this.getCookiePolicyName = function() {
		return this.cookieName;
	}

	this.getGaCookies = function() {
		return this.gaCookies;
	}
}

Cookies.prototype.hasConsentForAnalytics = function () {
	var consentCookie = JSON.parse(this.getCookie(this.cookieName))
	return consentCookie ? consentCookie.analytics : false
}

Cookies.prototype.loadGtmScript = function () {
// Load gtm script
// Script based on snippet at https://developers.google.com/tag-manager/quickstart
(function (w, d, s, l, i) {
	w[l] = w[l] || []
	w[l].push({
	'gtm.start': new Date().getTime(),
	'event': 'gtm.js'
	})

	var j = d.createElement(s)
	var dl = l !== 'dataLayer' ? '&l=' + l : ''

	j.async = true
	j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i + dl
	document.head.appendChild(j)
})(window, document, 'script', 'dataLayer', this.trackingId)
}

Cookies.prototype.setBannerCookieConsent = function (analyticsConsent) {
	this.setCookie(this.cookieName, JSON.stringify({ analytics: analyticsConsent }), { days: this.cookieDuration })

	this.$module.showBannerConfirmationMessage(analyticsConsent)
	this.$module.cookieBannerConfirmationMessage.focus()

	if (analyticsConsent) {
		this.initAnalytics()
	}
}

Cookies.prototype.showCookieBanner = function () {
	// Show the cookie banner if not on the cookie settings page and there is no cookie set
	if (!this.onCookiesPage()) {
		var hasCookiesPolicy = this.getCookie(this.cookieName)
		if (this.$module && !hasCookiesPolicy) {
			this.$module.removeAttribute('hidden')
		}
	}
}

Cookies.prototype.initCookieBanner = function ($module) {
	this.$module = $module

	this.$module.hideCookieMessage = this.hideCookieMessage.bind(this)
	this.$module.showBannerConfirmationMessage = this.showBannerConfirmationMessage.bind(this)
	this.$module.setBannerCookieConsent = this.setBannerCookieConsent.bind(this)
	this.$module.cookieBannerConfirmationMessage = this.$module.querySelector('.govuk-cookie-banner__confirmation-message')

	if (!this.$module) {
		return
	}

	this.$hideLink = this.$module.querySelector('button[data-hide-cookie-message]')
	if (this.$hideLink) {
		this.$hideLink.addEventListener('click', this.$module.hideCookieMessage)
	}

	this.$acceptCookiesLink = this.$module.querySelector('button[data-accept-cookies=true]')
	if (this.$acceptCookiesLink) {
		this.$acceptCookiesLink.addEventListener('click', function () {
			this.$module.setBannerCookieConsent(true)
		}.bind(this))
	}

	this.$rejectCookiesLink = this.$module.querySelector('button[data-accept-cookies=false]')
	if (this.$rejectCookiesLink) {
		this.$rejectCookiesLink.addEventListener('click', function () {
			this.$module.setBannerCookieConsent(false)
		}.bind(this))
	}

	this.showCookieBanner()
}

Cookies.prototype.initAnalytics = function () {
	// Load GTM
	this.loadGtmScript()
}

Cookies.prototype.hideCookieMessage = function (event) {
	if (this.$module) {
		this.$module.style.display = 'none'
	}

	if (event.target) {
		event.preventDefault()
	}
}

Cookies.prototype.showBannerConfirmationMessage = function (analyticsConsent) {
	var messagePrefix = analyticsConsent ? 'You’ve accepted analytics cookies.' : 'You’ve rejected analytics cookies.'

	this.$cookieBannerMainContent = document.querySelector('.govuk-cookie-banner__message')
	this.$cookieBannerConfirmationMessage = document.querySelector('.govuk-cookie-banner__confirmation-message')

	this.$cookieBannerConfirmationMessage.querySelector('.govuk-cookie-banner__content .govuk-body').insertAdjacentText('afterbegin', messagePrefix)
	this.$cookieBannerMainContent.setAttribute('hidden', true)
	this.$cookieBannerConfirmationMessage.removeAttribute('hidden')

	this.$cookieBannerConfirmationMessage.focus()
}

Cookies.prototype.onCookiesPage = function () {
	return window.location.pathname.indexOf('cookies') > -1
}

Cookies.prototype.getCookie = function (name) {
	var nameEQ = name + '='
	var cookies = document.cookie.split(';')
	for (var i = 0, len = cookies.length; i < len; i++) {
		var cookie = cookies[i]
		while (cookie.charAt(0) === ' ') {
			cookie = cookie.substring(1, cookie.length)
		}
		if (cookie.indexOf(nameEQ) === 0) {
			return decodeURIComponent(cookie.substring(nameEQ.length))
		}
	}
	return null
}

Cookies.prototype.setCookie = function (name, values, options) {
	if (typeof options === 'undefined') {
		options = {}
	}

	var cookieString = name + '=' + values + '; path=/'
	if (options.days) {
		var date = new Date()
		date.setTime(date.getTime() + (options.days * 24 * 60 * 60 * 1000))
		cookieString = cookieString + '; expires=' + date.toGMTString()
	}

	if (document.location.protocol === 'https:') {
		cookieString = cookieString + '; Secure'
	}
	
	document.cookie = cookieString
}

Cookies.prototype.deleteCookie = function(name) {
	if (name) {
		// Cookies need to be deleted in the same level of specificity in which they were set
		// If a cookie was set with a specified domain, it needs to be specified when deleted
		// If a cookie wasn't set with the domain attribute, it shouldn't be there when deleted
		// You can't tell if a cookie was set with a domain attribute or not, so try both options
		document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/'
		document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=' + window.location.hostname + ';path=/'
		document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;domain=.' + window.location.hostname + ';path=/'
	}
}

//initialise cookies so that it's available to the cookies page
var $cookieBanner = document.querySelector('[data-module="cookie-banner"]'),
	cookies = new Cookies()

if ($cookieBanner) {
	cookies.initCookieBanner($cookieBanner)
}

if (cookies.hasConsentForAnalytics()) {
	cookies.initAnalytics()
}

function CookiesPage ($module) {
	this.$module = $module
}

CookiesPage.prototype.init = function () {
	this.$cookiePage = this.$module

	if (!this.$cookiePage) {
		return
	}

	this.$cookieForm = this.$cookiePage.querySelector('.js-cookies-page-form')
	this.$cookieFormFieldsets = this.$cookieForm.querySelectorAll('.js-cookies-page-form-fieldset')
	this.$successNotification = this.$cookiePage.querySelector('.js-cookies-page-success')

	nodeListForEach(this.$cookieFormFieldsets, function ($cookieFormFieldset) {
		this.showUserPreference($cookieFormFieldset, cookies.getCookie(cookies.getCookiePolicyName()))
		$cookieFormFieldset.removeAttribute('hidden')
	}.bind(this))

	// Show submit button
	this.$cookieForm.querySelector('.js-cookies-form-button').removeAttribute('hidden')

	this.$cookieForm.addEventListener('submit', this.savePreferences.bind(this))
}

CookiesPage.prototype.savePreferences = function (event) {
	// Stop default form submission behaviour
	event.preventDefault()

	var preferences = {},
		isGaCookies = !!(cookies.getCookie(cookies.getGaCookies().main) && cookies.getCookie(cookies.getGaCookies().ga4Id))

	nodeListForEach(this.$cookieFormFieldsets, function ($cookieFormFieldset) {
		var cookieType = this.getCookieType($cookieFormFieldset),
			selectedItem = $cookieFormFieldset.querySelector('input[name=' + cookieType + ']:checked').value

		preferences[cookieType] = selectedItem === 'yes'
	}.bind(this))

	// if GA cookies exist and user has withdrawn consent, then delete them
	if (isGaCookies && !preferences.analytics) {
		cookies.deleteCookie(cookies.getGaCookies().main)
		cookies.deleteCookie(cookies.getGaCookies().ga4Id)
	}

	// Save preferences to cookie and show success notification
	cookies.setCookie(cookies.getCookiePolicyName(), JSON.stringify(preferences), { days: cookies.getCookieDuration() })
	this.showSuccessNotification()
}

CookiesPage.prototype.showUserPreference = function ($cookieFormFieldset, preferences) {
	var cookieType = this.getCookieType($cookieFormFieldset)
	var preference = false
	var preferenceObj = JSON.parse(preferences)

	if (cookieType && preferenceObj && preferenceObj[cookieType] !== undefined) {
		preference = preferenceObj[cookieType]
	}

	var radioValue = preference ? 'yes' : 'no'
	var radio = $cookieFormFieldset.querySelector('input[name=' + cookieType + '][value=' + radioValue + ']')
	radio.checked = true
}

CookiesPage.prototype.showSuccessNotification = function () {
	this.$successNotification.removeAttribute('hidden')

	// Set tabindex to -1 to make the element focusable with JavaScript.
	// GOV.UK Frontend will remove the tabindex on blur as the component doesn't
	// need to be focusable after the user has read the text.
	if (!this.$successNotification.getAttribute('tabindex')) {
		this.$successNotification.setAttribute('tabindex', '-1')
	}

	this.$successNotification.focus()

	// scroll to the top of the page
	window.scrollTo(0, 0)
}

CookiesPage.prototype.getCookieType = function ($cookieFormFieldset) {
	return $cookieFormFieldset.id
}

// Initialise cookie page
var $cookiesPage = document.querySelector('[data-module="app-cookies-page"]'),
		cookiesPage = new CookiesPage($cookiesPage)
if ($cookiesPage) {
	cookiesPage.init()
}
