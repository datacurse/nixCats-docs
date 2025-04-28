---
title: 'FAQ: First‑Run Problems'
description: 'Troubleshooting the most common errors you might hit on your very first nixCats build & launch.'
---

# First Build & Run – FAQ 🎛️

Getting a brand‑new `nixCats` repo to compile can feel like a mini‑boss fight.
Below are the hiccups that bite **most new users in the first hour**, plus the fastest fixes.

> **Tip:** keep Neovim open in a split—`":h nixCats"` is your in‑editor lifeline.

---

## 1. “*File not found in store / nix build can’t see my Lua file*”

**Symptom**  
*Build succeeds but Neovim opens an empty config, or plugins are missing.*

**Root cause**  
The file was never staged, so Nix’s content‑addressed store can’t see it.

**Fix**  

```bash
git add -A         # stage all new / changed files
nix flake check    # or: nix build .#nixCats
```

## 2. “*collision between ‘nvim’ and another package*”

**Symptom**  
Home‑Manager / NixOS complains about **alias name clashes** when evaluating.

**Fix**  
Every package in `settings.aliases` **must be globally unique**.  
Edit your `packageDefinitions` entry and rename the alias.

```nix
settings.aliases = [ "nixCats" "vi-cat" ];  # unique per user
```

---

## 3. “*My Lua edits don’t appear unless I rebuild*”

Check what you set for `wrapRc`:

| Setting            | Behaviour                               |
|--------------------|-----------------------------------------|
| `wrapRc = true`    | Lua is baked into the store – **rebuild** required |
| `wrapRc = false`   | Lua read from source dir – instant reload |
| `wrapRc = "ENV"`   | Toggle on the fly with `ENV=0 nixCats`   |

For live‑hacking, make a second package (`devCats`) identical except `wrapRc = false`.

---

## 4. “*LSP / mason tries to download things on NixOS*”

NixOS blocks network downloads in builds.  
Use the **`lspsAndRuntimeDeps`** category instead of Mason:

```nix
lspsAndRuntimeDeps = {
  neonixdev = with pkgs; [ nixd lua-language-server ];
};
```

In Lua:

```lua
if nixCats('neonixdev') then
  require('lspconfig').nixd.setup({})
end
```

---

## 5. “*My colourscheme / plugin isn’t found*”

* Did you add the plugin to a **category list** in `categoryDefinitions`?  
* Did you enable that category in `packageDefinitions.categories`?  
* View the final plugin list inside Neovim:

  ```vim
  :NixCats pawsible
  ```

---

## 6. “*Build time is huge!*”

Quick wins

* Pin `pkgs.neovim-unwrapped` to the latest stable instead of nightly – avoids rebuilds.  
* Disable `collate_grammars` during early iterations (`settings.collate_grammars = false`).  
* Use `nix run` for *one‑off* tests, and a **devShell** for iterative hacking.

--

## 7. Debug Cheatsheet

| Task | Command |
|------|---------|
| Show packages exported by flake | `nix flake show` |
| Inspect options inside module build | `nixos-option programs.nixCats` |
| List enabled categories in NVim | `:NixCats cats` |
| Print a specific value | `:NixCats cat settings.wrapRc` |

---

Still stuck? Jump into the **GitHub Discussions** board – paste your error log and `flake.nix`, someone will pounce. 🐱‍💻
