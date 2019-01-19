FROM node:11.7.0

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js .
COPY pages ./pages
COPY schema ./schema

RUN npm install
RUN npm run build

EXPOSE 3000
CMD [ "npm", "run", "start" ]