#!/usr/bin/env node

import 'dotenv/config';
import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in environment');
  process.exit(1);
}

async function checkWebhook() {
  try {
    console.log('🔍 Checking current webhook status...');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
    const result = await response.json();
    
    if (result.ok) {
      console.log('📊 Current webhook info:');
      console.log(JSON.stringify(result.result, null, 2));
      
      if (result.result.url) {
        console.log('\n✅ Webhook is set to:', result.result.url);
        console.log('📈 Pending updates:', result.result.pending_update_count || 0);
        console.log('❌ Last error:', result.result.last_error_message || 'None');
        console.log('🕒 Last error time:', result.result.last_error_date ? new Date(result.result.last_error_date * 1000).toISOString() : 'None');
      } else {
        console.log('\n❌ No webhook is currently set');
      }
    } else {
      console.error('❌ Failed to get webhook info:', result.description);
    }
  } catch (error) {
    console.error('❌ Error checking webhook:', error.message);
  }
}

async function deleteWebhook() {
  try {
    console.log('🗑️ Deleting webhook...');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`);
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook deleted successfully!');
    } else {
      console.error('❌ Failed to delete webhook:', result.description);
    }
  } catch (error) {
    console.error('❌ Error deleting webhook:', error.message);
  }
}

async function getUpdates() {
  try {
    console.log('📥 Getting recent updates...');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?limit=10`);
    const result = await response.json();
    
    if (result.ok) {
      console.log(`📊 Found ${result.result.length} recent updates:`);
      result.result.forEach((update, index) => {
        console.log(`\n--- Update ${index + 1} ---`);
        console.log('Update ID:', update.update_id);
        if (update.message) {
          console.log('Message ID:', update.message.message_id);
          console.log('Chat ID:', update.message.chat.id);
          console.log('Text:', update.message.text || '[no text]');
        }
        if (update.callback_query) {
          console.log('Callback Query ID:', update.callback_query.id);
          console.log('Data:', update.callback_query.data || '[no data]');
        }
      });
    } else {
      console.error('❌ Failed to get updates:', result.description);
    }
  } catch (error) {
    console.error('❌ Error getting updates:', error.message);
  }
}

async function testBot() {
  try {
    console.log('🤖 Testing bot connection...');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Bot is working:');
      console.log('Name:', result.result.first_name);
      console.log('Username:', result.result.username);
      console.log('Bot ID:', result.result.id);
    } else {
      console.error('❌ Bot test failed:', result.description);
    }
  } catch (error) {
    console.error('❌ Error testing bot:', error.message);
  }
}

const command = process.argv[2];

switch (command) {
  case 'check':
    checkWebhook();
    break;
  case 'delete':
    deleteWebhook();
    break;
  case 'updates':
    getUpdates();
    break;
  case 'test':
    testBot();
    break;
  case 'reset':
    console.log('🔄 Resetting webhook...');
    deleteWebhook().then(() => {
      console.log('✅ Webhook reset complete. You can now set it again.');
    });
    break;
  default:
    console.log('Usage: node debug-telegram.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  check   - Check current webhook status');
    console.log('  delete  - Delete the webhook');
    console.log('  updates - Get recent updates');
    console.log('  test    - Test bot connection');
    console.log('  reset   - Delete webhook (for reset)');
    console.log('');
    console.log('Environment variables:');
    console.log('  TELEGRAM_BOT_TOKEN - Your bot token from BotFather');
}
