FROM node:18 as base

ENV PORT=3000
ENV HOST=0.0.0.0

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

FROM base as development

EXPOSE 3000

ENTRYPOINT [ "node" ]
CMD ["index.js"]

FROM base as production

EXPOSE 3000

ENTRYPOINT ["node"]
CMD ["index.js"]