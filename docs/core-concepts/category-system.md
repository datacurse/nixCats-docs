---
title: "Category System"
description: "Understand how nixCats organises plugins, LSPs and every other dependency into reusable *categories*."
---

# Category System

*“Pick once in Nix, reuse everywhere in Lua.”*  
The **category system** is the core abstraction that lets nixCats bundle **all kinds of dependencies** (plugins, LSPs, shell tools, env‑vars, wrapper flags …) into **named groups** that you can:

* turn **on/off per Neovim package**
* query from Lua with `nixCats('some.category')`
* evolve without ever touching your existing `init.lua`

---

## 1. Why categories?

| Pain without | How categories fix it |
|--------------|-----------------------|
| Hard‑coded plugin lists and `$PATH` tweaks duplicated across machines | Put them **once** in `categoryDefinitions`, reuse in every package |
| Implicit mess of *“did I install ripgrep?”* | `if nixCats('search.ripgrep') then …` – explicit & typed |
| Separate configs for “lightweight”, “full dev”, “embedded” … | Enable/disable **boolean flags** instead of copying files |

---

## 2. Anatomy of a category

```nix
categoryDefinitions = { pkgs, settings, categories, ... }@packageDef: {

  ## 2.1 Where the dependency _lives_
  startupPlugins.general = with pkgs.vimPlugins; [
    telescope-nvim
    nvim-treesitter.withAllGrammars
  ];

  lspsAndRuntimeDeps.go = with pkgs; [ gopls go-tools ];

  environmentVariables.colorschemes = {
    NVIM_COLOR_DIR = "/etc/nvim-colors";
  };

  ## 2.2 Optional meta – Lua to execute if the category is active
  optionalLuaAdditions.colorschemes = [
    /*lua*/ "vim.opt.termguicolors = true"
  ];
}
```

Each **top‑level set** below can contain *any tree of categories* (nest as deep as you like):

| Set name | What goes inside | Example |
|----------|-----------------|---------|
| `startupPlugins` | always‑on plugins | `telescope-nvim` |
| `optionalPlugins` | `packadd`‑style lazy plugins | `nvim-dap` |
| `lspsAndRuntimeDeps` | LSP servers, CLI tools | `gopls`, `ripgrep` |
| `sharedLibraries` | `.so`/`.dylib` at run‑time | `libgit2` |
| `environmentVariables` | key/value env vars | `PATH`, `NVIM_COLOR_DIR` |
| `wrapperArgs` / `extraWrapperArgs` | arguments for `makeWrapper` | `["--set" "FOO" "bar"]` |
| `extraLuaPackages` | packages for LuaRocks / Fennel etc. | `(lp: [ lp.magick ])` |
| `optionalLuaPreInit` | Lua **before** `init.lua` | `require("impatient")` |
| `optionalLuaAdditions` | Lua **after** `init.lua` | `vim.cmd.colorscheme "catppuccin"` |
| `bashBeforeWrapper` | raw Bash in wrapper | `export SSL_CERT_FILE=…` |
| `propagatedBuildInputs` | **build‑time** deps | `clang` |
| `extraCats` | *meta* – enable other cats | see §4 |

---

## 3. Picking categories inside a package

```nix
packageDefinitions = {
  myNvim = { pkgs, ... }: {
    settings.wrapRc = true;
    categories = {
      # Boolean -> include whole sub‑tree
      general = true;

      # Nested picks
      debug.go = true;

      # Pass values (not just booleans!)
      colorscheme = "onedark";

      # Turn things _off_
      lazy = false;
    };
  };
};
```

### 3.1 Nested rules

* **Implicit inclusion** – if a parent list contains *non‑attributes* (plugins, derivations…) those follow the sub‑category automatically.
* **Explicit inclusion** – once you set *any* attribute of a subcategory, you must opt‑in the rest (`true`) if you still want them.

### 3.2 `extraCats` – declarative defaults

Want `debug.default` **whenever** a `debug.*` sub‑category is enabled?

```nix
extraCats = {
  debug = [ [ "debug" "default" ] ];
};
```

The target path (right) is turned on when **any** source category (left) becomes active – great for “baseline” plugins.

---

## 4. Using categories from Lua

```lua
-- Plain boolean
if nixCats('debug.go') then
  require('dap-go').setup()
end

-- Value lookup (colorscheme)
vim.cmd.colorscheme(nixCats('colorscheme') or 'default')

-- Safer table access
local cfg_dir = nixCats.settings('configDirName')
```

Behind the scenes the builder writes a small `lua/nixCats.lua` file that exports three helper tables & getters:

| Name | What it holds |
|------|---------------|
| `nixCats.cats` | **Categories** chosen in this package |
| `nixCats.settings` | The *settings* attr‑set |
| `nixCats.extra` | The *extra* attr‑set |

Each one doubles as a **function** that accepts an attribute‑path (`"a.b.c"` or `{'a','b','c'}`) and returns the value with nil‑safety.

---

## 5. Cheat‑sheet

```text
# Add a new category
startupPlugins.my.ui = with pkgs.vimPlugins; [ nvim-tree ];

# Enable it in a package
categories.my.ui = true;

# Query it in Lua
if nixCats('my.ui') then … end
```

| Task | Nix side | Lua side |
|------|----------|----------|
| Check if enabled | `categories.foo = true` | `nixCats('foo')` |
| Read a value | `colorscheme = "catppuccin"` | `nixCats('colorscheme')` |
| Provide defaults | `extraCats.defaults = [ ["foo"] ]` | not needed |
| Access settings | `settings.wrapRc = false` | `nixCats.settings('wrapRc')` |

---

## 6. Best practices

* **Keep names short & thematic** (`git`, `ui`, `rust.debug`)
* Reserve **singular cats for booleans**, use *values* for data (`colorscheme`)
* Put *tools* (ripgrep, tree‑sitter CLI…) in `lspsAndRuntimeDeps`, not `sharedLibraries`
* Use `optionalPlugins` for plugins that *must* be `packadd`‑ed after launch
* Set defaults via `extraCats` instead of manual duplication

Happy categorising! 󰄛
