### ☁ CloudFlare CORS Proxy
This is a CORS proxy build using CloudFlare Workers.
### 🔍 How to use?
Simply append your API endpoint URL after the Cloudflare worker URL and you're good to go.
```
https://yourproxy.username.workers.dev/{YourAPIEndpoint}
```
### 🍣 Example Usage
```
https://yourproxy.username.workers.dev/https://api.mangadex.org/manga?limit=1
```
### 🍙 Example Usage with custom referer
Some API Endpoints might require a specific referer header. You can set the custom referer using this search parameter, it'll later be automatically removed from the proxied request.
```
https://yourproxy.username.workers.dev/https://api.mangadex.org/manga?limit=1&customReferer=http://example.com
```
