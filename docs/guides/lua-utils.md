---
title: 'Lua Utils & lazy.nvim Wrapper'
description: 'Utilities for hybrid (Nix + Lua) configs & a drop‑in lazy.nvim wrapper that plays nicely with nixCats'
---

# Lua Utils & the **lazyCat** Wrapper

> **TL;DR**  If you sometimes open the same config *without* Nix (e.g. on another machine, or when hacking inside the tree) grab the **luaUtils** template.  
> It gives you a shim that lets the code run either way *plus* an opinionated wrapper for [lazy.nvim](https://github.com/folke/lazy.nvim) so you can keep its sweet UI without losing Nix purity.

---

## 1. Why you might need it

| Scenario | Pain without utils | Fix |
|----------|-------------------|-----|
| Open the repo with a plain `nvim` that was **not built by nixCats** | `require('nixCats')` throws | `require('nixCatsUtils').setup{}` provides a safe fallback |
| You *love* lazy.nvim’s dashboard but also want **immutable, cached downloads** for CI / daily work | lazy.nvim insists on downloading everything again | `require('nixCatsUtils.lazyCat')` turns each Nix‑provided plugin into a *disabled* lazy spec – zero downloads, same UI |
| Need per‑OS tweaks (e.g. Windows path) | `if vim.fn.has('win32') == 1 then …` *and* `nixCats()` checks everywhere | `nixCatsUtils.lazyAdd(foo, fallback)` helper keeps the logic tidy |

---

## 2. Getting the utilities

```bash
# inside an existing flake repo
nix flake init -t github:BirdeeHub/nixCats-nvim#luaUtils
```

This drops **`lua/nixCatsUtils/`** into your config tree.

> **Heads‑up:**  
> The path matters – lazyCat expects the module to be exactly `lua/nixCatsUtils`.  
> If you vendor it elsewhere, adjust the `require()` path in examples below.

---

## 3. The *isNixCats* bootstrap

```lua
-- top of init.lua **before** you touch plugins
require('nixCatsUtils').setup{
  non_nix_value = false,   -- default for nixCats(...) when Nix is NOT present
}
```

| Function | What it does | Typical use‑case |
|----------|--------------|------------------|
| `nixCatsUtils.isNixCats` | `true` if this Neovim was launched from a nixCats wrapper | Skip download steps |
| `nixCatsUtils.lazyAdd(real, alt?)` | Return `real` when nixCats, otherwise `alt` (or `nil`) | Conditionally disable build hooks |
| `nixCatsUtils.enableForCategory(cat, def?)` | Shorthand for `nixCats(cat) ~= nil` with fallback | Gate plugin setup behind a category flag |
| `nixCatsUtils.getCatOrDefault(cat, def)` | Like above but returns *value* | Read `colorscheme`, custom ports, etc. |

---

## 4. The **lazyCat** wrapper

### 4.1 Basic usage

```lua
local lazyCat = require('nixCatsUtils.lazyCat')

-- nixCats.pawsible() returns the *final* plugin set with Nix store paths
lazyCat.setup(
  nixCats.pawsible({'allPlugins', 'start', 'lazy.nvim'}), -- optional path hint
  -- extra lazy.nvim opts (same table you’d pass to lazy.setup)
  { ui = { border = 'rounded' } }
)
```

What it does:

1. **Resets** `runtimepath` exactly once – matching nixCats’ expectations.
2. Converts every Nix plugin into a disabled **lazy spec** so lazy.nvim
   still renders its UI but *never* redownloads.
3. Lets you mix in normal lazy specs for stuff you *do* want to fetch on demand.

### 4.2 When grammars matter

If you install Tree‑sitter grammars **via Nix** (recommended) the wrapper will
auto‑detect `nvim-treesitter` derivations produced by:

- `pkgs.vimPlugins.nvim-treesitter.withAllGrammars`
- `pkgs.vimPlugins.nvim-treesitter.withPlugins …`
- `pkgs.neovimUtils.grammarToPlugin …`

Any other method → add a classic lazy spec yourself so the files land on disk.

---

## 5. Putting it all together – minimal example

```lua
require('nixCatsUtils').setup{}

if nixCatsUtils.isNixCats then
  -- Use nixCats for plugins (lazyCat prints a summary on startup)
  require('nixCatsUtils.lazyCat').setup()
else
  -- Fallback to paq‑nvim with the helper wrapper
  require('nixCatsUtils.catPacker').setup(require('paqfile'))
end
```

That’s it – one config, two execution paths, zero duplication.

---

## 6. Cheatsheet

```lua
-- quick guards
if nixCatsUtils.isNixCats then … end
if nixCats('lspDebugMode') then … end

-- category‑gated call
require('nixCatsUtils').enableForCategory('neonixdev', false)

-- safely embed a Lua expression inside a category table
categories = {
  cacheDir = nixCatsUtils.inline [[ vim.fn.stdpath('cache') ]]
}
```

---

### Next Stop

Continue to **Overriding Existing Packages ➜** once you’re comfortable
switching between wrapped / unwrapped edits.

