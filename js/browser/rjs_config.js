// requiresjs configuration shared between all HTML
// Note that paths must be relative to the root of the distribution. Because of
// way requirejs works, that means this file also has to be in the root of the
// distribution.
// See https://coderwall.com/p/qbh0_w/share-requirejs-configuration-among-multiple-pages
/*global rjs_main*/

requirejs.config({
	baseUrl: '../..',
	paths: {
		jquery:
		'//cdnjs.cloudflare.com/ajax/libs/jquery/3.6.0/jquery.min',
		
		jqueryui:
		'//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.12.1/jquery-ui.min',
		
		i18n:
		'//cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.7/jquery.i18n.min',
		
		i18n_emitter:
		'//cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.7/jquery.i18n.emitter.min',

		i18n_fallbacks:
		'//cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.7/jquery.i18n.fallbacks.min',

		i18n_language:
		'//cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.7/jquery.i18n.language.min',

		i18n_messagestore:
		'//cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.7/jquery.i18n.messagestore.min',
		
		i18n_parser:
		'//cdnjs.cloudflare.com/ajax/libs/jquery.i18n/1.0.7/jquery.i18n.parser.min',
		
		touchpunch:
		'//cdnjs.cloudflare.com/ajax/libs/jqueryui-touch-punch/0.2.3/jquery.ui.touch-punch.min',
		
		'socket.io': '//cdnjs.cloudflare.com/ajax/libs/socket.io/3.1.2/socket.io',
		cookie: '//cdnjs.cloudflare.com/ajax/libs/jquery-cookie/1.4.1/jquery.cookie.min',

		browser: '/js/browser',
		game: '/js/game',
		dawg: '/js/dawg',
		platform: '/js/browser/BrowserPlatform'
	},
	
	shim: {
		jqueryui: ['jquery'],
		i18n: ['jquery'],
		i18n_emitter: ['i18n'],
		i18n_fallbacks: ['i18n'],
		i18n_language: ['i18n'],
		i18n_messagestore: ['i18n'],
		i18n_parser: ['i18n']
	}
});

if (typeof rjs_main !== "undefined")
	requirejs([rjs_main]);
