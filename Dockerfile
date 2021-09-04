FROM node:15-alpine
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# RUN npm install --production --silent && mv node_modules ../

ARG NODE_ENV
RUN if [ "${NODE_ENV}" = "development" ]; \
    then npm install && mv node_modules ../; \
    else npm install --only=production && mv node_modules ../; \
    fi

COPY . .
ENV PORT 3000
EXPOSE $PORT
RUN chown -R node /app
USER node
CMD ["node", "index.js"]
