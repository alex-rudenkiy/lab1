FROM node:10
WORKDIR /app
COPY ./package.json ./
RUN npm install
COPY . .
RUN npm run build
# EXPOSE 3000
  
CMD ["npm", "install", "pg --save"]
CMD ["npm", "run", "start:prod"]
