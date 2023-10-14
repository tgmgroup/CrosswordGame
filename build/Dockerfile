# syntax=docker/dockerfile:1

FROM node:19-alpine
ENV NODE_ENV=production
WORKDIR /app
RUN apk update && apk add git
COPY package*.json ./
RUN npm install || cat /root/.npm/_logs/*.log
COPY CONFIGURATION.md .
COPY DEVELOPING.md .
COPY README.md .
COPY audio audio
COPY bin bin
COPY css css
COPY dictionaries/*.dict dictionaries/
COPY dist dist
COPY editions editions
COPY favicon.ico .
COPY games games
COPY html html
COPY i18n i18n
COPY images images
COPY src src
EXPOSE 9093
CMD [ "npm", "run", "debug_server" ]
