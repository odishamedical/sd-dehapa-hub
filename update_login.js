const fs = require('fs');

let code = fs.readFileSync('src/app/login/page.tsx', 'utf8');

if (!code.includes('updateDoc')) {
  code = code.replace('setDoc, getDoc, serverTimestamp', 'setDoc, getDoc, updateDoc, serverTimestamp');
}

const oldSaveUser = `      if (referralCode) {
        newUserDoc.referredBy = referralCode;
      }
      
      await setDoc(userRef, newUserDoc, { merge: true });
    } else {
      userRole = userSnap.data()?.role || 'user';
      userName = userSnap.data()?.displayName || userName;
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
    
    const userEmail = user.email || user.phoneNumber || additionalData.phone;
    if (userEmail === 'odishamedical@gmail.com') {
      userRole = 'super_admin';
    }`;

const newSaveUser = `      if (referralCode) {
        newUserDoc.referredBy = referralCode;
      }
      
      await setDoc(userRef, newUserDoc, { merge: true });
    } else {
      userRole = userSnap.data()?.role || 'user';
      userName = userSnap.data()?.displayName || userName;
      await setDoc(userRef, { lastLogin: serverTimestamp() }, { merge: true });
    }
    
    const userEmail = user.email || user.phoneNumber || additionalData.phone;
    
    // Ghost Onboarding Auto-Assign
    if (referralCode) {
      try {
        const dirRef = doc(db, 'directory', referralCode);
        const dirSnap = await getDoc(dirRef);
        if (dirSnap.exists()) {
          await updateDoc(dirRef, {
            verified: true,
            ownerEmail: userEmail,
            assignedOwnerEmail: userEmail
          });
          userRole = 'doctor'; // Assume doctors claim profiles typically
        }
      } catch (err) {
        console.error("Ghost onboarding failed", err);
      }
    }

    if (userEmail === 'odishamedical@gmail.com') {
      userRole = 'super_admin';
    }`;

if (code.includes(oldSaveUser)) {
  code = code.replace(oldSaveUser, newSaveUser);
}

fs.writeFileSync('src/app/login/page.tsx', code);
console.log("Successfully updated login page for Ghost Onboarding.");
