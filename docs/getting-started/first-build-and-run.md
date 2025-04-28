---
title: 'First Build & Run'
description: 'Build your nixCats‑powered Neovim for the first time and launch it'
---

# First Build & Run

> **Goal (≈ 5 minutes)** — take a freshly‑generated nixCats project, build it with Nix, and open the editor for the very first time.

---

## 1 · Prerequisites

| Tool | Minimum version | Notes |
|------|-----------------|-------|
| **Nix** | 2.19+ | _flake support enabled_ (`experimental-features = nix-command flakes`) |
| **Git** | any | Nix only builds **tracked** files → always `git add` new/changed files |
| **Neovim** | *none* | Neovim itself will be provided by nixCats |

---

## 2 · Create your project

```bash
# pick a directory & generate the fresh flake template
mkdir ~/code/my‑nvim && cd $_
nix flake init -t github:BirdeeHub/nixCats-nvim
```

<details>
<summary><kbd>…or</kbd> choose another template</summary>

```bash
# e.g. starter gallery:
nix flake init -t github:BirdeeHub/nixCats-nvim#example      # idiomatic example config
nix flake init -t github:BirdeeHub/nixCats-nvim#LazyVim      # LazyVim port
nix flake init -t github:BirdeeHub/nixCats-nvim#home-manager # HM module skeleton
```
</details>

---

## 3 · Inspect the generated files

```text
.
├─ flake.nix            # your build definition — edit categories & settings here
├─ lua/                 # familiar Lua config directory (init.lua, after/, …)
└─ README.md            # per‑template notes
```

Open **`flake.nix`** and look for:

```nix
# default starter package
defaultPackageName = "nixCats";    # rename if you like 👈
# categories you want enabled in the first build
categories = { general = true; };
```

---

## 4 · First build

```bash
# stage the files so Nix can see them
git add .

# build your package (≈1‑2 min the very first time)
nix build .#nixCats        # <pkgName> matches defaultPackageName
```

The result is a symlink:

```bash
./result/bin/nixCats       # wrapper script + bundled runtime
```

> **Tip** Use `nix build --print-build-logs` if you need to debug compilation issues.

---

## 5 · Run the editor

```bash
# directly from the result symlink
./result/bin/nixCats

# …or via nix run (works from anywhere)
nix run ~/code/my‑nvim#nixCats
```

On first launch nixCats prints a short summary and then loads Neovim with your starter Lua config.  
Use `:NixCats cats` inside Neovim to confirm the `general` category is active.

---

## 6 · Iterate

| Change type | What to do |
|-------------|------------|
| **Lua only** | edit files → **no rebuild** needed when `wrapRc = false` → just `:so %` / `:PackerSync` |
| **Nix file** (new plugin, category change, settings) | `git add .` → `nix build` again |
| **Template update / flake input bump** | `nix flake update` → `nix build` |

> **DEV shell**  Run `nix develop` to drop into a shell with _this exact_ Neovim and all declared runtime deps on your `$PATH`.

---

## 7 · Cleanup (optional)

```bash
# remove older build outputs
nix store gc
```

---

### Next up · FAQ / first‑run problems  →  

Head to **[FAQ: first‑run problems](../faq-first-run)** if something went wrong, or continue to the **Core Concepts** section to learn how categories & packages work.
