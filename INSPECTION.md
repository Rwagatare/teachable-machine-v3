# Teachable Machine v3 — Inspection Report

Read-only inspection. No files were built, installed, or modified to produce this report (one exception noted in §6: a hung `eslint` process was started and killed — see there).

---

## 1. Orientation

This is a browser-based Teachable Machine clone: the user trains a 3-class (extendable) image classifier live in the browser using their webcam, by holding down a button to record example frames for each class, then the app runs real-time predictions and drives one of three "outputs" — an emoji, a spoken phrase (Web Speech API), or a sound clip. Classification is done client-side with MobileNet (feature extractor) + a KNN classifier (`@tensorflow-models/knn-classifier`), so no images are sent to a server for the core ML flow. The project has been retrofitted with PWA scaffolding (manifest, install prompts, an offline indicator, a service worker) in recent commits, but — see §4 — that scaffolding is currently broken/incomplete, not functioning offline support.

**Entry points:**

- Dev server: `npm run watch` → runs `budo` ([package.json:24](package.json#L24)) serving `src/index.js` bundled on the fly, plus stylus/asset watchers, at `http://localhost:3000`.
- Build: `npm run build` → `html-copy` + `style-build` (stylus) + `assets-copy` + `browserify` (bundles `src/index.js` → `public/bundle.js`) + `workbox` (`workbox generateSW workbox-config.js` → intended to emit `public/sw.js`) ([package.json:12](package.json#L12)).
- Deploy target #1 (static): `npm run deploy` → `gh-pages -d public` ([package.json:22](package.json#L22)), pushing the _local, on-disk_ `public/` folder to the `gh-pages` branch (confirmed to exist: `remotes/origin/gh-pages`). Note `public/*` is gitignored ([.gitignore:5](.gitignore#L5)) except three files force-tracked in git (`public/index.html`, `public/manifest.json`, `public/service-worker.js` — confirmed via `git ls-files public/`), so the deployed site's JS/CSS/assets are whatever happens to be sitting locally when someone runs `deploy`, not something reconstructable from a fresh clone + `npm run build` alone unless that build is run first.
- Deploy target #2 (dynamic): [app.yaml](app.yaml) + [main.py](main.py) — a Google App Engine app, `runtime: python27` ([app.yaml:18](app.yaml#L18)), serving `public/index.html`/`public/fb.html` as static handlers and one dynamic route `/share-video` (Facebook video-sharing OAuth relay, [main.py:9-56](main.py#L9-L56)). Two independent, seemingly unsynchronized deploy paths for the same `public/` output.

**Runtime versions — expected vs. present:**
| | Expected (inferred) | On this machine |
|---|---|---|
| Node | Not pinned anywhere — no `.nvmrc`, no `engines` field in [package.json](package.json) | v24.10.0 |
| npm | Not pinned | 11.6.0 |
| App Engine Python | `python27` ([app.yaml:18](app.yaml#L18)) — this runtime was decommissioned by Google Cloud years ago | INFERRED not installed/checked (out of scope of a JS toolchain inspection) |
| eslint | `^4.3.0` ([package.json:64](package.json#L64)), released 2017 | hung/unusable against Node 24 in practice — see §6 |

No `engines` field exists to declare a supported Node range, and the toolchain mixes eras: `browserify`+`babel-preset-es2015` (2016-era, the actual build path) alongside unused `webpack`/`@babel/preset-env`/`babel-loader` devDependencies ([package.json:60-72](package.json#L60-L72)) that no script or config file references (no `webpack.config.js` found anywhere in the repo).

---

## 2. Stack inventory

**Framework:** none (vanilla ES6 classes + DOM, no React/Vue/etc.).
**Bundler:** Browserify + Babelify (`babel-preset-es2015`) — [package.json:5-14](package.json#L5-L14), invoked via `browserify` script ([package.json:14](package.json#L14)).
**CSS:** Stylus (`style/*.styl` → `public/style.css`, [package.json:15-16](package.json#L15-L16)).
**Package manager:** npm (`package-lock.json`, lockfileVersion 3) — a `yarn.lock` also exists at the repo root, i.e. two lockfiles are present simultaneously (dual package-manager drift).
**Language(s):** JavaScript (ES6/ES2015 source, transpiled), Stylus, plus Python 2 for the App Engine backend ([main.py](main.py) uses `print '...'` statement syntax, Python-2-only).

**Full dependency list** (from [package.json](package.json); versions as declared, not resolved). Last-published dates were **not** looked up — see §8/§9, this needs a network `npm view` call I didn't run.

Dependencies:
| Package | Version | Notes |
|---|---|---|
| @tensorflow-models/knn-classifier | 0.1.0 | INFERRED first/near-first release of this package, superseded by later tfjs-models major versions |
| @tensorflow-models/mobilenet | 0.1.1 | same era as above |
| @tensorflow/tfjs | 0.11.7 | pre-1.0 release; current tfjs majors are far ahead — INFERRED effectively unmaintained at this version |
| babel-preset-es2015 | ^6.14.0 | INFERRED officially deprecated upstream in favor of `@babel/preset-env`, which is _also_ installed as a devDependency but not wired into the actual build ([package.json:5-13](package.json#L5-L13) vs [package.json:60-61](package.json#L60-L61)) |
| babelify | ^7.3.0 | |
| browserify | ^14.4.0 | INFERRED several majors behind current |
| budo | ^10.0.3 | INFERRED unmaintained dev-server package |
| concurrently | ^3.1.0 | INFERRED many majors behind current |
| cpx | ^1.5.0 | INFERRED unmaintained |
| gifler | git://github.com/themadcreator/gifler.git#v0.3.0 | git-URL dependency, not on npm registry — install requires git network access to a third-party personal repo, no registry provenance/integrity check |
| gsap | ^1.20.2 | INFERRED extremely old major (GSAP is now on v3+) |
| ncp | ^2.0.0 | INFERRED deprecated in favor of `fs.cp`/other tools |
| nib | ^1.1.2 | Stylus mixin library |
| openssl | ^1.1.0 | Flagged: this npm package name is a known source of confusion (it is not a binding to the real OpenSSL library) — worth confirming with the user why it's a dependency at all (§8) |
| stylus | ^0.54.5 | |
| workbox-background-sync/expiration/precaching/routing/strategies | ^7.3.0 each | reasonably current |

devDependencies:
| Package | Version | Notes |
|---|---|---|
| @babel/core | ^7.28.0 | present but unused by the actual build (browserify+babelify uses the older `babel-preset-es2015` toolchain, not `@babel/core`) |
| @babel/preset-env | ^7.28.0 | same — unused/orphaned |
| babel-loader | ^10.0.0 | webpack-only loader; no webpack build exists — orphaned |
| eslint | ^4.3.0 | see §6, could not complete a lint run against this environment |
| gh-pages | ^6.3.0 | used by `deploy` script |
| lighthouse | ^12.8.1 | used by `lighthouse` script; a stale `lighthouse-report.html` (653KB) already sits at repo root, dated Jul 21 |
| pre-commit | ^1.2.2 | wires `eslint`+`stylint` as git pre-commit hooks ([package.json:18-21](package.json#L18-L21)) |
| stylint | ^1.5.9 | |
| webpack | ^5.101.0 | no `webpack.config.js` found; unused |
| webpack-cli | ^6.0.1 | unused, same as above |
| workbox-cli | ^7.3.0 | provides the `workbox` binary used by the `workbox` script |
| workbox-webpack-plugin | ^7.3.0 | webpack-only, unused since there's no webpack build |

**Cannot work offline (flagged, exhaustive — see §3 for full grep):**

- MobileNet model weights fetched at runtime from `https://storage.googleapis.com/tfjs-models/tfjs/` — hardcoded in `node_modules/@tensorflow-models/mobilenet/dist/index.js:40`, invoked via `mobilenet.load()` with no local model URL argument at [src/ai/WebcamClassifier.js:148](src/ai/WebcamClassifier.js#L148). Not bundled, not cached by any working service worker (see §4).
- Google Fonts stylesheet loaded from CDN: [public/index.html:44](public/index.html#L44) / [html/index.html:44](html/index.html#L44) (`fonts.googleapis.com`).
- Google Tag Manager / gtag analytics loaded from CDN: [public/index.html:400-402](public/index.html#L400-L402).
- Giphy API calls (`api.giphy.com`) with a hardcoded API key at [src/outputs/GIFOutput.js:263](src/outputs/GIFOutput.js#L263), plus hotlinked giphy.com GIF URLs at [src/outputs/GIFOutput.js:35-52](src/outputs/GIFOutput.js#L35-L52) — but this whole module is dead code, unreferenced (§6).
- Facebook OAuth + Graph API calls: [public/fb.html:20-23](public/fb.html#L20-L23), [main.py:16](main.py#L16) — a full network round-trip through a Python backend.
- `gifler` npm dependency installed via a live git clone of a third-party GitHub repo at install time (not from the npm registry) — [package.json:39](package.json#L39).

---

## 3. Architecture map

```
teachable-machine-v3/
├── src/                      # application source (bundled by browserify)
│   ├── ai/                   # ML: webcam capture + classification
│   │   ├── WebcamClassifier.js          # getUserMedia, mobilenet+knn pipeline
│   │   ├── EnhancedWebcamClassifier.js  # wraps WebcamClassifier, smooths predictions
│   │   ├── squeezenet.js                # DEAD CODE — imports 'deeplearn', not a dependency
│   │   └── imagenet_util.js             # DEAD CODE — only used by squeezenet.js
│   ├── outputs/               # the 3 (nominally 4) prediction outputs
│   │   ├── EmojiOutput.js / SoundOutput.js / SpeechOutput.js   # wired in, live
│   │   ├── GIFOutput.js                 # DEAD CODE — not imported by OutputSection.js
│   │   ├── sound/SoundSearch.js, speech/TextToSpeech.js
│   ├── ui/
│   │   ├── components/        # Button, CamInput, Selector, PWAUtils, BrowserUtils, GifCanvas(dead)
│   │   └── modules/           # IntroSection, InputSection, LearningSection, OutputSection,
│   │                          # Recording, Wizard, TrainingQuality, WiresLeft/Right,
│   │                          # WizardGIFExample.js (dead), wizard/Storyboard2.js (dead)
│   ├── config.js              # GLOBALS singleton: class names/colors/counts, shared app state
│   ├── index.js               # app bootstrap, wires GLOBALS.*Section instances, registers init on load
│   └── optimized-bundle.js    # DEAD CODE — not required/imported/built by anything (excluded even
│                               #   from eslint via .eslintignore:1, suggesting known-dead)
├── style/                     # Stylus source → compiled to public/style.css
│   ├── components/            # one .styl per UI section; output__gif.styl is dead CSS for dead JS
│   └── main.styl, base.styl, config.styl, ...
├── html/                      # source HTML templates, copied to public/ by `html-copy`
│   ├── index.html, fb.html, browserconfig.xml
├── public/                    # build output + a few git-tracked files (deploy source dir)
│   ├── index.html, manifest.json, service-worker.js   # git-tracked
│   ├── bundle.js, style.css, assets/, fb.html, browserconfig.xml   # gitignored, local build output
│   └── sw.js                  # MISSING — see §4, this is what's actually registered
├── assets/                    # source images/icons, copied to public/assets by `assets-copy`
├── main.py, app.yaml, appengine_config.py, requirements.txt   # Python 2.7 App Engine backend
├── workbox-config.js           # config for `workbox generateSW`
└── package.json / yarn.lock / package-lock.json   # dual lockfiles present
```

**Data flow — training image to prediction:**

1. Camera frame enters via `getUserMedia` in [src/ai/WebcamClassifier.js:99-118](src/ai/WebcamClassifier.js#L99-L118) (facingMode chosen per §5), rendered into a `<video>` fixed at 227×227px ([src/ai/WebcamClassifier.js:118-119](src/ai/WebcamClassifier.js#L118-L119)).
2. On button-hold ([src/ui/modules/LearningClass.js:27-30](src/ui/modules/LearningClass.js#L27-L30), touchstart/touchend + mousedown), frames are captured and featurized: MobileNet produces logits/embeddings (model loaded remotely, [src/ai/WebcamClassifier.js:148](src/ai/WebcamClassifier.js#L148)).
3. Those features are added to an in-memory KNN classifier: `this.classifier.addExample(logits, newMappedIndex)` ([src/ai/WebcamClassifier.js:193](src/ai/WebcamClassifier.js#L193)). The trained model lives **only in JS memory** for the page's lifetime — nothing is written to IndexedDB, OPFS, or any persistent store (confirmed via grep, §4).
4. Live prediction: `this.classifier.predictClass(logits)` ([src/ai/WebcamClassifier.js:167](src/ai/WebcamClassifier.js#L167)), wrapped/smoothed by `EnhancedWebcamClassifier.predict()` ([src/ai/EnhancedWebcamClassifier.js](src/ai/EnhancedWebcamClassifier.js)).
5. Predictions surface through [src/ui/modules/OutputSection.js:18-24](src/ui/modules/OutputSection.js#L18-L24), which instantiates `EmojiOutput`, `SoundOutput`, `SpeechOutput` (not `GIFOutput` — dead) and renders whichever the user selected.

**Every network-touching line (exhaustive grep of `src/`, `public/`, `html/`, config files for fetch/XHR/CDN/import URLs):**
| File:line | What |
|---|---|
| [src/ai/squeezenet.js:21-22](src/ai/squeezenet.js#L21-L22) | Remote checkpoint URL — but file is dead code, unreachable |
| [src/outputs/GIFOutput.js:35-52](src/outputs/GIFOutput.js#L35-L52) | Hardcoded giphy.com media URLs — dead code |
| [src/outputs/GIFOutput.js:255,263](src/outputs/GIFOutput.js#L255) | `XMLHttpRequest` to Giphy search API with embedded key — dead code |
| [src/ui/modules/wizard/LaunchScreen.js:44,53](src/ui/modules/wizard/LaunchScreen.js#L44) | `XMLHttpRequest` (ajax) — live code, purpose not traced further |
| [src/outputs/sound/SoundSearch.js:34,61](src/outputs/sound/SoundSearch.js#L34) | `XMLHttpRequest` (ajax) — live, sound-output search |
| [src/outputs/SoundOutput.js:109,169](src/outputs/SoundOutput.js#L109) | `XMLHttpRequest` (ajax) — live |
| [src/outputs/SpeechOutput.js:62,121](src/outputs/SpeechOutput.js#L62) | `XMLHttpRequest` (ajax) — live |
| [src/ui/modules/Recording.js:422](src/ui/modules/Recording.js#L422) | `XMLHttpRequest` — live, recording/upload flow |
| [html/index.html:44](html/index.html#L44) / [public/index.html:44](public/index.html#L44) | Google Fonts CDN stylesheet |
| [html/index.html:400](html/index.html#L400) / [public/index.html:400](public/index.html#L400) | Google Tag Manager script (async, from googletagmanager.com) |
| [html/fb.html:20,23](html/fb.html#L20) / [public/fb.html:20,23](public/fb.html#L20) | Facebook OAuth dialog URL |
| [main.py:16](main.py#L16) | Facebook Graph API URL (server-side) |
| [public/service-worker.js:29,37,252,282](public/service-worker.js#L29) | `fetch()` calls + Google Fonts origin matchers inside the (broken, see §4) service worker |
| [workbox-config.js:85,93](workbox-config.js#L85) | Google Fonts origin runtime-caching rules |
| `node_modules/@tensorflow-models/mobilenet/dist/index.js:40` | Hardcoded remote model base path, invoked at [src/ai/WebcamClassifier.js:148](src/ai/WebcamClassifier.js#L148) |

No `importScripts()` calls found anywhere in `src/` or `public/`.

---

## 4. Offline readiness audit

| Item                                                                            | State                 | Gap                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| ------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Service worker + caching strategy                                               | **Broken**            | Two things are wrong simultaneously: (1) [public/index.html:64](public/index.html#L64) registers `sw.js` (`navigator.serviceWorker.register(swBase + 'sw.js', ...)`), which is the file `workbox generateSW` is configured to emit at `public/sw.js` ([workbox-config.js:16](workbox-config.js#L16)) — but **`public/sw.js` does not exist on disk** (verified with `ls`). So there is currently no service worker actually installable at all. (2) Separately, [public/service-worker.js](public/service-worker.js) — a different, git-tracked file that nothing registers — is itself invalid: it concatenates a Workbox-module SW (lines 1-140, uses `import` statements that only work if loaded as an ES module worker, which the registration code does not request) directly followed by a hand-written legacy SW (lines 141-334) that references `CORE_ASSETS`, `CACHE_NAME`, `ASSETS_TO_CACHE`, `OFFLINE_URL` — none of which are ever declared in the file. It also has mismatched braces in the install handler ([public/service-worker.js:167-174](public/service-worker.js#L167-L174)) that would throw a syntax error if parsed as a classic script. |
| Web app manifest + installability                                               | **Present**           | [public/manifest.json](public/manifest.json) is well-formed (name, icons at 4 sizes, standalone display, theme color, scope). Installability itself, however, requires a working service worker per the standard PWA installability criteria in most browsers — which is currently absent (see above), so install prompts may fire in some browsers but the "installed" app will have no offline capability.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Model weights: bundled or fetched?                                              | **Fetched**           | See §2/§3 — MobileNet loads from `storage.googleapis.com` at runtime, no local copy bundled or cached by a working SW.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| TFJS backend availability without network                                       | **Partial**           | `@tensorflow/tfjs` itself is an npm dependency (bundled into `bundle.js`), so the _library_ works offline; it's the _model weights_ that require network, per above.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Persistence layer (IndexedDB/OPFS/localStorage) for datasets and trained models | **Absent**            | Grep of all of `src/` for `indexedDB`, `sessionStorage`, `OPFS`, `showDirectoryPicker` returns zero hits. The only `localStorage` usage found is for tiny UI flags: which camera is active ([src/index.js:52](src/index.js#L52), [src/ui/modules/InputSection.js:218](src/ui/modules/InputSection.js#L218)), webcam permission state ([src/ui/modules/Wizard.js:549-666](src/ui/modules/Wizard.js#L549)), and an iOS install-banner dismissal flag ([src/ui/components/PWAUtils.js:313,336](src/ui/components/PWAUtils.js#L313)). No training images, embeddings, or trained-classifier state are persisted anywhere. A page refresh loses all training.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Export/import of trained models to a local file                                 | **Absent**            | Grep for `model.save`, `tf.io`, `exportModel`, `importModel` returns zero hits anywhere in `src/`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| First-run-offline behavior                                                      | **Absent (INFERRED)** | A cold start with no network cannot load: the Google Fonts stylesheet (render-blocking `<link>`, [public/index.html:44](public/index.html#L44)), the MobileNet weights (blocks the ability to train/predict at all), and — because no working service worker exists — none of `bundle.js`, `style.css`, or `index.html` itself would be served from cache on a true first load either; only whatever the browser's default HTTP cache happens to retain from a prior _online_ visit would be available, and that's opportunistic, not a guarantee.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |

---

## 5. Responsiveness audit

**Breakpoints currently defined** (grep of all `style/**/*.styl` for `@media`):

- `max-width: 1200px` — [style/components/machine.styl:533](style/components/machine.styl#L533), [style/components/faq.styl:49](style/components/faq.styl#L49)
- `max-width: 900px` — the dominant breakpoint, used in [style/buttons.styl:210](style/buttons.styl#L210), [style/components/intro.styl:160](style/components/intro.styl#L160), [style/components/machine.styl:541](style/components/machine.styl#L541), [style/components/accessibility.styl:112](style/components/accessibility.styl#L112), [style/components/faq.styl:62](style/components/faq.styl#L62), [style/components/footer.styl:21](style/components/footer.styl#L21), [style/components/wizard.styl:167](style/components/wizard.styl#L167), [style/components/recording.styl:134](style/components/recording.styl#L134), plus a landscape-specific variant at [style/components/intro.styl:266](style/components/intro.styl#L266) and [style/components/pwa.styl:139](style/components/pwa.styl#L139) (`max-width: 900px and (orientation: landscape)`)
- `max-width: 768px` — [style/components/pwa.styl:75,107](style/components/pwa.styl#L75), [style/components/add-class.styl:33](style/components/add-class.styl#L33)
- `max-width: 600px` — [style/components/machine.styl:893](style/components/machine.styl#L893)
- `max-height: 680px` — [style/components/wizard.styl:189](style/components/wizard.styl#L189)
- Non-width media features: `display-mode: standalone` ([style/components/pwa.styl:4,68,234](style/components/pwa.styl#L4)), `prefers-color-scheme: dark` ([style/components/pwa.styl:178](style/components/pwa.styl#L178)), `prefers-reduced-motion: reduce` ([style/components/pwa.styl:192](style/components/pwa.styl#L192)), device-pixel-ratio ([style/components/pwa.styl:167](style/components/pwa.styl#L167))

**No breakpoint below 600px exists anywhere in the stylesheet.** There is no `@media` rule targeting 400px, 375px, or any smaller width.

**Screens/components that break under 400px width:**

- Everything styled only down to the `600px`/`768px`/`900px` tier is unverified below that — I cannot confirm actual visual breakage without rendering the page in a browser (this pass is code-only). Named as at-risk, not confirmed-broken: `style/components/machine.styl` (main teach/predict layout, only one rule below 900px at line 893), `style/components/wizard.styl` (onboarding wizard, floor is 900px), `style/components/faq.styl` (floor 900px). This should be verified visually — see §8.
- One concrete, code-confirmed non-responsive element: the webcam `<video>` element is **hardcoded to a fixed 227×227 pixel box**, not a percentage or viewport unit, at two separate places that should presumably move together: [src/ai/WebcamClassifier.js:118-119](src/ai/WebcamClassifier.js#L118-L119) (`this.video.width = 227; this.video.height = 227;`) and [src/ui/components/CamInput.js:70-71](src/ui/components/CamInput.js#L70-L71) (same fixed values, with a _commented-out_ aspect-ratio-aware sizing block directly below it at [src/ui/components/CamInput.js:73-80](src/ui/components/CamInput.js#L73-L80) that was apparently disabled). On any viewport narrower than ~227px plus surrounding chrome, or on a device with a very different camera aspect ratio, this will not adapt.

**Camera/webcam handling on mobile:**

- `facingMode` is applied _only_ when `GLOBALS.browserUtils.isMobile` is true ([src/ai/WebcamClassifier.js:98-100](src/ai/WebcamClassifier.js#L98-L100)): `'environment'` (back camera) vs `'user'` (front), toggled via `GLOBALS.isBackFacingCam`, persisted in `localStorage` ([src/ui/modules/InputSection.js:218](src/ui/modules/InputSection.js#L218)).
- Permission handling: `getUserMedia` guarded by feature-detection ([src/ai/WebcamClassifier.js:102](src/ai/WebcamClassifier.js#L102), [src/ui/components/BrowserUtils.js:48,56](src/ui/components/BrowserUtils.js#L48)); granted/denied state written to `localStorage.webcam_status` ([src/ui/modules/Wizard.js:549-666](src/ui/modules/Wizard.js#L549)) with per-browser instructional copy for Chrome/Safari/Firefox ([src/index.js:57-64](src/index.js#L57-L64)).
- No explicit device-orientation (`orientationchange`) handling found in `src/` — only a CSS `orientation: landscape` media query (§ above). Portrait lock is asserted at the manifest level (`"orientation": "portrait-primary"`, [public/manifest.json:5](public/manifest.json#L5)) but that only applies once installed as a PWA, not in a regular mobile browser tab.

**Touch vs. mouse event coverage:**

- Good, deliberate dual coverage on the primary "hold to record" control: [src/ui/modules/LearningClass.js:27-30](src/ui/modules/LearningClass.js#L27-L30) binds both `mousedown`/`touchstart` and `touchend`, with `mouseup` handled globally on `window` ([src/ui/modules/LearningClass.js:160](src/ui/modules/LearningClass.js#L160)) rather than the element (avoids stuck-recording if the pointer leaves the button — reasonable design).
- [src/ui/components/Button.js:25-29](src/ui/components/Button.js#L25-L29) also binds both `mousedown`/`touchstart`, `mouseup`/`touchend`, and `click`.
- [src/ui/modules/wizard/LaunchScreen.js:39-40](src/ui/modules/wizard/LaunchScreen.js#L39-L40) uses `touchstart`/`touchmove` specifically to `preventDefault()` (likely stopping mobile scroll/bounce on the intro screen), plus a _second_, mobile-specific skip button (`skipButtonMobile`, [src/ui/modules/wizard/LaunchScreen.js:83](src/ui/modules/wizard/LaunchScreen.js#L83)) distinct from the desktop one — an indication mobile and desktop are already visually forked in places, not just CSS-collapsed.
- `InputSection.js` shows one candidate rough edge: touchend handlers for its camera/mic toggle are present but **commented out** ([src/ui/modules/InputSection.js:22-25](src/ui/modules/InputSection.js#L22-L25)) while the `click` handler for camera flip is live ([src/ui/modules/InputSection.js:27](src/ui/modules/InputSection.js#L27)) — `click` does fire on mobile taps too (with ~300ms delay historically, less so on modern mobile browsers), so this is not necessarily broken, just asymmetric with the rest of the codebase's touch-handling pattern.

**Fixed pixel widths / desktop-only assumptions:**

- [src/ai/WebcamClassifier.js:118-119](src/ai/WebcamClassifier.js#L118-L119), [src/ui/components/CamInput.js:70-71](src/ui/components/CamInput.js#L70-L71) — fixed 227×227 video box, detailed above.
- [style/components/intro.styl:93](style/components/intro.styl#L93) `max-width: 400px`, [:123](style/components/intro.styl#L123) `max-width: 420px` — fixed caps below the 900px breakpoint's floor.
- [style/components/machine.styl:28](style/components/machine.styl#L28) `max-width: 1360px` on the outer machine layout — a desktop-oriented ceiling, not inherently a mobile problem but confirms desktop-first authoring.
- [html/index.html:372](html/index.html#L372) / [public/index.html:372](public/index.html#L372) — a YouTube `<iframe>` with hardcoded `width="424" height="238"` (not percentage/responsive), in the FAQ section.
- [src/ui/components/PWAUtils.js:97-146](src/ui/components/PWAUtils.js#L97-L146) — the install button _is_ mobile-aware (repositions/resizes at `window.innerWidth <= 768`), a deliberate JS-driven responsive pattern rather than pure CSS, notable because it's inconsistent with how the rest of the UI handles breakpoints (Stylus media queries).

---

## 6. Health

**Does it build?** Not attempted — running `npm run build` would write into `public/` (mutating the repo's working tree), which this read-only pass avoids. Listed as a command for you to run in §9.

**Does it run?** Not attempted for the same reason (`npm run watch` still triggers `style-build`/`assets-copy`/`html-copy` writes before serving). Listed in §9.

**Test suite:** **None found.** No `*.test.js`/`*.spec.js` files anywhere outside `node_modules`, no `jest`/`mocha`/`test` entries in [package.json](package.json) scripts, no test runner among dependencies.

**Lint/type errors, counted by severity:** **Could not be measured.** `npx eslint src -f json` was started as a read-only, non-mutating command; after several minutes it had consumed almost no CPU and produced no output, and never terminated — I killed the process rather than let it hang indefinitely. The installed `eslint` is `^4.3.0` ([package.json:64](package.json#L64)), released in 2017; this version's dependency tree predates Node 24 by many major versions, which is the most likely explanation (INFERRED — not confirmed by a stack trace, since the process never got far enough to print one). There is no type checker configured (no TypeScript, no Flow) so "type errors" is N/A.

**Console errors/warnings on a cold load:** Not observed (no browser was launched in this read-only pass — see §9 for a command to do this yourself). Code-level indicators that _something_ will log at minimum: `console.log`/`console.warn`/`console.error` calls throughout [public/service-worker.js](public/service-worker.js) and [src/ui/components/PWAUtils.js](src/ui/components/PWAUtils.js) are development-mode diagnostics by design, not necessarily bugs.

**Dead code and unreferenced files** (confirmed via grep — each of these has zero importers/references anywhere in `src/`, `public/`, or `html/` outside itself):

- [src/ai/squeezenet.js](src/ai/squeezenet.js) — imports `deeplearn` ([src/ai/squeezenet.js:17](src/ai/squeezenet.js#L17)), a package **not present** in [package.json](package.json) dependencies at all; this file could not even be bundled successfully if something tried to import it.
- [src/ai/imagenet_util.js](src/ai/imagenet_util.js) — only ever imported by the dead `squeezenet.js` ([src/ai/squeezenet.js:18](src/ai/squeezenet.js#L18)).
- [src/outputs/GIFOutput.js](src/outputs/GIFOutput.js), [src/ui/components/GifCanvas.js](src/ui/components/GifCanvas.js), [src/ui/modules/WizardGIFExample.js](src/ui/modules/WizardGIFExample.js), [src/ui/modules/wizard/Storyboard2.js](src/ui/modules/wizard/Storyboard2.js) — orphaned as a group; consistent with commit `037a6c6` ("replaced gif output with emoji output") having swapped the wiring in [src/ui/modules/OutputSection.js:140-142](src/ui/modules/OutputSection.js#L140-L142) to import `SpeechOutput`/`EmojiOutput`/`SoundOutput` only, without deleting the superseded GIF files. Corresponding dead CSS: `style/components/output__gif.styl`.
- [src/optimized-bundle.js](src/optimized-bundle.js) — not imported/required anywhere, not referenced by any `package.json` script; also explicitly excluded from linting via [.eslintignore:1](.eslintignore#L1)), suggesting its dead status was already known to a prior author.
- [public/service-worker.js](public/service-worker.js) — git-tracked but not registered by anything (registration targets `sw.js`, §4) — dead _and_ broken.

**Accessibility quick pass on the main flow** ([public/index.html](public/index.html)):

- A form control has a properly associated label: the age-certification checkbox, `<label><input id="recording__checkbox" type="checkbox">...</label>` ([public/index.html:358](public/index.html#L358)) — correct pattern (label wraps input).
- Decorative images generally have empty `alt=""` appropriately (e.g. [public/index.html:120](public/index.html#L120)), and at least one meaningful image has descriptive alt text ([public/index.html:153](public/index.html#L153), `alt="Made with some friends at Google"`).
- Only 3 `aria-*`/`role=`/`tabindex` attributes total were found across the entire main HTML file in this grep pass — the primary interactive controls (record button, output selector links, camera-flip button) rely on native `<button>`/`<a>` semantics rather than explicit ARIA, which is acceptable _if_ they are genuinely native elements, but this pass didn't verify every one individually.
- Not assessed here (would need a rendered page + a tool like axe or manual keyboard-only navigation): focus order, color contrast, live-region announcements for prediction changes. Flagged as a gap in this static pass, not as a confirmed defect.

---

## 7. Risk register

| Risk                                                                                                                                                            | Severity   | Evidence                                                                                                                                                 | Why it blocks offline-or-mobile                                                                                                                                                        |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| No working service worker is actually installed (registers `sw.js`, which doesn't exist)                                                                        | High       | [public/index.html:64](public/index.html#L64); `public/sw.js` absent on disk                                                                             | Directly defeats the entire offline-first goal — there is currently zero offline capability, PWA scaffolding notwithstanding                                                           |
| Committed `public/service-worker.js` is a broken, unreferenced concatenation of two SW implementations                                                          | High       | [public/service-worker.js:1-334](public/service-worker.js)                                                                                               | Even if someone rewired registration to point at this file, it would fail to parse/run as written                                                                                      |
| MobileNet model weights are fetched from a remote CDN with no local fallback or cache                                                                           | High       | [src/ai/WebcamClassifier.js:148](src/ai/WebcamClassifier.js#L148); `node_modules/@tensorflow-models/mobilenet/dist/index.js:40`                          | The app's core feature (training a classifier) cannot function at all offline or on a first-ever load without network                                                                  |
| No persistence of training data or trained model state                                                                                                          | High       | Grep of `src/` for `indexedDB`/`OPFS`/`model.save`/`tf.io` — zero hits                                                                                   | A refresh or crash loses all trained work; there's also no way to hand a model to someone else or reload it later, on- or offline                                                      |
| Deploy pipeline (`gh-pages -d public`) publishes whatever is locally on disk in `public/`, most of which is gitignored                                          | Medium     | [.gitignore:5](.gitignore#L5); `git ls-files public/` shows only 3 tracked files; [package.json:22](package.json#L22)                                    | Deployed output isn't reproducible from a fresh clone without knowing to run the build first; increases risk of deploying stale/wrong assets                                           |
| Fixed 227×227px webcam video box, not responsive                                                                                                                | Medium     | [src/ai/WebcamClassifier.js:118-119](src/ai/WebcamClassifier.js#L118-L119), [src/ui/components/CamInput.js:70-71](src/ui/components/CamInput.js#L70-L71) | Won't adapt to narrow viewports or non-square camera aspect ratios; an aspect-ratio-aware alternative exists in the code but is commented out                                          |
| No CSS breakpoint below 600px anywhere in the stylesheet                                                                                                        | Medium     | Full grep of `style/**/*.styl` for `@media`                                                                                                              | Small phones (< 600px, common in portrait) get whatever the 600–900px tier happens to produce, unverified — real risk of overflow/clipping                                             |
| Render-blocking Google Fonts `<link>` with no local font fallback                                                                                               | Medium     | [public/index.html:44](public/index.html#L44)                                                                                                            | Blocks/delays first paint offline or on slow networks; no self-hosted font file bundled                                                                                                |
| Ancient toolchain versions with divergent, partially-unused build systems (browserify+babel6 live; webpack+babel7 devDependencies present but wired to nothing) | Medium     | [package.json:5-14](package.json#L5-L14) vs [package.json:60-72](package.json#L60-L72); no `webpack.config.js` found                                     | Increases maintenance risk and confusion for anyone touching the build; doesn't block offline/mobile directly but blocks confidently modifying the build to fix the above              |
| `eslint@4.3.0` could not complete a run against the current Node version in practice (hung, killed after producing no output)                                   | Low-Medium | Observed directly in this session; [package.json:64](package.json#L64)                                                                                   | Blocks automated verification of code quality/regressions going forward, including for future offline/mobile fixes                                                                     |
| Facebook OAuth relay backend runs on a Python 2.7 App Engine runtime                                                                                            | Low        | [app.yaml:18](app.yaml#L18); `print` statement syntax in [main.py:56](main.py#L56)                                                                       | Not part of the offline PWA surface directly, but is a live, unrelated network dependency (`/fb` sharing flow) sitting in the same codebase, on a long-decommissioned platform runtime |
| Dual lockfiles (`package-lock.json` and `yarn.lock`) both present                                                                                               | Low        | repo root listing                                                                                                                                        | Doesn't block offline/mobile directly, but risks two contributors installing divergent dependency trees                                                                                |

---

## 8. Open questions for me

- **Is `public/service-worker.js` meant to be the real service worker** (with registration in `index.html` simply pointing at the wrong filename, `sw.js` instead of `service-worker.js`), **or is it stale/leftover** from before the Workbox `generateSW` approach was adopted, and should be deleted? I can't tell intent from the code alone — the file's own first-line comment ("this is revised service-worker with workbox...") suggests it was _meant_ to be current, but it's never invoked.
- **Was `npm run build` (specifically the `workbox` step) ever run successfully in this environment?** I didn't run it myself (would mutate `public/`), so I can't confirm whether `public/sw.js` merely failed to generate, or was generated then deleted/never committed. Worth telling me if you've already tried this.
- **Is the `openssl` npm dependency ([package.json:34](package.json#L34)) actually needed for anything**, or is it a stray/legacy entry? I didn't find any `require('openssl')`/`import ... from 'openssl'` in `src/`.
- **Is the Python 2.7 App Engine backend (`main.py`/`app.yaml`, the Facebook video-share relay) still in active use**, or is it a legacy feature that predates the GitHub Pages migration and can be considered out of scope for the offline/mobile work? This materially changes whether §7's App Engine risk matters at all.
- **Do you want the four confirmed-dead GIF-related files, `optimized-bundle.js`, and `squeezenet.js`/`imagenet_util.js` removed**, or kept for reference/rollback? I didn't delete anything since this is inspection-only.
- I could not verify actual rendered breakage below 400px width (§5) without launching a browser — is that something you want me to do as a next step, or do you already know which screens are broken from testing on a real device?

---

## 9. Terminal commands

In order. Each states whether it mutates the repo and what to look for.

1. **`node -v && npm -v`**
   Mutates: no. Look for: confirms the versions already captured above (v24.10.0 / 11.6.0) still match your shell.

2. **`npm ls --depth=0`**
   Mutates: no (reads installed tree only). Look for: any `UNMET DEPENDENCY` or `invalid` markers — particularly whether `deeplearn` shows up unexpectedly, and whether the `gifler` git dependency resolved. Note: when I tried a similar read-only npm command it hung in my sandbox for reasons that may be specific to that environment — if it hangs for you too, that's itself worth knowing.

3. **`npm outdated`**
   Mutates: no. Look for: how far behind each dependency is from latest — this is the "last-published date" data I could not fetch without a live registry call.

4. **`npx eslint@latest src`** _(fresh install of a current eslint, not the pinned `^4.3.0`)_
   Mutates: no to the repo (installs eslint into npm's cache, not into `node_modules`, if run via `npx eslint@latest` without adding to package.json). Look for: whether a modern eslint completes where the old one hung, and what actual rule violations surface — the current `.eslintrc.json` uses `"extends": "eslint:recommended"` with ecmaVersion 9, which a newer eslint may reject as a config-format mismatch (eslint 9 uses flat config by default), so this may need `ESLINT_USE_FLAT_CONFIG=false npx eslint@latest src` instead.

5. **`npm run build`**
   Mutates: **yes** — writes/overwrites `public/bundle.js`, `public/style.css`, `public/assets/*`, `public/*.html`, and attempts to generate `public/sw.js` via `workbox generateSW`. Look for: whether the `workbox` step completes and actually produces `public/sw.js` (currently absent), and whether `browserify`/`babelify` on this old `babel-preset-es2015` toolchain completes cleanly under Node 24 (this is the same version-mismatch risk category as the eslint hang).

6. **`npm run watch`** _(after step 5, or standalone — it runs `style-build` itself first)_
   Mutates: yes, same output files as above, continuously while running; also starts a long-running dev server (`budo` on port 3000) — you'll need to Ctrl-C it. Look for: whether `budo` starts without error, and then open `http://localhost:3000` in a real browser to check the console for errors/warnings on cold load (§6) and visually test <400px width layouts (§5) — this is the step I could not perform myself in a read-only, no-browser pass.

7. **`npm run lighthouse`** _(requires step 6's server running first)_
   Mutates: no to source, but overwrites `lighthouse-report.html` at the repo root (a stale one from Jul 21 already exists). Look for: current PWA/Performance/Accessibility scores, and specifically the "Installable manifest" / "Service worker" audit results, which should confirm or contradict my §4 finding that no working service worker currently exists.

8. **`npm view @tensorflow/tfjs time.modified` (repeat per package of interest, e.g. `gsap`, `browserify`, `budo`, `ncp`, `openssl`)**
   Mutates: no. Look for: actual last-publish dates to firm up the "dead/deprecated" flags in §2, which I marked as INFERRED rather than verified.
