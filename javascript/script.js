document.addEventListener('DOMContentLoaded', () => {
const consentGrantedBtn = document.querySelector('#consentGranted');
const consentRejectedBtn = document.querySelector('#consentRejected');
const cookieBanner = document.querySelector('.govuk-cookie-banner');

consentGrantedBtn.addEventListener('click', handleConsent);
consentRejectedBtn.addEventListener('click', handleConsent);

function handleConsent(event) {
  if (event.target.id === 'consentGranted') {
    setCookie('cookieConsent', 'granted', 365);
  } else {
    setCookie('cookieConsent', 'rejected', 30);
  }
  hideCookieBanner();
}

function hideCookieBanner() {
  cookieBanner.style.display = 'none';
}

function setCookie(name, value, days) {
  let expires = '';
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = '; expires=' + date.toUTCString();
  }
  document.cookie = name + '=' + value + expires + '; path=/';
}

function getCookie(name) {
  const nameEQ = name + '=';
  const ca = document.cookie.split(';');
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) === ' ') c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

const cookieConsent = getCookie('cookieConsent');
if (cookieConsent === 'granted') {
  hideCookieBanner();
} else if (cookieConsent === 'rejected') {
  const lastVisit = getCookie('lastVisit');
  if (!lastVisit) {
    setCookie('lastVisit', Date.now(), 365);
  } else {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    if (lastVisit > thirtyDaysAgo) {
      hideCookieBanner();
    }
  }
} else {
  setCookie('lastVisit', Date.now(), 365);
}

});