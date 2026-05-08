# QuartusAssistant

VS Code extension that integrates Intel Quartus workflow directly into the editor, making CPLD development faster and more convenient.

It provides compile/flash automation and syntax highlighting for Quartus project files.

---

## ✨ Features

- ⚡ Compile Quartus projects directly from VS Code
- 🚀 Flash CPLDs from inside the editor
- 📁 Support for `.qpf` and `.qsf` files
- 🎨 Syntax highlighting for Quartus project files
- 🔧 Simple workflow integration for FPGA/CPLD development
- 📦 Packaged as `.vsix` for easy installation

---

## 🛠 Requirements

- Intel Quartus Prime installed and available in PATH
- VS Code 1.80 or higher
- Node.js (only for development / building the extension)

---

## 📥 Installation

### Option 1 — Install from release (.vsix)

Download the latest `.vsix` file from the GitHub Releases page, then install it:

```bash
code --install-extension quartusassistant-0.1.0.vsix
````

---

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

---

## 🔨 Usage

Open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) and use:

### Compile project

```
Quartus: Build
```

### Flash CPLD

```
Quartus: Flash Device
```

---

## 🎨 Syntax Highlighting

Automatic support for:

* `.qpf` (Quartus Project Files)
* `.qsf` (Quartus Settings Files)

Just open the file in VS Code.

---

## 🚀 GitHub Actions Release

This project includes CI automation that:

* builds the extension
* packages `.vsix`
* publishes a GitHub Release when a tag is pushed (`v*`)

Example:

```bash
git tag v0.1.0
git push origin v0.1.0
```

---

## 📦 File Support

| Extension | Description           |
| --------- | --------------------- |
| `.qpf`    | Quartus Project File  |
| `.qsf`    | Quartus Settings File |

---

## 🧠 Motivation

Quartus workflows are often slow and fragmented across tools.

This extension aims to:

* reduce context switching
* speed up compile/flash cycles
* integrate FPGA/CPLD workflows directly into VS Code

---

## 📌 Roadmap

* [ ] Auto-detect Quartus project root
* [ ] Parse Quartus compilation errors in VS Code
* [ ] Board presets for CPLDs
* [ ] GUI panel for compile/flash
* [ ] Integration with VS Code Tasks API

---

## 🤝 Contributing

Pull requests are welcome.
If you want to improve FPGA/CPLD tooling inside VS Code, feel free to contribute.

---

## 📄 License

MIT

```
