---
title: "LSP & Mason Integration"
description: "Configure language‑servers with nixCats and keep Mason as an optional fallback."
---

# LSP & Mason Integration

:::info TL;DR  
* **Prefer Nix** – declare LSP binaries in `lspsAndRuntimeDeps`.  
* **Call `lspconfig` as usual** – packages appear on `$PATH`.  
* **Keep Mason as a fallback** – only runs when Neovim was *not* launched by nixCats (handy for non‑Nix machines).  
:::

---

## 1. Declare LSP binaries in Nix

Add every language‑server (or other CLI tool such as *ctags* or *debug adapters*) to the `lspsAndRuntimeDeps` set inside **`categoryDefinitions`**.

```nix
lspsAndRuntimeDeps = {
  web = with pkgs; [ nodePackages.typescript-language-server prettierd ];
  go  = with pkgs; [ gopls delve ];
  nix = with pkgs; [ nixd nil nixfmt ];
};
```

Enable the categories you need in the package definition:

```nix
packageDefinitions = {
  myNvim = { pkgs, ... }: {
    categories = {
      web = true;
      go  = true;
      nix = true;
    };
  };
};
```

> At runtime every tool is **prepended** (or suffixed – see `settings.suffix-path`) to `$PATH` so `:!gopls --version` works exactly as if you installed it manually.

---

## 2. Configure language‑servers in Lua

Nothing changes compared to vanilla Neovim.  
Just `require("lspconfig").<server>.setup { … }`.

```lua
-- Enable only when the category is present:
if nixCats("go") then
  require("lspconfig").gopls.setup {}
end
```

### Optional helper

The [Lua Utils template](./lua-utils) ships a small helper to reduce boilerplate:

```lua
local isCat = require("nixCatsUtils").enableForCategory
if isCat("nix") then
  require("lspconfig").nixd.setup {}
end
```

---

## 3. Making Mason a *portable* fallback 🧳

Mason excels at on‑demand downloads, but that breaks Nix purity and **fails on NixOS**.  
The snippet below mirrors the behaviour used in the `kickstart‑nvim` template:

```lua
local servers = {}

if require("nixCatsUtils").isNixCats then
  -- Launched *via Nix*: skip Mason, LSPs already on PATH
  servers.lua_ls = {}
  servers.gopls  = {}
else
  -- Fallback for Git‑cloned config outside Nix
  servers.lua_ls = {}
  servers.gopls  = {}
end

-- Common setup (with nvim-cmp capabilities etc.)
local caps = require("cmp_nvim_lsp").default_capabilities()

for name, cfg in pairs(servers) do
  require("lspconfig")[name].setup(vim.tbl_deep_extend(
    "force",
    { capabilities = caps },
    cfg
  ))
end
```

### Key points 🔑  
| When | Behaviour |
|------|-----------|
| **nixCats** run | All servers compiled into the wrapper; Mason *skipped*. |
| **Vanilla** run | Mason installs what’s missing, then `lspconfig` starts them. |

---

## 4. Debugging

* `:echo $PATH` inside *nixCats* nvim – should show store paths of every LSP.  
* `:checkhealth` – confirms each provider.  
* Set `nixCats('lspDebugMode') = true` in your package to enable verbose LSP logs.

---

## 5. Cheat‑sheet

| Action | Where |
|--------|-------|
| Add **new LSP** | `lspsAndRuntimeDeps.<cat>` + enable category |
| Temporarily disable Mason | `local ok, _ = pcall(require, "nixCatsUtils"); if ok and _.isNixCats then return end` |
| Use non‑standard binary | Override in Lua: `cmd = { "/custom/bin", "--stdio" }` |

---

Enjoy language‑server power ✨ **without** losing Nix purity!

