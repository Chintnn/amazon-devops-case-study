FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
ARG APP_VERSION=1.0.0
ENV APP_VERSION=$APP_VERSION
ENV PORT=3001
EXPOSE 3001
USER node
CMD ["node", "src/server.js"]