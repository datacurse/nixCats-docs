---
title: "Lua Runtime API (`nixCats`)"
description: "Programmatic access to categories, settings, and helpers exposed by the nixCats Neovim plugin."
---

# Lua Runtime API

> **Scope**  
> This page documents the Lua‑side interface you get inside Neovim after launching a package that was built with **nixCats**.  
> Everything lives in a tiny plugin that is generated during the build and shipped on your `runtimepath`.

---

## 1 · Getting the table

```lua
local nixCats = require("nixCats")   -- or simply use the global `nixCats`
```

`require("nixCats")` returns a single table whose fields are listed below.  
Calling the table **as a function** is a shortcut for `nixCats.get()` (see §2).

---

## 2 · Category helpers

| API                                   | Purpose                                                                           | Notes |
|---------------------------------------|-----------------------------------------------------------------------------------|-------|
| `nixCats.get(attrpath)`               | Lowest‑level getter (also the `nixCats(…)` call syntax)                           | Accepts dot‑string (`"lsp.go"`) **or** list `{ "lsp", "go" }`. |
| `nixCats.cats` **or** `nixCats()`     | Root table containing **only** the `categories` set that you enabled in Nix.      | Reading fields is cheap; no I/O. |
| `nixCats.settings` (attr or table)    | Mirrors the **settings** attrset from your package definition.                    | Common check: `if nixCats.settings.wrapRc then … end` |
| `nixCats.extra` (attr or table)       | Mirrors the **extra** attrset (free‑form data you decide).                        | Great for passing file paths, ports, etc. |
| `nixCats.pawsible`                    | Final set of plugins that were actually installed (names & store paths).          | Use `:NixCats pawsible` in editor for a quick list. |
| `nixCats.petShop`                     | All *possible* categories defined in `categoryDefinitions` (even if disabled).    | Helps when writing UI like pickers. |

### Truthiness rules

`nixCats("foo.bar")` returns:

* **`false` / `nil`** if the category is disabled or unknown  
* **`true`** if the exact attrpath was set to `true`  
* **any other Lua value** (string, number, table, …) if you stored such a value

That means you can write very terse checks:

```lua
if nixCats("debug") then
  print("🐛  Extra debug tooling enabled!")
end
```

---

## 3 · Convenience globals & CLI

When Neovim starts, the plugin defines:

| Global             | Type    | Description |
|--------------------|---------|-------------|
| `nixCats`          | table / callable | Same table as `require("nixCats")`. |
| `:NixCats` command | ex‑cmd  | Dev helper that pretty‑prints any of the tables above. Try `:NixCats cats lsp` or `:NixCats cat colorscheme`. |

Disable the floating‑window UI (useful for TUI or VS Code embeds):

```lua
vim.g.nixcats_debug_ui = false
```

---

## 4 · Practical Examples

### 4.1 – Switch theme on the fly

```lua
vim.cmd.colorscheme(nixCats("colorscheme") or "default")
```

### 4.2 – Register optional plugins

```lua
if nixCats("optionalPlugins.telescope") then
  require("telescope").setup({})
end
```

### 4.3 – Pass dynamic build info

```lua
-- Nix side
extra = { buildHash = builtins.substring 0 7 self.rev; };

-- Lua side
print("Built on commit " .. nixCats.extra("buildHash"))
```

---

## 5 · Reference: full table shape

<details>
<summary>Click to expand</summary>

```lua
---@class NixCatsAPI
---@field cats          table | fun(path: string|string[]): any
---@field settings      table | fun(path: string|string[]): any
---@field extra         table | fun(path: string|string[]): any
---@field pawsible      table | fun(path: string|string[]): any
---@field petShop       table | fun(path: string|string[]): any
---@field configDir     string   -- resolved stdpath('config') dir
---@field packageBinPath string  -- wrapper script that launched nvim
---@field vimPackDir    string   -- store sub‑dir with all plugins
---@field nixCatsPath   string   -- path to the runtime plugin itself
---@field get           fun(path: string|string[]): any  -- alias of cats getter
local nixCats = {}  -- provided by plugin
```

</details>

---

## 6 · Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| `E5108: Error executing lua …` during startup | You called `nixCats()` **before** the plugin was on `runtimepath`. | Move your `require("nixCats")` lines *below* `runtimepath` tweaks (or remove the tweak). |
| Global `nixCats` is `nil` | You opened a vanilla Neovim, not a nixCats‑built one. | Install config via `wrapRc = false` **or** call `require("nixCatsUtils").setup()` in your `init.lua`. |

---

## 7 · See Also

* **Builder & Packages** – how the tables are generated.
* **Lua Utils & lazy.nvim wrapper** – helper library for non‑Nix runtime.
