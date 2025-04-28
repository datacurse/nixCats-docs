---
title: "Builder & Packages"
description: "How the nixCats builder turns your category & package definitions into real Neovim derivations"
---

# Builder & Packages

> **TL;DR**  
> *`categoryDefinitions` says **what can be built**,  
>  `packageDefinitions` says **what to build**,  
>  `utils.baseBuilder` puts the two together and spits out **packages you can `nix run`.***

---

## 1. Two‑layer model

| Layer | Where you write it | Purpose |
|-------|-------------------|---------|
| **Category layer** | `categoryDefinitions = {{…}}` | Declare **reusable buckets** of plugins, LSPs, env‑vars, etc. (nothing is enabled yet!) |
| **Package layer** | `packageDefinitions = {{…}}` | Pick a **set of categories** + tweak settings to produce a runnable *Neovim package*. |

Because the two layers are pure Nix **functions**, you can introspect or override them later – a super‑power when you want several variants of your IDE.

---

## 2. Writing `categoryDefinitions`

```nix
categoryDefinitions = { pkgs, settings, categories, name, mkPlugin, ... }@packageDef: {
  startupPlugins = {
    core = with pkgs.vimPlugins; [ plenary-nvim telescope-nvim ];
    ui   = with pkgs.vimPlugins; [ lualine-nvim catppuccin-nvim ];
  };

  lspsAndRuntimeDeps = {
    web = with pkgs; [ nodejs eslint_d ];
  };

  # … many other sets: sharedLibraries, environmentVariables, wrapperArgs, …
};
```

* Every **top‑level attribute** (`startupPlugins`, `lspsAndRuntimeDeps`, …) corresponds to a **different kind** of dependency handled specially by the builder.  
* Inner attributes (`core`, `ui`, `web`, …) are the **category names** a package can enable with `categories.<name> = true;`.

> **Cheat‑sheet:** need a one‑off plugin? just create a tiny category for it.

---

## 3. Writing `packageDefinitions`

```nix
packageDefinitions = {
  myIDE = { pkgs, ... }: {
    settings = {
      wrapRc  = true;           # ship Lua in /nix/store for reproducibility
      aliases = [ "vi" "nvim" ];
      configDirName = "nixCats";# custom XDG dir
    };

    categories = {
      # enable entire buckets
      core = true;
      ui   = true;
      web  = true;

      # pass arbitrary data to Lua
      colorscheme = "catppuccin-mocha";
    };

    extra = {
      # misc values exposed to Lua as nixCats.extra("…")
      nixdExtras.nixpkgs = ''import ${pkgs.path} {}'';
    };
  };
};
```

*The rule*: **only boolean `true` pulls things in**.  Any other value is treated as data for Lua.

---

## 4. The Builder pipeline

```nix
let
  builder = utils.baseBuilder luaPath {
    inherit nixpkgs system dependencyOverlays;
  } categoryDefinitions packageDefinitions;

  packages = {
    default = builder "myIDE";
    minimal = builder "myIDE-min";
  };
in
  packages
```

Steps performed under the hood:

1. **Resolve `pkgs`** (with your overlays / config).  
2. **Filter each category set** using the booleans from the selected package.  
3. **Deduplicate & order** everything.  
4. **Generate Lua plugin** embedding `settings`, `categories`, `extra`.  
5. **Wrap Neovim** with dependencies, `PATH`, `LD_LIBRARY_PATH`, etc.  
6. Return a **fully‑built derivation** that exposes helpers in `passthru`.

Result: you can `nix run .#myIDE` or add it to `home.packages`.

---

## 5. Multiple outputs for free

Every built package also exposes:

| `pkg.passthru` key | What it is for |
|--------------------|----------------|
| `utils`            | Full `nixCats.utils` set – handy when overriding |
| `homeModule` / `nixosModules` | Pre‑wired modules that install the package |
| `template.*`       | Skeleton dirs you can `nix flake init -t` |

That means **no boiler‑plate** to reuse the same config in NixOS or Home‑Manager.

---

## 6. Pro tips & gotchas

* **Need a dev variant?** Create another `packageDefinitions` entry that reuses the same categories but sets `wrapRc = false;` for live‑editing.  
* **Avoid alias clashes** – two Neovim packages cannot both provide `vi` on `$PATH`.  
* **Order matters** only inside the *same* list; across categories the builder already handles dependency order (e.g. wrapper args before env‑vars).  
* **Override everything** – any `nixCats` package can be tweaked with `.override { name = "…" ; … }`. See the *Overriding* guide.

---

Next stop → **Settings & `wrapRc`**   *(how to control runtime wrapping & paths)*
