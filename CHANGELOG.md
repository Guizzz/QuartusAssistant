# Changelog

All notable changes to this project will be documented in this file.

## [0.5.1] - 2026-05-22

### Fixed
- Minor fix of v0.5.0

## [0.5.0] - 2026-05-22

### Feature

- Added integrated QuestaSim `.do` launcher
- Added QuickPick selection for simulation scripts
- Added automatic QuestaSim GUI startup from VS Code
- Added support for launching simulations directly from the Quartus Assistant view
- Added automatic workspace-relative `.do` file discovery
- Added top-level entity source file detection from VHDL entity declarations
- Added project-aware simulation execution using workspace root as working directory

### Improved

- Improved TreeView display using workspace-relative paths instead of absolute paths
- Improved VHDL top-level entity parsing and lookup
- Refactored simulation execution logic for reusable command-based invocation
- Improved cross-platform file path handling using `fsPath`
- Improved extension stability when launching detached QuestaSim GUI processes

## [0.4.2] - 2026-05-21

### Improved
- When generting .do now add only testbench waves

## [0.4.1] - 2026-05-20
 
### Fixed
- Fix order of dependencies auto imported on .do file

## [0.4.0] - 2026-05-20

### Feature
- New command implemented: "Generate QuestaSim .do" file
- Auto search into project if there are testbench files
- Auto search for dependencies of the test bench
- Auto-Generation of .do file ready to be executed on questasim


## [0.3.2] - 2026-05-19

### Feature

- Implemented new parser for top level entity ports
- Implemented lint warning on top level entity port that are missing on .qsf
- Implemented syntax highlighting for questasim .do files


## [0.3.1] - 2026-05-18

### Improved
- Improved logger, now stamp better info of the Error

## [0.3.0] - 2026-05-15

### Features

- Introduced a new sidebar view for Quartus project inspection
- Implemented `.qsf` parsing support to retrieve:

  - FPGA family
  - Target device
  - Top-level entity
  - Output directory
- Added support for parsing pin assignments
- Added collapsible sections for pin configuration browsing

## [0.2.0] - 2026-05-14

### Improved
- Refactored extension architecture into modular components
- Improved command separation and maintainability
- Improved Quartus process handling
- Improved status bar management
- Improved logging system reliability
- Improved workspace event handling
- Improved extension scalability for future features

### Fixed
- Fixed duplicated output channels on multiple builds
- Fixed output panel not automatically opening during tasks
- Fixed inconsistent status bar updates
- Fixed project visibility refresh after workspace changes

## [0.1.0] - 2026-05-08

### Added
- Compile Quartus projects directly from VS Code
- Flash CPLDs from inside the editor
- Support for `.qpf` and `.qsf` files
- Syntax highlighting for Quartus project files

### Notes
- First public release