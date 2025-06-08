# Discord Seed Monitor Bot Setup Guide

This bot monitors a Discord channel for seed stock notifications and automatically DMs specified users when seeds are detected.

## Features

- 🔍 **Message Monitoring**: Watches a specific channel for seed-related messages
- 🌱 **Keyword Detection**: Detects messages containing seed-related keywords
- 📨 **Automatic DMs**: Sends notifications to specified users via direct message
- 🎯 **Seed Type Detection**: Identifies specific seed types (auto, feminized, etc.)
- 📊 **Rich Embeds**: Sends formatted notifications with message details and links

## Setup Instructions

### 1. Create a Discord Bot

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to "Bot" section and click "Add Bot"
4. Copy the Bot Token (you'll need this later)
5. **IMPORTANT**: Scroll down to "Privileged Gateway Intents" and enable:
   - ✅ **Message Content Intent** (required to read message content)
   - ✅ **Server Messages Intent** (may be needed depending on server settings)
6. Go to "OAuth2" > "URL Generator"
7. Select scopes: `bot`
8. Select bot permissions: `Send Messages`, `Read Message History`, `Add Reactions`
9. Use the generated URL to invite your bot to your Discord server

### 2. Get Required IDs

#### Channel ID (to monitor):
1. Enable Developer Mode in Discord (User Settings > Advanced > Developer Mode)
2. Right-click on the channel you want to monitor
3. Select "Copy ID"

#### User IDs (to notify):
1. Right-click on users you want to notify
2. Select "Copy ID"
3. Collect all user IDs you want to notify

### 3. Configure the Bot

1. Copy `config.example.env` to `.env`
2. Fill in your values:
   ```
   DISCORD_TOKEN=your_actual_bot_token
   MONITOR_CHANNEL_ID=your_channel_id
   NOTIFY_USERS=user_id_1,user_id_2,user_id_3
   ```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run the Bot

```bash
# For development (with auto-restart)
npm run dev

# For production
npm start
```

## Configuration Options

You can modify the keywords and seed types the bot looks for by editing the `CONFIG` object in `bot.js`:

```javascript
const CONFIG = {
    // Keywords to look for in messages
    SEED_KEYWORDS: [
        'seed',
        'seeds',
        'in stock',
        'available',
        'restocked',
        'back in stock'
    ],
    
    // Specific seed names to monitor
    SPECIFIC_SEEDS: [
        'auto',
        'feminized',
        'regular',
        'photoperiod',
        'autoflower'
    ]
};
```

## How It Works

1. The bot monitors the specified channel for new messages
2. When a message contains seed-related keywords, it analyzes the content
3. Creates a rich embed notification with:
   - Timestamp
   - Channel information
   - Original message content
   - Detected seed types (if any)
   - Link to jump to the original message
4. Sends the notification as a DM to all specified users
5. Reacts to the original message with a 🌱 emoji

## Troubleshooting

### "Used disallowed intents" Error:
This is the most common error. Fix it by:
1. Going to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Select your application → Bot section
3. Scroll down to "Privileged Gateway Intents"
4. Enable "Message Content Intent" ✅
5. Save changes and restart your bot

### Bot not responding:
- Check that the bot token is correct
- Ensure the bot has proper permissions in your server
- Verify that "Message Content Intent" is enabled in the Developer Portal
- Make sure the bot is online in your Discord server

### Not receiving DMs:
- Check that user IDs are correct
- Ensure users have DMs enabled from server members
- Verify the bot can send DMs to the users
- Check if users have blocked the bot

### Keywords not detected:
- Check the `SEED_KEYWORDS` array in the configuration
- Make sure the keywords match the actual message content
- Keywords are case-insensitive
- Test with a simple keyword like "test" first

## Example Notification

When a seed stock message is detected, users will receive a DM like this:

```
🌱 Seed Stock Alert!
New seed notification detected!

📅 Time: 12/15/2023, 3:45:30 PM
📍 Channel: #seed-notifications
👤 Posted by: SeedSupplier#1234
💬 Message: 🌱 RESTOCK ALERT! Auto White Widow seeds are back in stock! Limited quantity available.
🎯 Detected Seeds: auto
🔗 Jump to Message: [Click here](https://discord.com/channels/...)
```

## Security Notes

- Keep your `.env` file secure and never commit it to version control
- Only give the bot the minimum required permissions
- Regularly rotate your bot token if needed 