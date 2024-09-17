// eslint-disable-next-line no-restricted-globals
addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  // Modify the referer header to match the allowed localhost IP
  let modifiedHeaders = new Headers(request.headers);
  const requestURL = new URL(request.url);
  modifiedHeaders.set("Referer", requestURL.searchParams.get("customReferer"));
  modifiedHeaders.set("Access-Control-Allow-Origin", "*");
  modifiedHeaders.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  modifiedHeaders.set("Access-Control-Allow-Headers", "Content-Type");
  modifiedHeaders.set(
    "User-Agent",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:15.0) Gecko/20100101 Firefox/15.0.1"
  );

  let baseUrl = new URL(request.url).origin;
  let proxyUrl = new URL(request.url).href.replaceAll(`${baseUrl}/`, "");
  if (proxyUrl) {
    const url = new URL(proxyUrl);
    url.searchParams.delete("customReferer");
    // Proxy the request to the specified URL
    let modifiedRequest = new Request(url.href, {
      method: request.method,
      headers: modifiedHeaders,
      body: request.body,
      redirect: "manual", // Prevent following redirects
    });

    let response = await fetch(modifiedRequest);

    // Support for redirected response
    if ([301, 302].includes(response.status)) {
      const redirectedUrl = response.headers.get("location");
      if (redirectedUrl) {
        const newModifiedRequest = new Request(`${baseUrl}/${redirectedUrl}`, {
          method: request.method,
          headers: modifiedHeaders,
          body: request.body,
          redirect: "manual", // Prevent following redirects
        });
        return handleRequest(newModifiedRequest);
      }
    }

    let newResponseHeaders = new Headers(response.headers);
    newResponseHeaders.set("Access-Control-Allow-Origin", "*");
    newResponseHeaders.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE"
    );
    newResponseHeaders.set("Access-Control-Allow-Headers", "Content-Type");

    let newResponse = new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newResponseHeaders,
    });
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: newResponseHeaders,
      });
    }
    return newResponse;
  } else {
    let htmlResponse = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>CORS Proxy</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet"><link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" rel="stylesheet"><link rel="icon" href="https://developers.cloudflare.com/favicon.png"><script src="https://cdn.tailwindcss.com"></script><style>:root {color-scheme: dark;font-family: "JetBrains Mono";}</style></head><body class="flex flex-col items-center justify-center p-4"><header class="w-full h-12 flex items-center px-4 max-w-screen-2xl"><a href="#" class="flex items-center gap-2"><img src="https://developers.cloudflare.com/favicon.png" alt="Logo"><p class="font-bold uppercase">Cloudflare CORS Proxy</p></a><a href="https://github.com/Lahnshen/Cloudflare-CORS-Proxy.git" class="ml-auto"><i class="fa-brands fa-github"></i></a></header><main class="flex flex-col items-center gap-4 max-w-screen-2xl w-full"><div class="bg-green-300 p-4 rounded w-full text-zinc-900 font-bold border border-green-500 uppercase">The Cloudflare CORS Proxy is now up and running.</div><section class="w-full flex flex-col gap-2"><p class="font-medium uppercase text-xs">How to use?</p><p class="text-zinc-400 text-[0.65rem]">Simply append your API endpoint URL after the Cloudflare worker URL and you're good to go.</p><p class="px-6 py-4 rounded bg-zinc-800 text-xs">${baseUrl}/{YourAPIEndpoint}</p></section><section class="w-full flex flex-col gap-2"><p class="font-medium uppercase text-xs">Example Usage</p><p class="px-6 py-4 rounded bg-zinc-800 text-xs">${baseUrl}/https://api.mangadex.org/manga?limit=1</p></section><section class="w-full flex flex-col gap-2"><p class="font-medium uppercase text-xs">Usage with custom referer</p><p class="text-zinc-400 text-[0.65rem]">Some API Endpoints might require a specific referer header. You can set the custom referer using this search parameter, it'll later be automatically removed from the proxied request.</p><p class="px-6 py-4 rounded bg-zinc-800 text-xs">${baseUrl}/https://api.mangadex.org/manga?limit=1<i class="text-red-400 not-italic"><i class="not-italic font-bold">&customReferer</i>=http://example.com</i></p></section></main></body></html>`

    let defaultResponse = new Response(htmlResponse, {
      status: 200,
      statusText: "OK",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    });
    return defaultResponse;
  }

}
