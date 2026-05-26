# Quartus Assistant
## FPGA workflow automation for Intel Quartus in VS Code

![GitHub release](https://img.shields.io/github/v/release/Guizzz/QuartusAssistant)


A modern Visual Studio Code extension that brings Intel Quartus and QuestaSim workflows directly into VS Code.

Designed for FPGA developers who are tired of switching between terminals, Quartus GUI windows, and simulation tools just to compile or run a testbench.

---

## ✨ Features

### 🧠 Quartus Project Awareness

* Automatic Quartus project detection
* QSF parsing and project information extraction
* Top-level entity detection
* Pin assignment parsing
* Workspace-aware project handling

### ▶ QuestaSim Integration

* Automatic `.do` script discovery
* QuickPick-based simulation launcher
* Direct QuestaSim GUI startup from VS Code
* Workspace-relative simulation management
* Detached GUI execution for smooth workflow integration

### 🌳 Dedicated Quartus Explorer

* Clean TreeView integration inside VS Code
* Workspace-relative file visualization
* Organized simulation script navigation
* Project-aware structure browsing

### ⚡ Developer Workflow Improvements

* Faster simulation startup
* Reduced context switching
* Integrated command-based architecture
* Cross-platform path handling
* Cleaner FPGA development experience inside VS Code

---

## 🚀 Current Capabilities

* Run QuestaSim simulations directly from VS Code
* Detect and manage Quartus projects
* Parse `.qsf` project configuration files
* Locate VHDL top-level entities automatically
* Launch simulation scripts with a single click
* Automatic workspace-root execution handling

---

## 🧠 Motivation

Quartus workflows are often slow and fragmented across tools.

This extension aims to:

* reduce context switching
* speed up compile/flash cycles
* integrate FPGA/CPLD workflows directly into VS Code

## ⚙️ Available Commands

Quartus Assistant integrates directly into the VS Code Command Palette and workflow.

### Quartus Commands

| Command                             | Description                                                     |
| ----------------------------------- | --------------------------------------------------------------- |
| `Quartus: Build`                    | Launches Quartus project compilation                            |
| `Quartus: Flash`                    | Programs the FPGA device using Quartus tools                    |
| `Quartus: Set Quartus Path`         | Configures the Quartus installation path                        |
| `Quartus: Generate QuestaSim DO`    | Automatically generates QuestaSim `.do` scripts                 |
| `Quartus: Run QuestaSim simulation` | Launches a selected simulation script directly in QuestaSim GUI |

---

## 🧩 Command Palette Integration

All commands are accessible from:

```txt
Ctrl + Shift + P
```

then search:

```txt
Quartus:
```

Example:

```txt
Quartus: Build
Quartus: Generate QuestaSim DO
Quartus: Run QuestaSim simulation
```

---

## 🚀 Typical Workflow

1. Open a Quartus project workspace
2. Configure Quartus path
3. Build the FPGA project
4. Generate simulation `.do` files
5. Launch QuestaSim simulations directly from VS Code
6. Flash the FPGA device

All without leaving the editor. ✨

---

### 🔨 Build from source

```bash
git clone https://github.com/Guizzz/QuartusAssistant.git
cd QuartusAssistant
npm install
```

Then package the extension:

```bash
npm install -g @vscode/vsce
vsce package
```

```bash
code --install-extension quartusassistant-<version>.vsix
```

---

## 📌 Roadmap

* [ ] Pin Planner integration
* [ ] GUI panel for compile/flash

---

## 🤝 Contributing

Pull requests are welcome.
If you want to improve FPGA/CPLD tooling inside VS Code, feel free to contribute.

---

## 📄 License

[MIT](./LICENSE)

