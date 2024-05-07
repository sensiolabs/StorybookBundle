# Building Storybook

Storybook can be built in a static application, to be deployed on a simple web server. The build will contain all stories metadata and the JavaScript used to render the Storybook UI.

## Build Storybook

To build Storybook, use:
```shell
npm run build-storybook
```

This will create a `storybook-static` directory:
```text
./storybook-static/
├── 230.5744d375.iframe.bundle.js
├── 260.a0fcd16a.iframe.bundle.js
├── 294.1615ff58.iframe.bundle.js
├── 33.b34bb2e3.iframe.bundle.js
├── 33.b34bb2e3.iframe.bundle.js.map
├── 414.b5e0bef5.iframe.bundle.js
├── 62.3b614862.iframe.bundle.js
├── 694.eaea88c7.iframe.bundle.js
├── 694.eaea88c7.iframe.bundle.js.LICENSE.txt
├── 694.eaea88c7.iframe.bundle.js.map
├── 956.9bb662f7.iframe.bundle.js
├── 981.dcbbae55.iframe.bundle.js
├── app-ProductList-stories.759d41de.iframe.bundle.js
├── favicon.svg
├── iframe.html
├── index.html
├── index.json
├── library-Button-stories.fa586cfc.iframe.bundle.js
├── library-Pagination-stories.8725b52b.iframe.bundle.js
├── library-SearchBar-stories.9c6220df.iframe.bundle.js
├── library-Table-mdx.74d8d377.iframe.bundle.js
├── library-Table-mdx.74d8d377.iframe.bundle.js.LICENSE.txt
├── library-Table-stories.056dd1c2.iframe.bundle.js
├── main.238705ce.iframe.bundle.js
├── main.238705ce.iframe.bundle.js.LICENSE.txt
├── main.238705ce.iframe.bundle.js.map
├── project.json
├── runtime~main.ffd941f6.iframe.bundle.js
├── sb-addons/
├── sb-common-assets/
├── sb-manager/
└── sb-preview/

```

## Deploy Storybook

The simplest way to deploy Storybook is to bundle the application in a Docker image. The webserver should serve Storybook static files, and use a reverse-proxy to forward other requests to the webserver hosting the Symfony application. 

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

