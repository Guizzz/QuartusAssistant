# QuartusAssistant

VS Code extension that integrates the Intel Quartus workflow directly into the editor, making FPGA/CPLD development faster and more convenient.

The extension provides project management utilities, compile/flash automation, syntax highlighting for Quartus project files, and project information extracted directly from `.qsf` files.

---

## ✨ Features

* ⚡ Compile Quartus projects directly from VS Code
* 🚀 Flash FPGA/CPLD devices from inside the editor
* 📁 Support for `.qpf` and `.qsf` project files
* 🎨 Syntax highlighting for Quartus project files
* 🧩 Dedicated sidebar panel for Quartus project inspection
* 🔍 Automatic `.qsf` parsing to extract:

  * FPGA family
  * Target device
  * Top-level entity
  * Output directory
  * Pin assignments
* 📌 Expandable pin configuration view
* 🔧 Streamlined workflow integration for Quartus-based development


## 🛠️ Requirements

* Intel Quartus Prime installed
* VS Code 1.80 or later
* ___(optional)___ Node.js (required only for development/building the extension)


## 🎨 Syntax Highlighting

Automatic support for:

* `.qpf` (Quartus Project Files)
* `.qsf` (Quartus Settings Files)

Just open the file in VS Code.


## 🧠 Motivation

Quartus workflows are often slow and fragmented across tools.

This extension aims to:

* reduce context switching
* speed up compile/flash cycles
* integrate FPGA/CPLD workflows directly into VS Code

## 🔨 Usage

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and use:

### Compile project
To compile de project use:

```
Quartus: Build
```

### Flash CPLD
After plug in your board, you can use this command to program your CPLD:
```
Quartus: Flash Device
```

### Configure Quartus Path
To make everythigs works, you must have Quartus installed, and use this path to configure his installation path:
```
Quartus: Set PATH
```
--- 
## 📥 Installation

### Option 1 — Install from release (.vsix)

Download the latest `.vsix` file from the GitHub Releases page, then open Visual Studio Coode:

> _Ctrl-Shift-X_ -> "Install from .vsix..."



### Option 2 — Build from source

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

