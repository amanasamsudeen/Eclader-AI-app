import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { EcladerLogo } from '../common/EcladerLogo';
import { 
  Lock, 
  Mail, 
  User, 
  MapPin, 
  Phone, 
  ShieldCheck, 
  Wrench, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  Sparkles,
  Loader2,
  LogOut
} from 'lucide-react';

export const Screen2_Auth: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUser, 
    firebaseAuthUser,
    loginWithEmail, 
    registerWithEmail, 
    loginWithGoogle,
    logout,
    users, 
    setActiveScreen 
  } = useApp();

  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState<UserRole>('consumer');
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+94 77 123 4567');
  const [district, setDistrict] = useState('Colombo');
  const [businessName, setBusinessName] = useState('');
  const [certNumber, setCertNumber] = useState('');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleDemoLogin = (roleType: UserRole) => {
    setErrorMsg(null);
    const targetUser = users.find(u => u.role === roleType) || (roleType === 'technician' ? users[1] : users[0]);
    setCurrentUser(targetUser);
    setSuccessMsg(`Simulated demo session as ${targetUser.name} (${targetUser.role === 'technician' ? 'Certified Technician' : 'Consumer'}).`);
    setTimeout(() => {
      if (roleType === 'technician') {
        setActiveScreen(9); // Screen 9: Technician Dashboard
      } else {
        setActiveScreen(3); // Screen 3: Consumer Dashboard
      }
    }, 600);
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle(role);
      setSuccessMsg('Authenticated with Google successfully!');
      setTimeout(() => {
        if (role === 'technician') {
          setActiveScreen(9);
        } else {
          setActiveScreen(3);
        }
      }, 600);
    } catch (err: any) {
      console.warn('Google sign-in error:', err);
      setErrorMsg(err.message || 'Google sign-in failed. Please try email/password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Please provide both an email address and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (isRegistering) {
        if (!fullName.trim()) {
          setErrorMsg('Please enter your full legal name.');
          setIsLoading(false);
          return;
        }

        // Register with Firebase Authentication and create user profile document in Firestore
        await registerWithEmail(
          email.trim(),
          password,
          fullName.trim(),
          role,
          district,
          phone,
          businessName,
          certNumber
        );

        setSuccessMsg('Account created and verified in Firestore! Redirecting...');
        setTimeout(() => {
          if (role === 'technician') {
            setActiveScreen(9);
          } else {
            setActiveScreen(3);
          }
        }, 700);
      } else {
        // Sign in with Firebase Authentication
        await loginWithEmail(email.trim(), password);
        setSuccessMsg('Signed in to Firebase successfully! Loading records...');
        setTimeout(() => {
          if (currentUser.role === 'technician') {
            setActiveScreen(9);
          } else {
            setActiveScreen(3);
          }
        }, 700);
      }
    } catch (err: any) {
      console.error('Firebase Auth error:', err);
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setErrorMsg('This email address is already registered. Please sign in instead.');
      } else if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password. Please verify your credentials.');
      } else if (code === 'auth/invalid-email') {
        setErrorMsg('Please enter a valid email address.');
      } else if (code === 'auth/weak-password') {
        setErrorMsg('Password is too weak. Please use at least 6 characters.');
      } else {
        setErrorMsg(err?.message || 'Authentication error. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await logout();
      setSuccessMsg('Successfully logged out.');
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] text-[#131b2e] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <EcladerLogo variant="full" size={130} className="mb-2" />
        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#131b2e] tracking-tight font-['Plus_Jakarta_Sans']">
          {firebaseAuthUser ? 'Authenticated Session' : isRegistering ? 'Create your Eclader Account' : 'Sign in to Eclader AI'}
        </h2>
        <p className="mt-1 text-xs text-[#3e4944]">
          Western Province Circular Electronics & Hardware Triage Hub • Firebase Connected
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-6 shadow-xl border border-[#bdc9c2]/60 sm:rounded-2xl sm:px-10 space-y-6">
          
          {/* Active Firebase Session Card if logged in */}
          {firebaseAuthUser && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Active Firebase Session
                </span>
                <span className="text-[10px] bg-white px-2 py-0.5 rounded font-mono font-bold text-emerald-800">
                  UID: {firebaseAuthUser.uid.slice(0, 8)}...
                </span>
              </div>
              <div className="text-sm">
                Signed in as: <strong>{currentUser.name}</strong> ({currentUser.email || firebaseAuthUser.email})
              </div>
              <div className="text-xs text-emerald-700">
                Role: <strong className="capitalize">{currentUser.role}</strong> • Location: {currentUser.location}
              </div>
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveScreen(currentUser.role === 'technician' ? 9 : 3)}
                  className="px-4 py-2 bg-[#005f48] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Go to {currentUser.role === 'technician' ? 'Technician Portal' : 'My Dashboard'} →
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1 px-3 py-2 bg-white text-red-600 border border-red-200 rounded-lg text-xs font-semibold hover:bg-red-50 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}

          {/* Role Selector Tabs */}
          {!firebaseAuthUser && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#3e4944] mb-2 font-['Plus_Jakarta_Sans']">
                Select Your Platform Role
              </label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-[#f2f3ff] rounded-xl">
                <button
                  type="button"
                  onClick={() => setRole('consumer')}
                  className={`py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer font-['Plus_Jakarta_Sans'] ${
                    role === 'consumer'
                      ? 'bg-white text-[#005f48] shadow-xs border border-[#bdc9c2]/40 font-bold'
                      : 'text-[#3e4944] hover:text-[#131b2e]'
                  }`}
                >
                  <User className="w-4 h-4 text-[#005f48]" />
                  <span>Citizen / Device Owner</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole('technician')}
                  className={`py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer font-['Plus_Jakarta_Sans'] ${
                    role === 'technician'
                      ? 'bg-white text-[#005f48] shadow-xs border border-[#bdc9c2]/40 font-bold'
                      : 'text-[#3e4944] hover:text-[#131b2e]'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-[#005f48]" />
                  <span>Certified Technician</span>
                </button>
              </div>
            </div>
          )}

          {/* Quick Demo Instant Logins */}
          {!firebaseAuthUser && (
            <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                  <Sparkles className="w-3.5 h-3.5 text-[#005f48]" /> Quick Demo One-Click Test Personas
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">Instant Session</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('consumer')}
                  className="text-left px-3 py-2 bg-white hover:bg-emerald-100/50 rounded-lg border border-emerald-200 text-xs transition-colors cursor-pointer"
                >
                  <div className="font-bold text-slate-800">Kasun Perera</div>
                  <div className="text-[10px] text-slate-500">Citizen • Colombo 03 (3 devices)</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleDemoLogin('technician')}
                  className="text-left px-3 py-2 bg-white hover:bg-emerald-100/50 rounded-lg border border-emerald-200 text-xs transition-colors cursor-pointer"
                >
                  <div className="font-bold text-slate-800">Nuwan Silva</div>
                  <div className="text-[10px] text-slate-500">Master Tech • MicroTech Lab, Nugegoda</div>
                </button>
              </div>
            </div>
          )}

          {/* Feedback messages */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Standard Email / Password Form */}
          {!firebaseAuthUser && (
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Google One-Tap Sign In */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2.5 py-2.5 px-4 border border-slate-300 rounded-xl shadow-2xs text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 transition-colors cursor-pointer font-['Plus_Jakarta_Sans']"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google Account</span>
              </button>

              <div className="relative flex items-center justify-center my-2">
                <div className="border-t border-slate-200 w-full" />
                <span className="bg-white px-2 text-[11px] text-slate-400 uppercase font-semibold">or email</span>
                <div className="border-t border-slate-200 w-full" />
              </div>

              {isRegistering && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Ruwan Wickremasinghe"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-[#005f48]"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.lk"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-[#005f48]"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-[#005f48]"
                    required
                  />
                </div>
              </div>

              {isRegistering && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">
                      Phone (Sri Lanka)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+94 77 123 4567"
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-['Plus_Jakarta_Sans']">
                      District / Zone
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white"
                      >
                        <option value="Colombo 01-15">Colombo (01–15 Metro)</option>
                        <option value="Dehiwala-Mount Lavinia">Dehiwala-Mount Lavinia</option>
                        <option value="Nugegoda/Kotte">Nugegoda / Sri Jayawardenepura</option>
                        <option value="Gampaha">Gampaha District</option>
                        <option value="Kandy">Kandy</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {isRegistering && role === 'technician' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
                    <ShieldCheck className="w-4 h-4 text-[#005f48]" /> Technician Lab Registration
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Repair Lab / Business Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. MicroTech Precision Electronics Lab"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">NVQ Level 4 / Accreditation Ref</label>
                    <input
                      type="text"
                      value={certNumber}
                      onChange={(e) => setCertNumber(e.target.value)}
                      placeholder="e.g. NVQ-L4-ENG-2025"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl shadow-md text-xs font-bold text-white bg-[#005f48] hover:bg-[#007a5e] active:bg-[#004d40] transition-all cursor-pointer font-['Plus_Jakarta_Sans']"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Communicating with Firebase...</span>
                  </>
                ) : (
                  <>
                    <span>{isRegistering ? 'Register in Firebase' : 'Sign In with Firebase'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Toggle Register / Login */}
          {!firebaseAuthUser && (
            <div className="text-center pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className="text-xs font-semibold text-[#005f48] hover:underline cursor-pointer font-['Plus_Jakarta_Sans']"
              >
                {isRegistering
                  ? 'Already have an account? Sign in here'
                  : "Don't have an account yet? Register with Firebase"}
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
