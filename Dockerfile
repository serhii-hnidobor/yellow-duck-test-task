FROM node:19-alpine
WORKDIR /app

RUN apk add --update --no-cache chromium

RUN apk add --no-cache \
    build-base \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev

RUN npm i canvas

COPY ./dist ./dist

EXPOSE 3000

CMD ["node", "./dist/index.js", "--max_old_space_size=425" ]
