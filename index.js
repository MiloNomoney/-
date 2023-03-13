const Discord = require('discord.js');
const config = require('./config.json');
const colors = require("colors");
var use_webhook = true;

const client = new Discord.Client({
  intents: [
    1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536
  ],
  partials: ['CHANNEL']
});

//function ฟังก์ชัน
function send_verifylog(color, status, reason, user) {
 if(use_webhook) {
  let webhook = new Discord.WebhookClient({ url: config.webhook_log });
  let embed = new Discord.MessageEmbed()
  .setColor((color ? color : "#FF0000"))
	.setAuthor({ name: 'Log verification' })
	.setDescription('มีการกดยืนยันตัวตนใหม่')
	.setThumbnail('https://cdn.discordapp.com/avatars/982978216656515134/a_9947256fd7f38bfb5f48bfa8b53fccee.gif?size=1024')
	.setTimestamp()
	.setFooter({ text: 'Dxkhung Log' });

  if(status == "success") {
    embed.addFields(
      { name: 'สถานะ', value: (status == "success" ? "สำเร็จ": "ไม่สำเร็จ"), inline: true },
      { name: 'ผู้ใช้งาน', value: `<@${user}>`, inline: true },
    )

    webhook.send({
      content: "มีการแจ้งเตือนใหม่!",
      embeds: [embed]
    })
  } else {
    embed.addFields(
      { name: 'สถานะ', value: (status == "success" ? "สำเร็จ": "ไม่สำเร็จ"), inline: true },
      { name: 'สาเหตุ', value: reason, inline: true },
      { name: 'ผู้ใช้งาน', value: `<@${user}>`},
    )

    webhook.send({
      content: "มีการแจ้งเตือนใหม่!",
      embeds: [embed]
    })
  }
 }
}
//รับข้อความ receive message
client.on("messageCreate", async (message) => {
  if(message.content == config.command) {
    if(message.author.id.includes(config.ownerID)) {
      const embed_verify = new Discord.MessageEmbed()
      .setTitle("ยืนยันตัวตนก่อนเข้า Server ")
      .setDescription("**ยืนยันตัวตนเพื่อเข้า Server โดยการกด __ยืนยันตัวตน__**")
      .setColor('#00c31f')
      .setFooter('ยืนยันตัวสำเร็จ คุณจะเห็นห้องต่างๆใน Server');

      const row = new Discord.MessageActionRow()
			.addComponents(
				new Discord.MessageButton()
					.setCustomId('verify_button')
					.setLabel('ยืนยันตัวตน')
          .setEmoji('1065619924162203738')
					.setStyle('PRIMARY'),
			);

      message.channel.send({
        embeds: [embed_verify], 
        components: [row]
      });
      message.delete();
    }
  }
})

//ready พร้อมทำงาน
client.on("ready", async () => {
    console.log(colors.green("Verification Manager | Ready!"));
    console.log("- Created by Dxkhung");
    console.log("- Edited by Pipatpong ");
    console.log("");

    client.user.setActivity("Verification Manager | Dxkhung");
    require("./keep_alive");
    try {
      new Discord.WebhookClient({ url: config.webhook_log })
      use_webhook = true;
      console.log(colors.green("- Webhook is working fine."))
    } catch (err) {
      if (err.code == "WEBHOOK_URL_INVALID") {
        console.log(colors.red("- Url webhook is invaild"))
        use_webhook = false;
      } else {
        console.log(colors.red("- There is something wrong in webhook"))
      }
    }
})

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;
    if (interaction.customId == "verify_button") {
      if(interaction.member.roles.cache.get(config.roleID)) {
        await interaction.reply({ content: ':x: คุณมียศ <@&'+config.roleID+'> อยู่แล้ว!', ephemeral: true });
        console.log(colors.red("[ERROR] Already have role "+interaction.user.tag));
        send_verifylog(null, "failed", "ผู้ใช้นี้มียศอยู่แล้ว!", interaction.user.id)
      } else {
        interaction.member.roles.add(config.roleID)
        .then(async () => {
          await interaction.reply({ content: ':white_check_mark: เพิ่มยศ <@&'+config.roleID+'> สำเร็จ!', ephemeral: true });
          console.log(colors.green("[SUCCESS] Added role to "+interaction.user.tag));
          send_verifylog("#00FF00", "success", "success", interaction.user.id)
        })
        .catch(async (err) => {
          await interaction.reply({ content: ':x: ไม่สามารถให้ยศได้เนื่องจาก: ```'+err+'```', ephemeral: true });
          console.log(colors.red("[ERROR] "+err));
          send_verifylog(null, "failed", "มีปัญหา ```"+err+"```", interaction.user.id)
        })
      }
    }
})

client.login(config.token ||  process.env.TOKEN || process.env.token).catch(err => {
  console.log(colors.red("Verification Manager | Error"));
  console.log(colors.red(err.name +" "+ err.message));
});