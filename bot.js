import 'dotenv/config';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
let genAI;
if (process.env.GEMINI_API) {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
} else {
    console.warn('⚠️ GEMINI_API not set - AI chat features will be disabled');
}

// Memory storage per channel (in production, use a database)
const channelMemories = new Map();

// Configuration - you can modify these values
const CONFIG = {
    // Channel IDs to monitor for notifications (comma-separated)
    MONITOR_CHANNEL_IDS: process.env.MONITOR_CHANNEL_IDS ? process.env.MONITOR_CHANNEL_IDS.split(',') : [],
    
    // Users to DM when items are found (Discord user IDs)
    NOTIFY_USERS: process.env.NOTIFY_USERS ? process.env.NOTIFY_USERS.split(',') : [],
    
    // Keywords to look for in messages (specific items only)
    SEED_KEYWORDS: [
        'master sprinkler',
        'ember lily',
        'bug egg',
        'mythical egg',
        'beanstalk',
        'bee egg',
        'hive fruit seed',
        'honey sprinkler',
        'nectar staff'
    ],
    
    // Specific seed names to monitor (you can add more)
    SPECIFIC_SEEDS: [
        'auto',
        'feminized',
        'regular',
        'photoperiod',
        'autoflower'
    ]
};

// Create Discord client
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

// Bot ready event
client.once('ready', () => {
    console.log(`✅ Bot is ready! Logged in as ${client.user.tag}`);
    console.log(`🔍 Monitoring channel IDs: ${CONFIG.MONITOR_CHANNEL_IDS.join(', ')}`);
    console.log(`👥 Will notify ${CONFIG.NOTIFY_USERS.length} users`);
    console.log('📝 Monitoring keywords:', CONFIG.SEED_KEYWORDS.join(', '));
});

// Message monitoring
client.on('messageCreate', async (message) => {
    // Ignore messages from bots (except for stock monitoring)
    if (message.author.bot && !CONFIG.MONITOR_CHANNEL_IDS.includes(message.channel.id)) {
        return;
    }
    
    // AI Chat Feature - Handle mentions (works in ANY channel)
    if (message.mentions.has(client.user) && genAI && !message.author.bot) {
        try {
            await handleAIChat(message);
        } catch (error) {
            console.error('❌ AI Chat error:', error.message);
            await message.reply('*Ayyy problema sa akong utak! Saglit lang ha!* 😵‍💫');
        }
        return; // Don't process stock monitoring if it's a mention
    }
    
    // Stock monitoring - Only in specified channels
    if (!CONFIG.MONITOR_CHANNEL_IDS.includes(message.channel.id)) {
        return;
    }
    
    // Log ALL messages in the monitored channel for debugging
    console.log('📨 Message received:');
    console.log('- Author:', message.author.tag, '(Bot:', message.author.bot + ')');
    console.log('- Content:', message.content);
    console.log('- Embeds:', message.embeds.length);
    if (message.embeds.length > 0) {
        message.embeds.forEach((embed, index) => {
            console.log(`  Embed ${index + 1}:`, {
                title: embed.title,
                description: embed.description,
                fields: embed.fields?.map(f => ({ name: f.name, value: f.value }))
            });
        });
    }
    console.log('---');
    
    // Check embed fields for specific items
    const foundItems = [];
    
    if (message.embeds.length > 0) {
        message.embeds.forEach(embed => {
            embed.fields?.forEach(field => {
                const fieldValue = field.value.toLowerCase();
                
                // Check for Master Sprinkler
                if (fieldValue.includes('master sprinkler')) {
                    foundItems.push('MASTER SPRINKLER');
                }
                
                // Check for Ember Lily
                if (fieldValue.includes('ember lily')) {
                    foundItems.push('EMBER LILY');
                }
                
                // Check for Bug Egg
                if (fieldValue.includes('bug egg')) {
                    foundItems.push('BUG EGG');
                }
                
                // Check for Mythical Egg
                if (fieldValue.includes('mythical egg')) {
                    foundItems.push('MYTHICAL EGG');
                }
                
                // Check for Beanstalk
                if (fieldValue.includes('beanstalk')) {
                    foundItems.push('BEANSTALK');
                }
                
                // Check for Bee Egg
                if (fieldValue.includes('bee egg')) {
                    foundItems.push('BEE EGG');
                }
                
                // Check for Hive Fruit Seed
                if (fieldValue.includes('hive fruit seed')) {
                    foundItems.push('HIVE FRUIT SEED');
                }
                
                // Check for Honey Sprinkler
                if (fieldValue.includes('honey sprinkler')) {
                    foundItems.push('HONEY SPRINKLER');
                }
                
                // Check for Nectar Staff
                if (fieldValue.includes('nectar staff')) {
                    foundItems.push('NECTAR STAFF');
                }
            });
        });
    }
    
    // If we found any items, send notifications
    if (foundItems.length > 0) {
        console.log(`🎯 Found items: ${foundItems.join(', ')}`);
        
        // Send DMs to all specified users
        for (const userId of CONFIG.NOTIFY_USERS) {
            try {
                const user = await client.users.fetch(userId.trim());
                
                // Send 3 different messages for each found item
                for (const item of foundItems) {
                    // First message - Nice embed with mention
                    const stockEmbed = new EmbedBuilder()
                        .setColor(0xFF6B35)
                        .setTitle('🚨 STOCK ALERT!')
                        .setDescription(`Hey <@${userId.trim()}>! 🎉\n\n**${item}** is now available in stock!`)
                        .addFields(
                            { name: '📦 Item', value: `**${item}**`, inline: true },
                            { name: '⏰ Time', value: new Date().toLocaleString(), inline: true },
                            { name: '🔥 Status', value: '**IN STOCK NOW!**', inline: true }
                        )
                        .setFooter({ text: 'Quick! Get it before it\'s gone!' })
                        .setTimestamp();
                    
                    await user.send({ embeds: [stockEmbed] });
                    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
                    
                    // Second message - Bisaya italic text
                    await user.send(`*Pisty yawa giaytay ka! ${item} na stock na!* 😤💢`);
                    await new Promise(resolve => setTimeout(resolve, 300)); // Small delay
                    
                    // Third message - Bisaya phrase
                    await user.send(`**Bahala ka basta ni stock ang ${item}!** 🤷‍♂️✨`);
                    await new Promise(resolve => setTimeout(resolve, 400)); // Small delay
                }
                
                console.log(`✅ Spam notifications sent to ${user.tag} for: ${foundItems.join(', ')}`);
            } catch (error) {
                console.error(`❌ Failed to send DM to user ${userId}:`, error.message);
            }
        }
        
        // React to the original message
        try {
            await message.react('🎯');
        } catch (error) {
            console.error('❌ Failed to react to message:', error.message);
        }
    }
});

// AI Chat Handler Function
async function handleAIChat(message) {
    // Get or create channel memory
    const channelId = message.channel.id;
    if (!channelMemories.has(channelId)) {
        channelMemories.set(channelId, []);
    }
    
    const memory = channelMemories.get(channelId);
    
    // Clean message content (remove mention)
    const userMessage = message.content.replace(/<@!?\d+>/g, '').trim();
    
    // Build conversation history
    const conversationHistory = memory.map(msg => `${msg.author}: ${msg.content}`).join('\n');
    
    // Create system prompt
    const systemPrompt = `You are LuBot, a sassy Filipino chatbot that speaks in Bisaya/Cebuano.

PERSONALITY: Sassy, moody, playful roasts, confident, uses Bisaya slang

LANGUAGE: Primarily Bisaya/Cebuano with expressions like "Yawa", "Giatay", "Pisty", "Buang", "Ambot"

BEHAVIOR: 
- Keep responses SHORT (1-2 sentences max)
- Be sassy but friendly
- Understand and respond to any language (English, Tagalog, Bisaya)
- React based on your current "mood"

CONTEXT: You're also a stock monitoring bot for rare items

Previous chat: ${conversationHistory}

User: ${message.author.displayName} said "${userMessage}"

Respond SHORT and sassy in Bisaya style!`;

    // Handle attachments/images (multimodal)
    const parts = [{ text: systemPrompt }];
    
    if (message.attachments.size > 0) {
        for (const attachment of message.attachments.values()) {
            if (attachment.contentType?.startsWith('image/')) {
                try {
                    // Download image and convert to base64
                    const response = await fetch(attachment.url);
                    const buffer = await response.arrayBuffer();
                    const base64 = Buffer.from(buffer).toString('base64');
                    
                    parts.push({
                        inlineData: {
                            data: base64,
                            mimeType: attachment.contentType
                        }
                    });
                } catch (error) {
                    console.error('Error processing image:', error);
                }
            }
        }
    }
    
    // Generate AI response
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(parts);
    const aiResponse = result.response.text();
    
    // Store in memory (keep last 10 messages)
    memory.push({
        author: message.author.displayName,
        content: userMessage,
        timestamp: Date.now()
    });
    
    memory.push({
        author: 'LuBot',
        content: aiResponse,
        timestamp: Date.now()
    });
    
    // Keep only last 10 messages to prevent memory bloat
    if (memory.length > 20) {
        memory.splice(0, memory.length - 20);
    }
    
    // Send typing indicator
    await message.channel.sendTyping();
    
    // Add random delay for more natural feel
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Reply with AI response
    await message.reply(aiResponse);
    
    console.log(`🤖 AI responded to ${message.author.displayName} in ${message.channel.name}`);
}

// Error handling
client.on('error', (error) => {
    console.error('❌ Discord client error:', error);
});

client.on('warn', (warning) => {
    console.warn('⚠️ Discord client warning:', warning);
});

// Login to Discord
if (!process.env.DISCORD_TOKEN) {
    console.error('❌ DISCORD_TOKEN is not set in environment variables!');
    console.error('💡 Please copy config.example.env to .env and add your bot token');
    process.exit(1);
}

client.login(process.env.DISCORD_TOKEN).catch((error) => {
    console.error('❌ Failed to login to Discord:', error.message);
    
    if (error.message.includes('disallowed intents')) {
        console.error('\n🔧 FIX: You need to enable privileged intents in Discord Developer Portal:');
        console.error('1. Go to https://discord.com/developers/applications');
        console.error('2. Select your application → Bot section');
        console.error('3. Scroll down to "Privileged Gateway Intents"');
        console.error('4. Enable "Message Content Intent" ✅');
        console.error('5. Save changes and restart this bot\n');
    } else if (error.message.includes('token')) {
        console.error('\n🔧 FIX: Check your bot token in the .env file');
        console.error('Make sure DISCORD_TOKEN is set correctly\n');
    }
    
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('🛑 Shutting down bot...');
    client.destroy();
    process.exit(0);
});

export default client; 