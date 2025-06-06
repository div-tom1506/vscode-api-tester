const vscode = require("vscode");
const axios = require("axios");

function activate(context) {
  let disposable = vscode.commands.registerCommand("apiTester.open", function () {
    const panel = vscode.window.createWebviewPanel(
      "apiTester",
      "API Tester",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();

    panel.webview.onDidReceiveMessage(
      async (message) => {
        if (message.command === "sendRequest") {
          const response = await handleApiRequest(message.data);
          panel.webview.postMessage({ command: "response", response });
        }
      },
      undefined,
      context.subscriptions
    );
  });

  context.subscriptions.push(disposable);
}

async function handleApiRequest({ url, method, headers, body, token, username, password }) {
  try {
    let requestHeaders = headers ? JSON.parse(headers) : {};

    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    } else if (username && password) {
      requestHeaders["Authorization"] = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
    }

    const axiosOptions = {
      method,
      url,
      headers: requestHeaders,
      data: body ? JSON.parse(body) : undefined,
      timeout: 15000,
    };

    const response = await axios(axiosOptions);
    return { success: true, statusCode: response.status, data: response.data };
  } catch (error) {
    return {
      success: false,
      statusCode: error.response?.status || "Unknown",
      error: error.message,
      data: error.response?.data || null
    };
  }
}

function getWebviewContent() {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>API Tester</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 20px; 
          background-color: #1e1e1e; 
          color: #ddd; 
        }
        .container {
          max-width: 600px;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .form-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        label {
          width: 150px;
          text-align: right;
          font-weight: bold;
        }
        input, select, textarea, button {
          flex: 1;
          padding: 10px;
          border-radius: 5px;
          border: none;
          font-size: 14px;
          background-color: #333;
          color: #ddd;
          transition: box-shadow 0.3s ease-in-out, transform 0.2s;
        }
        input:focus, select:focus, textarea:focus {
          outline: none;
          box-shadow: 0 0 10px #00e5ff;
          transform: scale(1.02);
        }
        button {
          background-color: #007acc;
          color: white;
          cursor: pointer;
          box-shadow: 0 0 8px rgba(0, 122, 204, 0.8);
        }
        button:hover {
          background-color: #005f99;
          box-shadow: 0 0 15px rgba(0, 229, 255, 0.9);
          transform: scale(1.05);
        }
        .json-container {
          position: relative;
          background: #222;
          padding: 15px;
          border-radius: 5px;
          font-size: 16px;
          white-space: pre-wrap;
          word-wrap: break-word;
          transition: box-shadow 0.3s ease-in-out;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }
        .success { box-shadow: 0 0 15px rgba(0, 255, 0, 0.8); }
        .error { box-shadow: 0 0 20px rgba(255, 50, 50, 0.9); }
        .status-code {
          position: absolute;
          top: 5px;
          right: 10px;
          font-size: 12px;
          font-weight: bold;
          opacity: 0.8;
        }
        .status-success { color: #00ff00; }
        .status-error { color: #ff3333; }
        .key { color: #f08d49; }
        .string { color: #8bc34a; }
        .number { color: #ffeb3b; }
        .boolean { color: #03a9f4; }
        .null { color: #ff5722; }
        button + pre, pre + button { margin-top: 8px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>API Tester</h2>

        <div class="form-group">
          <label>API URL:</label>
          <input type="text" id="url" placeholder="Enter API URL" />
        </div>

        <div class="form-group">
          <label>Method:</label>
          <select id="method">
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="DELETE">DELETE</option>
          </select>
        </div>

        <div class="form-group">
          <label>Headers:</label>
          <textarea id="headers" placeholder='Headers (JSON format)'></textarea>
        </div>

        <div class="form-group">
          <label>Request Body:</label>
          <textarea id="body" placeholder='Request Body (JSON format)'></textarea>
        </div>

        <div class="form-group">
          <label>Bearer Token:</label>
          <input type="text" id="bearerToken" placeholder="Optional" />
        </div>

        <div class="form-group">
          <label>Username:</label>
          <input type="text" id="username" placeholder="For Basic Auth" />
        </div>

        <div class="form-group">
          <label>Password:</label>
          <input type="password" id="password" placeholder="For Basic Auth" />
        </div>

        <button onclick="sendRequest()">🚀 Send Request</button>

        <div id="response" class="json-container"></div>
      </div>

      <script>
        const vscode = acquireVsCodeApi();

        window.onload = () => {
          const previous = vscode.getState();
          if (previous) {
            document.getElementById("url").value = previous.url || "";
            document.getElementById("method").value = previous.method || "GET";
            document.getElementById("headers").value = previous.headers || "";
            document.getElementById("body").value = previous.body || "";
            document.getElementById("bearerToken").value = previous.token || "";
            document.getElementById("username").value = previous.username || "";
            document.getElementById("password").value = previous.password || "";
          }
        };

        function sendRequest() {
          const headersText = document.getElementById("headers").value;
          const bodyText = document.getElementById("body").value;

          try {
            if (headersText) JSON.parse(headersText);
            if (bodyText) JSON.parse(bodyText);
          } catch (err) {
            const container = document.getElementById("response");
            container.className = "json-container error";
            container.innerHTML = \`<pre>❌ JSON Parse Error: \${err.message}</pre>\`;
            return;
          }

          const requestData = {
            url: document.getElementById("url").value,
            method: document.getElementById("method").value,
            headers: headersText,
            body: bodyText,
            token: document.getElementById("bearerToken").value,
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
          };

          vscode.setState(requestData);
          vscode.postMessage({ command: "sendRequest", data: requestData });
        }

        window.addEventListener("message", (event) => {
          const message = event.data;
          if (message.command === "response") {
            const container = document.getElementById("response");
            container.className = \`json-container \${message.response.success ? "success" : "error"}\`;
            container.innerHTML = \`
              <div class="status-code \${message.response.success ? "status-success" : "status-error"}">
                HTTP \${message.response.statusCode}
              </div>
            \`;

            const pre = document.createElement("pre");
            const formatted = message.response.success
              ? JSON.stringify(message.response.data, null, 2)
              : JSON.stringify({ error: message.response.error, data: message.response.data }, null, 2);
            pre.innerHTML = syntaxHighlight(formatted);
            container.appendChild(pre);

            const copyBtn = document.createElement("button");
            copyBtn.textContent = "📋 Copy JSON";
            copyBtn.onclick = () => {
              navigator.clipboard.writeText(formatted);
              copyBtn.textContent = "✅ Copied!";
              setTimeout(() => (copyBtn.textContent = "📋 Copy JSON"), 1500);
            };
            container.appendChild(copyBtn);
          }
        });

        function syntaxHighlight(json) {
        json = json.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?=:)|\\b(true|false|null)\\b|-?\\d+(\\.\\d+)?(e[+-]?\\d+)?)/g, function (match) {
            let cls = "number";
            if (/^"/.test(match)) {
              if (/:$/.test(match)) {
                cls = "key";
              } else {
                cls = "string";
              }
            } else if (/true|false/.test(match)) {
              cls = "boolean";
            } else if (/null/.test(match)) {
              cls = "null";
            }
            return '<span class="' + cls + '">' + match + "</span>";
          });
                  }
      </script>
    </body>
    </html>
  `;
}

exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
