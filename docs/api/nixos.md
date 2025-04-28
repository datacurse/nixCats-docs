---
title: "Module Options — NixOS & nix-darwin"
description: "Reference for all nixCats options exposed through the NixOS and nix‑darwin modules."
---

# nixCats — NixOS & nix‑darwin Module Options

> **Scope** These options are created by  
> `utils.mkNixosModules` (and therefore also the *nix‑darwin* variant).  
> They sit at whatever attribute path you supplied as `moduleNamespace`
> – by default `<defaultPackageName>`.

## 1. Quick overview

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| **`<pkg>.enable`** | `bool` | `false` | Turn the module on/off |
| **`<pkg>.packageNames`** | `list(str)` | `[]` | Which packages from *packageDefinitions* to build / install |
| **`<pkg>.packageDefinitions.*`** | `attrset` | – | Merge/replace/extend existing *packageDefinitions* |
| **`<pkg>.categoryDefinitions.*`** | `function` | – | Merge/replace/extend *categoryDefinitions* |
| **`<pkg>.addOverlays`** | `list(overlay)` | `[]` | Extra overlays *visible only* to nixCats builds |
| **`<pkg>.luaPath`** | `path / str` | `""` | Where to source Lua config from |
| **`<pkg>.nixpkgs_version`** | `input / path / null` | `null` | Override the nixpkgs rev used *for this module* |
| **`<pkg>.dontInstall`** | `bool` | `false` | Build packages but **don’t** add them to `environment.systemPackages` |

All other fields are identical to the [Home‑Manager module](./home-manager-options), so
they’re omitted here for brevity.

---

## 2. Per‑user sub‑module `<pkg>.users.<name>`

Most options above are duplicated under `users.<name>` so you can give every user
a different Neovim.

```nix
{
  programs.nixCats.users.alice = {
    enable = true;
    packageNames = [ "work" ];
    luaPath = ./alice-config;
  };

  programs.nixCats.users.bob = {
    enable = true;
    packageDefinitions.merge = {
      minimal = { pkgs, ... }: {
        settings.wrapRc = false;
        categories.colorscheme = "onedark";
      };
    };
  };
}
```

Resulting packages are exported for later use at

```nix
config.<pkg>.out.users.<name>.packages.<packageName>
```

— handy when you need the absolute store path, e.g. for `$EDITOR`.

---

## 3. Grabbing the finished package

Inside **your** system flake you can export (or run) the package built by the
module like so:

```nix
# flake.nix (top level)
outputs = { self, nixpkgs, ... }@inputs:
let
  system = "x86_64-linux";
  pkgs   = import nixpkgs { inherit system; };
  nvim   =
    self.nixosConfigurations.myHost.config.nixCats.out.users.alice.packages.work;
in
{
  packages.${system}.nvim-alice = nvim;
}
```

Now `nix run .#nvim-alice` just works everywhere.

---

## 4. Complete option list

Below is the authoritative JSON‑style schema (≈ `nixos-option --json`) collapsed
for readability. Every field supports Nix’s usual `_module.args` /
`options` machinery.

```text
< ${pkg} >:
  enable :: bool
  packageNames :: list(str)
  packageDefinitions:
    existing :: "replace" | "merge" | "discard"
    merge    :: attrset (functions)
    replace  :: attrset (functions)
  categoryDefinitions:
    existing :: "replace" | "merge" | "discard"
    merge    :: function
    replace  :: function
  addOverlays :: list(overlay)
  luaPath :: path | str
  nixpkgs_version :: input | path | null
  dontInstall :: bool
  users:
    <name>:
      … (same fields as top‑level) …
```

Use `nixos-option` or `home-manager options` to inspect the generated values
after enabling the module.

---

## 5. Minimal example

```nix
{ inputs, ... }:
{
  imports = [
    inputs.nixCats.nixosModules.default
  ];

  programs.nixCats = {
    enable = true;
    packageNames = [ "default" ];
    packageDefinitions.merge = {
      default = { pkgs, ... }: {
        settings.aliases = [ "vim" ];
        categories.general = true;
      };
    };
  };
}
```

That’s all – rebuild your system and launch **`vim`**!
