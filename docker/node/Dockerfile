FROM node:carbon

RUN mkdir /src
RUN npm install express-generator -g
RUN npm install nodemon -g
WORKDIR /src
ADD node/nodemon.json /src/nodemon.json
ADD node/package.json /src/package.json
RUN npm install
