---
title: 'Overriding Existing Packages'
description: 'How to tweak or extend a nixCats Neovim package without forking it'
---

# Overriding Existing Packages

The **override** / **overrideNixCats** hooks let you take **any** nixCats‑built
derivation that you already have (from a template, a friend’s repo, or the
upstream examples) and _surgically_ change bits of it — without copy‑pasting the
whole flake.

> **Why override?**  
> * keep upstream template in‑sync – no hard forks  
> * share one base config, build different variants (Dev, Minimal, CI, …)  
> * patch in extra overlays, categories, or settings only in specific places  

---

## 1. Grab the original package

```nix
# in your flake.nix / shell.nix / devShell
inputs = {
  nixCats.url = "github:BirdeeHub/nixCats-nvim?dir=templates/example";
  nixpkgs.url = "github:nixos/nixpkgs/nixpkgs-unstable";
};

outputs = { self, nixpkgs, nixCats, ... }:
let
  base = nixCats.packages.${nixpkgs.system}.default;
in
{
  # … we’ll override `base` in the next step …
}
```

*`base` already contains:*  

* `luaPath`, `pkgs`, `system`, overlays, category & package definitions, **plus**  
  a ready‑to‑run Neovim wrapper inside `base/bin/<name>`.

---

## 2. Apply overrides

### 2.1  Change only the **package name**

```nix
regularCats = base.override {
  name = "regularCats";   # must exist in `packageDefinitions`
};
```

### 2.2  Add **extra overlays**

```nix
withOverlays = base.override (prev: {
  dependencyOverlays = prev.dependencyOverlays ++ [
    (prev.utils.standardPluginOverlay inputs)
    inputs.myOverlay.overlays.default
  ];
});
```

### 2.3  Inject **new categories / plugins**

```nix
withExtraCats = withOverlays.override (prev: {
  categoryDefinitions = prev.utils.mergeCatDefs prev.categoryDefinitions
    ({ pkgs, ... }@pkg:
      {
        startupPlugins.newcat = with pkgs.vimPlugins; [ lze ];
      });
});
```

### 2.4  Create an **extra package** that enables them

```nix
final = withExtraCats.override (prev: {
  name = "newvim";   # ← new output package
  packageDefinitions = prev.packageDefinitions // {
    newvim = prev.utils.mergeCatDefs prev.packageDefinitions.nixCats
      ({ pkgs, ... }: {
        categories = {
          newcat = true;
          # keep the old ones we merged in
        };
        settings.aliases = [ "nvi" ];
      });
  };
});
```

Result: you now have **`final/bin/newvim`** (plus `nvi` alias) that contains
_all_ of the upstream example _plus_ the additional `newcat` plugins.

---

## 3. When to chain vs. merge

* Small tweaks → _do everything in one_ `override { ... }`.
* Pedagogical / reusable docs → split like above so each step is clear.
* Remember: each `override` receives **`prev`** – the result so far.

---

## 4. Common recipes

| Goal                            | Snippet / Tip |
|--------------------------------|---------------|
| Swap Neovim channel            | `prev.nvimSRC = inputs.neovim-nightly` |
| Layer debug build over release | `settings.wrapRc = false` in new package |
| Different LSP set per project  | enable / disable `categories.<lspGroup>` |
| Patch one plugin build flag    | `overlay = self: super: { <drv>.overrideAttrs ... }` and append overlay |

---

## 5. Cheat‑sheet

```nix
# quick template
myPkg = base.override (prev: {
  name = "myPkg";
  dependencyOverlays = prev.dependencyOverlays ++ [ myOverlay ];
  categoryDefinitions = prev.utils.mergeCatDefs prev.categoryDefinitions
    (import ./cats.nix);
  packageDefinitions  = prev.packageDefinitions // (import ./pkgDefs.nix);
});
```

* **`.override` vs `.overrideNixCats`** – identical, second one can’t be hidden
  by `callPackage`.
* You can override _any_ top‑level attribute that the `baseBuilder` accepted.
* Never touch `passthru.utils` – use the helper fns inside it.

---

## 6. Next steps

* Open Neovim & run `:NixCats cats` to verify your new categories.  
* Commit your tiny override flake – upstream updates won’t break it.  
* Read the full reference: `:help nixCats.overriding`.

