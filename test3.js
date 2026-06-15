import { loadEnvConfig } from '@next/env';
const projectDir = process.cwd();
loadEnvConfig(projectDir);

async function sendRequest(payload) {
  const url = `https://graph.facebook.com/v25.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('WhatsApp API Error:', errorData);
      return;
    }

    console.log("Success:", await response.json());
  } catch (error) {
    console.error('Fetch Error:', error);
  }
}

sendRequest({
  messaging_product: "whatsapp",
  recipient_type: "individual",
  to: "917683811120",
  type: "text",
  text: {
    preview_url: false,
    body: "Test from Server script"
  }
});
