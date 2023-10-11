# syntax=docker/dockerfile:1

FROM node:current-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install --production
COPY . .
EXPOSE 9093
CMD [ "node", "server.js", "-c", "docker_config.json" ]
