FROM maven:3.9.9-eclipse-temurin-21

SHELL ["/bin/bash", "-lc"]

ENV DEBIAN_FRONTEND=noninteractive
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
    openssh-client \
    procps \
    tmux \
    ttyd \
    unzip \
    xz-utils \
  && rm -rf /var/lib/apt/lists/*

# Official Kiro CLI Linux/macOS install path. Keep this in the image so users do not install Kiro locally.
RUN curl -fsSL https://cli.kiro.dev/install | bash \
  && kiro-cli --version

WORKDIR /workspace
