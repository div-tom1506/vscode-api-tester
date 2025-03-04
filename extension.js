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
      timeout: 15000, // 15 seconds timeout
    };

    const response = await axios(axiosOptions);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.message };
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
        body { font-family: Arial, sans-serif; margin: 20px; background-color: #1e1e1e; color: #ddd; }
        .container {
          max-width: 600px;
          margin: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
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
        }
        button {
          background-color: #007acc;
          color: white;
          cursor: pointer;
        }
        button:hover {
          background-color: #005f99;
        }
        .json-container {
          background: #222;
          padding: 10px;
          border-radius: 5px;
          font-size: 16px;
          white-space: pre-wrap;
          word-wrap: break-word;
        }
        .key { color: #f08d49; }  /* Orange color for keys */
        .string { color: #8bc34a; }  /* Green for strings */
        .number { color: #ffeb3b; }  /* Yellow for numbers */
        .boolean { color: #03a9f4; }  /* Blue for booleans */
        .null { color: #ff5722; }  /* Red for null values */
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

        function sendRequest() {
          const requestData = {
            url: document.getElementById("url").value,
            method: document.getElementById("method").value,
            headers: document.getElementById("headers").value,
            body: document.getElementById("body").value,
            token: document.getElementById("bearerToken").value,
            username: document.getElementById("username").value,
            password: document.getElementById("password").value
          };

          vscode.postMessage({ command: "sendRequest", data: requestData });
        }

        window.addEventListener("message", (event) => {
          const message = event.data;
          if (message.command === "response") {
            document.getElementById("response").innerHTML = message.response.success
              ? "<h3>✅ Response:</h3><pre>" + syntaxHighlight(JSON.stringify(message.response.data, null, 2)) + "</pre>"
              : "<span style='color: red;'>❌ Error: " + message.response.error + "</span>";
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
