---
title: 'Flake Format & Builder API'
description: 'Detailed reference for nixCats flake outputs and the `utils.baseBuilder` function'
---

# Flake Format & Builder API

This page documents the *public* Nix API exposed by **nixCats**:  
how to structure a flake (or plain expression) that builds one or more
Neovim packages, and every argument you can pass to the main builder
function.

> **TL;DR**  
> `utils.baseBuilder` turns:
>
> 1. a **Lua path** (your Neovim config)  
> 2. a **pkgs definition** (or `(nixpkgs, system)` pair)  
> 3. **categoryDefinitions** – *what* can be installed  
> 4. **packageDefinitions** – *which* categories & settings are enabled  
>
> …into a **wrapped Neovim derivation** plus rich `passthru`.

---

## 1. Top‑level skeleton

```nix
# flake.nix (simplified)
{
  description = "My Neovim on nixCats";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.nixCats.url = "github:BirdeeHub/nixCats-nvim";

  outputs = { self, nixpkgs, nixCats, ... }:
  let
    inherit (nixCats.utils) baseBuilder mkAllWithDefault;
    luaPath = ./nvim;           # <- your Lua config root
    systems = [ "x86_64-linux" "aarch64-darwin" ];
  in nixCats.utils.eachSystem systems (system:
    let
      pkgs = import nixpkgs { inherit system; };
      builder = baseBuilder luaPath { inherit pkgs; }
        categoryDefinitions
        packageDefinitions;

      defaultPkg = builder "myNvim";
    in
    {
      packages = mkAllWithDefault defaultPkg;
      devShells.default = pkgs.mkShell { packages = [ defaultPkg ]; };
    });
}
```

---

## 2. `categoryDefinitions`

> *“What **could** be installed if a package enables it”*

```nix
categoryDefinitions = { pkgs, settings, categories, name, mkPlugin, ... }@pkg: {

  startupPlugins = {
    core = with pkgs.vimPlugins; [
      plenary-nvim telescope-nvim
    ];
    ui   = with pkgs.vimPlugins; [
      lualine-nvim catppuccin-nvim
    ];
  };

  lspsAndRuntimeDeps = {
    web = with pkgs; [ nodejs eslint_d ];
    nix = with pkgs; [ nixd nixfmt ];
  };

  environmentVariables = {
    nix = { NIX_CONFIG = "experimental-features nix-command flakes"; };
  };

};
```

* All **eight** top‑level sets (`startupPlugins`, `optionalPlugins`, …)
  behave the same: *any depth* of attribute nesting becomes a “category”
  that can later be toggled from `packageDefinitions`.
* Lists **deduplicate** across categories – it’s safe to list the same
  plugin in multiple places.

---

## 3. `packageDefinitions`

> *“Which categories/settings are ON for *this* Neovim executable”*

```nix
packageDefinitions = {

  myNvim = { pkgs, ... }: {
    settings = {
      wrapRc = true;                 # bundle Lua into /nix/store
      aliases = [ "vim" "nvim" ];    # extra shell entry‑points
    };

    categories = {
      core = true;       # enables startupPlugins.core
      ui   = true;
      nix  = true;
      colorscheme = "catppuccin";
    };

    extra = {
      nixdExtras.nixpkgs = ''import ${pkgs.path} {}'';
    };
  };

  bare = { pkgs, ... }: {
    settings.wrapRc = false;         # live‑edit config in ~/.config
    categories.core = true;
  };

};
```

`settings`, `categories`, and `extra` are **exported verbatim** into the
Lua runtime through the `nixCats()` helper – so you can read any value
from your init.lua:

```lua
-- init.lua
if nixCats('ui') then
  vim.cmd.colorscheme(nixCats('colorscheme') or 'default')
end
```

---

## 4.  `utils.baseBuilder` argument reference

| Parameter | Type | Required | Purpose |
|-----------|------|----------|---------|
| **luaPath** | `path` / `string` | ✓ | Directory to ship as Neovim `$XDG_CONFIG_HOME` (or wrapper script when `wrapRc=true`). |
| **pkgsParams** | `attrs` | ✓ | Either `{ pkgs = ...; }` **or** `{ nixpkgs = <path>; system = "x86_64-linux"; }`. Optional keys:   • `dependencyOverlays` – list   • `extra_pkg_config` – attrset   • `extra_pkg_params` – attrset   • `nixCats_passthru` – attrset |
| **categoryDefinitions** | `function` | ✓ | See §2 |
| **packageDefinitions** | `attrset` | ✓ | See §3 |
| **name** *(when builder is fully applied)* | `string` | ✓ | Key to pick from `packageDefinitions`. |

Return value: a **derivation** with additional `passthru` keys:

* `passthru.utils` – entire utils set (handy for downstream overrides)
* `passthru.out.packages` – map of **every** package in
  `packageDefinitions` (used by `mkAllWithDefault`, overlay helpers,
  Modules, etc.).
* `passthru.homeModule` / `passthru.nixosModules` – pre‑built modules.

---

## 5.  Re‑using or overriding packages

Because every finished derivation keeps the full context in
`passthru`, you can import somebody else’s build **and** mutate it:

```nix
# In another flake
let
  upstream = inputs.nixCatsExample.packages.${system}.default;
  myTweaked = upstream.override {
    name = "myNvim-tweaked";
    dependencyOverlays = upstream.dependencyOverlays ++ [
      (self: super: { myTreesitter = super.callPackage ./grammar.nix {}; })
    ];
  };
in
{
  packages.default = myTweaked;
}
```

See the dedicated **Overriding Existing Packages** guide for a complete
tour.

---

## 6.  Generated helpers (`utils.*`)

Common helpers you’ll see in the templates:

| Helper | What it does |
|--------|--------------|
| `eachSystem` | Light wrapper around `flake-utils.lib.eachSystem`. |
| `mkAllWithDefault pkg` | Builds **all** named packages from the same `packageDefinitions` as `pkg`, with `pkg` set as *default*. |
| `makeOverlays` / friends | Exports your packages as an overlay: `pkgs.myOverlay.<packageName>`. |
| `mergeCatDefs` / `deepmergeCats` | Combine two categoryDefinitions (replace or recursive). |

---

## 7.  When to *not* use the builder

* **Single‑file demo** – use the *flakeless* template (returns a ready
  derivation).
* **Just wrapper script tweaks** – import an existing package and call
  `.override` (no builder needed).
* **Non‑NixOS users needing only Lua utils** – grab the `luaUtils`
  template and ignore Nix altogether.

---

That’s the complete public interface!  
For the Lua runtime side, jump to **“Lua Runtime API”**.

