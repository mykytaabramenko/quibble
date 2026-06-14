# Auto-publishing to the Chrome Web Store

The `Release to Chrome Web Store` GitHub Action publishes a new version when
the `version` in `package.json` changes on `main`. This is a one-time setup to
give CI the credentials it needs.

## 1. Get the Chrome Web Store API credentials

The Store API uses Google OAuth2. You need four values.

### Extension ID

From the [Developer Dashboard](https://chrome.google.com/webstore/devconsole),
open Quibble — the ID is in the URL and on the item page.

### Client ID + Client Secret

1. Open the [Google Cloud Console](https://console.cloud.google.com/) and
   create (or pick) a project.
2. **APIs & Services → Library** → enable the **Chrome Web Store API**.
3. **APIs & Services → OAuth consent screen** → configure it (External is
   fine; add yourself as a test user).
4. **APIs & Services → Credentials → Create credentials → OAuth client ID** →
   application type **Desktop app**. Copy the **Client ID** and
   **Client Secret**.

### Refresh token

Generate it once locally. The easiest path is WXT's helper:

```bash
npx wxt submit init
```

It walks you through the OAuth flow and prints the refresh token. (Alternatively
follow the manual `oauth2` flow described in the
[Chrome Web Store API docs](https://developer.chrome.com/docs/webstore/using-api).)

## 2. Add the values as GitHub Secrets

Repo → **Settings → Secrets and variables → Actions → New repository secret**.
Add all four:

| Secret name             | Value                      |
| ----------------------- | -------------------------- |
| `CHROME_EXTENSION_ID`   | the extension ID           |
| `CHROME_CLIENT_ID`      | OAuth client ID            |
| `CHROME_CLIENT_SECRET`  | OAuth client secret        |
| `CHROME_REFRESH_TOKEN`  | the refresh token          |

## 3. Release flow

1. Make your changes.
2. Bump `version` in `package.json` (e.g. `0.1.0` → `0.1.1`). The Store rejects
   a version that is not higher than the published one.
3. Merge/push to `main`.

CI builds on every push, but only the **version bump** triggers a submit. The
new version goes into Chrome's review queue and auto-publishes once approved.

To publish without changing the version (e.g. retry a failed submit), run the
workflow manually: **Actions → Release to Chrome Web Store → Run workflow**.

## Notes

- You can't have two versions in review at once — wait for one to clear.
- A failed `submit` step usually means a missing/expired secret or a version
  that isn't higher than the published one. Check the step log.
