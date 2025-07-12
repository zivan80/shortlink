// 全局 CORS 头部，避免重复定义
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // 允许任意来源
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', // 允许的方法
  'Access-Control-Allow-Headers': 'Content-Type', // 允许的头部
  'Content-Type': 'application/json' // 默认响应类型
};

// 集成的 GUI 页面
const guiPage = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Shortlink</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        body {
            font-family: 'Inter', sans-serif;
            background-color: #f4f4f9;
            color: #333;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        .container {
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 500px;
            text-align: center;
        }
        h1 {
            color: #1a1a1a;
            margin-bottom: 30px;
        }
        .input-group {
            margin-bottom: 20px;
            text-align: left;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 500;
            color: #555;
        }
        input[type="url"], input[type="text"] {
            width: 100%;
            padding: 12px;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-sizing: border-box;
            transition: border-color 0.3s;
        }
        input[type="url"]:focus, input[type="text"]:focus {
            outline: none;
            border-color: #007bff;
        }
        button {
            width: 100%;
            padding: 14px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            font-weight: 600;
            transition: background-color 0.3s;
        }
        button:hover {
            background-color: #0056b3;
        }
        button:disabled {
            background-color: #a0c8f0;
            cursor: not-allowed;
        }
        .result {
            margin-top: 30px;
            padding: 15px;
            background-color: #e9f5ff;
            border: 1px solid #b3d7ff;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            word-break: break-all;
        }
        .result-text {
            font-weight: 500;
        }
        .copy-btn {
            background: none;
            border: none;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            color: #007bff;
            padding: 5px 10px;
        }
        .copy-btn:hover {
            text-decoration: underline;
        }
        .hidden {
            display: none;
        }
        .error-message {
            color: #d93025;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Create a Shortlink</h1>
        <form id="shorten-form">
            <div class="input-group">
                <label for="longUrl">Long URL</label>
                <input type="url" id="longUrl" name="longUrl" placeholder="https://example.com/my-very-long-url" required>
            </div>
            <div class="input-group">
                <label for="shortKey">Custom Key (Optional)</label>
                <input type="text" id="shortKey" name="shortKey" placeholder="my-custom-key">
            </div>
            <button type="submit" id="submit-btn">Shorten</button>
        </form>
        <div id="result-container" class="hidden">
            <div class="result">
                <span id="result-text" class="result-text"></span>
                <button id="copy-btn" class="copy-btn">Copy</button>
            </div>
        </div>
        <div id="error-container" class="hidden">
            <p id="error-message" class="error-message"></p>
        </div>
    </div>

    <script>
        const form = document.getElementById('shorten-form');
        const submitBtn = document.getElementById('submit-btn');
        const resultContainer = document.getElementById('result-container');
        const resultText = document.getElementById('result-text');
        const copyBtn = document.getElementById('copy-btn');
        const errorContainer = document.getElementById('error-container');
        const errorMessage = document.getElementById('error-message');

        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            submitBtn.disabled = true;
            submitBtn.textContent = 'Shortening...';
            resultContainer.classList.add('hidden');
            errorContainer.classList.add('hidden');

            const longUrl = document.getElementById('longUrl').value;
            const shortKey = document.getElementById('shortKey').value;

            try {
                const formData = new FormData();
                // Base64 encode the long URL
                formData.append('longUrl', btoa(longUrl));
                if (shortKey) {
                    formData.append('shortKey', shortKey);
                }

                const response = await fetch('/short', {
                    method: 'POST',
                    body: new URLSearchParams(formData) // Use URLSearchParams to send as x-www-form-urlencoded
                });

                const data = await response.json();

                if (response.ok) {
                    resultText.textContent = data.ShortUrl;
                    resultContainer.classList.remove('hidden');
                } else {
                    throw new Error(data.Message || 'An unknown error occurred.');
                }
            } catch (error) {
                errorMessage.textContent = 'Error: ' + error.message;
                errorContainer.classList.remove('hidden');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Shorten';
            }
        });

        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(resultText.textContent).then(() => {
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = 'Copy';
                }, 2000);
            });
        });
    </script>
</body>
</html>`;

// 生成随机后缀
function generateRandomSuffix(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// API 请求处理（创建短链接）
async function handleApiRequest(request) {
  const url = new URL(request.url);
  let targetUrl, customSuffix;

  // 根据请求方法获取参数
  if (request.method === 'GET') {
    targetUrl = url.searchParams.get('longUrl');
    customSuffix = url.searchParams.get('shortKey');
  } else if (request.method === 'POST') {
    try {
      const formData = await request.formData();
      targetUrl = formData.get('longUrl');
      customSuffix = formData.get('shortKey');
    } catch (e) {
      return new Response(JSON.stringify({ Code: 400, Message: 'Invalid form data.' }), { status: 400, headers: corsHeaders });
    }
  }

  // 验证 longUrl
  if (!targetUrl) {
    return new Response(JSON.stringify({ Code: 400, Message: 'Missing longUrl parameter.' }), { status: 400, headers: corsHeaders });
  }

  // Base64 解码
  try {
    targetUrl = atob(targetUrl);
    // 简单的 URL 格式验证
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        throw new Error('Invalid URL format');
    }
  } catch (error) {
    return new Response(JSON.stringify({ Code: 400, Message: 'Invalid or improperly encoded longUrl.' }), { status: 400, headers: corsHeaders });
  }

  const suffix = customSuffix || generateRandomSuffix(6);

  // 检查自定义后缀是否已存在
  if (customSuffix) {
    const existingUrl = await LINKS.get(suffix);
    if (existingUrl) {
      return new Response(JSON.stringify({ Code: 409, Message: 'Short key already exists.' }), { status: 409, headers: corsHeaders });
    }
  }

  // 存储并返回结果
  await LINKS.put(suffix, targetUrl);
  const workerDomain = request.headers.get('host');
  const scheme = new URL(request.url).protocol;
  const shortLink = `${scheme}//${workerDomain}/${suffix}`;

  return new Response(JSON.stringify({ Code: 200, ShortUrl: shortLink }), { status: 200, headers: corsHeaders });
}

// 重定向处理
async function handleRedirect(request) {
  const url = new URL(request.url);
  const suffix = url.pathname.substring(1); // 移除开头的 '/'

  if (!suffix) {
    // 如果路径是'/'，则显示 GUI 页面
    return new Response(guiPage, {
      headers: {
        'Content-Type': 'text/html;charset=UTF-8'
      }
    });
  }

  const targetUrl = await LINKS.get(suffix);

  if (targetUrl) {
    // 使用 302 临时重定向，以便未来进行点击统计
    return Response.redirect(targetUrl, 302);
  } else {
    // 如果找不到短链接，可以返回一个更友好的 404 页面或消息
    return new Response('Short link not found.', { status: 404 });
  }
}

// 主事件监听器
addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // 预检请求处理
  if (request.method === 'OPTIONS') {
    return event.respondWith(new Response(null, { headers: corsHeaders }));
  }

  // 检查 KV 是否绑定
  if (typeof LINKS === 'undefined' || !LINKS) {
    const errResponse = {
      Code: 500,
      Message: 'KV namespace "LINKS" is not bound. Please configure it in your Worker settings.'
    };
    return event.respondWith(new Response(JSON.stringify(errResponse), { status: 500, headers: corsHeaders }));
  }

  // 路由分发
  if (url.pathname === '/short') {
    // API 请求，用于创建短链接
    event.respondWith(handleApiRequest(request));
  } else {
    // 其他所有路径都视为短链接进行重定向
    event.respondWith(handleRedirect(request));
  }
});
