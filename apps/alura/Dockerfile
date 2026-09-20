# ── Estágio 1: Builder ──────────────────────────────────────────────────────────
FROM hexpm/elixir:1.16.2-erlang-26.2.4-debian-bookworm-20240408-slim AS builder

# Instala dependências de compilação
RUN apt-get update -y && apt-get install -y build-essential git \
    && apt-get clean && rm -f /var/lib/apt/lists/*_*

WORKDIR /app

# Instala hex e rebar
RUN mix local.hex --force && \
    mix local.rebar --force

ENV MIX_ENV=prod

# Instala dependências
COPY mix.exs mix.lock* ./
RUN mix deps.get --only $MIX_ENV
RUN mix deps.compile

# Copia configurações e código fonte
COPY config config
COPY lib lib

# Compila código e gera a release do OTP
RUN mix compile
RUN mix release

# ── Estágio 2: Runner (Imagem Mínima de Produção) ──────────────────────────────
FROM debian:bookworm-20240408-slim AS runner

RUN apt-get update -y && \
    apt-get install -y libstdc++6 openssl libncurses5 locales ca-certificates \
    && apt-get clean && rm -f /var/lib/apt/lists/*_*

# Configura locale UTF-8
RUN sed -i '/en_US.UTF-8/s/^# //g' /etc/locale.gen && locale-gen
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

WORKDIR /app
RUN chown nobody /app

# Copia a release compilada do estágio builder
COPY --from=builder --chown=nobody:root /app/_build/prod/rel/alura ./

USER nobody

ENV HOME=/app
ENV MIX_ENV=prod
ENV PORT=4000
ENV PHX_SERVER=true

EXPOSE 4000

CMD ["bin/alura", "start"]
