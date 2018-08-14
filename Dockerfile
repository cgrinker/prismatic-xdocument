FROM node:alpine
#ENV PRISMA_SECRET ""
#ENV PRISMA_ENDPOINT "http://prisma:4466"
RUN npm i -g prisma
WORKDIR /app 


ADD ./package.json /app

RUN yarn install
ADD . /app
cmd npm run prod
