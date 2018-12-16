FROM node
WORKDIR /opt

COPY .next /opt/.next
COPY components /opt/components
COPY dialogs /opt
COPY node_modules /opt/node_modules
COPY pages /opt/pages
COPY src /opt/src
COPY static /opt/static
COPY store /opt/store
COPY .env.prod /opt/.env
COPY next.config.js /opt/next.config.js
COPY package.json /opt/package.json
COPY server.js /opt/server.js

EXPOSE 3000
