export class WhatsAppService {
  private static readonly API_VERSION = 'v25.0'; // Updated to match user's screenshot
  
  private static get accessToken() {
    return process.env.WHATSAPP_ACCESS_TOKEN;
  }

  private static get phoneNumberId() {
    return process.env.WHATSAPP_PHONE_NUMBER_ID;
  }

  private static async sendRequest(payload: any) {
    if (!this.accessToken || !this.phoneNumberId) {
      console.error("Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
      return null;
    }

    const url = `https://graph.facebook.com/${this.API_VERSION}/${this.phoneNumberId}/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('WhatsApp API Error:', errorData);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch Error when sending WhatsApp message:', error);
      return null;
    }
  }

  static async sendTextMessage(to: string, text: string) {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "text",
      text: {
        preview_url: false,
        body: text
      }
    };

    return this.sendRequest(payload);
  }

  static async sendInteractiveButtons(to: string, bodyText: string, buttons: { id: string, title: string }[]) {
    if (buttons.length > 3) {
      console.error("WhatsApp API only allows up to 3 buttons.");
      buttons = buttons.slice(0, 3);
    }

    const payload = {
      messaging_product: "whatsapp",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: bodyText
        },
        action: {
          buttons: buttons.map(btn => ({
            type: "reply",
            reply: {
              id: btn.id,
              title: btn.title
            }
          }))
        }
      }
    };

    return this.sendRequest(payload);
  }
}
