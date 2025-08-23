#!/usr/bin/env node

import 'dotenv/config';
import fetch from 'node-fetch';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TEST_CHAT_ID = process.env.TEST_CHAT_ID; // Add your test chat ID to .env

if (!TELEGRAM_BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN not set in environment');
  process.exit(1);
}

if (!TEST_CHAT_ID) {
  console.error('❌ TEST_CHAT_ID not set in environment');
  console.log('Add TEST_CHAT_ID=your_chat_id to your .env file for testing');
  process.exit(1);
}

async function sendTestMessage(text) {
  try {
    console.log(`📤 Sending test message: "${text}"`);
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TEST_CHAT_ID,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Message sent successfully');
      return result.result;
    } else {
      console.error('❌ Failed to send message:', result.description);
      return null;
    }
  } catch (error) {
    console.error('❌ Error sending message:', error.message);
    return null;
  }
}

async function testCommands() {
  console.log('🧪 Testing Clypr Agent commands...\n');

  const testCases = [
    {
      name: 'Help Command',
      message: '/help',
      description: 'Should show help message with available commands'
    },
    {
      name: 'Start Command (no token)',
      message: '/start',
      description: 'Should show welcome message'
    },
    {
      name: 'Start Command (with token)',
      message: '/start test_token_123',
      description: 'Should attempt to verify with token'
    },
    {
      name: 'Verify Command (no token)',
      message: '/verify',
      description: 'Should prompt user to paste token'
    },
    {
      name: 'Verify Command (with token)',
      message: '/verify test_token_456',
      description: 'Should attempt to verify with token'
    },
    {
      name: 'Direct Token Paste',
      message: 'test_token_789',
      description: 'Should attempt to verify with token'
    },
    {
      name: 'Invalid Message',
      message: 'Hello, this is not a token',
      description: 'Should show error message with instructions'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n--- ${testCase.name} ---`);
    console.log(`Description: ${testCase.description}`);
    console.log(`Message: "${testCase.message}"`);
    
    const result = await sendTestMessage(testCase.message);
    
    if (result) {
      console.log('✅ Test completed');
    } else {
      console.log('❌ Test failed');
    }
    
    // Wait 2 seconds between tests to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log('\n🎉 All tests completed!');
  console.log('Check your Telegram chat to see the agent responses.');
}

async function testWebhookSimulation() {
  console.log('\n🔗 Testing webhook simulation...\n');

  // Simulate webhook payloads
  const webhookTests = [
    {
      name: 'Help Command Webhook',
      payload: {
        update_id: 123456789,
        message: {
          message_id: 1,
          chat: { id: parseInt(TEST_CHAT_ID) },
          text: '/help'
        }
      }
    },
    {
      name: 'Start Command Webhook',
      payload: {
        update_id: 123456790,
        message: {
          message_id: 2,
          chat: { id: parseInt(TEST_CHAT_ID) },
          text: '/start'
        }
      }
    },
    {
      name: 'Verify Command Webhook',
      payload: {
        update_id: 123456791,
        message: {
          message_id: 3,
          chat: { id: parseInt(TEST_CHAT_ID) },
          text: '/verify test_token_123'
        }
      }
    },
    {
      name: 'Direct Token Webhook',
      payload: {
        update_id: 123456792,
        message: {
          message_id: 4,
          chat: { id: parseInt(TEST_CHAT_ID) },
          text: 'test_token_456'
        }
      }
    }
  ];

  console.log('Note: To test webhook simulation, you need to:');
  console.log('1. Start your bridge server');
  console.log('2. Set up the webhook');
  console.log('3. Send these payloads to your webhook endpoint');
  console.log('\nExample webhook URL: http://localhost:3000/telegram/webhook');
  
  for (const test of webhookTests) {
    console.log(`\n--- ${test.name} ---`);
    console.log('Payload:', JSON.stringify(test.payload, null, 2));
  }
}

const command = process.argv[2];

switch (command) {
  case 'commands':
    testCommands();
    break;
  case 'webhook':
    testWebhookSimulation();
    break;
  case 'all':
    testCommands().then(() => testWebhookSimulation());
    break;
  default:
    console.log('Usage: node test-bot-commands.js <command>');
    console.log('');
    console.log('Commands:');
    console.log('  commands - Test agent commands by sending messages');
    console.log('  webhook  - Show webhook simulation payloads');
    console.log('  all      - Run all tests');
    console.log('');
    console.log('Environment variables:');
    console.log('  TELEGRAM_BOT_TOKEN - Your bot token');
    console.log('  TEST_CHAT_ID       - Your chat ID for testing');
    console.log('');
    console.log('Example:');
    console.log('  node test-bot-commands.js commands');
}
