FROM node:20-alpine
WORKDIR /app
COPY client/package*.json ./
RUN npm ci
COPY client/ .
COPY shared/ /shared/
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]
