FROM node:latest
WORKDIR /schedul
COPY . .
RUN npm i
RUN npm test
EXPOSE 5000
CMD ["npm", "app.js"]