import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, 
  query, where, onSnapshot, serverTimestamp, orderBy, 
  runTransaction, deleteDoc, getDocs, enableIndexedDbPersistence 
} from 'firebase/firestore';
import { 
  Coffee, ClipboardList, Users, CheckCircle, Ticket, 
  LogOut, Package, MapPin, Clock, Shield, ArrowRight, Lock, 
  User, Edit, Trash2, UserPlus, Building2, Wifi, WifiOff,
  LayoutDashboard, History, UserCircle
} from 'lucide-react';

// --- 1. Firebase Configuration ---
// GANTI DENGAN CONFIG ANDA JIKA BERBEDA
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

// --- OFFLINE PERSISTENCE ---
try {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.log('Persistence not supported by browser');
    }
  });
} catch (e) {
  console.log("Persistence init error:", e);
}

// --- 2. Helpers ---
const formatDate = (date) => date.toISOString().split('T')[0];
const getTodayString = () => formatDate(new Date());

const YARDS = ['Yard Cakung', 'Yard Sukapura', 'Yard Jababeka'];

const formatDateTime = (timestamp) => {
  if (!timestamp) return '-';
  const date = timestamp.toDate ? timestamp.toDate() : new Date(); 
  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).format(date);
};

// --- 3. Shared Components ---

const ConnectionStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;
    return (
        <div className="bg-red-500 text-white text-[10px] font-bold text-center py-1 absolute top-0 w-full z-50 flex items-center justify-center gap-1">
            <WifiOff size={12} /> MODE OFFLINE
        </div>
    );
};

const MobileWrapper = ({ children, className = "" }) => (
  <div className="min-h-screen bg-gray-900 flex justify-center items-center font-sans">
    <div className={`w-full max-w-md h-[100dvh] bg-gray-50 flex flex-col relative overflow-hidden shadow-2xl md:rounded-3xl ${className}`}>
      <ConnectionStatus />
      {children}
    </div>
  </div>
);

const CouponModal = ({ data, onClose }) => {
  if (!data) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xs rounded-3xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-blue-600 h-32 flex items-center justify-center text-center p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-50" style={{backgroundImage: 'radial-gradient(circle, #fff 2px, transparent 2.5px)', backgroundSize: '10px 10px'}}></div>
            <div className="relative z-10">
                <div className="bg-white/20 p-3 rounded-full inline-block mb-2 backdrop-blur-sm">
                  <Ticket className="text-white" size={32} />
                </div>
                <h3 className="text-white font-bold text-xl tracking-wider shadow-sm">KUPON DIGITAL</h3>
                <p className="text-blue-100 text-[10px] uppercase font-bold tracking-widest">{data.location}</p>
            </div>
        </div>
        
        <div className="p-6 pt-6 text-center bg-white relative">
            <div className="absolute -top-3 -left-3 w-6 h-6 bg-gray-900 rounded-full"></div>
            <div className="absolute -top-3 -right-3 w-6 h-6 bg-gray-900 rounded-full"></div>

            <h2 className="text-2xl font-black text-slate-800 mb-2 leading-tight">{data.drinkName}</h2>
            <div className={`border-2 border-dashed rounded-xl p-3 mb-6 ${data.status === 'approved' ? 'border-green-400 bg-green-50' : data.status === 'rejected' ? 'border-red-400 bg-red-50' : 'border-yellow-400 bg-yellow-50'}`}>
                <div className={`text-xl font-black uppercase tracking-widest ${data.status === 'approved' ? 'text-green-600' : data.status === 'rejected' ? 'text-red-600' : 'text-yellow-600'}`}>
                  {data.status === 'pending' ? 'MENUNGGU' : data.status === 'approved' ? 'DISETUJUI' : 'DITOLAK'}
                </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg mb-6">
               <div className="text-left">
                  <p className="text-[10px] text-gray-400 uppercase font-bold">Waktu Request</p>
                  <p className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Clock size={12}/> {formatDateTime(data.timestamp)}
                  </p>
               </div>
               {data.processedAt && (
                   <div className="text-right border-l pl-3">
                      <p className="text-[10px] text-gray-400 uppercase font-bold">Diproses</p>
                      <p className="text-xs font-bold text-slate-700">
                        {new Date(data.processedAt.toDate()).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})}
                      </p>
                   </div>
               )}
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
const LoginScreen = ({ onLoginSuccess }) => {
  const [nrp, setNrp] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Master Admin Bypass
      if (nrp.toUpperCase() === 'ADMIN' && password === 'GSI2025!') {
        onLoginSuccess({ uid: 'master-admin', nrp: 'ADMIN', role: 'general_admin', displayName: 'Master Admin' });
        return;
      }
      // Normal Login
      const q = query(collection(db, 'users'), where('nrp', '==', nrp), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        onLoginSuccess({ ...userData, uid: querySnapshot.docs[0].id });
      } else {
        setError('NRP atau Password salah!');
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi.');
      setLoading(false);
    }
  };

  return (
    <MobileWrapper className="bg-gradient-to-br from-slate-900 to-indigo-950">
      <div className="flex-1 flex flex-col justify-center px-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-md w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-xl mx-auto border border-white/10">
          <Coffee size={48} className="text-blue-300" />
        </div>
        <h1 className="text-3xl font-bold text-white text-center mb-2">SiapMinum GSI</h1>
        <p className="text-blue-200 mb-8 text-center text-sm opacity-80">Portal Layanan Karyawan</p>

        <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input type="text" placeholder="NRP Karyawan" className="w-full bg-white/10 text-white placeholder:text-gray-400 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-400"
              value={nrp} onChange={(e) => setNrp(e.target.value)} />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input type="password" placeholder="Password" className="w-full bg-white/10 text-white placeholder:text-gray-400 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-400"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {error && <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl"><p className="text-red-200 text-xs text-center font-bold">{error}</p></div>}
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold shadow-lg flex items-center justify-center gap-2 active:scale-95 hover:bg-blue-500 transition-all">
            {loading ? 'Memuat...' : 'Masuk'} <ArrowRight size={20} />
          </button>
        </form>
      </div>
    </MobileWrapper>
  );
};

// --- 5. Area Selection ---
const AreaSelectionScreen = ({ user, onSelectArea, onLogout }) => {
  return (
    <MobileWrapper className="bg-slate-50">
      <div className="p-8 h-full flex flex-col">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Pilih Area</h1>
                <p className="text-slate-500 text-sm">Halo, {user.displayName}</p>
            </div>
            <button onClick={onLogout} className="text-red-500 bg-red-50 p-2 rounded-full"><LogOut size={18}/></button>
        </div>
        
        <div className="grid gap-4">
            {YARDS.map((yard) => (
                <button key={yard} onClick={() => onSelectArea(yard)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-500 hover:shadow-md transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <Building2 size={24} />
                        </div>
                        <span className="font-bold text-lg text-slate-700">{yard}</span>
                    </div>
                    <ArrowRight className="text-slate-300 group-hover:text-blue-500" />
                </button>
            ))}
        </div>
      </div>
    </MobileWrapper>
  );
};

// --- 6. Admin Dashboard ---
const AdminDashboard = ({ user, area, logout }) => {
  const [activeTab, setActiveTab] = useState('approvals'); 
  const [inventory, setInventory] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  
  // State Input
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [editingItem, setEditingItem] = useState(null); 
  // User Management
  const [usersList, setUsersList] = useState([]);
  const [newUserNrp, setNewUserNrp] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserName, setNewUserName] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'inventory'), where('area', '==', area), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [area]);

  useEffect(() => {
    const q = query(collection(db, 'claims'), where('status', '==', 'pending'), where('area', '==', area), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => setPendingClaims(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [area]);

  useEffect(() => {
    if(user.role !== 'user') {
        const q = user.role === 'general_admin' 
            ? query(collection(db, 'users'), orderBy('displayName'))
            : query(collection(db, 'users'), where('role', '==', 'user'));
        return onSnapshot(q, (snap) => setUsersList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }
  }, [user.role]);

  const handleSaveInventory = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemStock) return;
    try {
        if (editingItem) {
            await updateDoc(doc(db, 'inventory', editingItem.id), {
                name: newItemName,
                warehouseStock: parseInt(newItemStock)
            });
            setEditingItem(null);
        } else {
            await addDoc(collection(db, 'inventory'), {
                name: newItemName,
                warehouseStock: parseInt(newItemStock),
                area: area,
                createdAt: serverTimestamp(),
            });
        }
        setNewItemName(''); setNewItemStock('');
    } catch(err) { alert("Error: " + err.message); }
  };

  const processClaim = async (claim, isApproved) => {
    try {
        const adminNrp = user.nrp || 'Admin';
        if (!isApproved) {
            await updateDoc(doc(db, 'claims', claim.id), {
                status: 'rejected',
                processedAt: serverTimestamp(),
                processedBy: adminNrp
            });
            return; 
        }
        await runTransaction(db, async (t) => {
            const invRef = doc(db, 'inventory', claim.inventoryId);
            const invDoc = await t.get(invRef);
            if (!invDoc.exists()) throw new Error("Barang dihapus!");
            const currentStock = invDoc.data().warehouseStock || 0;
            if (currentStock <= 0) throw new Error("Stok habis!");

            t.update(invRef, { warehouseStock: currentStock - 1 });
            t.update(doc(db, 'claims', claim.id), { 
                status: 'approved', 
                processedAt: serverTimestamp(), 
                processedBy: adminNrp 
            });
        });
    } catch (e) { alert("Gagal: " + e.message); }
  };

  const handleAddUser = async (e) => {
      e.preventDefault();
      try {
          await addDoc(collection(db, 'users'), {
              nrp: newUserNrp, password: newUserPass, displayName: newUserName,
              role: newUserRole, createdAt: serverTimestamp()
          });
          setNewUserNrp(''); setNewUserPass(''); setNewUserName('');
      } catch (e) { alert("Gagal tambah user"); }
  };

  return (
    <MobileWrapper>
      <div className="bg-indigo-900 text-white p-6 pt-10 rounded-b-[2.5rem] shadow-lg flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-indigo-300"/>
              <h2 className="text-xl font-bold">Admin Panel</h2>
            </div>
            <p className="text-sm mt-1 text-indigo-200 flex items-center gap-1"><MapPin size={12}/> {area}</p>
          </div>
          <button onClick={logout} className="bg-white/20 p-2 rounded-full hover:bg-white/30"><LogOut size={18} /></button>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => setActiveTab('approvals')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'approvals' ? 'bg-white text-indigo-900' : 'bg-white/10'}`}>
            <CheckCircle size={20} /> <span className="text-[10px] font-bold">Approval</span>
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'inventory' ? 'bg-white text-indigo-900' : 'bg-white/10'}`}>
            <Package size={20} /> <span className="text-[10px] font-bold">Stok</span>
          </button>
          {(user.role === 'general_admin' || user.role === 'admin_area') && (
             <button onClick={() => setActiveTab('users')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'users' ? 'bg-white text-indigo-900' : 'bg-white/10'}`}>
                <Users size={20} /> <span className="text-[10px] font-bold">Users</span>
             </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 bg-slate-50">
        {activeTab === 'approvals' && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700">Klaim Menunggu ({pendingClaims.length})</h3>
            {pendingClaims.length === 0 && <div className="text-center py-10 text-gray-400">Tidak ada antrian.</div>}
            {pendingClaims.map(claim => (
                <div key={claim.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-bold text-slate-800 text-lg">{claim.userName}</div>
                            <div className="text-xs text-gray-500 mb-2">NRP: {claim.userNrp}</div>
                            <div className="bg-blue-50 px-3 py-1 rounded-lg inline-block border border-blue-100">
                                <span className="text-sm text-blue-700 font-bold flex items-center gap-1"><Coffee size={14}/> {claim.drinkName}</span>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-400 font-bold bg-gray-100 px-2 py-1 rounded">
                           {formatDateTime(claim.timestamp).split(',')[1]}
                        </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                        <button onClick={() => processClaim(claim, true)} className="flex-1 bg-emerald-500 text-white py-3 rounded-xl font-bold text-sm shadow-md active:scale-95">Terima</button>
                        <button onClick={() => processClaim(claim, false)} className="flex-1 bg-white text-red-500 py-3 rounded-xl font-bold text-sm border border-red-100 shadow-sm active:scale-95">Tolak</button>
                    </div>
                </div>
            ))}
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="space-y-4">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100">
                <h3 className="font-bold text-sm mb-3 text-slate-700">{editingItem ? 'Edit Stok' : 'Tambah Stok Baru'}</h3>
                <form onSubmit={handleSaveInventory} className="space-y-2">
                    <input required placeholder="Nama Minuman" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" 
                        value={newItemName} onChange={e=>setNewItemName(e.target.value)} />
                    <div className="flex gap-2">
                        <input required type="number" placeholder="Jumlah" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" 
                            value={newItemStock} onChange={e=>setNewItemStock(e.target.value)} />
                        <button type="submit" className={`px-4 py-2 rounded-lg text-white font-bold text-sm ${editingItem ? 'bg-orange-500' : 'bg-indigo-600'}`}>{editingItem ? 'Update' : 'Simpan'}</button>
                    </div>
                </form>
             </div>
             <div className="space-y-2">
                {inventory.map(item => (
                    <div key={item.id} className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Package className="text-slate-400" size={18}/>
                            <div>
                                <div className="font-bold text-slate-700 text-sm">{item.name}</div>
                                <div className="text-[10px] text-gray-400">Sisa: {item.warehouseStock}</div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={()=>{setEditingItem(item); setNewItemName(item.name); setNewItemStock(item.warehouseStock); window.scrollTo(0,0);}} className="p-2 bg-orange-50 text-orange-500 rounded-lg"><Edit size={14}/></button>
                            <button onClick={()=>confirm("Hapus?") && deleteDoc(doc(db, 'inventory', item.id))} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        )}

        {activeTab === 'users' && (
             <div className="space-y-4">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100">
                    <h3 className="font-bold text-sm mb-3 text-slate-700 flex items-center gap-2"><UserPlus size={16}/> Tambah User</h3>
                    <form onSubmit={handleAddUser} className="space-y-2">
                        <input required placeholder="Nama Lengkap" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={newUserName} onChange={e=>setNewUserName(e.target.value)} />
                        <input required type="text" placeholder="NRP" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={newUserNrp} onChange={e=>setNewUserNrp(e.target.value)} />
                        <input required type="text" placeholder="Password" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={newUserPass} onChange={e=>setNewUserPass(e.target.value)} />
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm" value={newUserRole} onChange={e=>setNewUserRole(e.target.value)} disabled={user.role === 'admin_area'}>
                            <option value="user">User (Karyawan)</option>
                            {user.role === 'general_admin' && <><option value="admin_area">Admin Area</option><option value="general_admin">General Admin</option></>}
                        </select>
                        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold text-sm">Simpan</button>
                    </form>
                 </div>
                 <div className="space-y-2">
                      {usersList.map(u => (
                          <div key={u.id} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                              <div><div className="font-bold text-sm text-slate-700">{u.displayName}</div><div className="text-[10px] text-gray-400">{u.nrp}</div></div>
                              <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">{u.role}</span>
                          </div>
                      ))}
                 </div>
             </div>
        )}
      </div>
    </MobileWrapper>
  );
};

// --- 7. Employee Dashboard (PEMBAHARUAN BESAR) ---
const EmployeeDashboard = ({ user, area, logout }) => {
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, history, profile
  const [menuItems, setMenuItems] = useState([]);
  const [todaysClaim, setTodaysClaim] = useState(null);
  const [showCoupon, setShowCoupon] = useState(false);
  const [historyList, setHistoryList] = useState([]); // State untuk riwayat

  // Fetch Menu
  useEffect(() => {
    const q = query(collection(db, 'inventory'), where('area', '==', area), orderBy('name'));
    return onSnapshot(q, (snap) => setMenuItems(snap.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [area]);

  // Fetch Today's Claim (Cek status pending/approved hari ini)
  useEffect(() => {
    // Cari klaim hari ini yang TIDAK ditolak
    const q = query(
        collection(db, 'claims'), 
        where('userId', '==', user.uid), 
        where('date', '==', getTodayString()),
        where('status', '!=', 'rejected') 
    );
    return onSnapshot(q, (snap) => {
      if (!snap.empty) setTodaysClaim({ id: snap.docs[0].id, ...snap.docs[0].data() });
      else setTodaysClaim(null);
    });
  }, [user]);

  // Fetch Full History (Saat Tab History aktif)
  useEffect(() => {
      if (activeTab === 'history') {
          const q = query(collection(db, 'claims'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'));
          return onSnapshot(q, (snap) => setHistoryList(snap.docs.map(d => ({id: d.id, ...d.data()}))));
      }
  }, [activeTab, user]);

  const handleOrder = async (item) => {
    if (todaysClaim) return;
    if (item.warehouseStock <= 0) { alert("Stok Habis!"); return; }

    try {
        const claimData = {
            userId: user.uid,
            userName: user.displayName,
            userNrp: user.nrp || '-',
            inventoryId: item.id,
            drinkName: item.name,
            date: getTodayString(),
            status: 'pending', // Awal klaim statusnya PENDING
            location: area,
            area: area, 
            timestamp: serverTimestamp()
        };
        await addDoc(collection(db, 'claims'), claimData);
        // User tidak perlu mengurangi stok di sini. 
        // Admin approval yang akan mengurangi stok via Transaction.
        // Tampilan stok di user akan update otomatis karena onSnapshot menuItems.
        setShowCoupon(true);
    } catch (e) { alert("Gagal klaim: " + e.message); }
  };

  // --- SUB-COMPONENTS VIEW ---

  const DashboardView = () => (
    <div className="p-6 pb-28">
        {/* Banner Status */}
         <div className={`p-5 rounded-3xl text-white shadow-xl mb-6 relative overflow-hidden ${todaysClaim ? 'bg-slate-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
             <div className="relative z-10">
                 <p className="text-xs opacity-80 mb-1">Status Hari Ini</p>
                 <h3 className="text-2xl font-bold flex items-center gap-2">
                     {todaysClaim ? (todaysClaim.status === 'pending' ? 'Menunggu Approval' : 'Siap Diambil') : 'Belum Klaim'}
                     {todaysClaim && todaysClaim.status === 'approved' && <CheckCircle size={20} className="text-green-400"/>}
                 </h3>
                 {todaysClaim && (
                     <button onClick={()=>setShowCoupon(true)} className="mt-3 bg-white/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/30 transition-all">
                         <Ticket size={14}/> Lihat E-Tiket
                     </button>
                 )}
             </div>
             <ClipboardList className="absolute right-4 bottom-4 text-white/10" size={60} />
         </div>

         <h3 className="font-bold text-slate-700 mb-4">Menu Tersedia</h3>
         <div className="space-y-3">
             {menuItems.length === 0 && <p className="text-gray-400 text-center text-sm">Menu belum tersedia.</p>}
             {menuItems.map(item => (
                 <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                             <Coffee size={24}/>
                         </div>
                         <div>
                             <div className="font-bold text-slate-800">{item.name}</div>
                             {/* Badge Stok */}
                             <div className={`text-xs font-bold px-2 py-0.5 rounded-md w-fit mt-1 flex items-center gap-1 ${item.warehouseStock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 <Package size={10} /> Stok: {item.warehouseStock}
                             </div>
                         </div>
                     </div>
                     <button 
                       disabled={todaysClaim || item.warehouseStock <= 0}
                       onClick={()=>handleOrder(item)}
                       className={`px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all active:scale-95 ${todaysClaim || item.warehouseStock <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                     >
                         {todaysClaim ? 'Selesai' : item.warehouseStock <= 0 ? 'Habis' : 'Klaim'}
                     </button>
                 </div>
             ))}
         </div>
    </div>
  );

  const HistoryView = () => (
      <div className="p-6 pb-28">
          <h3 className="font-bold text-slate-700 mb-4 text-xl">Riwayat Klaim</h3>
          <div className="space-y-3">
              {historyList.length === 0 && <p className="text-gray-400 text-center mt-10">Belum ada riwayat.</p>}
              {historyList.map(item => (
                  <div key={item.id} onClick={() => {if(item.date === getTodayString()) setShowCoupon(true)}} className={`bg-white p-4 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden ${item.date === getTodayString() ? 'cursor-pointer ring-1 ring-blue-400' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                          <span className="font-bold text-slate-800">{item.drinkName}</span>
                          <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-1 rounded-full">{item.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                          <div className={`text-xs font-bold px-2 py-1 rounded flex items-center gap-1 
                              ${item.status === 'approved' ? 'bg-green-100 text-green-600' : 
                                item.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                              {item.status === 'approved' ? <CheckCircle size={12}/> : item.status === 'rejected' ? <WifiOff size={12}/> : <Clock size={12}/>}
                              {item.status === 'approved' ? 'Disetujui' : item.status === 'rejected' ? 'Ditolak' : 'Menunggu'}
                          </div>
                          {item.date === getTodayString() && <span className="text-[10px] text-blue-500 font-bold">Hari Ini</span>}
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const ProfileView = () => (
      <div className="p-6 pb-28">
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 text-center mb-6">
              <div className="w-20 h-20 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center text-slate-400">
                  <User size={40} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">{user.displayName}</h2>
              <p className="text-slate-500 text-sm mb-4">{user.nrp || 'No NRP'}</p>
              <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold inline-flex items-center gap-2">
                  <MapPin size={14} /> {area}
              </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <button onClick={logout} className="w-full p-4 text-left flex items-center justify-between hover:bg-slate-50 text-red-500 font-bold">
                  <span className="flex items-center gap-3"><LogOut size={18}/> Keluar Akun</span>
                  <ArrowRight size={16} className="text-red-300"/>
              </button>
          </div>
          <p className="text-center text-gray-300 text-xs mt-8">Versi Aplikasi 2.1.0</p>
      </div>
  );

  return (
    <MobileWrapper className="bg-slate-50">
      {showCoupon && <CouponModal data={todaysClaim} onClose={() => setShowCoupon(false)} />}
      
      {/* HEADER FIXED */}
      <div className="bg-white px-6 py-4 rounded-b-3xl shadow-sm sticky top-0 z-20 flex justify-between items-center">
         <div>
             <h2 className="text-lg font-bold text-slate-800">
                {activeTab === 'dashboard' ? 'Beranda' : activeTab === 'history' ? 'Riwayat' : 'Profil Saya'}
             </h2>
             <p className="text-xs text-slate-400 flex items-center gap-1"><MapPin size={10}/> {area}</p>
         </div>
         <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs">
             {user.displayName.charAt(0)}
         </div>
      </div>

      {/* CONTENT SCROLLABLE */}
      <div className="flex-1 overflow-y-auto h-full">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'history' && <HistoryView />}
          {activeTab === 'profile' && <ProfileView />}
      </div>

      {/* BOTTOM NAVIGATION */}
      <div className="absolute bottom-0 w-full bg-white border-t border-slate-100 py-3 px-6 pb-6 rounded-t-2xl shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-30 flex justify-between items-center">
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'dashboard' ? 'text-blue-600 scale-105' : 'text-slate-400'}`}
          >
              <div className={`p-1.5 rounded-xl ${activeTab === 'dashboard' ? 'bg-blue-50' : 'bg-transparent'}`}>
                <LayoutDashboard size={22} strokeWidth={activeTab === 'dashboard' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold">Dashboard</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('history')} 
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'history' ? 'text-blue-600 scale-105' : 'text-slate-400'}`}
          >
              <div className={`p-1.5 rounded-xl ${activeTab === 'history' ? 'bg-blue-50' : 'bg-transparent'}`}>
                <History size={22} strokeWidth={activeTab === 'history' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold">Riwayat</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-blue-600 scale-105' : 'text-slate-400'}`}
          >
              <div className={`p-1.5 rounded-xl ${activeTab === 'profile' ? 'bg-blue-50' : 'bg-transparent'}`}>
                <UserCircle size={22} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-bold">Profil</span>
          </button>
      </div>
    </MobileWrapper>
  );
};

// --- 8. Main App ---
const App = () => {
  const [user, setUser] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setSelectedArea(null);
  };

  if (!user) return <LoginScreen onLoginSuccess={setUser} />;
  if (!selectedArea) return <AreaSelectionScreen user={user} onSelectArea={setSelectedArea} onLogout={handleLogout} />;
  
  // Logic Role
  if (['admin_area', 'general_admin'].includes(user.role)) {
      return <AdminDashboard user={user} area={selectedArea} logout={handleLogout} />;
  }

  return <EmployeeDashboard user={user} area={selectedArea} logout={handleLogout} />;
};

export default App;