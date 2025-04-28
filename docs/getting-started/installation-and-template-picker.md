---
title: "Installation & Template Picker"
description: "Set up **nixCats** in minutes by choosing the template that fits your workflow."
---

# Installation & Template Picker

This page shows the quickest ways to get **nixCats** on your machine and pick a starting template.

---

## 1. Prerequisites

| Requirement | Notes |
|-------------|-------|
| **Nix ≥ 2.19** | Enable the flake & new-command features `experimental-features = nix-command flakes` in `/etc/nix/nix.conf` or `$XDG_CONFIG_HOME/nix/nix.conf`. |
| **Git** | Needed for cloning templates & staging config files. |
| **Neovim ≥ 0.9** | The version used by nixCats unless you pin something else. |

---

## 2. Template Quick-Picker

Run the **init** command _inside an empty directory_ (it won’t overwrite tracked files).

| Template | When to choose | Init command |
|----------|----------------|--------------|
| **`default`** | Fresh Lua config, happy to learn Nix | `nix flake init -t github:BirdeeHub/nixCats-nvim` |
| **`example`** | Play with a full “batteries-included” setup | `nix flake init -t github:BirdeeHub/nixCats-nvim#example` |
| **`home-manager`** | You already use Home-Manager | `nix flake init -t github:BirdeeHub/nixCats-nvim#home-manager` |
| **`nixos`** | NixOS / nix-darwin system flake | `nix flake init -t github:BirdeeHub/nixCats-nvim#nixos` |
| **`luaUtils`** | Keep existing Lua; only want helper utils | `nix flake init -t github:BirdeeHub/nixCats-nvim#luaUtils` |
| **`kickstart-nvim`** | Kickstart.nvim with Nix purity | `nix flake init -t github:BirdeeHub/nixCats-nvim#kickstart-nvim` |
| **`LazyVim`** | LazyVim distribution on Nix | `nix flake init -t github:BirdeeHub/nixCats-nvim#LazyVim` |

> **Z-shell:** using `zsh` with `extendedglob` **and** `nomatch`?  
> Escape the `#` – e.g. `nix flake init -t github:BirdeeHub/nixCats-nvim\#example`.

---

## 3. One-off Try-out

```bash
# Launch the full example config in a disposable shell
nix run github:BirdeeHub/nixCats-nvim?dir=templates/example

# Once inside, start Neovim with:
nixCats
```

---

## 4. First Build & Run

After `nix flake init …` you’ll have a skeleton repo.

```bash
git add .
nix develop          # optional dev-shell with Neovim + utils
nix run .#nixCats    # or whatever package name the template sets
```

> **Why `git add`?**  
> Flakes only copy **tracked** files into the build sandbox.  
> Stage new Lua/Nix files before each rebuild — or set `wrapRc = false` later for live editing.

---

## 5. Next Steps

1. Head to **First Build & Run** for a walkthrough.  
2. Check **FAQ: first-run problems** if something fails.  
3. Dive into **Core Concepts → Category System** to learn how nixCats organises plugins & LSPs.

