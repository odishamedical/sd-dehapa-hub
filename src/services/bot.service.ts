import { db } from '@/lib/firebase';
import { collection, doc, getDoc, setDoc, query, where, getDocs, limit } from 'firebase/firestore';
import { WhatsAppService } from './whatsapp.service';

export class BotService {
  
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
          try { await setDoc(sessionRef, { state: 'SEARCHING_DOCTOR_SPECIALTY', lastInteraction: new Date() }, { merge: true }); } catch(e){}
          await WhatsAppService.sendTextMessage(from, "👩‍⚕️ *Find a Doctor*\n\nPlease type the specialty you are looking for (e.g., Cardiologist, Dentist, General Physician):");
        } else if (interactiveId === 'btn_hospitals') {
          await WhatsAppService.sendTextMessage(from, "🏥 *Hospital Search*\n\nThis feature is coming soon! Please type 'Menu' to go back.");
        } else {
          await this.sendMainMenu(from, sessionRef);
        }
        break;

      case 'SEARCHING_DOCTOR_SPECIALTY':
        if (textBody) {
          await this.searchDoctors(from, textBody);
          // Return to main menu state after searching to allow new searches
          try { await setDoc(sessionRef, { state: 'MAIN_MENU', lastInteraction: new Date() }, { merge: true }); } catch(e){}
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
      await setDoc(sessionRef, { state: 'MAIN_MENU', lastInteraction: new Date() }, { merge: true }); 
      console.log("sendMainMenu: setDoc SUCCESS!");
    } catch(e) {
      console.log("sendMainMenu: setDoc FAILED silently:", e);
    }
    
    console.log("sendMainMenu: Calling WhatsAppService.sendInteractiveButtons...");
    await WhatsAppService.sendInteractiveButtons(
      from, 
      "👋 *Welcome to Dehapa Hub!*\n\nI am your virtual healthcare assistant. What would you like to find today?",
      [
        { id: 'btn_doctors', title: 'Find a Doctor' },
        { id: 'btn_hospitals', title: 'Find a Hospital' }
      ]
    );
  }

  private static async searchDoctors(from: string, specialty: string) {
    await WhatsAppService.sendTextMessage(from, `🔍 Searching for *${specialty}*... please wait a moment.`);
    
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
        await WhatsAppService.sendTextMessage(from, `❌ Sorry, we couldn't find any doctors for "${specialty}".\n\nType 'Menu' to start over.`);
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

    } catch (error) {
      console.error("Error searching doctors:", error);
      await WhatsAppService.sendTextMessage(from, "⚠️ Sorry, an error occurred while searching our directory. Please try again later.");
    }
  }

}
