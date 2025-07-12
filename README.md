[English](README.md) | [简体中文](README.zh-CN.md)

# Cloudflare Worker Shortlink Service

A simple, fast, and self-contained shortlink service running on Cloudflare Workers. Features a clean UI and a straightforward API.

This project is a modification of the original work by [kiko923/MyUrls-Workers](https://github.com/kiko923/MyUrls-Workers).

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/deploy?repo=https://github.com/zivan80/shortlink)

## Setup

1.  **Clone the repository.**
2.  **Create a KV Namespace**: Run the following command and note the output `id`.
    ```bash
    npx wrangler kv:namespace create LINKS
    ```
3.  **Configure `wrangler.toml`**: Open `wrangler.toml` and replace `your-kv-namespace-id` with the actual ID you obtained in the previous step.
4.  **Deploy**:
    ```bash
    npx wrangler deploy
    ```

## API Usage

The API endpoint for creating shortlinks is `/short`.

### Parameters

-   `longUrl`: (Required) The original URL to shorten. **Must be Base64 encoded.**
-   `shortKey`: (Optional) A custom key for the shortlink.

### Example using `curl`

#### 1. Create a shortlink with a random key

First, Base64 encode your long URL. For example, `https://www.cloudflare.com` becomes `aHR0cHM6Ly93d3cuY2xvdWRmbGFyZS5jb20=`.

```bash
curl --request POST \
  --url 'https://your-worker-url.com/short' \
  --form 'longUrl=aHR0cHM6Ly93d3cuY2xvdWRmbGFyZS5jb20='
```

**Success Response:**
```json
{
  "Code": 200,
  "ShortUrl": "https://your-worker-url.com/Jg7x2a"
}
```

#### 2. Create a shortlink with a custom key

```bash
curl --request POST \
  --url 'https://your-worker-url.com/short' \
  --form 'longUrl=aHR0cHM6Ly93d3cuY2xvdWRmbGFyZS5jb20=' \
  --form 'shortKey=cf-home'
```

**Success Response:**
```json
{
  "Code": 200,
  "ShortUrl": "https://your-worker-url.com/cf-home"
}
```

**Error Response (if key exists):**
```json
{
  "Code": 409,
  "Message": "Short key already exists."
}
```

## License

This project is licensed under the [MIT License](LICENSE).
