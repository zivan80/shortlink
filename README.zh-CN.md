[English](README.md) | [简体中文](README.zh-CN.md)

# Cloudflare Worker 短链接服务

一个运行在 Cloudflare Workers 上的简单、快速且完全自包含的短链接服务。拥有简洁的用户界面和直观的 API。

本项目修改自 [kiko923/MyUrls-Workers](https://github.com/kiko923/MyUrls-Workers) 的初始项目。

[![一键部署至 Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/deploy?repo=https://github.com/zivan80/shortlink)

## 安装与设置

1.  **克隆仓库。**
2.  **创建 KV 命名空间**: 运行以下命令并记下输出的 `id`。
    ```bash
    npx wrangler kv namespace create LINKS
    ```
3.  **配置 `wrangler.toml`**: 打开 `wrangler.toml` 文件，将 `your-kv-namespace-id` 替换为您在上一步中获得的真实 ID。
4.  **部署**:
    ```bash
    npx wrangler deploy
    ```

## API 使用方法

用于创建短链接的 API 端点是 `/short`。

### 请求参数

-   `longUrl`: (必需) 需要缩短的原始链接。**必须经过 Base64 编码**。
-   `shortKey`: (可选) 自定义短链接的后缀。

### `curl` 调用示例

#### 1. 创建一个随机后缀的短链接

首先，对您的长链接进行 Base64 编码。例如, `https://www.cloudflare.com` 编码后是 `aHR0cHM6Ly93d3cuY2xvdWRmbGFyZS5jb20=`。

```bash
curl --request POST \
  --url 'https://your-worker-url.com/short' \
  --form 'longUrl=aHR0cHM6Ly93d3cuY2xvdWRmbGFyZS5jb20='
```

**成功响应:**
```json
{
  "Code": 200,
  "ShortUrl": "https://your-worker-url.com/Jg7x2a"
}
```

#### 2. 创建一个自定义后缀的短链接

```bash
curl --request POST \
  --url 'https://your-worker-url.com/short' \
  --form 'longUrl=aHR0cHM6Ly93d3cuY2xvdWRmbGFyZS5jb20=' \
  --form 'shortKey=cf-home'
```

**成功响应:**
```json
{
  "Code": 200,
  "ShortUrl": "https://your-worker-url.com/cf-home"
}
```

**错误响应 (如果后缀已存在):**
```json
{
  "Code": 409,
  "Message": "Short key already exists."
}
```

## 许可证

本项目采用 [MIT 许可证](LICENSE)。
