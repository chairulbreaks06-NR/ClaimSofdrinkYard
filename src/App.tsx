import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc,
  updateDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp,
  orderBy,
  runTransaction
} from 'firebase/firestore';
import { 
  Coffee, ClipboardList, Users, Plus, CheckCircle, XCircle, Calendar, 
  LogOut, Package, MapPin, Home, Clock, CupSoda, Droplet, Shield, 
  ArrowRight, Lock, User, Ticket
} from 'lucide-react';

// --- 1. Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDVNvKd6x4Iw_BIvP6OFRB9cSrXXIW5SD4",
  authDomain: "claimlunchmkt.firebaseapp.com",
  projectId: "claimlunchmkt",
  storageBucket: "claimlunchmkt.firebasestorage.app",
  messagingSenderId: "502120224174",
  appId: "1:502120224174:web:d8f3b330ccdb31a825a43f"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- 2. Helpers ---
const formatDate = (date) => date.toISOString().split('T')[0];
const getTodayString = () => formatDate(new Date());

// --- 3. Shared Components ---

const MobileWrapper = ({ children, className = "" }) => (
  <div className="min-h-screen bg-gray-900 flex justify-center items-center font-sans">
    <div className={`w-full max-w-md h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden shadow-2xl md:rounded-3xl ${className}`}>
      {children}
    </div>
  </div>
);

const CouponModal = ({ data, onClose }) => {
  if (!data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xs rounded-3xl overflow-hidden relative shadow-2xl transform transition-all scale-100 animate-in zoom-in-95 duration-300">
        <div className="bg-blue-600 h-32 relative overflow-hidden flex items-center justify-center">
            <div className="text-center z-10">
                <div className="bg-white/20 p-3 rounded-full inline-block mb-2 backdrop-blur-sm">
                  <Ticket className="text-white" size={32} />
                </div>
                <h3 className="text-white font-bold text-xl tracking-wider">KUPON KLAIM</h3>
                <p className="text-blue-100 text-[10px] tracking-[0.2em] uppercase">PT Global Service Indonesia</p>
            </div>
        </div>
        <div className="p-6 pt-8 text-center relative bg-white">
            <div className="mb-6">
                <p className="text-gray-400 text-[10px] uppercase font-bold mb-1 tracking-wider">Item Minuman</p>
                <h2 className="text-2xl font-black text-slate-800 leading-tight">{data.drinkName}</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6 text-left bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div>
                    <p className="text-gray-400 text-[9px] uppercase font-bold">Lokasi</p>
                    <p className="font-bold text-xs text-slate-700">{data.location || 'Yard'}</p>
                </div>
                <div>
                    <p className="text-gray-400 text-[9px] uppercase font-bold">Tanggal</p>
                    <p className="font-bold text-xs text-slate-700">{data.date}</p>
                </div>
            </div>
            <div className={`border-2 border-dashed rounded-xl p-4 mb-6 ${data.status === 'approved' ? 'border-green-400 bg-green-50' : data.status === 'rejected' ? 'border-red-400 bg-red-50' : 'border-yellow-400 bg-yellow-50'}`}>
                <p className={`text-[10px] font-bold uppercase tracking-widest ${data.status === 'approved' ? 'text-green-600' : data.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>Status Kupon</p>
                <div className={`text-2xl font-black uppercase tracking-[0.2em] mt-1 ${data.status === 'approved' ? 'text-green-500' : data.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {data.status || 'PENDING'}
                </div>
            </div>
            <button onClick={onClose} className="w-full bg-slate-800 text-white font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform">
                Tutup
            </button>
        </div>
      </div>
    </div>
  );
};

// --- 4. Login Screen ---
const LoginScreen = ({ setManualUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    setTimeout(() => {
        if (email === 'admin@gsi.co.id' && password === 'Admin123!') {
            setManualUser({
                uid: 'admin-gsi-id',
                email: 'admin@gsi.co.id',
                role: 'admin',
                displayName: 'Admin Pusat'
            });
        } 
        else if (email === 'karyawan@gsi.co.id' && password === 'User123!') {
            setManualUser({
                uid: 'karyawan-gsi-001', 
                email: 'karyawan@gsi.co.id',
                role: 'employee',
                displayName: 'Karyawan GSI'
            });
        } 
        else {
            setError('Email atau Password salah!');
            setLoading(false);
        }
    }, 800);
  };

  return (
    <MobileWrapper className="bg-gradient-to-br from-slate-800 to-indigo-900">
      <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-md w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl mx-auto border border-white/10">
          <Coffee size={48} className="text-blue-300" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-2">SiapMinum</h1>
        <p className="text-blue-200 mb-8 text-center text-sm opacity-80">PT Global Service Indonesia</p>

        <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="text" 
              placeholder="Email Perusahaan" 
              className="w-full bg-white/10 text-white placeholder:text-gray-400 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-white/10 text-white placeholder:text-gray-400 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-400 focus:bg-white/20 transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error && <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl"><p className="text-red-200 text-xs text-center font-bold">{error}</p></div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-transform hover:shadow-blue-500/30"
          >
            {loading ? 'Memverifikasi...' : 'Masuk Aplikasi'} <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-white/40 text-[10px] mb-3 uppercase tracking-widest font-bold">Mode Demo (Klik Untuk Isi)</p>
            <div className="flex gap-2 justify-center">
                <button onClick={() => {setEmail('admin@gsi.co.id'); setPassword('Admin123!')}} className="text-[10px] bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-400/30 text-indigo-200 px-4 py-2 rounded-lg transition-colors">
                    Akun Admin
                </button>
                <button onClick={() => {setEmail('karyawan@gsi.co.id'); setPassword('User123!')}} className="text-[10px] bg-blue-500/20 hover:bg-blue-500/40 border border-blue-400/30 text-blue-200 px-4 py-2 rounded-lg transition-colors">
                    Akun Karyawan
                </button>
            </div>
        </div>
      </div>
    </MobileWrapper>
  );
};

// --- 5. Admin Dashboard ---
const AdminDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('approvals');
  const [inventory, setInventory] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'inventory'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => {
      setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  useEffect(() => {
    const q = query(
        collection(db, 'claims'),
        where('status', '==', 'pending'),
        orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (snap) => {
      setPendingClaims(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
  }, []);

  const handleAddInventory = async (e) => {
    e.preventDefault();
    if (!newItemName) return;
    try {
        await addDoc(collection(db, 'inventory'), {
          name: newItemName,
          warehouseStock: parseInt(newItemStock),
          createdAt: serverTimestamp(),
          claimedToday: 0
        });
        setNewItemName(''); setNewItemStock(0);
    } catch(err) {
        alert("Gagal tambah stok: " + err.message);
    }
  };

  // --- FIX ERROR APPROVE ---
  const processClaim = async (claim, isApproved) => {
    try {
        // Validasi: Pastikan inventoryId ada
        if (!claim.inventoryId) {
            alert("Error: Data stok tidak valid (ID Hilang). Silakan tolak klaim ini.");
            return;
        }

        const claimRef = doc(db, 'claims', claim.id);
        
        if (isApproved) {
            await runTransaction(db, async (t) => {
                // Cek ketersediaan dokumen stok
                const invRef = doc(db, 'inventory', claim.inventoryId);
                const invDoc = await t.get(invRef);
                
                if (!invDoc.exists()) {
                    throw "Data stok minuman ini sudah dihapus dari master!";
                }

                // 1. Update status klaim
                t.update(claimRef, { status: 'approved', processedAt: serverTimestamp(), processedBy: user.email });
                
                // 2. Kurangi Stok Gudang
                const currentStock = invDoc.data().warehouseStock || 0;
                const newStock = Math.max(0, currentStock - 1);
                t.update(invRef, { warehouseStock: newStock });
            });
        } else {
            await updateDoc(claimRef, { status: 'rejected', processedAt: serverTimestamp(), processedBy: user.email });
        }
    } catch (e) { 
        console.error("Error processing claim:", e);
        // Tampilkan pesan error yang lebih jelas ke user
        alert("Gagal memproses: " + (typeof e === 'string' ? e : e.message));
    }
  };

  return (
    <MobileWrapper>
      <div className="bg-indigo-900 text-white p-6 pt-10 rounded-b-[2.5rem] shadow-lg z-10 flex-shrink-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-indigo-300"/>
              <h2 className="text-xl font-bold">Admin GSI</h2>
            </div>
            <p className="text-sm mt-1 text-indigo-200">Dashboard Manajemen</p>
          </div>
          <button onClick={logout} className="bg-white/20 p-2 rounded-full hover:bg-white/30 backdrop-blur-sm transition-colors">
            <LogOut size={18} />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`p-4 rounded-2xl flex flex-col items-start gap-2 transition-all ${activeTab === 'approvals' ? 'bg-white text-slate-800 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <div className="flex justify-between w-full">
              <CheckCircle size={24} />
              {pendingClaims.length > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm animate-pulse">{pendingClaims.length}</span>}
            </div>
            <span className="font-bold text-sm">Approval</span>
          </button>
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`p-4 rounded-2xl flex flex-col items-start gap-2 transition-all ${activeTab === 'inventory' ? 'bg-white text-slate-800 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}
          >
            <Package size={24} />
            <span className="font-bold text-sm">Master Stok</span>
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 bg-slate-50">
        {activeTab === 'approvals' && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700">Klaim Menunggu ({pendingClaims.length})</h3>
            {pendingClaims.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-200">
                <CheckCircle size={48} className="mx-auto mb-3 opacity-20 text-green-500" />
                <p>Semua beres! Tidak ada antrian.</p>
              </div>
            ) : (
              pendingClaims.map(claim => (
                <div key={claim.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 relative overflow-hidden">
                  <div className="flex justify-between items-start mt-1">
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{claim.userName}</div>
                      <div className="text-indigo-600 font-medium text-sm flex items-center gap-1">
                        <Coffee size={14}/> {claim.drinkName}
                      </div>
                    </div>
                    <div className="text-right pt-4">
                       <div className="text-xs text-slate-400 font-mono">{claim.timestamp ? new Date(claim.timestamp.seconds * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : ''}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <button onClick={() => processClaim(claim, true)} className="bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      <CheckCircle size={16}/> Terima
                    </button>
                    <button onClick={() => processClaim(claim, false)} className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                      <XCircle size={16}/> Tolak
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <h3 className="font-bold text-sm mb-3 flex items-center gap-2 text-slate-700">
                <Plus size={16} className="text-indigo-500"/> Tambah Stok Gudang
              </h3>
              <form onSubmit={handleAddInventory} className="flex gap-2">
                {/* --- FIX FONT COLOR: text-gray-900 --- */}
                <input required placeholder="Nama Minuman" className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" value={newItemName} onChange={e=>setNewItemName(e.target.value)} />
                <input required type="number" placeholder="Qty" className="w-20 bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center" value={newItemStock} onChange={e=>setNewItemStock(e.target.value)} />
                <button className="bg-indigo-600 text-white p-3 rounded-xl shadow-md hover:bg-indigo-700 transition-transform active:scale-95"><Plus size={20}/></button>
              </form>
            </div>

            <div className="space-y-2">
              <h3 className="font-bold text-slate-700 px-2 text-sm">Stok Saat Ini</h3>
              {inventory.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                      <Package size={20} />
                    </div>
                    <div>
                        <span className="font-bold text-slate-700 block">{item.name}</span>
                        <span className="text-[10px] text-gray-400">Update: {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : '-'}</span>
                    </div>
                  </div>
                  <div className="bg-indigo-50 text-indigo-700 px-4 py-1.5 rounded-lg font-mono font-bold text-sm">
                    {item.warehouseStock}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </MobileWrapper>
  );
};

// --- 6. Employee Dashboard ---
const EmployeeDashboard = ({ user, logout }) => {
  const [activeTab, setActiveTab] = useState('menu'); 
  const [menuItems, setMenuItems] = useState([]);
  
  // State untuk Kupon
  const [todaysClaim, setTodaysClaim] = useState(null); // Menyimpan objek klaim hari ini
  const [showCoupon, setShowCoupon] = useState(false);
  
  const today = getTodayString();

  useEffect(() => {
    const q = query(collection(db, 'inventory'), orderBy('name'));
    return onSnapshot(q, (snap) => {
        setMenuItems(snap.docs.map(d => ({id: d.id, ...d.data()})));
    });
  }, []);

  // Update Logic: Simpan data klaim hari ini untuk ditampilkan di Dashboard
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'claims'),
      where('userId', '==', user.uid),
      where('date', '==', today),
      where('status', '!=', 'rejected')
    );
    return onSnapshot(q, (snap) => {
      if (!snap.empty) {
        // Ambil data klaim pertama yang valid
        const docData = snap.docs[0];
        setTodaysClaim({ id: docData.id, ...docData.data() });
      } else {
        setTodaysClaim(null);
      }
    });
  }, [user, today]);

  const handleOrder = async (item) => {
    if (todaysClaim) return;
    if (item.warehouseStock <= 0) {
        alert("Maaf, Stok Habis!");
        return;
    }

    try {
        const claimData = {
            userId: user.uid,
            userName: user.displayName || 'Karyawan',
            inventoryId: item.id,
            drinkName: item.name,
            date: today,
            status: 'pending',
            location: 'Kantor Pusat', 
            timestamp: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'claims'), claimData);
        
        // Langsung set state lokal untuk tampilan instan
        setTodaysClaim({ id: docRef.id, ...claimData, timestamp: new Date() });
        setShowCoupon(true);

    } catch (e) { 
        console.error(e);
        alert("Gagal klaim: " + e.message);
    }
  };

  return (
    <MobileWrapper className="bg-gray-50">
      
      {/* Tampilkan Kupon jika showCoupon true ATAU user klik tombol lihat tiket */}
      {showCoupon && <CouponModal data={todaysClaim} onClose={() => setShowCoupon(false)} />}

      <div className="sticky top-0 bg-white z-20 px-6 pt-8 pb-4 shadow-sm rounded-b-[2rem]">
        <div className="flex justify-between items-center mb-2">
           <div>
             <div className="flex items-center gap-1 text-xs text-gray-500 font-medium">
               <MapPin size={12} className="text-blue-600" />
               Lokasi Anda
             </div>
             <div className="font-bold text-gray-800 text-lg">
               PT Global Service Indonesia
             </div>
           </div>
           <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold border-2 border-blue-200 shadow-sm uppercase">
             {user.email?.[0]}
           </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto pb-24 no-scrollbar p-6 pt-4">
        {activeTab === 'menu' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* --- CARD STATUS HARIAN (Updated) --- */}
            <div className={`rounded-3xl p-5 text-white shadow-xl relative overflow-hidden transition-all
              ${todaysClaim ? 'bg-slate-800 shadow-slate-200' : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-200'}`}>
               <div className="relative z-10 flex justify-between items-center">
                 <div>
                   <p className="text-white/80 text-xs font-medium mb-1">Status Harian</p>
                   <h2 className="text-2xl font-bold flex items-center gap-2">
                     {todaysClaim ? 'Sudah Klaim' : '1 Jatah Tersedia'}
                     {todaysClaim && <CheckCircle size={20} className="text-green-400" />}
                   </h2>
                   
                   {/* Tombol Lihat Kupon (FITUR BARU) */}
                   {todaysClaim && (
                      <button 
                        onClick={() => setShowCoupon(true)}
                        className="mt-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                      >
                        <Ticket size={14}/> Lihat E-Tiket
                      </button>
                   )}
                   {!todaysClaim && <p className="text-xs text-white/60 mt-1">{today}</p>}
                 </div>
                 <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                   <ClipboardList className="text-white" size={24} />
                 </div>
               </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2">
                <Coffee size={16} className="text-blue-600"/> Menu Tersedia
              </h3>
              
              <div className="space-y-3">
                 {menuItems.length === 0 && <p className="text-center text-gray-400 text-sm py-8">Belum ada stok tersedia.</p>}
                 {menuItems.map(item => {
                      const isAvailable = !todaysClaim && item.warehouseStock > 0;
                      return (
                        <div key={item.id} className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex gap-4 transition-all hover:shadow-md">
                           <div className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 bg-blue-50 text-blue-400">
                             <Coffee size={28}/>
                           </div>
                           <div className="flex-1 flex flex-col justify-between py-1">
                              <div>
                                <h4 className="font-bold text-gray-800 line-clamp-1 text-lg">{item.name}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                   <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.warehouseStock === 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                     Sisa: {item.warehouseStock}
                                   </span>
                                </div>
                              </div>
                              <button 
                                disabled={!isAvailable}
                                onClick={() => handleOrder(item)}
                                className={`w-full py-2 rounded-lg text-xs font-bold transition-colors mt-2
                                  ${!isAvailable 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'}`}
                              >
                                {todaysClaim ? 'Besok Lagi' : item.warehouseStock === 0 ? 'Habis' : 'Klaim Sekarang'}
                              </button>
                           </div>
                        </div>
                      );
                 })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
           <div className="animate-in fade-in duration-300">
             <HistorySection user={user} />
           </div>
        )}
      </div>

      <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 px-8 py-3 pb-6 flex justify-around items-center z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-3xl">
         <NavButton icon={Home} label="Menu" active={activeTab === 'menu'} onClick={() => setActiveTab('menu')} />
         <div className="w-px h-8 bg-gray-100"></div>
         <NavButton icon={Clock} label="Riwayat" active={activeTab === 'history'} onClick={() => setActiveTab('history')} />
         <div className="w-px h-8 bg-gray-100"></div>
         <NavButton icon={LogOut} label="Keluar" active={false} onClick={logout} />
      </div>
    </MobileWrapper>
  );
};

const NavButton = ({ icon: Icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all w-20 ${active ? 'text-blue-600 scale-105' : 'text-gray-400'}`}>
    <Icon size={24} strokeWidth={active ? 2.5 : 2} className={active ? "text-blue-600" : "text-gray-400"} />
    <span className={`text-[10px] font-bold ${active ? 'text-blue-600' : 'text-gray-400'}`}>{label}</span>
  </button>
);

const HistorySection = ({ user }) => {
  const [claims, setClaims] = useState([]);
  useEffect(() => {
    const q = query(
        collection(db, 'claims'), 
        where('userId', '==', user.uid), 
        orderBy('timestamp', 'desc')
    );
    return onSnapshot(q, (s) => setClaims(s.docs.map(d => ({id:d.id, ...d.data()}))));
  }, [user]);

  return (
    <div>
      <h2 className="font-bold text-lg mb-4 text-gray-800 flex items-center gap-2">
        <Clock size={18} className="text-blue-600"/> Riwayat Pesanan
      </h2>
      <div className="space-y-3">
        {claims.length === 0 ? (
          <div className="text-center py-12 text-gray-400">Belum ada riwayat.</div>
        ) : claims.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div>
              <div className="font-bold text-gray-800">{c.drinkName}</div>
              <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                <Calendar size={12}/> {c.date}
                <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                <span className={`font-bold ${c.status === 'approved' ? 'text-green-500' : c.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                    {c.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 7. Main App ---
const App = () => {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };
  
  if (!user) {
    return <LoginScreen setManualUser={setUser} />;
  }
  
  if (user.role === 'admin') {
      return <AdminDashboard user={user} logout={handleLogout} />;
  }
  
  return <EmployeeDashboard user={user} logout={handleLogout} />;
};

export default App;