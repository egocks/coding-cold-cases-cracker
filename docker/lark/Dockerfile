FROM node:25-alpine

WORKDIR /workspace

RUN apk add --no-cache bash ca-certificates curl git jq

RUN npm install -g @getlark/cli \
  && getlark --version

CMD ["bash"]
