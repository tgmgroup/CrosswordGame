FILES=$(shell ls *.txt)

all: $(FILES:.txt=.dict)

%.dict: %.txt
	node ../node_modules/@cdot/dictionary/bin/compress.js $< $@
