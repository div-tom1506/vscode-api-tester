# VS Code API Tester Extension

A lightweight API Testing tool inside VS Code, designed as a minimal alternative to Postman. Quickly test REST APIs without leaving your coding environment.

## Features

- [x] Send API Requests – Supports GET, POST, PUT, and DELETE requests.
- [x] Simple UI – Input API URL, select method, and view responses instantly.
- [x] Live Response Display – Fetch and format JSON responses.
- [x] Support for Headers & Body – Send custom headers and request body.
- [x] Authentication Support – Supports Bearer Token & Basic Auth.
- [x] VS Code Integration – Runs in a Webview Panel for seamless testing.
- [x] Lightweight & Fast – No need for external apps like Postman or Insomnia.

## Installation

Clone the repository:
``` bash
git clone https://github.com/your-repo/vscode-api-tester.git
cd vscode-api-tester
```
Open the project in VS Code:
```
code .
```
Install dependencies (if any) and compile:
```
npm install
npm run compile
```
Run the extension in Development Mode:
Open the Debug Panel (Ctrl + Shift + D)
Select "Run Extension" and press F5
A new VS Code Extension Development Host window will open.

## How to Use

Open the Command Palette (`Ctrl + Shift + P`).

Search for **"api tester"** and select it.

Enter an API URL, select method (GET, POST, PUT, or DELETE), and click Send.

Add optional Headers and Body if required.

Use Authentication options (Bearer Token / Basic Auth) when needed.

View the response JSON inside the panel.

## Contributing

If you want to improve this extension:

Fork the repository

Create a new branch for your feature or fix

Submit a pull request with your changes

## License

This project is licensed under the MIT License.

## Enjoying the extension?

If you find this useful, feel free to star ⭐ the repository and contribute!
