/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env amd, browser, jquery */

/**
 * Common dependency handling for all browser apps (games, game, createGame)
 * Returns a promise that resolves to a list of supported locales
 */
define('browser/browserApp', [
	'jquery',
	'jqueryui',
	'i18n',
	'i18n_emitter',
	'i18n_fallbacks',
	'i18n_language',
	'i18n_messagestore',
	'i18n_parser'
], () => {
	return $.get('/locales')
	.then(locales => {
		const params = {};
		locales.forEach(locale => {
			params[locale] = `/i18n/${locale}.json`;
		});
		// Note: without other guidance, i18n will use the locale
		// already in the browser - which is fine by us!
		return $.i18n().load(params).then(() => locales);
	})
	.then(locales => {
		console.log('Locales available', locales.join(', '));
		// Expand/translate strings in the HTML
		return new Promise(resolve => {
			$(document).ready(() => {
				console.log('Translating HTML to', $.i18n().locale);
				$('body').i18n();
				resolve(locales);
			});
		});
	});
});
