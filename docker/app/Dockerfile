FROM maven:3.9.9-eclipse-temurin-21

WORKDIR /workspace

SHELL ["/bin/bash", "-lc"]

ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PATH="/root/.local/bin:/usr/local/bin:${PATH}"

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    curl \
    git \
    jq \
    less \
    nodejs \
    npm \
    openssh-client \
    procps \
    unzip \
    xz-utils \
    zip \
  && rm -rf /var/lib/apt/lists/*

RUN curl -fsSL https://cli.kiro.dev/install | bash \
  && kiro-cli --version

RUN npm install -g @getlark/cli \
  && getlark --version

COPY . /workspace

EXPOSE 3000

CMD ["node", "app/server.js"]
