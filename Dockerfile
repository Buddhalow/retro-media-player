FROM node:24.24-alpine3.18 AS base

ENV PORT=3000
ENV HOST=0.0.0.0

# Create app directory
WORKDIR /usr/src/app

ENV SPOTIFY_CLIENT_ID=
ENV SPOTIFY_CLIENT_SECRET=
ENV SPOTIFY_REDIRECT_URI=http://localhost:3000/callback.html
ENV BUNGALOW_PATH=/.bungalow

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install -g pnpm

RUN pnpm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3000

ENTRYPOINT ["node"]
CMD ["index.js"]