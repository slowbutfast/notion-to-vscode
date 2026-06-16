# Notion to VS Code Project Launcher

> **Platform Compatibility**:  **macOS Only**
> 
> This tool leverages macOS-specific protocols (`open`) and background service daemons (`launchd`) to automatically launch local workspaces.

A lightweight, background Node.js daemon that connects to Notion via the official Notion API. When a checkbox or button is toggled next to a project entry on your Notion dashboard, this app instantly opens the corresponding local folder or workspace in VS Code.

This enables you to use Notion as your centralized project dashboard, launching your local development environments with a single click.

---

## How it Works

1. **Notion Database**: You maintain a database of projects in Notion. Each entry has:
   - A `Path` text property (e.g. `/Users/username/projects/my-app`).
   - A `Launch` checkbox property.
2. **Background Daemon**: A local Node.js process polls the database every 1.5 seconds.
3. **OS Trigger**: When `Launch` is checked, the daemon runs the macOS system command to trigger the `vscode://file/[Path]` protocol handler, opening the project in VS Code.
4. **Auto-Reset**: The daemon immediately updates Notion to uncheck `Launch`, resetting the trigger for next time.

---

## Installation & Setup

### 1. Create a Notion Connection
1. Go to [notion.so/my-integrations](https://www.notion.so/my-integrations) and click **+ New integration**.
2. Name it (e.g., `VS Code Launcher`), select the appropriate workspace, and click **Submit**.
3. Under the **Secrets** tab, copy the **Internal Integration Token** (starts with `secret_`).

### 2. Configure Your Notion Database
1. Open your projects database in Notion (or create a new one).
2. Ensure the database contains these properties:
   - **`Path`** (Text property): The absolute local folder path to open (e.g., `/Users/gregorylazatin/projects/my-app`).
   - **`Launch`** (Checkbox property).
3. Connect the integration to your database:
   - Open the database as a page.
   - Click the **three-dot menu (`...`)** in the top-right corner.
   - Go to **Connections** -> **Add connection**.
   - Search for your integration (`VS Code Launcher`) and add it.
4. *(Optional)* Add a **Button** property named `Open` in your database. Configure it to: **Edit page** -> Set `Launch` to **Checked**. (This lets you open projects with a single button click).

### 3. Get the Database ID
Open the database in Notion as a full page and look at the URL:
`https://www.notion.so/<long_hash_1>?v=<long_hash_2>`

- **`<long_hash_1>`** (the 32-character string before the `?`) is your **Database ID**. (Copy this one!).
- **`<long_hash_2>`** (after the `?v=`) is the **View ID**. (Do NOT use this one!).

### 4. Local Configuration
1. Clone this repository to your Mac.
2. Copy `.env.example` to create your local `.env` configuration file:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in:
   - `NOTION_TOKEN`: Paste your Integration Token.
   - `NOTION_DATABASE_ID`: Paste your Database ID.
    - *(Optional)* Configure additional variables if your setup differs:
      - `NOTION_PROPERTY_PATH`: Name of the text property in Notion (defaults to `Path`).
      - `NOTION_PROPERTY_LAUNCH`: Name of the checkbox property in Notion (defaults to `Launch`).
      - `VSCODE_EDITION`: Set to `stable` (default) or `insiders` depending on your editor version.
      - `VSCODE_FORCE_NEW_WINDOW`: Set to `true` (default) to force folders to open in a new window, or `false` to reuse the active window.

### 5. Running the App (Manual Mode)
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the daemon:
   ```bash
   npm start
   ```

---

## Running Automatically in the Background (macOS launchd)

You can configure the launcher to run silently in the background as a macOS **LaunchAgent** that starts automatically whenever you log into your Mac:

### 1. Identify Your Node Path
Find the absolute path to your Node.js executable:
```bash
which node
```
*(For example: `/usr/local/bin/node` or `~/.nvm/versions/node/...`)*

### 2. Configure the PLIST file
Open `notion-to-vscode-launcher.plist` and update the arguments to match your environment:
1. Replace `/Users/gregorylazatin/.nvm/versions/node/v22.21.1/bin/node` with your absolute Node path from step 1.
2. Replace `/Users/gregorylazatin/Documents/Dev/projects/notion-to-vscode` in both the script path and `<key>WorkingDirectory</key>` with your repository's local path.

### 3. Register the Background Agent
1. Copy the plist configuration to your user LaunchAgents folder:
   ```bash
   cp notion-to-vscode-launcher.plist ~/Library/LaunchAgents/
   ```
2. Load and start the background service:
   ```bash
   launchctl load ~/Library/LaunchAgents/notion-to-vscode-launcher.plist
   ```

To stop or uninstall the background service:
```bash
launchctl unload ~/Library/LaunchAgents/notion-to-vscode-launcher.plist
rm ~/Library/LaunchAgents/notion-to-vscode-launcher.plist
```

*Note: Logs will be automatically generated inside `out.log` and `err.log` in your project folder.*

---

## Repository Structure
* `notion-vscode-launcher` — The main Node.js polling and system execution code.
* `package.json` — Package metadata and dependencies (`@notionhq/client`, `dotenv`).
* `notion-to-vscode-launcher.plist` — LaunchAgent configuration for background automation on macOS.
* `manifest.json`, `content.js`, `styles.css` — Standard Chrome Extension assets, in case you prefer browser-based parsing instead of the companion daemon.
