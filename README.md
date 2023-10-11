# Dockerized Simplified Multiplayer Scrabble (Scrabble for New Horizon)

This project is a fork of Enter [CDOT's Xanado]([https://github.com/hanshuebner/html-scrabble](https://github.com/cdot/Xanado)], and [Hans Hübner's html-scrabble](https://github.com/hanshuebner/html-scrabble). Thanks to these great developers.

This project serves 2 purposes:
1. It adds a simplified English dictionary for English Language Learners, based on the Oxford 5000 Word List (https://www.oxfordlearnersdictionaries.com/about/wordlists/oxford3000-5000), Oxford Phrase List, and the Japanese New Horizon English textbook word list (https://ten.tokyo-shoseki.co.jp/text/chu/eigo/).

2. It provides a docker image, available on Docker Hub (https://hub.docker.com/r/tgmgroup/docker-scrabble), that can easily be used to create multiple versions of this game for different classes. If there is demand for it, I will create a version of this docker image without simplifications. Please notify me of issues or requests at the Github page (https://github.com/tgmgroup/Scrabble-for-New-Horizon)


## Credits
This work is based on:

1. Scrabble®
2. C-Dot Consultants's CrossWord Game (https://github.com/cdot/CrosswordGame)
3. Hans Hübner's html-scrabble (https://github.com/hanshuebner/html-scrabble)
4. JNoodle's English Word Lists (https://github.com/jnoodle/English-Vocabulary-Word-List)
4. All their predecessors

## Customizing and running the Game
1. To undo simplification, move these files in these directories back to the original directory:
    a. editions/other -> editions
    b. dictionaries/other -> dictionaries
2. Edit the config.json file.
3. Run npm install
4. Run server.js

## Customizing and running the Game on Docker
1. Touch /data/config.json (edit the directory as needed)
2. Copy and edit the data in config.json to /data/config.json
3. Edit your docker-compose.yml file to point to your /data/config.json file

## More information
For more details on how to run the game or add dictionaries, check out C-Dot Consultants's CrosswordGame.

## About Scrabble:

- [SCRABBLE®](http://www.scrabble.com/) is a registered trademark. All
intellectual property rights in and to the game are owned in the U.S.A
and Canada by Hasbro Inc., and throughout the rest of the world by
J.W. Spear & Sons Limited of Maidenhead, Berkshire, England, a
subsidiary of Mattel Inc.

This not-for-profit project is not associated with any of the owners
of the SCRABBLE® brand. If you don't already have a SCRABBLE board,
please go out and buy one!



