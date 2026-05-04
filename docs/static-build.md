# Building Storybook

Storybook can be built as a static application and deployed on a simple web server. The build contains story metadata and the JavaScript used to render the Storybook UI.

## Build Storybook

Build Storybook with:

```shell
npm run build-storybook
```

Production builds do not require the `symfony.server` framework option. The static output still needs access to the Symfony application at runtime for render, asset, and Live Component requests. Deploy it behind a reverse proxy that forwards unmatched Symfony routes to the Symfony server and sets the `X-Storybook-Proxy: true` header.

The command creates a `storybook-static` directory:

```text
./storybook-static/
├── favicon.svg
├── iframe.html
├── index.html
├── index.json
├── project.json
├── sb-addons/
├── sb-common-assets/
├── sb-manager/
├── sb-preview/
└── assets/

```

## Deploy Storybook

The simplest way to deploy Storybook is to bundle the application in a Docker image. The web server should serve Storybook static files and use a reverse proxy to forward other requests to the web server hosting the Symfony application.

For example with Caddy:

```caddyfile
# storybook/Caddyfile

{
	http_port 80
	https_port 443
}

${SERVER_NAME:localhost} {
    handle {
        templates
        file_server {
            pass_thru
            root /app
            index index.html
        }
    }

    handle {
        # Proxy unmatched requests to the Symfony server
        reverse_proxy * {$SYMFONY_SERVER_NAME} {
            header_up X-Storybook-Proxy true   # Identify Storybook requests in Symfony
            header_up Host {upstream_hostport} # Change origin
        }
    }
}

```

```dockerfile
# Dockerfile
FROM caddy:latest

COPY storybook-static /app
COPY storybook/Caddyfile /etc/caddy/Caddyfile
```

Then build and run the image:

```shell
docker build -t my-app-storybook .

docker run -d -p 80:80 -p 443:443 \
  -e SERVER_NAME=localhost \
  -e SYMFONY_SERVER_NAME=my-app.example.com \
  -v caddy_data:/data \
  -v caddy_config:/config \
  my-app-storybook
```
