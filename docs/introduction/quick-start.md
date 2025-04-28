---
title: 'Quick Start (5‑minute guide)'
description: 'Spin up a reproducible Neovim powered by nixCats in roughly five minutes.'
---

> **Goal:** Have a fully‑working, reproducible Neovim instance running with your own configuration, built by nixCats, in ~5 minutes.

---

## 0. Prerequisites

| Tool | Version (≈) | Notes |
|------|-------------|-------|
| `nix` | 2.18 or newer | Enable flakes + nix command.  
| `git` | any | Used for templates & staging.  
| **Optional:** `home-manager` / `nixos` modules if you’ll integrate later. |

```bash
# Enable experimental features once (bash / zsh RC or nix.conf)
export NIX_CONFIG="experimental-features = nix-command flakes"
```

---

## 1. Pick a template

The fastest path is the **default flake template** – it gives you a minimal, ready‑to‑edit project.

```bash
mkdir my‑nvim && cd my‑nvim
nix flake init -t github:BirdeeHub/nixCats-nvim   # <1 min>
```

*Need something else?* Run `nix flake show github:BirdeeHub/nixCats-nvim#templates` to browse all starter templates.

---

## 2. First build & run

```bash
# Build once and drop into the shell that exposes your fresh Neovim
nix develop             # builds deps, <3 min on decent connection
# —or— build to ./result
nix build .#packages.$(nix eval --raw --impure nixpkgs.hostPlatform.system).default
./result/bin/nixCats    # wrapper script produced by nixCats
```

Inside Neovim press `:checkhealth` – you should see plugins pre‑installed and no missing binaries.

> **Tip:** the launch script name equals the *package name* (`nixCats` by default).  
> To change it edit `aliases` or `packageDefinitions.<name>.settings.extraName`.

---

## 3. Tweak your config

* `flake.nix`: add plugins/LSPs in **`categoryDefinitions`** lists and flip booleans in **`packageDefinitions.<pkg>.categories`**.  
* `lua/`: edit `init.lua` & friends exactly like a normal Neovim setup.

Re‑enter Neovim with:

```bash
# fast rebuild after Nix edits
nix develop
# no rebuild needed for Lua edits if `wrapRc = false` (recommended while iterating)
```

---

## 4. Common first‑run issues

| Symptom | Fix |
|---------|-----|
| *“command not found: nixCats”* | Install the package (`nix develop` or add to `environment.systemPackages`). |
| Plugins present but Lua changes don’t reload | Set `wrapRc = false` in the package’s `settings` to use files from your checkout live. |
| Long first build | Use a local Nix cache or pin a closer `nixpkgs`. |

---

## 5. Next steps

* Explore **`:help nixCats`** inside Neovim.  
* Read the [Feature Highlights](./feature-highlights) & “Category System” sections.
* Integrate with Home Manager or NixOS modules when you’re ready.
