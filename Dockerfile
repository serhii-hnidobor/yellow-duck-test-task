FROM node:19-alpine
WORKDIR /app

RUN apk add --update --no-cache chromium

COPY ./dist ./dist

EXPOSE 3000

CMD ["node", "./dist/index.js", "--max_old_space_size=425" ]
