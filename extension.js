const vscode = require("vscode");

function activate(context) {
  let disposable = vscode.commands.registerCommand("apiTester.open", function () {
    const panel = vscode.window.createWebviewPanel(
      "apiTester",
      "API Tester",
      vscode.ViewColumn.One,
      { enableScripts: true }
    );

    panel.webview.html = getWebviewContent();
  });

  context.subscriptions.push(disposable);
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
        input, select, textarea, button { width: 100%; margin: 10px 0; padding: 10px; border-radius: 5px; border: none; font-size: 14px; }
        input, select, textarea { background-color: #333; color: #ddd; }
        button { background-color: #007acc; color: white; cursor: pointer; }
        button:hover { background-color: #005f99; }
        pre { background: #222; padding: 10px; border-radius: 5px; white-space: pre-wrap; word-wrap: break-word; font-size: 16px; }
        code { font-size: 16px; }
        .json-container { background: #222; padding: 10px; border-radius: 5px; font-size: 16px; white-space: pre-wrap; word-wrap: break-word; }
        .key { color: #f08d49; }  /* Orange color for keys */
        .string { color: #8bc34a; }  /* Green for strings */
        .number { color: #ffeb3b; }  /* Yellow for numbers */
        .boolean { color: #03a9f4; }  /* Blue for booleans */
        .null { color: #ff5722; }  /* Red for null values */
        .container { max-width: 600px; margin: auto; }
      </style>
      <script>
        async function sendRequest() {
          const url = document.getElementById("url").value;
          const method = document.getElementById("method").value;
          const headersInput = document.getElementById("headers").value;
          const bodyInput = document.getElementById("body").value;
          const token = document.getElementById("bearerToken").value;
          const username = document.getElementById("username").value;
          const password = document.getElementById("password").value;
          const responseContainer = document.getElementById("response");

          if (!url.trim()) {
            responseContainer.innerHTML = "<span style='color: red;'>❌ Please enter a valid API URL.</span>";
            return;
          }

          let headers = {};
          if (headersInput) {
            try {
              headers = JSON.parse(headersInput);
            } catch (error) {
              responseContainer.innerHTML = "<span style='color: red;'>❌ Invalid JSON in headers.</span>";
              return;
            }
          }

          // Authentication Handling
          if (token) {
            headers["Authorization"] = "Bearer " + token;
          } else if (username && password) {
            headers["Authorization"] = "Basic " + btoa(username + ":" + password);
          }

          let options = { method, headers };

          if (method !== "GET" && method !== "DELETE" && bodyInput) {
            try {
              options.body = JSON.stringify(JSON.parse(bodyInput));
              headers["Content-Type"] = "application/json";
            } catch (error) {
              responseContainer.innerHTML = "<span style='color: red;'>❌ Invalid JSON in request body.</span>";
              return;
            }
          }

          try {
            const response = await fetch(url, options);
            const data = await response.json();
            responseContainer.innerHTML = "<h3>✅ Response:</h3><pre>" + syntaxHighlight(JSON.stringify(data, null, 2)) + "</pre>";
          } catch (error) {
            responseContainer.innerHTML = "<span style='color: red;'>❌ Error: " + error.message + "</span>";
          }
        }

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
    </head>
    <body>
      <div class="container">
        <h2>🚀 API Tester</h2>
        <input type="text" id="url" placeholder="Enter API URL" />
        <select id="method">
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
        <textarea id="headers" placeholder='Headers (JSON format)'></textarea>
        <textarea id="body" placeholder='Request Body (JSON format)'></textarea>
        <input type="text" id="bearerToken" placeholder="Bearer Token (optional)" />
        <input type="text" id="username" placeholder="Username (for Basic Auth)" />
        <input type="password" id="password" placeholder="Password (for Basic Auth)" />
        <button onclick="sendRequest()">🚀 Send Request</button>
        <div id="response" class="json-container"></div>
      </div>
    </body>
    </html>
  `;
}

exports.activate = activate;
function deactivate() {}
exports.deactivate = deactivate;
