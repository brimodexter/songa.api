FROM node:lts-alpine as dependencies

WORKDIR	/usr/src/app

COPY package*.json ./

RUN npm install

RUN ls -la   # Check the contents of the build context
RUN ls -la ./prisma   # Check the contents of the prisma directory


#RUN npx prisma generate --schema=./prisma/schema.prisma

#RUN npx prisma generate

# RUN npm run migrate

# RUN npm ci --only=production

FROM dependencies as builder

RUN npm run build

COPY . .

EXPOSE 3000

CMD [ "node", "dist/index.js" ]

