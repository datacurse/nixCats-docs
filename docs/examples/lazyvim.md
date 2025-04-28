---
title: 'LazyVim Template Walk‑Through'
description: 'Step‑by‑step guide to the LazyVim nixCats template'
---

# LazyVim Template Walk‑Through

> **Goal** – clone the popular **LazyVim** starter, but fully _Nix‑powered_ and ready for hermetic builds, reproducible dev‑shells, and overrides.

---

## TL;DR – spin it up in 20 seconds

```bash
# 1. new empty directory
mkdir my-lazyvim && cd $_

# 2. pull in the template
nix flake init -t github:BirdeeHub/nixCats-nvim#LazyVim

# 3. build & run
nix run .#lazyvim
```

That’s it!  
The command above:

1. grabs the **LazyVim** template files,
2. builds all plugins/LSPs via Nix,
3. drops you into LazyVim with its default key‑maps.

---

## What’s inside?

| Path | Purpose |
|------|---------|
| `flake.nix` | the **nixCats** flake – categories, packages, and builder invocation |
| `templates/LazyVim/` | stock LazyVim Lua config (copied verbatim) |
| `lua/nixCatsUtils/` | *lazy.nvim* wrapper + helper utils |
| `overlays/` | overlay bringing in a few plugins not yet in nixpkgs |
| `nixCatsHelp/` | in‑editor `:help` additions specific to this template |

---

## File tour

### `flake.nix`

```nix
packageDefinitions = {
  lazyvim = { pkgs, ... }: {
    settings = {
      wrapRc  = true;               # packaged Lua lives in store
      aliases = [ "lazyvim" ];      # `nix run .#lazyvim`
    };
    categories = {
      # core LazyVim sets
      lazyvim.core    = true;
      lazyvim.extras  = true;

      # additional nixCats goodies
      neonixdev       = true;       # Nix/Lua LSPs pre‑installed
      colorscheme     = "catppuccin";
    };
  };
};
```

Key call‑outs:

* **Categories** mirror LazyVim’s own module groups – you can toggle pieces without editing Lua.
* `neonixdev` drops in *nixd*, *lua‑ls*, and extra Tree‑sitter grammars so Nix/Lua files get full IDE support out‑of‑the‑box.
* The template uses the **lazy.nvim wrapper** from `nixCatsUtils.lazyCat` to prevent `lazy` from re‑downloading plugins already provided by Nix.

### `lua/lazy-setup.lua`

The wrapper:

```lua
require('nixCatsUtils.lazyCat').setup(
  nixCats.pawsible({'allPlugins'}), -- plugin list coming from Nix
  {
    install = { colorscheme = { nixCats('colorscheme') } },
    ui      = { border = 'rounded' },
  }
)
```

– *If* `nixCatsUtils.isNixCats` is **false** (e.g. you copied the repo to a non‑Nix machine) the same file falls back to a vanilla Internet download so the config still works.

---

## Extending the template

1. **Add a plugin**  
   ```nix
   startupPlugins.extraTools = with pkgs.vimPlugins; [ todo-comments-nvim ];
   ```
   then set `extraTools = true` in `categories`.

2. **Swap theme on the fly**  
   ```lua
   vim.cmd('colorscheme ' .. nixCats('colorscheme'))
   ```
   change the value in `categories.colorscheme` and rebuild.

3. **Create a “minimal” version**  
   Duplicate the packageDefinition, toggle off heavy categories, and give it an alias like `lazyvim-mini`.

---

## Common tweaks

| Need | Where to change |
|------|-----------------|
| Mapleader, options | `templates/LazyVim/lua/config/options.lua` |
| Extra Treesitter grammars | `categoryDefinitions.lspsAndRuntimeDeps.treesitter` |
| Disable Mason entirely | ensure `mason = false` category + remove Mason Lua calls |
| Live‑reload Lua | set `wrapRc = false` and rebuild once (then edits are instant) |

---

## Troubleshooting

<details>
<summary><code>E5108: Error executing lua … lazy.nvim cache</code></summary>

Delete the cache dir (`~/.local/share/nvim/*lazy*`) **or** bump the
`configDirName` setting so the wrapped & un‑wrapped configs use separate paths.
</details>

<details>
<summary>Nix build fails on <code>nvim-treesitter</code> grammar compile</summary>

Ensure your system has a C compiler in `lspsAndRuntimeDeps`. Add `pkgs.gcc` to the category.
</details>

---

## Next steps

* **Read** the annotated source – each Lua file is peppered with `NOTE: nixCats:` comments explaining template‑specific hacks.
* **Compare** with the [Kickstart‑nvim walk‑through](./kickstart-nvim) to see a different lazy‑loading approach.
* **Override** this template inside another flake if you want to keep upstream updates – see the [Overriding Guide](../guides/overriding).
