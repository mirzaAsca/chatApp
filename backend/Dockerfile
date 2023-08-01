# First stage: build
FROM node:14 AS builder
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .

# Second stage: run
FROM node:14
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app .
EXPOSE 5000
CMD [ "node", "src/server.js" ]
