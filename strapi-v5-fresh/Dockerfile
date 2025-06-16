FROM node:20-alpine

# Installing libvips-dev for sharp compatibility
RUN apk update && apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /opt/app

COPY package.json package-lock.json ./

RUN npm ci --only=production

ENV PATH /opt/app/node_modules/.bin:$PATH

COPY . .

RUN npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]