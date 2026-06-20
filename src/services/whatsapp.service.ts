import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export class WhatsAppService {
  private static readonly API_VERSION = 'v25.0'; // Updated to match user's screenshot
  
  private static async getCredentials() {
    try {
      const docSnap = await getDoc(doc(db, "system_settings", "whatsapp"));
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          token: data.token || process.env.WHATSAPP_ACCESS_TOKEN,
          phoneId: data.phoneId || process.env.WHATSAPP_PHONE_NUMBER_ID
        };
      }
    } catch (e) {
      console.error("Error reading WhatsApp settings from Firebase:", e);
    }
    // Fallback to env vars
    return {
      token: process.env.WHATSAPP_ACCESS_TOKEN,
      phoneId: process.env.WHATSAPP_PHONE_NUMBER_ID
    };
  }

  private static async sendRequest(payload: any) {
    const creds = await this.getCredentials();
    if (!creds.token || !creds.phoneId) {
      console.error("Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID");
      return null;
    }

    const url = `https://graph.facebook.com/${this.API_VERSION}/${creds.phoneId}/messages`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${creds.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('WhatsApp API Error:', errorData);
        try {
          const { setDoc, doc } = require('firebase/firestore');
          await setDoc(doc(db, 'whatsapp_debug_logs', 'API_ERROR_' + Date.now()), { error: errorData, payload });
        } catch(e) {}
        return { error: true, data: errorData };
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

  static async sendTemplateMessage(to: string, templateName: string, languageCode: string = 'en_US', parameters?: string[]) {
    const payload: any = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode
        }
      }
    };

    if (parameters && parameters.length > 0) {
      payload.template.components = [
        {
          type: "body",
          parameters: parameters.map(p => ({
            type: "text",
            text: p
          }))
        }
      ];
    }

    return this.sendRequest(payload);
  }

  static async sendInteractiveButtons(to: string, text: string, buttons: {id: string, title: string}[]) {
    console.log("sendInteractiveButtons called. to:", to, "buttons:", buttons.length);
    const creds = await this.getCredentials();

    if (!creds.token || !creds.phoneId) {
      console.log("sendInteractiveButtons ERROR: Missing WHATSAPP_ACCESS_TOKEN or PHONE_NUMBER_ID in Firebase/Env");
      console.log("Token length:", creds.token ? creds.token.length : 0, "PhoneId length:", creds.phoneId ? creds.phoneId.length : 0);
      return;
    }
    
    console.log("Token and PhoneId found. Building payload...");
    if (buttons.length > 3) {
      console.error("WhatsApp API only allows up to 3 buttons.");
      buttons = buttons.slice(0, 3);
    }

    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: to,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: text
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
