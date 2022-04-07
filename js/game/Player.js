/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env amd, jquery */

define('game/Player', [
	'platform', 'game/GenKey', 'game/Rack',
], (
	Platform, GenKey, Rack
) => {

	// Unicode characters
	const BLACK_CIRCLE = '\u25cf';

	/**
	 * A player in a {@link Game}. Player objects are specific to
	 * a single game, and are used on both browser and server sides.
	 */
	class Player {

		/**
		 * @param {(string|Player)} name name of the player, or
		 * a Player object to copy
		 * @param {boolean} key unique key identifying the player. Names
		 * may be duplicated, but keys never are.
		 * @param {boolean} isRobot if name is a string and true then
		 * it's a robot. If name is a Player object, ignored.
		 */
		constructor(name, key, isRobot) {
			if (typeof name === 'object') {
				// Copying an existing Player or Player.simple
				this.isRobot = name.isRobot;
				this.key = name.key; // re-use
				name = name.name;
			} else {
				this.key = key;
				this.isRobot = isRobot;
			}

			/**
			 * Player name
			 * @member {string}
			 */
			this.name = name;

			/**
			 * Player doesn't have a rack until they join a game, as
			 * it's only then we know how big it has to be.
			 * @member {Rack}
			 */
			this.rack = null;

			/**
			 * Number of times this player has passed (or swapped)
			 * @member {number}
			 */
			this.passes = 0;

			/**
			 * Set true to advise player of better plays than the one
			 * they used
			 * @member {boolean}
			 */
			this.wantsAdvice = false;

			/**
			 * Player's current score
			 * @member {number}
			 */
			this.score = 0;

			/**
			 * Seconds remaining before play times out
			 * @member {number}
			 */
			this.secondsToPlay = 0;

			/**
			 * We don't keep a pointer to the dictionary objects so we can
			 * cheaply serialise and send to the games interface. We just
			 * keep the name of the relevant object. This dictionary will
			 * only be used for findBestPlay for robot players.
			 * @member {string}
			 */
			this.dictionary = undefined;
		}

		/**
		 * Create simple flat structure describing a subset of the player
		 * state
		 * @param {Game} game the game the player is participating in
		 * @param {UserManager?} um user manager for getting emails if wanted
		 * @return {Promise} resolving to a simple structure describing the player
		 */
		simple(game, um) {
			return ((this.isRobot || !um)
					? Promise.resolve(this)
					: um.getUser({key: this.key}))
			.then(ump => {
				return {
					name: this.name || 'Unknown Player',
					isRobot: this.isRobot,
					dictionary: this.dictionary,
					key: this.key,
					score: this.score,
					secondsToPlay: this.secondsToPlay,
					
					// Can they be emailed?
					email: ump.email ? true : false,
					// Only in simple, has no analog in Player
					connected: this.isRobot
					|| (game.getConnection(this) !== null)
				};
			})
			.catch(e => {
				// User key not found in the db. Not fatal, just pretend it's
				// a robot.
				return {
					name: 'Unknown',
					isRobot: this.isRobot,
					connected: this.isRobot
					|| (game.getConnection(this) !== null),
					key: this.key,
					score: this.score,
					secondsToPlay: this.secondsToPlay
				};
			});
		}

		/**
		 * Draw an initial rack from the letter bag.
		 * @param {LetterBag} letterBag LetterBag to draw tiles from
		 * @param {number} rackSize size of the rack
		 */
		fillRack(letterBag, rackSize) {
			// +1 to allow space for tile sorting in the UI
			this.rack = new Rack(rackSize + 1);
			for (let i = 0; i < rackSize; i++)
				this.rack.addTile(letterBag.getRandomTile());
			this.score = 0;
		}

		/**
		 * Return all tiles to the letter bag
		 */
		returnTiles(letterBag) {
			for (let tile of this.rack.tiles())
				letterBag.returnTile(this.rack.removeTile(tile));
		}

		/**
		 * Set a play timeout for the player
		 * @param {number} time number of seconds before elapse, or
		 * 0 to cancel any timeout. If undefined, will restart the timer with
		 * the time remaining to the player.
		 * @param {function} onTimeout a function() invoked if the
		 * timer expires
		 */
		startTimer(time, onTimeout) {
			if (typeof time !== 'undefined') {
				this.stopTimer();
				// Timer is being reset
				if (time === 0)
					// No timeout, nothing to do
					return;
				this._onTimeout = onTimeout;
			} else if (!this._timeoutTimer && this.secondsToPlay > 0) {
				// Timer was previously stopped in stopTimer with
				// time remaining
				time = this.secondsToPlay;
			} else {
				this.stopTimer();
				return;
			}

			console.log(`${this.name}'s go will time out in ${time}s`);

			// Set an overriding timeout
			this.secondsToPlay = time;
			this._timeoutAt = Date.now() + time * 1000;
			this._timeoutTimer = setTimeout(() => {
				this._timeoutTimer = null;
				console.log(`${this.name} has timed out at ${Date.now()}`);
				// Invoke the timeout function
				this._onTimeout();
			}, time * 1000);
		}

		/**
		 * Cancel current play timeout
		 */
		stopTimer() {
			if (this._timeoutTimer) {
				this.secondsToPlay = (this._timeoutAt - Date.now()) / 1000;
				console.log(`${this.name} stopped timer with ${this.secondsToPlay}s remaining`);
				clearTimeout(this._timeoutTimer);
				this._timeoutTimer = null;
			}
		}

		/**
		 * Generate a simple string representation of the player
		 */
		toString() {
			let s = `Player '${this.name}'`;
			if (this.isRobot)
				s += ' (Robot)';
			if (this.key)
				s += ` key ${this.key}`;
			return s;
		}

		/**
		 * Toggle wantsAdvice on/off
		 */
		toggleAdvice() {
			this.wantsAdvice = !this.wantsAdvice;
		}

		/**
		 * Create score table representation of the player on the browser
		 * side only. This is intended to work both on a full Player
		 * object, but also on a Player.simple of the player.
		 * @param {Player?} curPlayer the player for whom the DOM is
		 * being generated
		 * @param {boolean} showConnect show the connection status of the player
		 * @return {jQuery} DOM object for the score table
		 */
		createScoreDOM(curPlayer, showConnect) {
			const $tr = $(`<tr class="player-row" id='player${this.key}'></tr>`);
			$tr.append(`<td class='turn-pointer'>&#10148;</td>`);
			const $icon = $('<div class="ui-icon"></div>');
			$icon.addClass(this.isRobot ? "icon-robot" : "icon-person");
			$tr.append($("<td></td>").append($icon));
			const who = curPlayer && this.key === curPlayer.key
				? Platform.i18n("You")
				: this.name;
			$tr.append(`<td class='name'>${who}</td>`);
			$tr.append('<td class="remaining-tiles"></td>');

			if (showConnect) {
				const $status = $(`<td class='connect-state'>${BLACK_CIRCLE}</td>`);
				$status.addClass(this.connected ? "online" : "offline");
				$tr.append($status);
			}
			
			$tr.append(`<td class='score'>${this.score}</td>`);

			return $tr;
		}

		/**
		 * Refresh score table representation of the player on the browser
		 * side only.
		 */
		refreshDOM() {
			$(`#player${this.key} .score`).text(this.score);
		}

		/**
		 * Set 'online' status of player in UI on the browser
		 * side only.
		 * @param {boolean} tf true/false
		 */
		online(tf) {
			let rem = tf ? 'offline' : 'online';
			let add = tf ? 'online' : 'offline';
			$(`#player${this.key} .connect-state`)
			.removeClass(rem)
			.addClass(add);
		}
	}

	return Player;
});
