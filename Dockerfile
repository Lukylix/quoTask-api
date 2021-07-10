FROM node:16-alpine
WORKDIR /usr/src/app
# Copy package.json taking advantage of cahed Dicker layers
COPY package*.json ./
RUN npm install
#Copy source code
COPY . .
# Port
EXPOSE 3000
CMD [ "node", "server.js" ]