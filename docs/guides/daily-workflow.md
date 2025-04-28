---
title: "Daily Workflow"
description: "Your day‑to‑day editing & rebuild loop with nixCats"
---

# Daily Workflow 🛠️

This page shows you the **tight feedback loop** most users settle into after the
first build is working. Think of it as your “muscle‑memory cheatsheet” – open,
tweak, rebuild, repeat.

---
## 1  Quick reference matrix

| What changed? | Rebuild needed? | Typical command |
|---------------|-----------------|-----------------|
| **Lua only** (inside your config directory) | **No** when `wrapRc = false` → just `:so %` or restart Neovim**Yes** when `wrapRc = true` → stage file then rebuild | `git add …` `nix run .#<pkg>` |
| **Nix categories / settings** | **Yes** | `nix run .#<pkg>` (or `nix build .#<pkg>` and run the result) |
| **External plugin versions** (`nix flake update`) | **Yes** | `nix flake update` `nix run .#<pkg>` |
| **System modules** (HM / NixOS) | **Yes** | `home-manager switch` / `sudo nixos-rebuild switch` |

> **Tip** – keep a second *unwrapped* package (e.g. `myNvimDev`) with
> `wrapRc = false` for rapid Lua tinkering, and a *wrapped* one for daily use.

---
## 2  Editing Lua – two styles

### a. *Live* (wrapRc = false)

1. Open Neovim (`myNvimDev`) – the real files live in your checkout.
2. Change Lua → `:so %` or restart Neovim to see the effect immediately.
3. Happy? Stage the file (`git add`) **before** the next rebuild.

### b. *Immutable* (wrapRc = true)

1. Edit Lua, **stage** it (`git add`) – unstaged files are invisible to Nix.
2. Rebuild: `nix run .#myNvim` (or through HM/NixOS).
3. Launch the freshly wrapped binary.

---
## 3  Typical edit loop for Nix changes

```bash
# open a dev‑shell with same pkgs set (optional)
nix develop

# edit flake.nix (add a plugin, change settings, …)
$EDITOR flake.nix

# rebuild + run
nix run .#myNvim
```

Use `nix build .#myNvim` if you only want the drv (CI, remote caches, …).

---
## 4  Keeping plugins up to date

```bash
# inside your repo
nix flake update          # bumps all inputs
git commit -am 'update inputs'
nix run .#myNvim
```

Pin a specific plugin instead?  Use the `plugins-foo` input **without**
running `flake update` until *you* choose to.

---
## 5  Handy one‑liners

```bash
# List all packages defined in this repo
nix flake show | grep nixCats

# Enter a shell with the package on $PATH
nix develop .#myNvimShell

# Watch rebuild time (profiling)
time nix build .#myNvim
```

---
## 6  Speed tips

* **Cache** – push successful builds to a binary cache (e.g. Cachix).
* **Direnv** – `use flake` + `nix thick` gives instant rebuilds for small tweaks.
* **Separate systems** – use `arch-*` specific caches to avoid recompiles.

---
### Next stop

*Need to debug first‑run issues?* → head to **FAQ: first‑run problems**.
