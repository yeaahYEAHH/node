FROM node:latest
WORKDIR /schedule
COPY . .
RUN npm i
RUN npm test
EXPOSE 5000
CMD ["npm", "start"]