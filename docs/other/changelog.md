---
title: 'Release Notes'
description: 'Changelog for nixCats – notable changes and version history'
---

# nixCats — Release Notes

Below is a condensed changelog of the most recent releases.  For the complete commit‑level history, see the [GitHub releases page](https://github.com/BirdeeHub/nixCats-nvim/releases).

> **Versioning scheme** – nixCats follows [Semantic Versioning](https://semver.org/).  Only the highlights are shown here; patch‑level changes (‑x.y.z) are mostly bug‑fixes unless otherwise stated.

---

## [7.2.0] – 2025‑04‑12
### Added
* **wrapArgs:** explicit `priority` field supported in spec form  
  <sub>commit 6c2fc3d</sub>

---

## [7.1.2] – 2025‑04‑08
### Improved
* **init:** removed all `rtp` searches from init sequence for faster startup  
  <sub>commit 85626fc</sub>

---

## [7.1.1] – 2025‑04‑06
### Fixed
* **petShop:** display glitch when redefining default hosts (edge‑case)  
  <sub>commit a6194f9</sub>

---

## [7.1.0] – 2025‑04‑06
### Added
* **petShop:** `:NixCats petShop debug` now prints useful diagnostic info  
  <sub>commit 822eacc</sub>

---

## [7.0.7] – 2025‑04‑05
### Improved
* **core:** `nixCats.lua` moved earlier on `runtimepath` for snappier require() look‑ups  
  <sub>commit d595a68</sub>

---

## [7.0.6] – 2025‑04‑04
### Fixed
* **bashb4:** `${placeholder "out"}` now permitted inside `bashBeforeWrapper`  
  <sub>commit f4c53a9</sub>

---

## Older releases…
<details>
<summary>Click to expand v6.x history</summary>

### [6.10.0] – 2025‑04‑03
* **providers:** host‑bundle overhaul – can now package arbitrary tools (`#197`)  
  <sub>commit 2aa1b64</sub>

### [6.9.3] – 2025‑04‑01
* **lix:** guard for missing `builtins.warn`  
  <sub>commit 32c97d9</sub>

… _snipped for brevity_ …

</details>

---

_Last updated: 2025‑04‑12_
