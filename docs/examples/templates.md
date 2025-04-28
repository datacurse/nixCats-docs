---
title: "Starter Template Gallery"
description: "Browse the ready‑made nixCats starter templates and learn which one to pick for your next Neovim project."
---

# Starter Template Gallery

This page gives you a birds‑eye view of every template that ships with **nixCats‑nvim**.  
Each template is a fully‑working starting point that you can pull into an empty directory with **`nix flake init -t …`** and start hacking in minutes.

> **TL;DR** Run  
> ```bash
> nix flake init -t github:BirdeeHub/nixCats-nvim#<template>
> ```  
> …then read the generated `README.md` inside the new repo for next steps.

---

## Pick a Template

| Template slug | Quick command | What you get | Ideal for |
|---------------|--------------|--------------|-----------|
| **default** | `nix flake init -t github:BirdeeHub/nixCats-nvim` | Fresh flake with sane category skeleton, README, & build script. | First‑time nixCats users who want *maximum control*. |
| **example** | `…#example` | Opinionated config with Treesitter, Telescope, *lze* lazy‑loader & Nix LSPs. | “Kick the tyres” without writing code. |
| **simple** | `…#simple` | *Single Nix file* + minimal Lua that fits on one screen. | Learning the core builder mechanics. |
| **kickstart-nvim** | `…#kickstart-nvim` | Full port of the famous Kickstart.nvim tutorial, pre‑wired to nixCats lazy wrapper. | People who followed Kickstart and now want reproducibility. |
| **LazyVim** | `…#LazyVim` | Ready‑to‑run LazyVim distribution on Nix. | Trying the LazyVim ecosystem, Nix‑style. |
| **luaUtils** | `…#luaUtils` | Drops only the `lua/nixCatsUtils` helpers into an existing tree. | Adding Nix‑awareness to **non‑Nix** configs. |
| **home-manager** | `…#home-manager` | Flake demonstrating the **Home Manager module**. | Integrating into an existing HM system flake. |
| **nixos** | `…#nixos` | Same as above but for **NixOS / nix‑darwin** system modules. | System‑level installation for all users. |
| **flakeless** | `…#flakeless` | Plain `.nix` expression that returns a derivation, no flakes. | Guix / legacy Nix or anti‑flake environments. |
| **nixExpressionFlakeOutputs** | `…#nixExpressionFlakeOutputs` | Stand‑alone `outputs` function to embed inside another flake. | Embedding nixCats packages in *large* monorepos. |
| **overwrite** | `…#overwrite` | Tutorial: build new config **by overriding** an imported nixCats pkg. | Advanced package composability tricks. |
| **overriding** | `…#overriding` | Multi‑step override demo *plus* AppImage export. | Packaging & distribution experiments. |
| **overlayHub** | `…#overlayHub` | Boiler‑plate for `overlays/default.nix`. | Curating private plugin overlays. |
| **overlayFile** | `…#overlayFile` | Skeleton for an **individual** overlay file. | Splitting big overlay trees. |

---

## Workflow Cheat‑Sheet

```bash
# 1) Scaffold project
nix flake init -t github:BirdeeHub/nixCats-nvim#example
cd my-cats

# 2) Build & enter a dev‑shell with your new Neovim
nix develop       # or: nix run .#nixCats

# 3) Hack Lua, rebuild Nix when you add deps
vim .
```

*Need to switch templates?*  
Just initialise the new template in a **fresh** directory and copy‑paste your `lua/` and `categoryDefinitions` over—the underlying builder is identical so nothing else changes.

---

### More Examples

* **Kickstart walk‑through** – step‑by‑step tour of the Kickstart template (see next page).  
* **LazyVim walk‑through** – deep dive into the LazyVim port.  
* Community recipes live in the [**Discussions** board](https://github.com/BirdeeHub/nixCats-nvim/discussions).

---

> Got a template you’d like to share? Open a PR or start a Discussion—community examples are more than welcome!
