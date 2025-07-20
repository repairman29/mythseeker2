#!/usr/bin/env node

/**
 * Fix Campaign Permissions Script
 * 
 * This script adds campaign hosts to their campaigns' players subcollection
 * so they can read messages according to the updated Firestore rules.
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, getDocs, setDoc, serverTimestamp } = require('firebase/firestore');

// Firebase configuration (you'll need to add your config here)
const firebaseConfig = {
  // Add your Firebase config here
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function fixCampaignPermissions() {
  try {
    console.log('🔧 Starting campaign permissions fix...');
    
    // Get all campaigns
    const campaignsRef = collection(db, 'campaigns');
    const campaignsSnapshot = await getDocs(campaignsRef);
    
    console.log(`📋 Found ${campaignsSnapshot.size} campaigns to process`);
    
    let fixedCount = 0;
    
    for (const campaignDoc of campaignsSnapshot.docs) {
      const campaignData = campaignDoc.data();
      const campaignId = campaignDoc.id;
      const hostId = campaignData.host;
      
      if (!hostId) {
        console.log(`⚠️  Campaign ${campaignId} has no host, skipping`);
        continue;
      }
      
      try {
        // Check if host is already in players subcollection
        const playerRef = doc(db, 'campaigns', campaignId, 'players', hostId);
        
        // Add host to players subcollection
        await setDoc(playerRef, {
          userId: hostId,
          displayName: campaignData.hostName || 'Campaign Host',
          email: campaignData.hostEmail || '',
          joinedAt: serverTimestamp(),
          role: 'host',
          isActive: true
        });
        
        console.log(`✅ Fixed campaign ${campaignId} - added host ${hostId} to players`);
        fixedCount++;
        
      } catch (error) {
        console.error(`❌ Error fixing campaign ${campaignId}:`, error.message);
      }
    }
    
    console.log(`🎉 Campaign permissions fix complete! Fixed ${fixedCount} campaigns`);
    
  } catch (error) {
    console.error('❌ Error in fixCampaignPermissions:', error);
  }
}

// Run the script
fixCampaignPermissions()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }); 