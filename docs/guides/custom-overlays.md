---
title: "Custom Overlays & Third‑Party Plugins"
description: "How to pull in anything that isn’t already packaged – from one‑off plugins to full overlays."
---

# Custom Overlays & Plugins

Need a plugin that isn’t on **nixpkgs** yet?  
Want to patch—or pin—a dependency without waiting for upstream?  
`nixCats` lets you bolt extra overlays onto the *build‑only* `pkgs`
used for Neovim without touching your global system.

---

## 1 · Overlay Basics

| Where? | Why? | Common cases |
|--------|------|--------------|
| **`dependencyOverlays`** list ` (overrides only Neovim’s pkgs)` | Tailor the compiler set, patch a plugin, add a one‑off derivation. | • Private forks • Nightly treesitter grammars • Pre‑release language servers |
| **System overlays** (via `inputs.nixpkgs.overlays` etc.) | Share packages beyond Neovim—system‑wide or HM‑wide. | • Custom kernel • Company‑wide overlays |

> **Tip**  Because `nixCats` evaluates its own *private* `pkgs`
> you can safely experiment with overlays here without risking system rebuilds.

---

## 2 · One‑Shot Plugins with _standardPluginOverlay_

The fastest way to import plain GitHub plugins that need **no build
step**:

```nix
# flake.nix
inputs."plugins-foobar" = {
  url   = "github:example/foobar.nvim";
  flake = false;    # it’s just a git repo
};

outputs = { self, nixpkgs, ... }@inputs:
let
  dependencyOverlays = [
    (inputs.nixCats.utils.standardPluginOverlay inputs)
  ];
in ...
```

- Everything matching the prefix `plugins-*` is transformed into
  `pkgs.neovimPlugins.foobar`.
- Use it like any other derivation inside `categoryDefinitions`:

```nix
startupPlugins.general = with pkgs.vimPlugins; [
  foobar
  telescope-nvim
];
```

### Dots in names? Use _sanitizedPluginOverlay_

Some plugins are named `foo.bar.nvim`.  
`sanitizedPluginOverlay` converts dots → dashes for the package filename
while **preserving the original** for `packadd`.

---

## 3 · Custom Builds: `customBuildsOverlay.nix`

Need a **build phase** (TypeScript → JS, `make`, etc.)?

1.  Create `overlays/customBuildsOverlay.nix` from the template  
    (`nix flake init -t nixCats-nvim#overlayFile`).

2.  Define your derivation there:

```nix
# overlays/customBuildsOverlay.nix
importName: inputs:
self: super: {
  ${importName} = rec {
    my-tree-sitter-xyz = pkgs.tree-sitter.buildGrammar {
      name = "tree-sitter-xyz";
      src  = /* … */;
    };
  };
}
```

3.  Enable it in `dependencyOverlays`:

```nix
dependencyOverlays = [
  (import ./overlays { inherit inputs; })
];
```

4.  Reference `pkgs.${importName}.my-tree-sitter-xyz` inside
   your categories.

---

## 4 · Pinning / Patching Existing Packages

Because overlays sit **before** nixpkgs in the lookup chain,
you can straight‑up override a package:

```nix
# Pull in a specific commit of nvim‑dap
dependencyOverlays = [
  (self: super: {
    vimPlugins.nvim-dap = super.vimPlugins.nvim-dap.overrideAttrs (_: {
      src = inputs.nvim-dap-src;
    });
  })
];
```

Swap commits, apply patches, add compiler flags—the choice is yours.

---

## 5 · Debugging Tips

| Command | What it shows |
|---------|---------------|
| `:NixCats pawsible plugins start` | Final plugin filenames → handy when `packadd` fails |
| `nix repl` → `outputs.packages.${system}.default` | Inspect resulting derivations & their deps |
| `nix log /nix/store/…-myplugin.drv` | Build logs for failed custom plugins |

---

## Reference Cheatsheet

```nix
# Quick overlay skeleton -------------------------------------
self: super: {
  # 1. Override existing
  inherit (super) pkgs;
  vimPlugins.some-plugin = super.vimPlugins.some-plugin.overrideAttrs { … };

  # 2. Add brand‑new derivation
  myNamespace.foo = pkgs.stdenv.mkDerivation { … };
}
```

- **Docs**: `:help nixCats.flake.nixperts.overlays` inside Neovim  
- **Template**: `nix flake init -t nixCats-nvim#overlayHub`
