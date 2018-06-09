FROM node:8-alpine

WORKDIR /usr/app

COPY package.json yarn.lock ./
RUN npm install -g yarn
RUN yarn install

COPY . .
