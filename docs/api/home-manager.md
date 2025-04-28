---
title: 'nixCats Home‑Manager Module Options'
description: 'Reference for configuring nixCats through Home‑Manager'
---

# nixCats Home‑Manager Module Options

> **Scope** – This page documents the options exported by  
> `utils.mkHomeModules` so you can control your Neovim packages entirely
> from your `home-manager` configuration.  
> If you are using the NixOS / nix‑darwin module instead, jump to the
> **System‑wide Module Options** page.

---

## 1  Enabling the Module

Add the module (usually `inputs.nixCats.homeModule`) to your
`home-manager.users.<name>.imports` list and switch on the root option:

```nix
{
  programs.nixCats.enable = true;   # or whatever namespace you chose
}
```

- The top‑level attribute path is defined by the
  `moduleNamespace` argument you passed to `utils.mkHomeModules`
  (defaults to the package’s *default name*).

---

## 2  Quick Cheat‑Sheet

| Option | Type | Default | Purpose |
|--------|------|---------|---------|
| `enable` | `bool` | `false` | Turn the module on/off |
| `packageNames` | `list str` | `[]` | Which packages from `packageDefinitions` to build & install |
| `packageDefinitions`. `merge / replace` | *attrset* | `null` | Add/override package definitions |
| `categoryDefinitions`. `merge / replace` | *function* | `null` | Add/override category trees |
| `addOverlays` | `list overlay` | `[]` | Extra overlays visible **only** inside nixCats builds |
| `dontInstall` | `bool` | `false` | Build packages but don’t put them in `home.packages` |
| `luaPath` | `path / str` | `""` | Custom path packed as *runtime* when `wrapRc = true` |
| `nixpkgs_version` | *input / path* | _system default_ | Pin a different `nixpkgs` for these packages |
| `out.packages` | _(read‑only)_ | — | Resulting packages you can reference elsewhere |
| `utils` | _(read‑only)_ | — | The full `nixCats.utils` set |

---

## 3  Merging Strategies

Several groups (`packageDefinitions` and `categoryDefinitions`) are offered
in **both** `merge` and `replace` flavours:

- **merge** → deep merge with the previous value  
  (uses `utils.deepmergeCats` & keeps existing lists)
- **replace** → shallow merge / *last writer wins*  
  (uses `utils.mergeCatDefs`)

> **Tip** – the strategy for *existing* data inherited from the
> imported package is selected by  
> `packageDefinitions.existing` / `categoryDefinitions.existing`
> with values **"replace"**, **"merge"** or **"discard"**.

---

## 4  Typical Patterns

### 4.1  Install a single ready‑made package

```nix
{
  programs.nixCats = {
    enable = true;
    packageNames = [ "nixCats" ];  # Name from the upstream flake
  };
}
```

### 4.2  Add a small tweak (merge)

```nix
# enable ›‹ wrapRc = false for faster Lua editing
programs.nixCats.packageDefinitions.merge.nixCats = { ... }: {
  settings.wrapRc = false;
};
```

### 4.3  Full replacement

```nix
programs.nixCats.packageDefinitions.replace = {
  # completely new definition set
  lite = { pkgs, ... }: {
    settings.aliases = [ "vi" ];
    categories.general = true;
  };
};
programs.nixCats.packageNames = [ "lite" ];
```

### 4.4  Adding private overlays

```nix
programs.nixCats.addOverlays = [
  (self: super: {
    nvimPlugins.myFork =
      super.vimPlugins.somePlugin.overrideAttrs (_: { pname = "myFork"; });
  })
];
```

---

## 5  Referencing the Built Packages

Even when `dontInstall = true` you can grab the artefacts for scripts,
desktop files, or other flakes:

```nix
let
  myNvim = config.programs.nixCats.out.packages."lite";
in
{
  home.sessionVariables.EDITOR = "${myNvim}/bin/lite";
}
```

---

## 6  Troubleshooting

| Symptom | Likely Cause / Fix |
|---------|-------------------|
| **“collision between ‘nvim’ and ‘myNvim’”** | Two packages share an alias. Check every `aliases` list across all users |
| Package never shows up in `home.packages` | Did you forget `packageNames` **or** set `dontInstall = true`? |
| Build fails fetching a plugin | Add/patch an overlay or pin the repo with `flake.inputs."plugins‑..."` |

---

## 7  Complete Option Table

Below is the exhaustive list auto‑generated from the original help files.

| Option Path | Type | Default | Description |
|-------------|------|---------|-------------|
| `enable` | `bool` | `false` | Enable the module |
| `packageNames` | `list str` | `[]` | Packages from `packageDefinitions` to install |
| `packageDefinitions.existing` | `"replace" \| "merge" \| "discard"` | `"replace"` | Strategy for upstream defs |
| `packageDefinitions.merge` | *attrset (function)* | `null` | Deep‑merge new package defs |
| `packageDefinitions.replace` | *attrset (function)* | `null` | Shallow replace package defs |
| `categoryDefinitions.existing` | `"replace" \| "merge" \| "discard"` | `"replace"` | Strategy for upstream cats |
| `categoryDefinitions.merge` | *function* | `null` | Deep‑merge category tree |
| `categoryDefinitions.replace` | *function* | `null` | Shallow replace category tree |
| `addOverlays` | `list overlay` | `[]` | Extra overlays just for nixCats builds |
| `dontInstall` | `bool` | `false` | Don’t add packages to `home.packages` |
| `luaPath` | `path / str` | `""` | Custom runtime config path (store) |
| `nixpkgs_version` | *input / path* | `null` | Override nixpkgs source |
| `out.packages` | `attrset` (ro) | — | Finished packages |
| `utils` | `attrset` (ro) | — | Helper library |

---

## 8  Further Reading

- **System‑wide Module Options** – NixOS & nix‑darwin
- **Builder & Packages** – How nixCats constructs each derivation
- **Overriding Existing Packages** – Zero‑duplicate customization
