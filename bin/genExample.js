/**
 * Create a simple example game for the splash screen. The example is created
 * in the 'games' directory.
 */
import { FileDatabase } from "../src/server/FileDatabase.js";
import { Edition } from "../src/game/Edition.js";
import { ServerPlatform } from "../src/server/ServerPlatform.js";
global.Platform = ServerPlatform;
import { Game } from "../src/game/Game.js";
const Player = Game.CLASSES.Player;

const db = new FileDatabase({
  dir: "games",
  ext: "game",
  typeMap: Game
});
Edition.load("English_Scrabble")
.then(edition => {
  new Game({key:"example", edition: edition.name, debug: console.debug})
  .create()
  .then(game => game.onLoad(db))
  .then(game => {
    game.board.parse(
      Game.CLASSES, edition,
      "| | | | | | | | | | | | | | | |\n" +
      "| | | | | | | | |D| | | | | | |\n" +
      "| | | | | | | | |I| | | | | | |\n" +
      "| | | | |S| | | |C| | | | | | |\n" +
      "| | | | |C| | | |T| | | | | | |\n" +
      "| | | | |R| | | |I| | | | |W| |\n" +
      "| | | |X|A|N|A|D|O| | | | |O| |\n" +
      "| | | | |B| | | |N| |F| | |R| |\n" +
      "| | | | |B| | | |A| |R| | |D| |\n" +
      "| | | | |L| | |F|R|I|E|N|D|S| |\n" +
      "| | | | |E| | | |I| |E| | | | |\n" +
      "| | | | | | | | |E| | | | | | |\n" +
      "| |L|E|X|U|L|O|U|S| | | | | | |\n" +
      "| | | | | | | | | | | | | | | |\n" +
      "| | | | | | | | | | | | | | | |\n");
    game.save()
    .then(() => console.log(`Saved ${game.key}.game`));
  });
});


