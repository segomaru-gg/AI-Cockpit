# Discord Bot Invite Troubleshooting

If you cannot add the bot to your server, check these common causes:

## 1. Do you have "Manage Server" permissions?
You can only add bots to servers where you are an **Administrator** or have the **Manage Server** permission.
- **Check:** Are you the owner of the server? If not, ask the owner.
- **Symptom:** The server list in the invite popup is greyed out or your server doesn't appear.

## 2. Generate a new Invite Link
The link I provided might have expired or been malformed. Please generate one directly from the Developer Portal:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications).
2. Click your application (**BluePrint-OS**).
3. Go to **OAuth2** -> **URL Generator** (Left menu).
4. Under **Scopes**, check:
   - `bot`
   - `applications.commands`
5. Under **Bot Permissions**, check:
   - `Administrator` (For easiest setup)
6. Copy the **Generated URL** at the bottom.
7. Paste that URL into your browser and try to invite again.

## 3. Public Bot Setting
1. Go to **Bot** tab (Left menu).
2. Scroll down to **Public Bot**.
3. Ensure it is **ON** (Green).
   - If OFF, only you (the owner) can add it. (This should be fine if it's your server).

## 4. Browser Login Mismatch
- Are you logged into the correct Discord account in your browser?
- Try opening the invite link in an **Incognito Window** to force a fresh login.
