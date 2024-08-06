<h1 align="center">
  <br>Slate<br>
</h1>
<p align="center">
  A Discord.js Bot Startup Codebase
</p>

<h4 align="center">
  The best way to start your new Discord.js bot.
</h4>

<p align="center">
  <a href="https://img.shields.io/github/contributors/isahooman/Slate" >
    <img src="https://img.shields.io/github/contributors/isahooman/Slate" alt = "Contributors"/>
  </a>
  <a href="https://github.com/isahooman/Slate/pulse">
    <img src="https://img.shields.io/github/commit-activity/m/isahooman/slate" alt = "Activity" />
  </a>
  <a href="https://img.shields.io/github/issues/isahooman/Slate" >
    <img src="https://img.shields.io/github/issues/isahooman/Slate" alt="Issues"/>
  </a>
  <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/version/isahooman/slate">
</p>
<br>
<h2 align="center">Table of Contents</h2>

- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Installation Guide](#installation-guide)
    - [Linux](#linux-command-line-installation)
    - [Windows 10](#windows-10-gui--command-line)

## Key Features

- Easily configurable
  - Easily change your prefix, bot owners, or developer guild
  - Select which Discord intents your bot should start with
  - Select which Discord events should load
  - Blacklist users and servers
    - Choose to ignore or leave blacklisted servers
  - Choose which commands should be loaded
  - Determine active logging levels
  - Easily Customizable bot presence
- Comprehensive Logging and Debugging
- Support for all Discord.js Events
- Flexible commands
  - Supports slash and prefix commands
  - choose if commands are usable in DMs
  - optional NSFW properties
  - Custom aliases
  - Customizable cooldowns
    - Per user
    - Per server
    - Global

<br><br>

### Commands

- Owner<br>
  - <span style="color:lightgreen;">BotClear</span> - Mass deletes bot commands used in the current channel.<br>
  - <span style="color:lightgreen;">CommandToggle</span> - Toggles the given command.<br>
  - <span style="color:lightgreen;">Deploy</span> - Deploys global and guild slash commands.<br>
  - <span style="color:lightgreen;">Eval</span> - Evaluates given code.<br>
  - <span style="color:lightgreen;">EventToggle</span> - Toggles the given Discord.js event.<br>
  - <span style="color:lightgreen;">Fail</span> - Tests a given error.<br>
  - <span style="color:lightgreen;">Logs</span> - Retrieves the latest bot logs.<br>
  - <span style="color:lightgreen;">LogTest</span> - Tests each logger level.<br>
  - <span style="color:lightgreen;">LogToggle</span> - Toggles logging for the specified level.<br>
  - <span style="color:lightgreen;">Raw</span> - Relays the raw data of the replied message.<br>
  - <span style="color:lightgreen;">Reload</span> - Reloads a either a given command or all commands.<br>
  - <span style="color:lightgreen;">Shutdown</span> - Shuts the bot down gracefully.<br>
  - <span style="color:lightgreen;">Test</span> - Test slash command with subcommands and options.<br>
  - <span style="color:lightgreen;">Prefix</span> - Change the bot's prefix as needed.<br>
- Miscellaneous<br>
  - <span style="color:lightgreen;">Ping</span> - Shows the bot uptime as well as the bots connection to Discord.<br>
- Info<br>
  - <span style="color:lightgreen;">About</span> - Shows information about the bot.<br>
- Utility
  - <span style="color:lightgreen;">Temperature</span> - Convert the provided temperature.<br>
  - <span style="color:lightgreen;">Avatar</span> - Fetch the provided user's avatar.<br>
  - <span style="color:lightgreen;">Banner</span> - Fetch the provided user's banner.<br>
  - <span style="color:lightgreen;">Enlarge</span> - Enlarge the provided emoji.<<br>
  - <span style="color:lightgreen;">Math</span> - Solve the provided math equation.<br>
- Fun
  - <span style="color:lightgreen;">CoinFlip</span> - Flip a Coin!<br>
  - <span style="color:lightgreen;">Number</span> - Generate a random number within a given range.

<br><br>

# Getting Started

## Installation Guide

Slate can be installed by using the following instructions.
<br><br>

### Linux Command Line Installation

1. **Update package lists:**

- Debian/Ubuntu: `sudo apt update && sudo apt upgrade`
- Fedora/CentOS: `sudo dnf upgrade`
- Arch Linux: `sudo pacman -Syu`
- openSUSE: `sudo zypper dup`

2. **Installing prerequisites:**

- Debian/Ubuntu: `sudo apt install git nodejs npm`
- Fedora/CentOS: `sudo dnf install git nodejs`
- Arch Linux: `sudo pacman -S git nodejs npm`
- openSUSE: `sudo zypper install git nodejs npm`

3. **Clone the GitHub repository**
```bash
git clone https://github.com/isahooman/Slate.git .
cd Slate
```

4. **Configuring Slate**

Next you'll need to setup [config.json5](./config/config.json5) as well as the optional extra config files.

```bash
sudo nano ./config/config.json5
```

You can follow the [configuration example](./config/README.md#configjson) here if needed.

5. **You're now ready to run slate**

```bash
npm run start
```

<br><br>

### Windows 10 GUI + Command Line

1. **Install node from the one of the following methods**

- [Node v20.11.0 Direct Install Link](https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi)
- [Node Website](https://nodejs.org/en)

```bash
winget install OpenJS.NodeJS
```

2. **Download the zip file of the [Slate Repository](https://github.com/isahooman/Slate/archive/refs/heads/main.zip)**

```bash
# Get the zip file of Slate
curl -uri "https://github.com/isahooman/Slate/archive/main.zip" -Method "GET" -Outfile "Slate.zip"
```

3. **Extract the zip file to a file location of your choice**

```bash
# Unzips the zip file to your directory
tar -xvf Slate.zip
```

4. **Configuring Slate**

Next you'll need to configure your bot in [config.json5](./config/config.json5) as well as the optional extra config files.

```sh
# Opens the config file within the notepad text editor
notepad ./config/config.json5
```

You can follow the [configuration example](./config/README.md#configjson) here if needed.<br>

5. **You're now ready to run your bot!**

```bash
# Installs the npm prerequisites and starts the bot
npm run start
```

<br><br>

#### Darwin/Mac 10 GUI + Command Line

1. Install node from the one of the following links

- [Node v20.11.0 Direct Install Link](https://nodejs.org/dist/v20.11.0/node-v20.11.0.pkg)
- [Node Website](https://nodejs.org/en)

```bash
brew install node
```

2. Download the zip file of the [Slate Repository](https://github.com/isahooman/Slate/archive/refs/heads/main.zip)

```bash
# Get the zip file of Slate
curl -L -O https://github.com/isahooman/Slate/archive/main.zip
```

3. Extract the zip file to a file location of your choice

```bash
# Unzips the zip file to your directory
tar -xvf Slate-main.zip
```

4. **Configuring Slate**

Next you'll need to configure your bot in [config.json5](./config/config.json5) as well as the optional extra config files.

```sh
# Opens the config file within the notepad text editor
nano ./config/config.json5
```

You can follow the [configuration example](./config/README.md#configjson) here if needed.<br>

5. You're now ready to run your bot using the start.sh file!

```bash
# Installs the npm prerequisites
npm start
```

<br><br><br>

## Contributing

Contributions are always welcome! Please read our [contribution guidelines](.github/CONTRIBUTING.md) before contributing.

## Credits

- Electron
- NodeJS
