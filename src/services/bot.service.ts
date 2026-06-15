import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { WhatsAppService } from './whatsapp.service';

export class BotService {
  
  public static async logMessage(from: string, role: 'user' | 'bot' | 'admin', text: string) {
    try {
      const msgRef = doc(collection(db, 'whatsapp_sessions', from, 'messages'));
      await setDoc(msgRef, {
        role,
        text,
        timestamp: Date.now()
      });
      const sessionRef = doc(db, 'whatsapp_sessions', from);
      await setDoc(sessionRef, { lastInteraction: Date.now() }, { merge: true });
    } catch (e) {
      console.error("Error logging message:", e);
    }
  }

  static async handleIncomingMessage(from: string, messageData: any) {
    console.log("handleIncomingMessage starting for:", from);
    const sessionRef = doc(db, 'whatsapp_sessions', from);
    let state = 'NEW';
    try {
      console.log("Attempting to read Firebase state...");
      const sessionSnap = await getDoc(sessionRef);
      if (sessionSnap.exists()) {
        state = sessionSnap.data().state || 'NEW';
        console.log("Firebase read successful, state:", state);
      } else {
        console.log("Firebase document does not exist, state: NEW");
      }
    } catch (error) {
      console.error("Firebase read error (check rules):", error);
    }

    // Extract message content
    let textBody = '';
    let interactiveId = '';

    if (messageData.type === 'text') {
      textBody = messageData.text?.body?.toLowerCase().trim() || '';
    } else if (messageData.type === 'interactive') {
      interactiveId = messageData.interactive?.button_reply?.id || '';
    }

    // Log incoming message
    const msgTextToLog = messageData.type === 'text' ? (messageData.text?.body || '') : (interactiveId ? `[Button Click: ${interactiveId}]` : '[Unknown Message]');
    await this.logMessage(from, 'user', msgTextToLog);

    // Human Takeover check
    if (state === 'HUMAN_TAKEOVER') {
      console.log("Session in HUMAN_TAKEOVER mode. Skipping bot reply.");
      return;
    }

    // Universal Reset Commands
    if (textBody === 'menu' || textBody === 'hi' || textBody === 'hello' || textBody === 'reset') {
      await this.sendMainMenu(from, sessionRef);
      return;
    }

    // State Machine
    switch (state) {
      case 'NEW':
      case 'MAIN_MENU':
        if (interactiveId === 'btn_doctors') {
          try { await setDoc(sessionRef, { state: 'SEARCHING_DOCTOR_SPECIALTY', lastInteraction: Date.now() }, { merge: true }); } catch(e){}
          const msg = "👩‍⚕️ *Find a Doctor*\n\nPlease type the specialty you are looking for (e.g., Cardiologist, Dentist, General Physician):";
          await WhatsAppService.sendTextMessage(from, msg);
          await this.logMessage(from, 'bot', msg);
        } else if (interactiveId === 'btn_hospitals') {
          const msg = "🏥 *Hospital Search*\n\nThis feature is coming soon! Please type 'Menu' to go back.";
          await WhatsAppService.sendTextMessage(from, msg);
          await this.logMessage(from, 'bot', msg);
        } else {
          await this.sendMainMenu(from, sessionRef);
        }
        break;

      case 'SEARCHING_DOCTOR_SPECIALTY':
        if (textBody) {
          await this.searchDoctors(from, textBody);
          // Return to main menu state after searching to allow new searches
          try { await setDoc(sessionRef, { state: 'MAIN_MENU', lastInteraction: Date.now() }, { merge: true }); } catch(e){}
        }
        break;

      default:
        await this.sendMainMenu(from, sessionRef);
        break;
    }
  }

  private static async sendMainMenu(from: string, sessionRef: any) {
    console.log("sendMainMenu called for", from);
    try { 
      await setDoc(sessionRef, { state: 'MAIN_MENU', lastInteraction: Date.now() }, { merge: true }); 
      console.log("sendMainMenu: setDoc SUCCESS!");
    } catch(e) {
      console.log("sendMainMenu: setDoc FAILED silently:", e);
    }
    
    console.log("sendMainMenu: Calling WhatsAppService.sendInteractiveButtons...");
    const msg = "👋 *Welcome to Dehapa Hub!*\n\nI am your virtual healthcare assistant. What would you like to find today?";
    await WhatsAppService.sendInteractiveButtons(
      from, 
      msg,
      [
        { id: 'btn_doctors', title: 'Find a Doctor' },
        { id: 'btn_hospitals', title: 'Find a Hospital' }
      ]
    );
    await this.logMessage(from, 'bot', msg);
  }

  private static async searchDoctors(from: string, specialty: string) {
    const searchingMsg = `🔍 Searching for *${specialty}*... please wait a moment.`;
    await WhatsAppService.sendTextMessage(from, searchingMsg);
    await this.logMessage(from, 'bot', searchingMsg);
    
    try {
      const q = query(collection(db, 'directory'));
      const snapshot = await getDocs(q);
      
      const doctors = snapshot.docs
        .map(doc => doc.data())
        .filter(d => d.category?.toLowerCase() === 'doctor')
        .filter(d => {
          const spec = (d.subCategory || d.specialty || '').toLowerCase();
          return spec.includes(specialty.toLowerCase());
        })
        .slice(0, 3); // Max 3 for WhatsApp readability

      if (doctors.length === 0) {
        const errMsg = `❌ Sorry, we couldn't find any doctors for "${specialty}".\n\nType 'Menu' to start over.`;
        await WhatsAppService.sendTextMessage(from, errMsg);
        await this.logMessage(from, 'bot', errMsg);
        return;
      }

      let resultText = `✅ *Top Results for ${specialty}*\n\n`;
      doctors.forEach((doc, index) => {
        resultText += `${index + 1}. *${doc.name}*\n`;
        resultText += `🏥 ${doc.clinicName || 'Clinic'}\n`;
        resultText += `📍 ${doc.address || 'Address not provided'}\n`;
        resultText += `📞 ${doc.phone || 'Phone not provided'}\n\n`;
      });

      resultText += "To search again, type 'Menu'.";
      await WhatsAppService.sendTextMessage(from, resultText);
      await this.logMessage(from, 'bot', resultText);

    } catch (error) {
      console.error("Error searching doctors:", error);
      const errMsg = "⚠️ Sorry, an error occurred while searching our directory. Please try again later.";
      await WhatsAppService.sendTextMessage(from, errMsg);
      await this.logMessage(from, 'bot', errMsg);
    }
  }

}
