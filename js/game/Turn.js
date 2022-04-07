/* See README.md at the root of this distribution for copyright and
   license information */
/* eslint-env amd */

define('game/Turn', ["game/Move"], Move => {

	/**
	 * Communicating the result of a move from server back to client
	 */
	class Turn extends Move {
		/**
		 * @param {Game} game the Game
		 * @param {Object} members object fields (members)
		 */
		constructor(game, members) {
			super();

			/**
			 * The 'type' of the turn. This will be one of
			 * * `move`: a player has made a move
			 * * `swap`: a player has execute a tile swap
			 * * `Game over`: the end of the game has been confirmed
			 * * `challenge-failed`: a challenge was not successful
			 * * `challenge-won`: a challenge succeeded
			 * * `took-back`: the last player took back their turn
			 * @member {string}
			 */
			this.type = undefined;

			/**
			 * Key of the game
			 * @member {string}
			 */
			this.gameKey = game.key;

			/**
			 * Key of the player who's turn it was
			 * @member {string}
			 */
			this.playerKey = undefined;

			/**
			 * Key of the next player who's turn it is
			 * @member {string}
			 */
			this.nextToGoKey = undefined;
			
			/**
			 * At the (possible) end of game, this will be the key of
			 * the player who has no tiles on their rack (and there are no
			 * more in the bag), or -1 if no player has an empty rack.
			 * @member {number}
			 */
			this.emptyPlayerKey = undefined;

			/**
			 * For 'took-back', 'challenge-won',
			 * key of the player who initiated the action
			 */
			this.challengerKey = undefined;

			const ep = game.players.find(p => p.rack.isEmpty());
			if (ep)
				this.emptyPlayerKey = ep.key;

			if (members)
				Object.getOwnPropertyNames(members).forEach(
					prop => this[prop] = members[prop]);
		}
	}

	return Turn;
});
