---
title: 'Kickstart-nvim Walk‑Through'
description: 'Step‑by‑step guide to the nixCats Kickstart‑nvim template'
---

# Kickstart‑nvim Walk‑Through

*This guide assumes you have completed the [Starter Template Gallery](./starter-template-gallery) page and have Nix installed.*

---

## 1. What Is It?

The **`kickstart-nvim`** template is a 1‑to‑1 port of
[kickstart.nvim](https://github.com/nvim-lua/kickstart.nvim) — a popular “minimal &
opinionated” Neovim config — rewritten to use **nixCats** for *all* dependency
management.

| Aspect | Upstream kickstart.nvim | nixCats kickstart‑nvim |
|--------|------------------------|------------------------|
| Plugin manager | `lazy.nvim` | Nix + nixCats wrapper |
| LSP install    | `mason.nvim` | Nix categories `lspsAndRuntimeDeps` |
| Update method  | `:Lazy update` | `nix flake update` |
| Config style   | Pure Lua | Pure Lua |

> **Why this template?**  
> It’s instantly familiar to users who learned Neovim through the Kickstart
> tutorial, yet shows how nixCats replaces Mason & Lazy with reproducible
> Nix builds.

---

## 2. One‑Command Setup

```bash
nix flake init -t github:BirdeeHub/nixCats-nvim#kickstart-nvim
```

*Creates a new directory with the following structure:*

```
.
├─ flake.nix                # nixCats definition (≈ 180 loc)
├─ lua/
│  └─ myLuaConf/            # editable upstream Lua config
├─ templates/
│  └─ luaUtils/             # lazy wrapper, utility helpers
└─ README.md
```

> **Tip:** You can **preview** the result without installing anything by
> running  
> ```bash
> nix run .#nixCats
> ```  
> from inside the folder. It drops you straight into the fully‑configured
> editor.

---

## 3. Anatomy of the Template

| File/Dir | Purpose |
|----------|---------|
| `flake.nix` | Declares two packages:`nixCats` (normal) & `regularCats` (wrapRc =false for live Lua hacking). It also pins plugin versions. |
| `lua/myLuaConf/` | **All upstream Kickstart Lua** lives here, almost unmodified. |
| `templates/luaUtils/` | Adds • `require('nixCatsUtils').setup()` shim • `lazyCat` wrapper so `lazy.nvim` never tries to download anything • helper functions (`enableForCategory`, `lazyAdd`, …) |
| `README.md` | Extra tips for the template itself. |

### Category Cheatsheet

In `flake.nix` you will see:

```nix
categories = {
  kickstart  = true;   # core plugins
  lspBase    = true;   # LSP, cmp, snippets
  telescope  = true;   # Telescope + deps
  treesitter = true;   # TS + textobjects
};
```

You can toggle **whole bundles** off/on just
by flipping these booleans — no Lua edits required.

---

## 4. Common Customisations

### 4.1 Change Colourscheme

```nix
categories.colorscheme = "catppuccin";  # or "tokyonight", "onedark", …
```

Inside Lua:

```lua
vim.cmd('colorscheme ' .. nixCats('colorscheme'))
```

### 4.2 Add a Plugin

1. **Pin the source** in the `inputs` block, e.g.

   ```nix
   "plugins-guess-indent" = {
     url   = "github:nmac427/guess-indent.nvim";
     flake = false;
   };
   ```

2. Add it to a category:

   ```nix
   startupPlugins.extra = with pkgs.neovimPlugins; [
     guess-indent
   ];
   categories.extra = true;
   ```

3. Configure in Lua *exactly* as you would with Lazy.

### 4.3 Live‑Reload Lua Only

Launch the “unwrapped” sibling package:

```bash
regularCats  # alias defined by the template
```

It watches `lua/` directly without rebuilding the Nix derivation —
perfect for rapid prototyping.

---

## 5. Updating Plugins

```bash
nix flake lock --update-input plugins-*
nix build .#nixCats
```

The lock file now pins every plugin to a *commit hash*, ensuring
reproducible rebuilds.

---

## 6. Troubleshooting

| Symptom | Fix |
|---------|-----|
| `E117: Unknown function nixCats` | Call `require('nixCatsUtils').setup()` at the very *top* of `init.lua`. |
| Plugin shows as _“missing”_ in `:Lazy` UI | The wrapper purposely suppresses downloads. Verify you added the plugin to `startupPlugins.*`. |
| Language server not found | Add it to `lspsAndRuntimeDeps.*` and rebuild. Mason is unused. |
| “file not added to store” on rebuild | Remember to run **`git add`** before building when `wrapRc = true`. |

---

## 7. Next Steps

* **Explore the code:** open `flake.nix` and follow the comments.
* **Read the [Daily Workflow](./daily-workflow) guide.**
* Ready for something bigger? Try the [LazyVim Walk‑Through](./lazyvim-walkthrough).
