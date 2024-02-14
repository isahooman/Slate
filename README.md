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
  <img alt="GitHub package.json version" src="https://img.shields.io/github/package-json/v/isahooman/slate">
</p>

<h2 align="center">Table of Contents</h2>

- [Key Features](#key-features)
- [Getting Started](#getting-started)
  - [Installation Guide](#installation-guide)
    - [Linux Ubuntu](#ubuntu-linux-x64-command-line)
    - [Windows 10](#windows-10-gui--command-line)

## Key Features

- Easily configurable
  - Blacklist users and servers
    - Choose to ignore or leave blacklisted servers
    - Easily change your prefix, bot owners, or developer guild
    - Select which Discord events should load
    - Determine active logging levels
    - Customizable bot presence
- Commands
  - Owner Category
    - BotClear - Mass deletes bot command usage in a given channel
    - Data - Provides info about prefix commands
    - Debug - Enables debugging information
    - Deploy - Deploys global and guild slash commands
    - Fail - Tests a given error
    - Kill - Shuts the bot down gracefully
    - Logs - Retrieves the latest bot logs
    - LogTest - Tests each logger level
    - LogToggle - Toggles logging for the specified level
    - Raw - Relays the raw data of the replied message
    - Reload - Reloads a either a given command or all commands
    - Test - Test command with subcommand and options
  - Miscellaneous
    - Ping - Shows the bot uptime as well as the bots connection to Discord
- Comprehensive Logging and Debugging
- Support for all Discord.js Events
- Prefix and Slash commands
- Command Aliases
- Optional NSFW Properties

# Getting Started

## Installation Guide

Slate can be installed by using the following instructions.

### Linux Command Line Installation

1. **Update package lists:**

   - Debian/Ubuntu: `sudo apt upgrade`
   - Fedora/CentOS: `sudo dnf upgrade`
   - Arch Linux: `sudo pacman -Syu`
   - openSUSE: `sudo zypper dup`

2. **Installing prerequisites:**

   - Debian/Ubuntu: `sudo apt install git nodejs npm`
   - Fedora/CentOS: `sudo dnf install git nodejs npm`
   - Arch Linux: `sudo pacman -S git nodejs npm`
   - openSUSE: `sudo zypper install git nodejs npm`

3. **Clone the GitHub repository**
   ```bash
   git clone https://github.com/isahooman/Slate.git .
   cd Slate
   ```
4. **Configuring Slate**

   Next you'll need to setup your configuration files in the config folder.

   You can follow the [configuration examples here](./config/README.md) if needed.

5. **You're now ready to run slate**
   ```bash
   npm run start
   ```

#### Windows 10 GUI + Command Line

1. Install node from the one of the following methods

   - [Node v20.11.0 Direct Install Link](https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi)
   - [Node Website](https://nodejs.org/en)

```bash
winget install OpenJS.NodeJS
```

2. Download the zip file of the [Slate Repository](https://github.com/isahooman/Slate/archive/refs/heads/main.zip)

```bash
# Get the zip file of Slate
curl -uri "https://github.com/isahooman/Slate/archive/main.zip" -Method "GET" -Outfile "Slate.zip"
```

3. Extract the zip file to a file location of your choice

```bash
# Unzips the zip file to your directory
tar -xvf Slate.zip
```

4. You may now use the `start.bat` file

```bash
# Installs the npm prerequisites
npm run start
```

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

4. You may now use the `start.bat` file

```bash
# Installs the npm prerequisites
npm run start
```

## Contributing

Contributions are always welcome! Please read our [contribution guidelines](.github/CONTRIBUTING.md) before contributing.

## Credits

- Electron
- NodeJS
