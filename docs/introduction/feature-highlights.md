---
title: "Feature Highlights"
description: "A tour of the standout capabilities that make nixCats unique."
---

# ✨ Feature Highlights

Below is a quick‑glance tour of the “super‑powers” you unlock when you build your Neovim distribution with **nixCats**.  
Every item links to the section of the documentation where you can dive deeper.

---

## 1 • Nix‑Powered Dependency Management
- **True Reproducibility** – every plugin, LSP server, tool and shared library comes from an immutable Nix derivation.  
  Updates are explicit & version‑controlled.  
  → See [Getting Started › First Build & Run](./getting-started#first-build).

- **Single‑file definition** – describe *all* runtime pieces in one tidy `flake.nix`; keep your Lua code 100 % Lua.

---

## 2 • Category System 🎛️
- Group plugins, LSPs, env‑vars, wrapper flags... into **named categories** (e.g. `git`, `go`, `debug`).  
- Enable/disable categories per package with a boolean switch – perfect for *profiles* or per‑project builds.  
  → See [Core Concepts › Category System](./core-concepts/category-system).

---

## 3 • Multiple Neovim Packages
- Output **many executables** from one repo (`nixCats`, `regularCats`, `viCat`, …).  
- Handy for *wrapped* vs *live‑reload* builds, language‑specific variants, demo configs, etc.  
  → See [Core Concepts › Builder & Packages](./core-concepts/builder-packages).

---

## 4 • `wrapRc` Toggle
- Decide at build time (or even at runtime) whether your Lua lives in the Nix store (**frozen**) or in `~/.config` (**hot‑reload**).  
- Flip the switch with `settings.wrapRc = true | false | "ENV_VAR"` and keep both flows.  
  → See [Core Concepts › Settings & wrapRc](./core-concepts/settings-wraprc).

---

## 5 • Zero‑Boilerplate Lua ↔ Nix Bridge
- Pass **any Nix data** into Lua (`nixCats("<attr.path>")`) without ugly string interpolation.  
- Lua knows the final plugin names (`:NixCats pawsible`), the config dir, and more.

---

## 6 • First‑Class LSP & Tooling
- Declare language servers in `lspsAndRuntimeDeps`; nixCats puts them on `$PATH`.  
- Optional **Mason compatibility layer** for mixed workflows.  
  → See [Guide › LSP & Mason Integration](./guides/lsp-mason).

---

## 7 • Lazy Loading Utilities
- Drop‑in Lua helpers (`nixCatsUtils.lazyCat`, `lze`) for painless *lazy.nvim* or *paq‑nvim* setups when you **aren’t** on Nix.  
  → See [Guide › Lua Utils & lazy.nvim Wrapper](./guides/lua-utils).

---

## 8 • Effortless Overrides 🛠️
- Import any existing nixCats package and **override** categories, overlays or settings – no copy‑paste.  
  → See [Guide › Overriding Existing Packages](./guides/overriding).

---

## 9 • Module Support
- Plug into NixOS, Home‑Manager or nix‑darwin with ready‑made modules; keep options in your system flake.  
  → See [Guide › Modules](./guides/modules).

---

## 10 • Rich, Built‑In Documentation
- `:help nixCats` inside Neovim shows the same docs as https://nixcats.org.  
- `:NixCats cats` / `:NixCats debug` for on‑the‑fly inspection.

---

### Next Steps ➡️
- **5‑minute Quick Start** – jump to [Quick Start](./introduction/quick-start).  
- Or head over to **Installation & Template Picker** to spin up your first build.

