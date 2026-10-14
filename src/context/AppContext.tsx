import React, { createContext, useContext, useState, useEffect } from 'react';
import { CircularRoute, DeviceRecord, InspectionQuote, TechnicianProfile, User, UserRole } from '../types';
import { INITIAL_DEVICES, INITIAL_USERS, TECHNICIANS_LIST } from '../data/mockData';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  onSnapshot, 
  query, 
  where,
  updateDoc
} from 'firebase/firestore';

interface AppContextType {
  currentUser: User;
  setCurrentUser: (user: User) => void;
  firebaseAuthUser: FirebaseUser | null;
  authLoading: boolean;
  users: User[];
  devices: DeviceRecord[];
  activeDeviceId: string | null;
  setActiveDeviceId: (id: string | null) => void;
  activeScreen: number;
  setActiveScreen: (screen: number) => void;
  technicians: TechnicianProfile[];
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role: UserRole, district: string, phone: string, businessName?: string, certNumber?: string) => Promise<void>;
  loginWithGoogle: (role?: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  addDevice: (device: DeviceRecord) => Promise<void>;
  updateDevice: (id: string, updates: Partial<DeviceRecord>) => Promise<void>;
  setDeviceRoute: (deviceId: string, route: CircularRoute) => Promise<void>;
  assignTechnician: (deviceId: string, technicianId: string) => Promise<void>;
  submitInspectionQuote: (quote: InspectionQuote) => Promise<void>;
  respondToQuote: (deviceId: string, action: 'approve' | 'reject' | 'clarify', message?: string) => Promise<void>;
  advanceRepairProgress: (deviceId: string, stageIndex: number) => Promise<void>;
  finalizeOutcome: (deviceId: string, rating?: number, review?: string) => Promise<void>;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_DEVICES = 'eclader_devices_v3';
const STORAGE_KEY_USER = 'eclader_user_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [users] = useState<User[]>(INITIAL_USERS);
  const [technicians] = useState<TechnicianProfile[]>(TECHNICIANS_LIST);
  const [firebaseAuthUser, setFirebaseAuthUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [currentUser, setCurrentUser] = useState<User>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved user:', e);
    }
    return INITIAL_USERS[0]; // Default: Kasun Perera (consumer)
  });

  const [devices, setDevices] = useState<DeviceRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DEVICES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved devices:', e);
    }
    return INITIAL_DEVICES;
  });

  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(() => {
    return 'dev-thinkpad-01';
  });

  const [activeScreen, setActiveScreen] = useState<number>(1);

  // Sync state to localStorage for offline cache
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DEVICES, JSON.stringify(devices));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [devices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('LocalStorage error:', e);
    }
  }, [currentUser]);

  // Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseAuthUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const userSnap = await getDoc(userDocRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const loadedUser: User = {
              id: fbUser.uid,
              uid: fbUser.uid,
              name: data.name || fbUser.displayName || 'Eclader User',
              email: fbUser.email || '',
              role: data.role || 'consumer',
              location: data.location || 'Colombo, Western Province',
              phone: data.phone || '+94 77 123 4567',
              avatarUrl: fbUser.photoURL || undefined,
              businessName: data.businessName,
              certificationNumber: data.certificationNumber,
              joinedDate: data.createdAt ? new Date(data.createdAt).toLocaleDateString() : '2026',
            };
            setCurrentUser(loadedUser);
          } else {
            // Document does not exist yet (e.g. initial Google sign-in)
            const newUser: User = {
              id: fbUser.uid,
              uid: fbUser.uid,
              name: fbUser.displayName || 'Eclader User',
              email: fbUser.email || '',
              role: 'consumer',
              location: 'Colombo, Western Province',
              phone: '+94 77 000 0000',
              avatarUrl: fbUser.photoURL || undefined,
              joinedDate: new Date().toLocaleDateString(),
            };
            await setDoc(userDocRef, {
              uid: fbUser.uid,
              name: newUser.name,
              email: newUser.email,
              role: 'consumer',
              location: newUser.location,
              phone: newUser.phone,
              createdAt: new Date().toISOString(),
            });
            setCurrentUser(newUser);
          }
        } catch (err) {
          console.warn('Error fetching Firestore user profile:', err);
        }
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore devices collection in real-time when authenticated
  useEffect(() => {
    if (!firebaseAuthUser) return;

    const path = 'devices';
    let q;
    if (currentUser.role === 'technician') {
      // Technicians can see all devices in pilot
      q = collection(db, path);
    } else {
      // Consumers see devices they own
      q = query(collection(db, path), where('ownerUid', '==', firebaseAuthUser.uid));
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const remoteDevices: DeviceRecord[] = [];
          snapshot.forEach((d) => {
            const data = d.data() as any;
            remoteDevices.push({
              id: d.id,
              tagNumber: data.tagNumber || `ECL-CMB-${d.id.slice(0, 4)}`,
              userId: data.ownerUid || currentUser.id,
              ownerUid: data.ownerUid,
              userName: data.userName || currentUser.name,
              userPhone: data.userPhone || currentUser.phone,
              userDistrict: data.userDistrict || currentUser.location,
              title: data.deviceName || data.title || 'Electronic Device',
              category: data.deviceCategory || 'Laptop',
              brandModel: data.brandModel || data.deviceName || 'Hardware Model',
              lifecycleAge: data.lifecycleAge || '3-5 years',
              powerState: data.powerState || 'Powers on',
              knownFlaws: data.knownIssues ? [data.knownIssues] : data.knownFlaws || [],
              observations: data.observations || '',
              photoUrl: data.imageUrl || data.photoUrl || 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80',
              createdAt: data.createdAt || new Date().toISOString(),
              status: data.currentStatus || data.status || 'intake_pending',
              selectedRoute: data.selectedRoute,
              assignedTechnicianId: data.assignedTechnicianUid || data.assignedTechnicianId,
              geminiAssessment: data.geminiAssessment,
              inspectionQuote: data.inspectionQuote,
              repairProgress: data.repairProgress,
              finalOutcome: data.finalOutcome,
              milestones: data.milestones || [],
            });
          });

          // Merge with sample devices if not present
          setDevices((prev) => {
            const existingIds = new Set(remoteDevices.map((r) => r.id));
            const retainedSamples = prev.filter((p) => !existingIds.has(p.id));
            return [...remoteDevices, ...retainedSamples];
          });
        }
      },
      (error) => {
        console.warn('Firestore devices onSnapshot info:', error);
      }
    );

    return () => unsubscribe();
  }, [firebaseAuthUser, currentUser.role]);

  // Auth Functions
  const loginWithEmail = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      const data = snap.data();
      setCurrentUser({
        id: cred.user.uid,
        uid: cred.user.uid,
        name: data.name || cred.user.displayName || 'Eclader User',
        email: cred.user.email || '',
        role: data.role || 'consumer',
        location: data.location || 'Colombo',
        phone: data.phone || '+94 77 123 4567',
        joinedDate: '2026',
      });
    }
  };

  const registerWithEmail = async (
    email: string,
    pass: string,
    name: string,
    role: UserRole,
    district: string,
    phone: string,
    businessName?: string,
    certNumber?: string
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const path = `users/${cred.user.uid}`;
    try {
      await setDoc(doc(db, 'users', cred.user.uid), {
        uid: cred.user.uid,
        name,
        email,
        role,
        location: district,
        phone,
        businessName: businessName || null,
        certificationNumber: certNumber || null,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, path);
    }

    setCurrentUser({
      id: cred.user.uid,
      uid: cred.user.uid,
      name,
      email,
      role,
      location: district,
      phone,
      businessName,
      certificationNumber: certNumber,
      joinedDate: new Date().toLocaleDateString(),
    });
  };

  const loginWithGoogle = async (role: UserRole = 'consumer') => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const userDocRef = doc(db, 'users', cred.user.uid);
    const snap = await getDoc(userDocRef);

    if (!snap.exists()) {
      await setDoc(userDocRef, {
        uid: cred.user.uid,
        name: cred.user.displayName || 'Google User',
        email: cred.user.email || '',
        role,
        location: 'Colombo, Western Province',
        phone: cred.user.phoneNumber || '+94 77 123 4567',
        createdAt: new Date().toISOString(),
      });
    }

    const data = snap.exists() ? snap.data() : { role };
    setCurrentUser({
      id: cred.user.uid,
      uid: cred.user.uid,
      name: cred.user.displayName || 'Google User',
      email: cred.user.email || '',
      role: data.role || role,
      location: data.location || 'Colombo',
      phone: data.phone || '+94 77 123 4567',
      avatarUrl: cred.user.photoURL || undefined,
      joinedDate: '2026',
    });
  };

  const logout = async () => {
    await firebaseSignOut(auth);
    setFirebaseAuthUser(null);
    setCurrentUser(INITIAL_USERS[0]);
    setActiveScreen(2); // Go to login screen
  };

  // Device mutations with Firestore persistence
  const addDevice = async (device: DeviceRecord) => {
    setDevices((prev) => [device, ...prev]);
    setActiveDeviceId(device.id);

    // Persist to Firestore if user is authenticated
    if (auth.currentUser) {
      const path = `devices/${device.id}`;
      try {
        await setDoc(doc(db, 'devices', device.id), {
          ownerUid: auth.currentUser.uid,
          deviceName: device.title,
          deviceCategory: device.category,
          tagNumber: device.tagNumber,
          imageUrl: device.photoUrl,
          lifecycleAge: device.lifecycleAge,
          powerState: device.powerState,
          knownIssues: device.knownFlaws.join(', '),
          observations: device.observations,
          currentStatus: device.status,
          createdAt: device.createdAt,
          updatedAt: new Date().toISOString(),
          geminiAssessment: device.geminiAssessment || null,
          milestones: device.milestones || [],
        });

        // Also save to aiAssessments collection if assessment exists
        if (device.geminiAssessment) {
          const assessPath = `aiAssessments/assess-${device.id}`;
          await setDoc(doc(db, 'aiAssessments', `assess-${device.id}`), {
            deviceId: device.id,
            ownerUid: auth.currentUser.uid,
            deviceCategory: device.category,
            identifiedHardwareModel: device.geminiAssessment.identifiedHardwareModel,
            visibleCondition: device.geminiAssessment.visualMechanicalState,
            visibleDamage: device.geminiAssessment.visibleDamagePoints.join('; '),
            identificationConfidence: device.geminiAssessment.modelMatchConfidence,
            limitations: device.geminiAssessment.safetyAndVerificationDisclaimer,
            recommendedRoute: device.geminiAssessment.preliminaryRecommendation,
            alternativeRoutes: device.geminiAssessment.alternativePathways.join(', '),
            reasoning: device.geminiAssessment.pathwayRationale,
            safetyNotes: device.geminiAssessment.safetyAndVerificationDisclaimer,
            co2eAvoidanceKg: device.geminiAssessment.co2eAvoidanceKg,
            recoverableMassKg: device.geminiAssessment.recoverableMassKg,
            createdAt: new Date().toISOString(),
          });
        }

        // Save intake milestone to deviceStatusHistory
        await setDoc(doc(db, 'deviceStatusHistory', `hist-init-${device.id}`), {
          deviceId: device.id,
          status: 'intake_pending',
          description: 'Hardware uploaded for Gemini optical triage.',
          updatedBy: currentUser.name,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore device write warning:', err);
      }
    }
  };

  const updateDevice = async (id: string, updates: Partial<DeviceRecord>) => {
    setDevices((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );

    if (auth.currentUser) {
      try {
        const docRef = doc(db, 'devices', id);
        await updateDoc(docRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore device update warning:', err);
      }
    }
  };

  const setDeviceRoute = async (deviceId: string, route: CircularRoute) => {
    const target = devices.find((d) => d.id === deviceId);
    const newMilestone = {
      id: `m-route-${Date.now()}`,
      title: `Circular Route Chosen: ${route.replace('_', ' ').toUpperCase()}`,
      description: `Targeting circular economic optimization via ${route}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true,
      actor: currentUser.name,
    };

    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        return {
          ...d,
          selectedRoute: route,
          status: 'route_selected',
          milestones: [...d.milestones, newMilestone],
        };
      })
    );

    if (auth.currentUser) {
      try {
        const docRef = doc(db, 'devices', deviceId);
        await updateDoc(docRef, {
          selectedRoute: route,
          currentStatus: 'route_selected',
          updatedAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'deviceStatusHistory', `hist-route-${Date.now()}`), {
          deviceId,
          status: 'route_selected',
          description: `Route chosen: ${route}`,
          updatedBy: currentUser.name,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore route update warning:', err);
      }
    }
  };

  const assignTechnician = async (deviceId: string, technicianId: string) => {
    const tech = technicians.find((t) => t.id === technicianId);
    const newMilestone = {
      id: `m-tech-${Date.now()}`,
      title: `Technician Bench Assigned: ${tech?.name || 'Authorized Lab'}`,
      description: `Physical bench custody scheduled at ${tech?.businessName || 'Certified Lab'}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true,
      actor: 'Eclader Dispatch Engine',
    };

    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        return {
          ...d,
          assignedTechnicianId: technicianId,
          assignedTechnicianUid: technicianId,
          status: 'technician_assigned',
          milestones: [...d.milestones, newMilestone],
        };
      })
    );

    if (auth.currentUser) {
      try {
        const docRef = doc(db, 'devices', deviceId);
        await updateDoc(docRef, {
          assignedTechnicianUid: technicianId,
          currentStatus: 'technician_assigned',
          updatedAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'deviceStatusHistory', `hist-assign-${Date.now()}`), {
          deviceId,
          status: 'technician_assigned',
          description: `Assigned to ${tech?.name || 'Lab'}`,
          updatedBy: currentUser.name,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore tech assignment warning:', err);
      }
    }
  };

  const submitInspectionQuote = async (quote: InspectionQuote) => {
    const newMilestone = {
      id: `m-quote-${Date.now()}`,
      title: 'Bench Diagnostic & Official Quote Submitted',
      description: `Itemized breakdown: LKR ${quote.totalCostLkr.toLocaleString()} (${quote.estimatedTurnaroundDays} days estimated).`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      completed: true,
      actor: quote.technicianName,
    };

    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== quote.deviceId) return d;
        return {
          ...d,
          inspectionQuote: quote,
          status: 'quote_submitted',
          milestones: [...d.milestones, newMilestone],
        };
      })
    );

    if (auth.currentUser) {
      try {
        // Save to quotes collection
        await setDoc(doc(db, 'quotes', quote.id), {
          deviceId: quote.deviceId,
          ownerUid: currentUser.role === 'consumer' ? auth.currentUser.uid : (quote.ownerUid || 'user-consumer-1'),
          technicianUid: auth.currentUser.uid,
          technicianName: quote.technicianName,
          multimeterStatus: quote.multimeterStatus,
          batteryHealthPercent: quote.batteryHealthPercent,
          inspectionFindings: quote.thermalAnalysis,
          repairDescription: quote.technicianNotes,
          partsCost: quote.partsList.reduce((acc, p) => acc + p.costLkr, 0),
          labourCost: quote.laborCostLkr,
          totalEstimatedCost: quote.totalCostLkr,
          estimatedDuration: `${quote.estimatedTurnaroundDays} days`,
          quoteStatus: 'pending',
          createdAt: quote.createdAt,
          updatedAt: new Date().toISOString(),
        });

        // Update devices collection
        const docRef = doc(db, 'devices', quote.deviceId);
        await updateDoc(docRef, {
          inspectionQuote: quote,
          currentStatus: 'quote_submitted',
          updatedAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'deviceStatusHistory', `hist-quote-${Date.now()}`), {
          deviceId: quote.deviceId,
          status: 'quote_submitted',
          description: `Quote submitted: LKR ${quote.totalCostLkr.toLocaleString()}`,
          updatedBy: quote.technicianName,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore quote submission warning:', err);
      }
    }
  };

  const respondToQuote = async (deviceId: string, action: 'approve' | 'reject' | 'clarify', message?: string) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId || !d.inspectionQuote) return d;
        if (action === 'approve') {
          const updatedQuote: InspectionQuote = { ...d.inspectionQuote, status: 'approved' };
          const newMilestone = {
            id: `m-appr-${Date.now()}`,
            title: 'Quote Approved by Consumer',
            description: 'Payment escrow / authorization confirmed. Bench technician cleared to commence work.',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            completed: true,
            actor: currentUser.name,
          };
          const initialRepairProgress = {
            currentPercent: 25,
            currentStage: 'Disassembly & Board Cleaning',
            stages: [
              { name: 'Disassembly & Board Cleaning', description: 'ESD bench tear-down & ultrasonic wash', completed: true, timestamp: 'Today' },
              { name: 'Component Replacement & Micro-Soldering', description: 'Installing verified parts', completed: false },
              { name: 'Thermal & Power Rail Verification', description: 'Checking voltages and heat dissipation', completed: false },
              { name: 'Final Multi-Point QA & E-Waste Certificate', description: 'Certification seal and packaging', completed: false },
            ],
            benchLogs: [
              { timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), note: 'Work initiated. Component inventory checked.', author: 'Technician' },
            ],
          };
          return {
            ...d,
            inspectionQuote: updatedQuote,
            status: 'repair_in_progress',
            repairProgress: initialRepairProgress,
            milestones: [...d.milestones, newMilestone],
          };
        } else if (action === 'reject') {
          return {
            ...d,
            inspectionQuote: { ...d.inspectionQuote, status: 'rejected' },
            status: 'route_selected',
          };
        } else {
          return {
            ...d,
            inspectionQuote: { ...d.inspectionQuote, status: 'clarification_requested', clarificationMessage: message },
          };
        }
      })
    );

    if (auth.currentUser) {
      try {
        const quoteObj = devices.find((d) => d.id === deviceId)?.inspectionQuote;
        if (quoteObj) {
          const quoteDocRef = doc(db, 'quotes', quoteObj.id);
          await updateDoc(quoteDocRef, {
            quoteStatus: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'clarification_requested',
            updatedAt: new Date().toISOString(),
          });
        }
        const devDocRef = doc(db, 'devices', deviceId);
        await updateDoc(devDocRef, {
          currentStatus: action === 'approve' ? 'repair_in_progress' : 'route_selected',
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore quote response warning:', err);
      }
    }
  };

  const advanceRepairProgress = async (deviceId: string, stageIndex: number) => {
    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId || !d.repairProgress) return d;
        const updatedStages = d.repairProgress.stages.map((st, idx) => {
          if (idx <= stageIndex) return { ...st, completed: true, timestamp: 'Completed' };
          return st;
        });
        const percent = Math.min(100, Math.round(((stageIndex + 1) / updatedStages.length) * 100));
        const currentStageName = updatedStages[Math.min(stageIndex + 1, updatedStages.length - 1)].name;
        const isFullyDone = stageIndex >= updatedStages.length - 1;

        return {
          ...d,
          status: isFullyDone ? 'completed' : 'repair_in_progress',
          repairProgress: {
            ...d.repairProgress,
            currentPercent: percent,
            currentStage: currentStageName,
            stages: updatedStages,
            benchLogs: [
              ...d.repairProgress.benchLogs,
              {
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                note: `Advanced to: ${currentStageName}`,
                author: currentUser.name,
              },
            ],
          },
        };
      })
    );

    if (auth.currentUser) {
      try {
        const devDocRef = doc(db, 'devices', deviceId);
        await updateDoc(devDocRef, {
          currentStatus: stageIndex >= 3 ? 'completed' : 'repair_in_progress',
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore progress warning:', err);
      }
    }
  };

  const finalizeOutcome = async (deviceId: string, rating = 5, review = 'Excellent bench workmanship and e-waste avoidance!') => {
    const target = devices.find((d) => d.id === deviceId);
    const certNumber = `ECL-LK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const outcome = {
      certificateId: certNumber,
      completedAt: new Date().toISOString(),
      outcomeType: target?.selectedRoute || 'repair',
      co2eAvoidanceKg: target?.geminiAssessment?.co2eAvoidanceKg || 148.5,
      massDivertedKg: target?.geminiAssessment?.recoverableMassKg || 1.45,
      preciousMetals: {
        goldGrams: 0.18,
        copperGrams: 15.4,
        silverGrams: 1.2,
      },
      economicValueSavedLkr: target?.category === 'Laptop' ? 145000 : 65000,
      recipientOrBuyer: 'Retained by Owner (Extended Life +36 Months)',
      consumerRating: rating,
      consumerReview: review,
    };

    setDevices((prev) =>
      prev.map((d) => {
        if (d.id !== deviceId) return d;
        return {
          ...d,
          status: 'completed',
          finalOutcome: outcome,
        };
      })
    );

    if (auth.currentUser) {
      try {
        const devDocRef = doc(db, 'devices', deviceId);
        await updateDoc(devDocRef, {
          currentStatus: 'completed',
          finalOutcome: outcome,
          updatedAt: new Date().toISOString(),
        });

        await setDoc(doc(db, 'deviceStatusHistory', `hist-done-${Date.now()}`), {
          deviceId,
          status: 'completed',
          description: `Certified: #${certNumber}`,
          updatedBy: 'Eclader National Registry',
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore final outcome warning:', err);
      }
    }
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY_DEVICES);
    localStorage.removeItem(STORAGE_KEY_USER);
    setDevices(INITIAL_DEVICES);
    setCurrentUser(INITIAL_USERS[0]);
    setActiveDeviceId(INITIAL_DEVICES[0].id);
    setActiveScreen(1);
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        firebaseAuthUser,
        authLoading,
        users,
        devices,
        activeDeviceId,
        setActiveDeviceId,
        activeScreen,
        setActiveScreen,
        technicians,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
        addDevice,
        updateDevice,
        setDeviceRoute,
        assignTechnician,
        submitInspectionQuote,
        respondToQuote,
        advanceRepairProgress,
        finalizeOutcome,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
