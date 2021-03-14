FROM node:12

RUN mkdir -p /home/node/app/node_modules
RUN mkdir /home/node/app/temp_files
RUN chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY package*.json ./
COPY yarn.lock ./

USER node

RUN yarn install

COPY --chown=node:node . .
RUN chmod +x utils/entrypoint.sh

RUN yarn build

EXPOSE 8080

ENTRYPOINT ["utils/entrypoint.sh"]
CMD [ "yarn", "serve" ]
