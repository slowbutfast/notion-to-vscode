# Notion to VS Code Launcher

A lightweight Node.js companion application that polls a Notion database via the official Notion API. When a trigger checkbox/button is toggled on a project page, the app automatically launches that project/workspace folder in VS Code.

This enables you to use Notion as your central dashboard, opening local projects on your computer with a single click.

---

## How it Works

1. **Notion Database**: You list your projects in a Notion database. Each project page has:
   - A `Path` text property containing the absolute local folder path.
   - A `Launch` checkbox property.
2. **Background Daemon**: This Node.js app polls the database every 1.5 seconds.
3. **OS Protocol Trigger**: When `Launch` is checked, the app runs the OS command to open `vscode://file/[Path]`, launching the editor to the workspace.
4. **Checkbox Reset**: The app unchecks the Notion `Launch` checkbox so it doesn't trigger repeatedly.

---

## Setup Instructions

### 1. Create a Notion Connection
1. Visit [notion.so/my-integrations](https://www.notion.so/my-integrations) and click **+ New integration**.
2. Select your workspace, name it (e.g. `VS Code Launcher`), and click **Submit**.
3. Under the **Secrets** tab, copy the **Internal Integration Token** (starts with `secret_`).

### 2. Configure Your Database
1. Create a database in Notion.
2. Add the following properties:
   - `Path`: A **Text** property. Enter your project's absolute local path (e.g., `/Users/username/projects/my-project`).
   - `Launch`: A **Checkbox** property.
3. Open the database page, click the **three-dot menu (...)** in the top-right corner, select **Connections**, and add your integration (`VS Code Launcher`).
4. *(Optional)* Create a **Button** property in your database to edit the page and set `Launch` to Checked. This turns launching into a simple click!

### 3. Local Configuration
1. Clone or copy these files into your local directory.
2. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```
3. Open `.env` and fill in:
   - `NOTION_TOKEN`: Your integration token.
   - `NOTION_DATABASE_ID`: The 32-character ID of your database.
     > **How to find your Database ID**:
     > Open the database as a page (or copy the link to the database view). Look at the URL structure:
     >
     > `https://www.notion.so/<long_hash_1>?v=<long_hash_2>`
     >
     > - **`<long_hash_1>`** is the **Database ID** (Copy this one!).
     > - **`<long_hash_2>`** is the **View ID** (Do NOT copy this one!).
     > 
     > *Note: Make sure to add your integration as a Connection to this database by clicking `...` -> `Connections` -> search for your integration.*
   - *(Optional)* Custom property names if they differ from `Path` and `Launch`:
     ```env
     NOTION_PROPERTY_PATH=Path
     NOTION_PROPERTY_LAUNCH=Launch
     ```

### 4. Running the App
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the daemon:
   ```bash
   npm start
   ```

---

## Project Structure
* `app.js` — The main polling and launch logic.
* `package.json` — Dependency management.
* `com.greg.notion-to-vscode.plist` — Background daemon configuration for macOS.
* `manifest.json`, `content.js`, `styles.css` — Files for the Chrome Extension (Option 1) in case you prefer the browser-based parsing approach.

---

## Run Automatically in the Background (macOS)

Instead of manually running `npm start` in a terminal tab every time, you can register this app as a macOS **LaunchAgent**. It will run silently in the background and start automatically whenever you log into your Mac:

1. Copy the plist configuration to your system LaunchAgents directory:
   ```bash
   cp com.greg.notion-to-vscode.plist ~/Library/LaunchAgents/
   ```
2. Load and start the background agent:
   ```bash
   launchctl load ~/Library/LaunchAgents/com.greg.notion-to-vscode.plist
   ```

To stop or uninstall the background service:
```bash
launchctl unload ~/Library/LaunchAgents/com.greg.notion-to-vscode.plist
rm ~/Library/LaunchAgents/com.greg.notion-to-vscode.plist
```

*Note: Logs will be automatically outputted to `out.log` and `err.log` in your project folder.*
