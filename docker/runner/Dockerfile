FROM maven:3.9.9-eclipse-temurin-21

WORKDIR /workspace

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    bash \
    ca-certificates \
    curl \
    git \
    jq \
    unzip \
    zip \
  && rm -rf /var/lib/apt/lists/*

CMD ["bash"]
