# Arcana Canvas — TWA Setup

This folder contains the config for building the Google Play APK via
Bubblewrap. The web PWA is the real app; this just wraps it in the thin
Android shell Play Store requires.

---

## Prerequisites

```bash
node -v   # needs 18+
npm install -g @bubblewrap/cli
```

You'll also need Android Studio installed (for the SDK and build tools).
Bubblewrap will prompt for the SDK path on first run.

---

## Step 1 — Fill in your domain

Open `twa-manifest.json` and replace every `YOUR_DOMAIN_HERE` with your
actual hosted domain, e.g. `arcanacanvas.app`.

Also update `packageId` to your reverse-domain ID, e.g.
`com.arcanacanvas.app`.

---

## Step 2 — Generate the Android project

From this `twa/` directory:

```bash
bubblewrap init --manifest https://YOUR_DOMAIN/manifest.json
```

Bubblewrap will read your live manifest and pre-fill most values. When it
asks about the signing key, choose "Create new keystore" and save it as
`android.keystore` in this folder. **Back up the keystore and password —
losing it means you can never update the Play listing.**

---

## Step 3 — Get your SHA-256 fingerprint

```bash
keytool -list -v -keystore android.keystore -alias arcana
```

Copy the `SHA256:` line (colons included, e.g.
`AB:CD:EF:...`) and paste it into `assetlinks.json`.

---

## Step 4 — Deploy assetlinks.json to your server

The file must be reachable at:

```
https://YOUR_DOMAIN/.well-known/assetlinks.json
```

This is what tells Android that your domain and your APK trust each other.
Without it the TWA falls back to a regular Chrome Custom Tab (no full-screen,
shows the URL bar).

Verify it's live with the Asset Link checker:
https://developers.google.com/digital-asset-links/tools/generator

---

## Step 5 — Build the APK

```bash
bubblewrap build
```

This produces:
- `app-release-signed.apk` — sideload / manual testing
- `app-release-bundle.aab` — what you upload to Play Console

---

## Step 6 — Play Console

1. Go to https://play.google.com/console
2. Create app → Android → Free
3. Fill in store listing (use the description from `manifest.json`)
4. Upload `app-release-bundle.aab` to Internal Testing first
5. Screenshots are already in `../screenshots/` at the correct 1080×1920

---

## Updating the app

When you push new code to your hosted domain, the TWA picks it up
automatically on next launch — no new APK needed. You only need a new
APK if you change the package name, signing key, min SDK, or Play Store
metadata.

Bump `appVersion` (integer) and `appVersionName` (semver string) in
`twa-manifest.json` when you do rebuild.
