# Put Bilingual Reader on your phone (GitHub Pages)

This folder has everything you need:

- `index.html` — the whole app in one self-contained file (works offline; ready to host).
- `translate-worker.js` — the free proxy that holds your DeepL + Google keys.

The app's interface runs anywhere. **Translation needs the proxy** — the in-studio AI
that translated during the demo does not exist outside this studio, so you point the app
at your own DeepL/Google keys through the little worker below.

---

## Part 1 — Deploy the translation proxy (≈5 min, free)

1. Get your API key(s):
   - **DeepL:** sign up at deepl.com/pro-api (Free plan = 500,000 chars/month). Copy your *Authentication Key*.
   - **Google:** in Google Cloud Console, enable the *Cloud Translation API* and create an *API key*.
   - You only need the key(s) for the provider(s) you'll actually use.
2. Go to **dash.cloudflare.com → Workers & Pages → Create → Worker**. Name it, **Deploy**.
3. Click **Edit code**, delete the sample, paste the contents of `translate-worker.js`, **Deploy**.
4. Open the worker → **Settings → Variables and Secrets** → add:
   - `DEEPL_KEY` = your DeepL key
   - `GOOGLE_KEY` = your Google key
   Click **Encrypt** / Save, then **Deploy** again.
5. Copy the worker URL — e.g. `https://bilingual.yourname.workers.dev`.

> Using DeepL **Pro** (not Free)? Open `translate-worker.js` and change
> `api-free.deepl.com` to `api.deepl.com` before pasting.

---

## Part 2 — Host the app on GitHub Pages (≈5 min, free)

1. Create a new GitHub repository (e.g. `bilingual-reader`).
2. Upload **`index.html`** into it (drag-and-drop on github.com works).
3. Repo **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   pick `main` / root, **Save**.
4. After a minute your app is live at `https://yourname.github.io/bilingual-reader/`.

---

## Part 3 — Connect them & install on your phone

1. Open your GitHub Pages URL on your phone.
2. Tap the **⚙ gear → Translation**:
   - choose **DeepL** or **Google**
   - paste your **worker URL** into *Endpoint*
   The line *"Active engine"* should now show DeepL or Google instead of "Studio AI".
3. Tap **New**, paste an article, **Translate & Read** — translation now runs through your keys.
4. Install it: in your phone browser's menu choose **Add to Home Screen**. It launches
   full-screen with its own icon, like a native app. Your settings, library, and endpoint
   are remembered on the device.

---

## Notes
- Keys stay inside Cloudflare; they're never in the public `index.html`.
- Switch providers anytime in Settings (handy if one hits its monthly quota).
- "Save PDF" uses the phone's built-in print → *Save as PDF*.
- Reading actual PDF/Word *files* on-device isn't wired up yet — paste text or `.txt` for now.
