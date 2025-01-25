const express = require('express');
const bodyParser = require('body-parser');
const TelegramBot = require('node-telegram-bot-api');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

// Replace with your bot token
const BOT_TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Database simulation
let users = {};
let tickets = [];

// User interaction
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const username = msg.chat.username || 'Anonymous';

  if (!users[chatId]) {
    users[chatId] = { username, role: 'Customer' };
    bot.sendMessage(chatId, `Welcome, ${username}! You are registered as a Customer.`);
  } else {
    bot.sendMessage(chatId, `Hello again, ${username}!`);
  }
});

// Open ticket command
bot.onText(/\/open (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const ticketTitle = match[1];

  const ticket = {
    id: uuidv4(),
    title: ticketTitle,
    user: users[chatId]?.username || 'Anonymous',
  };
  tickets.push(ticket);
  bot.sendMessage(chatId, `Ticket "${ticketTitle}" opened successfully!`);
});

// Get tickets command
bot.onText(/\/tickets/, (msg) => {
  const chatId = msg.chat.id;

  if (tickets.length === 0) {
    bot.sendMessage(chatId, 'No tickets opened yet.');
    return;
  }

  let response = 'Opened Tickets:\n';
  tickets.forEach((t, idx) => {
    response += `${idx + 1}. ${t.title} (by ${t.user})\n`;
  });

  bot.sendMessage(chatId, response);
});

// Web app routes
app.get('/api/users', (req, res) => res.json(users));
app.get('/api/tickets', (req, res) => res.json(tickets));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
