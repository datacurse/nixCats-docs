---
title: 'Settings & wrapRc'
description: 'Understand nixCats package-level settings and the wrapRc live‑reload switch'
---

# Settings & `wrapRc`

nixCats lets every **Neovim package** carry its own tiny config object called
`settings`.  
Most keys are optional – you only specify the ones you actually need – and they
tweak how the builder wraps, names and installs the final `nvim` executable.

| Key | Type | Default | Why you might change it |
|-----|------|---------|-------------------------|
| `aliases` | list\<str> or `null` | `null` | Extra symlinks placed next to the main binary. <br/>Make `vi`, `vim`, or `editor` point to your package. |
| `extraName` | str | `""` | Cosmetic suffix visible in the *Nix store* – useful when comparing derivations. |
| `wrapRc` | **bool \| str** | `true` | **Live‑reload switch.** <br/>`true` ⇒ config is copied into the store and the launcher is wrapped; <br/>`false` ⇒ launcher reads files from your checkout; <br/>`"ENV_VAR"` ⇒ dynamic: wrapped unless that env‑var is set at runtime. |
| `configDirName` | str | `"nvim"` | Folder name inside `~/.config`, `~/.local/share`, … <br/>Great for trying multiple configs side‑by‑side. |
| `unwrappedCfgPath` | str \| `null` | `null` | Absolute path to use **only when** `wrapRc = false`; helpful if your repo lives outside `~/.config`. |
| `neovim-unwrapped` | derivation \| `null` | `null` | Pin to a specific `neovim` build without recompiling it yourself. |
| `nvimSRC` | derivation \| `null` | `null` | Point at an *arbitrary* source tree; forces a compile from source. |
| `suffix-path` / `suffix-LD` | bool | `true` | If `true`, nixCats appends its extras to `$PATH` / `$LD_LIBRARY_PATH` instead of prepending. |
| `autowrapRuntimeDeps` | `"suffix"` \| `"prefix"` \| `false` | `"suffix"` | Whether to expose plugin runtimeDeps on the PATH. |
| `autoconfigure` | `"prefix"` \| `"suffix"` \| `false` | `"prefix"` | Whether to run compatibility Lua shipped by nixpkgs plugins. |
| `collate_grammars` | bool | `true` | Merge all Tree‑sitter grammars into one directory for faster start‑up. |
| `autoPluginDeps` | bool | `true` | Pull in recursive plugin dependencies from nixpkgs. |
| `moduleNamespace` | list\<str> | `[ <packageName> ]` | Where the module options will live if you export nixCats as a NixOS/HM module. |

> **Tip**    
> A single change in `settings` rebuilds *only* the wrapper – your plugins stay
> cached unless you changed dependency lists.

---

## 1. What exactly does `wrapRc` do?

With `wrapRc = true` (the default) nixCats:

1. Copies your Lua directory into the Nix store  
   → ensures perfect reproducibility.
2. Generates a small *launcher* script that sets `XDG_*` dirs **inside** that
   store path so Neovim reads the frozen copy.

Updating Lua then requires a `git add` + `nix build` because the store hash must
change.

### Live‑reload mode

Set `wrapRc = false` (or export `$UNWRAP_IT=1` when you used the string form)
and the launcher will **skip** step 1.  
Now Neovim reads your *working‑tree* files – edit & `:w` → restart → boom, no
rebuild.

```nix
settings = {
  wrapRc = "UNWRAP_IT";        # run wrapped unless you export UNWRAP_IT
  configDirName = "nixCats-dev";
};
```

```bash
# normal reproducible run
nix run .#nixCats

# hack on Lua without rebuilds
UNWRAP_IT=1 nixCats-dev
```

---

## 2. Switching between wrapped & unwrapped packages

A common workflow is to keep **two** nearly identical packages:

```nix
packageDefinitions = rec {
  nixCats = basePackage { };           # production, wrapRc = true (default)

  nixCatsLive = basePackage {
    settings.wrapRc = false;           # fast‑reload variant
    settings.aliases = [ "nvc" ];      # avoid clashing symlink
  };
};
```

Develop in *nvc*, commit + rebuild, then go back to *nixCats*.

---

## 3. Reference: accessing settings in Lua

All keys show up under `nixCats.settings` **and** via the helper:

```lua
if nixCats('wrapRc') then
  print('running the wrapped version')
end
```

Remember that a **missing** key returns `nil`, so use `nixCats('wrapRc') == false`
to explicitly detect the unwrapped case.

---

## 4. Troubleshooting

| Symptom | Likely Cause |
|---------|--------------|
| Changes in `init.lua` don’t show up after `nix run` | Forgot `git add` (when `wrapRc = true`). |
| `E475: Invalid argument: packpath…` on live package | Mixing wrapped *and* unwrapped dirs under the same `configDirName`. |
| `nix build` suddenly recompiles *everything* | You toggled `wrapRc`; the Lua path moved and derivation hash changed. |

---

Next up: **Daily Workflow** – how to iterate quickly without leaving your editor.
