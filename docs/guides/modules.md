---
title: 'Modules (NixOS / Home Manager / nix-darwin)'
description: 'Use nixCats through declarative modules—enable, pick package names, export for nix run'
---

# nixCats Modules Guide  
*—integrating Neovim via NixOS / Home Manager / nix‑darwin*

> **TL;DR**  
> - Import the module, set `enable = true`, choose `packageNames`  
> - Rebuild your system; the packages are built, wrapped, and on `$PATH`  
> - Grab ready‑made packages for `nix run` from `config.<ns>.out.packages`  

## 1  Why modules?
| Method | When to choose |
|--------|----------------|
| **Modules** | You already manage your machine declaratively (NixOS, HM, Darwin) and want the editor to follow the same mechanism. |
| Flake package | You need a portable *nix run* command or CI job without touching the system config. |
| Override‑only | You consumed someone else’s nixCats package and just want a quick tweak. |

Modules let you treat Neovim like any other *programs.\** option: enable once and forget about plumbing, while still getting all the feature flags, overrides and multi‑package power that nixCats offers.

## 2  Prerequisites
* **System manager** Already running NixOS, Home Manager, or nix‑darwin.  
* **nixpkgs ≥ unstable 2024‑05** (or compatible channel).  
* **flake‑enabled** Nix is assumed throughout.

## 3  Getting the module
1. **Add nixCats to inputs**

   ```nix
   # flake.nix
   inputs.nixCats.url = "github:BirdeeHub/nixCats-nvim";
   ```

2. **Import the helper** in your `outputs`:

   ```nix
   outputs = { self, nixpkgs, nixCats, ... }@inputs:
   let
     inherit (nixpkgs.lib) nixosSystem;
   in
   {
     nixosConfigurations."laptop" = nixosSystem {
       # …
       modules = [
         # <–– the line that matters
         nixCats.outputs.nixosModules.default
       ];
     };
   };
   ```

   *Replace the call site with `homeConfigurations` or `darwinConfigurations` for HM / Darwin.*

## 4  Module options — the 30‑second tour
(Full typedoc lives in the API Reference.)

| Option | Type | Purpose | Typical use |
|--------|------|---------|-------------|
| `<ns>.enable` | `bool` | Turn the module on. | `true` |
| `<ns>.packageNames` | `list str` | Which packages from your *packageDefinitions* to install. | `[ "nixCats" ]` |
| `<ns>.packageDefinitions.{merge,replace}` | `attrset` | Extend/override individual package recipes. | Add `aliases = [ "vim" ]` |
| `<ns>.categoryDefinitions.merge` | `func` | Inject extra categories into **every** package & rebuild it. | Add a corporate LSP proxy |
| `<ns>.addOverlays` | `list overlay` | Extra overlays visible *only* to editor builds. | Pin nightly Neovim |

**Per‑user** settings live under `<ns>.users.<name>.*` (NixOS / Darwin only) and mirror the same schema.

## 5  Example – minimal Home Manager setup

```nix
{ config, pkgs, lib, ... }:
let
  nixCatsNS = "nixCats";  # whatever defaultPackageName was
in {
  imports = [ inputs.nixCats.outputs.homeModule ];

  nixCats.enable = true;
  nixCats.packageNames = [ "nixCats" "unwrappedCats" ];

  # Optional tweaks
  nixCats.packageDefinitions.merge.nixCats = { pkgs, ... }: {
    settings.aliases = [ "vi" ];
    categories.colorscheme = "catppuccin";
  };
}
```

Rebuild with `home-manager switch`. You now have **`nixCats`** and **`unwrappedCats`** binaries in `~/.nix-profile/bin`.

## 6  Export packages for `nix run`
Need the same build in CI or another host? Everything the module builds is exposed read‑only:

```nix
# Export the wrapped package for every CPU
packages = nixCats.packages;
# or just one
packages.x86_64-linux.default =
  self.homeConfigurations."work".config.nixCats.out.packages.nixCats;
```

Push your flake and anyone can do:

```bash
nix run github:you/flake#nixCats
```

## 7  Common pitfalls
1. **Binary name collisions** – Every alias ends up in `$PATH`; make sure they’re unique across *all* Neovim derivations for that user.  
2. **Stale Lua when `wrapRc = true`** – Don’t forget `git add` before `nixos-rebuild` or `hm switch`.  
3. **Mixing `pkgs`** – Modules inherit the system `pkgs` by default, but you can point to a different channel via `<ns>.nixpkgs_version`.  

## 8  Need to go deeper?
* Full option reference: see [Home Manager](../api/hm-options) / [NixOS](../api/nixos-options) pages.  
* Recipe‑level overrides: head over to the [Overriding Packages](./overriding) guide.  
* Questions? Drop by the 📚 [Discussions](https://github.com/BirdeeHub/nixCats-nvim/discussions).

---

© 2025 BirdeeHub • Docs licensed CC‑BY‑SA
