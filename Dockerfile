FROM node:alpine
#ENV PRISMA_SECRET ""
#ENV PRISMA_ENDPOINT "http://prisma:4466"
RUN npm i -g prisma
ADD . /app
WORKDIR /app 

RUN yarn install

cmd npm run prod
