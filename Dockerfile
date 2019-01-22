FROM node:11.7.0

# Create app directory
WORKDIR /usr/src/app

COPY package*.json ./
COPY index.js .
COPY pages ./pages
COPY schema ./schema

RUN apt update
RUN apt install -y tor

# Enable tor controll port
RUN echo 'ControlPort 9051' >> /etc/tor/torrc

# We are usin nc to renew tor ip
RUN apt install -y netcat

RUN npm install
RUN npm run build

EXPOSE 3000
CMD service tor restart && \
    echo HashedControlPassword $(tor --hash-password "privacy1" | tail -n 1) >> /etc/tor/torrc && \
    npm run start