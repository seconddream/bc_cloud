FROM node:alpine
WORKDIR 'app'
COPY package.json .
RUN apk add --no-cache make gcc g++ python git
RUN npm install 
COPY src src
CMD ["npm", "run", "start"]
