FROM denoland/deno:1.18.1

# The port that your application listens to.
EXPOSE 8080

WORKDIR /app

ENV PORT=8080

# Prefer not to run as root.
USER root

# These steps will be re-run upon each file change in your working directory:
ADD .env.prod .env
ADD . .

# Compile the main app so that it doesn't need to be compiled each startup/entry.
RUN deno cache --reload --import-map=import_map.json --unstable app.ts

RUN deno run --allow-read=. --allow-write=nessie.config.ts,db --allow-net --allow-env --import-map=import_map.json --unstable https://deno.land/x/nessie/cli.ts migrate

# RUN deno run --allow-read=. --allow-write=nessie.config.ts,db --allow-net --allow-env --import-map=import_map.json --unstable https://deno.land/x/nessie/cli.ts seed add_initial_karyawan.ts
# RUN deno run --allow-read=. --allow-write=nessie.config.ts,db --allow-net --allow-env --import-map=import_map.json --unstable https://deno.land/x/nessie/cli.ts seed add_initial_tarif.ts

RUN apt update && apt install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
RUN apt install -y nodejs

RUN npm install --only=prod

CMD ["deno", "run", "--allow-all", "--quiet", "https://deno.land/x/velociraptor@1.4.0/cli.ts", "run", "start"]