const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();

const Service = require('./models/Service'); // Adjust if path differs

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// 🚀 Post new services to Telegram
async function postNewServices() {
  const newServices = await Service.find({ postedToTelegram: false }).sort({ createdAt: -1 });

  if (newServices.length === 0) return;

  console.log("⏳ Found", newServices.length, "new services to post");

  for (const svc of newServices) {
    const message =
      `We are Added Working New Service 🔥🔥🚀

➡️ *Category Name:* ${svc.category}

${svc.name} ᴺᴱᵂ ➡️

💰 *Price:* ₦${svc.my_price} per 1000
⏱️ *Speed:* ${svc.average_time}

✅ API Discount Available 2%-5%

📌 Visit - https://poplox.com`;

    try {
      await bot.sendMessage(process.env.CHANNEL_ID, message, { parse_mode: 'Markdown' });
      svc.postedToTelegram = true;
      await svc.save();
      console.log(`✅ Posted service ID ${svc.service_id}`);
    } catch (err) {
      console.error("❌ Failed to post service:", err.response?.body || err);
    }
  }
}

// 💡 Tips and Marketing Messages
const tips = [
  "*Tip:* Always double-check the service speed before placing an urgent order!\n📌 Visit: https://poplox.com",
  "*Tip:* Use `My Orders` page to track the status of your active campaigns.\n📌 Visit: https://poplox.com",
  "*Tip:* Fund your account in advance to avoid delays in order processing.\n📌 Visit: https://poplox.com",
  "*Tip:* Avoid placing overlapping orders on the same post or profile.\n📌 Visit: https://poplox.com",
  "*Tip:* Instagram and TikTok services may fluctuate — check our updates often.\n📌 Visit: https://poplox.com",
  "*Tip:* Use 'Cheapest Services' filter on Poplox for budget-friendly options.\n📌 Visit: https://poplox.com",
  "*Tip:* Some providers require public accounts to deliver successfully!\n📌 Visit: https://poplox.com",
  "*Tip:* Targeted services are better for niche marketing. Explore by region!\n📌 Visit: https://poplox.com",

  // 🔥 Marketing tips
  "*Clone Poplox Today!* Get the exact source code & launch your own SMM platform.\n📌 https://poplox.com",
  "*Connect Your App to Poplox API* and resell our services directly from your site!\n📌 https://poplox.com",
  "*Need a custom SMM solution?* Hire us to build or customize a full panel.\n📌 https://poplox.com",
  "*Complete Poplox Panel Script* available for serious resellers. DM admin.\n📌 https://poplox.com",
  "*Start your own SMM business today!* All you need is the Poplox source code.\n📌 https://poplox.com",
  "*Have traffic or clients?* Buy our source and launch your own brand now!\n📌 https://poplox.com",
  "*Fully working Poplox codebase available!* No bugs, ready to deploy.\n📌 https://poplox.com",
  "*Smart devs use our API to resell services from Poplox directly.*\n📌 https://poplox.com",
  "*Make money selling SMM services!* Launch your own site using Poplox source code.\n📌 https://poplox.com",
  "*Already have a site?* Integrate with Poplox via API and expand instantly.\n📌 https://poplox.com",

];

async function postRandomTip() {
  const tip = tips[Math.floor(Math.random() * tips.length)];
  try {
    await bot.sendMessage(process.env.CHANNEL_ID, tip, { parse_mode: 'Markdown' });
    console.log("💡 Tip posted successfully.");
  } catch (err) {
    console.error("❌ Failed to post tip:", err.response?.body || err);
  }
}

// ⏱️ Start intervals
setInterval(postNewServices, 60 * 1000);       // Every 1 minute → check & post new services
setInterval(postRandomTip, 30 * 60 * 1000);    // Every 30 minutes → post 1 tip

// ▶️ Initial run
(async () => {
  await postNewServices();
  await postRandomTip();
})();
