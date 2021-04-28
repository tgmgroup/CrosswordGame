/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env browser, jquery */

/**
 * Browser app for games.html; populate the list of live games
 */
requirejs(["browserApp", "socket.io"], (browserApp, io) => {
	const BLACK_CIRCLE = '\u25cf';
	const ROBOT_FACE = ' <img class="glyph" src="/images/robotface.png" />';

	// Format a player
	function formatPlayer(game, player) {
		let $but = $(`<button class="player">${player.name}</button>`);
		if (player.isRobot) {
			$but.append(ROBOT_FACE);
			$but.prop("disabled", true);
		} else {
			if (player.connected)
				$but.append(` <span class="greenDot">${BLACK_CIRCLE}</span>`);
			let $a = $(`<a href='/game/${game.key}/${player.key}'></a>`);
			$a.append($but);
			$but = $a;
		}
		return $but;
	}

	// Format an active game
	function formatGame(game) {
		const $p = $(`<div></div>`)

		const msg = [ $.i18n('game-description',
						   game.players.length, game.edition) ];
		if (game.dictionary)
			msg.push($.i18n('game-using-dict', game.dictionary));
		if (game.time_limit > 0)
			msg.push($.i18n('game-time-limit', game.time_limit));
		if (game.ended) {
			const info = game.ended;
			let results;
			if (info.players) {
				results = info.players.map(p => {
					const s = game.players[p.player].name +
						  ':' + p.score;
					if (p.score === info.winningScore)
						return `<span class="winner">${s}</span>`;
					else
						return s;
				}).join(', ');
			}
			msg.push($.i18n(info.reason, results));
			$p.append(msg.join(", "));
		} else {
			$p.append(msg.join(", "));
			game.players.map(player => $p.append(formatPlayer(game, player)));
		}

		const $but = $(`<button class="deleteGame">${$.i18n('game-delete')}</button>`);
		$but.on('click', () => {
			console.log(`Delete game ${game.key}`);
			$.ajax({
				type: 'POST',
				url: `/deleteGame/${game.key}`,
				success: refresh,
				error: function(jqXHR, textStatus, errorThrown) {
					console.error(`deleteGame returned error: ${textStatus} (${errorThrown})`);
				}
			});
		});
		$p.append(' ').append($but);
		return $p;
	}

	function handle_refresh(data) {
		console.log("Refreshing");
		if (data.length == 0) {
			$("#active_games").hide();
			return;
		}
		$("#active_games").show();
		let $gt = $('#game-table');
		$gt.empty();
		data.forEach(game => $gt.append(formatGame(game)));
	}

	function refresh() {
		$.getJSON('/games', data => handle_refresh(data));
	}

	browserApp.then(() => {

		let transports = ['websocket', 'flashsocket', 'htmlfile', 'xhr-multipart', 'xhr-polling', 'jsonp-polling'];
		if (navigator.userAgent.search("Firefox") >= 0) {
			transports = ['htmlfile', 'xhr-polling', 'jsonp-polling'];
		}

		const socket = io.connect(null, { transports: transports });

		refresh();

		socket
		.on('connect', () => console.debug('Server: Socket connected'))
		.on('update', () => refresh());

		socket.emit('monitor');
	});
});
