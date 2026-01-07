import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, doc, addDoc, updateDoc, 
  query, where, onSnapshot, serverTimestamp, orderBy, 
  runTransaction, deleteDoc, getDocs, setDoc 
} from 'firebase/firestore';
import { 
  Coffee, ClipboardList, Users, Plus, CheckCircle, XCircle, Calendar, 
  LogOut, Package, MapPin, Home, Clock, Shield, ArrowRight, Lock, 
  User, Ticket, Edit, Trash2, UserPlus, Building2
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

// --- 2. Helpers & Constants ---
const formatDate = (date) => date.toISOString().split('T')[0];
const getTodayString = () => formatDate(new Date());

const YARDS = ['Yard Cakung', 'Yard Sukapura', 'Yard Jababeka'];

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
      <div className="bg-white w-full max-w-xs rounded-3xl overflow-hidden relative shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="bg-blue-600 h-32 flex items-center justify-center text-center p-4">
            <div>
                <div className="bg-white/20 p-3 rounded-full inline-block mb-2">
                  <Ticket className="text-white" size={32} />
                </div>
                <h3 className="text-white font-bold text-xl tracking-wider">KUPON DIGITAL</h3>
                <p className="text-blue-100 text-[10px] uppercase">{data.location}</p>
            </div>
        </div>
        <div className="p-6 pt-8 text-center bg-white">
            <h2 className="text-2xl font-black text-slate-800 mb-6">{data.drinkName}</h2>
            <div className={`border-2 border-dashed rounded-xl p-4 mb-6 ${data.status === 'approved' ? 'border-green-400 bg-green-50' : data.status === 'rejected' ? 'border-red-400 bg-red-50' : 'border-yellow-400 bg-yellow-50'}`}>
                <div className={`text-2xl font-black uppercase tracking-widest ${data.status === 'approved' ? 'text-green-500' : data.status === 'rejected' ? 'text-red-500' : 'text-yellow-500'}`}>
                  {data.status}
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

// --- 4. Login & Setup Screens ---

const LoginScreen = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Cek Master Login (Hardcoded untuk Initial Setup)
      if (email === 'master@gsi.co.id' && password === 'Master123!') {
        onLoginSuccess({
           uid: 'master-admin',
           email: 'master@gsi.co.id',
           role: 'general_admin',
           displayName: 'Master Admin'
        });
        return;
      }

      // 2. Cek Database Users
      const q = query(collection(db, 'users'), where('email', '==', email), where('password', '==', password));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        onLoginSuccess({ ...userData, uid: querySnapshot.docs[0].id });
      } else {
        setError('Email atau Password salah!');
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
        <p className="text-blue-200 mb-8 text-center text-sm opacity-80">Portal Layanan Umum</p>

        <form onSubmit={handleLogin} className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative">
            <User className="absolute left-4 top-3.5 text-gray-400" size={20} />
            <input type="text" placeholder="Email" className="w-full bg-white/10 text-white placeholder:text-gray-400 border border-white/20 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-blue-400"
              value={email} onChange={(e) => setEmail(e.target.value)} />
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
        <p className="text-center text-white/20 text-xs mt-8">Gunakan akun Master untuk setup awal.</p>
      </div>
    </MobileWrapper>
  );
};

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
                <button 
                    key={yard}
                    onClick={() => onSelectArea(yard)}
                    className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between hover:border-blue-500 hover:shadow-md transition-all group"
                >
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

// --- 5. Admin Dashboard (Updated) ---
const AdminDashboard = ({ user, area, logout }) => {
  const [activeTab, setActiveTab] = useState('approvals'); // approvals, inventory, users
  const [inventory, setInventory] = useState([]);
  const [pendingClaims, setPendingClaims] = useState([]);
  
  // State Input Stock
  const [newItemName, setNewItemName] = useState('');
  const [newItemStock, setNewItemStock] = useState('');
  const [editingItem, setEditingItem] = useState(null); // Jika sedang edit

  // State Input User
  const [usersList, setUsersList] = useState([]);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPass, setNewUserPass] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserName, setNewUserName] = useState('');

  // 1. Fetch Inventory per Area
  useEffect(() => {
    const q = query(collection(db, 'inventory'), where('area', '==', area), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snap) => setInventory(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [area]);

  // 2. Fetch Pending Claims per Area
  useEffect(() => {
    const q = query(collection(db, 'claims'), where('status', '==', 'pending'), where('area', '==', area), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snap) => setPendingClaims(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
  }, [area]);

  // 3. Fetch Users (Only if General Admin)
  useEffect(() => {
    if(user.role === 'general_admin') {
        const q = query(collection(db, 'users'));
        return onSnapshot(q, (snap) => setUsersList(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
    }
  }, [user.role]);

  // --- ACTIONS ---

  // A. Inventory Management
  const handleSaveInventory = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemStock) return;
    
    try {
        if (editingItem) {
            // Edit Mode
            await updateDoc(doc(db, 'inventory', editingItem.id), {
                name: newItemName,
                warehouseStock: parseInt(newItemStock)
            });
            setEditingItem(null);
        } else {
            // Add Mode
            await addDoc(collection(db, 'inventory'), {
                name: newItemName,
                warehouseStock: parseInt(newItemStock),
                area: area,
                createdAt: serverTimestamp(),
            });
        }
        setNewItemName(''); setNewItemStock('');
        alert("Data berhasil disimpan!");
    } catch(err) {
        alert("Gagal simpan: " + err.message);
    }
  };

  const startEdit = (item) => {
      setEditingItem(item);
      setNewItemName(item.name);
      setNewItemStock(item.warehouseStock);
      setActiveTab('inventory'); // Ensure tab is open
      window.scrollTo(0,0); // Scroll to top form
  };

  const handleDeleteInventory = async (id) => {
      if(confirm("Hapus item ini?")) await deleteDoc(doc(db, 'inventory', id));
  };

  // B. Claim Processing (FIXED)
  const processClaim = async (claim, isApproved) => {
    try {
        const claimRef = doc(db, 'claims', claim.id);
        
        await runTransaction(db, async (t) => {
            if (isApproved) {
                // Pastikan dokumen stok masih ada
                const invRef = doc(db, 'inventory', claim.inventoryId);
                const invDoc = await t.get(invRef);
                
                if (!invDoc.exists()) {
                    throw new Error("Master stok barang ini sudah dihapus.");
                }

                // Cek stok cukup
                const currentStock = invDoc.data().warehouseStock || 0;
                /* Optional: if (currentStock <= 0) throw new Error("Stok habis saat ingin diapprove."); */

                // Update Stok
                t.update(invRef, { warehouseStock: Math.max(0, currentStock - 1) });
                
                // Update Klaim
                t.update(claimRef, { 
                    status: 'approved', 
                    processedAt: serverTimestamp(), 
                    processedBy: user.email 
                });
            } else {
                // Reject
                t.update(claimRef, { 
                    status: 'rejected', 
                    processedAt: serverTimestamp(), 
                    processedBy: user.email 
                });
            }
        });
    } catch (e) {
        console.error("Transaction failed: ", e);
        alert("Gagal memproses: " + e.message);
    }
  };

  // C. User Management
  const handleAddUser = async (e) => {
      e.preventDefault();
      try {
          await addDoc(collection(db, 'users'), {
              email: newUserEmail,
              password: newUserPass,
              displayName: newUserName,
              role: newUserRole,
              createdAt: serverTimestamp()
          });
          setNewUserEmail(''); setNewUserPass(''); setNewUserName('');
          alert("User berhasil ditambahkan");
      } catch (e) { alert("Gagal tambah user"); }
  };

  return (
    <MobileWrapper>
      {/* Header */}
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
          <button onClick={() => {setActiveTab('approvals'); setEditingItem(null);}} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'approvals' ? 'bg-white text-indigo-900' : 'bg-white/10'}`}>
            <CheckCircle size={20} /> <span className="text-[10px] font-bold">Approval</span>
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'inventory' ? 'bg-white text-indigo-900' : 'bg-white/10'}`}>
            <Package size={20} /> <span className="text-[10px] font-bold">Stok</span>
          </button>
          {user.role === 'general_admin' && (
             <button onClick={() => {setActiveTab('users'); setEditingItem(null);}} className={`p-3 rounded-xl flex flex-col items-center gap-1 ${activeTab === 'users' ? 'bg-white text-indigo-900' : 'bg-white/10'}`}>
                <Users size={20} /> <span className="text-[10px] font-bold">Users</span>
             </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-20 bg-slate-50">
        
        {/* --- TAB APPROVALS --- */}
        {activeTab === 'approvals' && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-700">Klaim Menunggu ({pendingClaims.length})</h3>
            {pendingClaims.length === 0 ? (
               <div className="text-center py-10 text-gray-400">Tidak ada antrian di {area}.</div>
            ) : pendingClaims.map(claim => (
                <div key={claim.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                    <div className="flex justify-between">
                        <div>
                            <div className="font-bold text-slate-800">{claim.userName}</div>
                            <div className="text-sm text-indigo-600 font-medium">{claim.drinkName}</div>
                            <div className="text-xs text-gray-400 mt-1">{new Date(claim.timestamp?.toDate()).toLocaleTimeString()}</div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button onClick={() => processClaim(claim, true)} className="flex-1 bg-green-50 text-green-600 py-2 rounded-lg font-bold text-sm border border-green-200 hover:bg-green-100">Terima</button>
                        <button onClick={() => processClaim(claim, false)} className="flex-1 bg-red-50 text-red-600 py-2 rounded-lg font-bold text-sm border border-red-200 hover:bg-red-100">Tolak</button>
                    </div>
                </div>
            ))}
          </div>
        )}

        {/* --- TAB INVENTORY --- */}
        {activeTab === 'inventory' && (
          <div className="space-y-4">
             <div className="bg-white p-4 rounded-2xl shadow-sm border border-indigo-100">
                <h3 className="font-bold text-sm mb-3 text-slate-700">{editingItem ? 'Edit Stok' : 'Tambah Stok Baru'}</h3>
                <form onSubmit={handleSaveInventory} className="space-y-2">
                    <input required placeholder="Nama Minuman" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-900" 
                        value={newItemName} onChange={e=>setNewItemName(e.target.value)} />
                    <div className="flex gap-2">
                        <input required type="number" placeholder="Jumlah" className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-900" 
                            value={newItemStock} onChange={e=>setNewItemStock(e.target.value)} />
                        <button type="submit" className={`px-4 py-2 rounded-lg text-white font-bold text-sm ${editingItem ? 'bg-orange-500' : 'bg-indigo-600'}`}>
                            {editingItem ? 'Update' : 'Simpan'}
                        </button>
                        {editingItem && <button type="button" onClick={()=>{setEditingItem(null); setNewItemName(''); setNewItemStock('');}} className="px-3 bg-gray-200 rounded-lg text-xs font-bold text-gray-600">Batal</button>}
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
                            <button onClick={()=>startEdit(item)} className="p-2 bg-orange-50 text-orange-500 rounded-lg"><Edit size={14}/></button>
                            <button onClick={()=>handleDeleteInventory(item.id)} className="p-2 bg-red-50 text-red-500 rounded-lg"><Trash2 size={14}/></button>
                        </div>
                    </div>
                ))}
             </div>
          </div>
        )}

        {/* --- TAB USER MANAGEMENT (General Admin Only) --- */}
        {activeTab === 'users' && user.role === 'general_admin' && (
             <div className="space-y-4">
                 <div className="bg-white p-4 rounded-2xl shadow-sm border border-purple-100">
                    <h3 className="font-bold text-sm mb-3 text-slate-700 flex items-center gap-2"><UserPlus size={16}/> Tambah User</h3>
                    <form onSubmit={handleAddUser} className="space-y-2">
                        <input required placeholder="Nama Lengkap" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-900" 
                            value={newUserName} onChange={e=>setNewUserName(e.target.value)} />
                        <input required type="email" placeholder="Email" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-900" 
                            value={newUserEmail} onChange={e=>setNewUserEmail(e.target.value)} />
                        <input required type="text" placeholder="Password" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-900" 
                            value={newUserPass} onChange={e=>setNewUserPass(e.target.value)} />
                        <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-gray-900"
                            value={newUserRole} onChange={e=>setNewUserRole(e.target.value)}>
                            <option value="user">User (Karyawan)</option>
                            <option value="admin_area">Admin Area</option>
                            <option value="general_admin">General Admin</option>
                        </select>
                        <button type="submit" className="w-full bg-purple-600 text-white py-2 rounded-lg font-bold text-sm">Tambah User</button>
                    </form>
                 </div>
                 
                 <div className="space-y-2">
                     <h3 className="font-bold text-xs text-gray-500 uppercase px-2">Daftar User</h3>
                     {usersList.map(u => (
                         <div key={u.id} className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                             <div>
                                 <div className="font-bold text-sm text-slate-700">{u.displayName}</div>
                                 <div className="text-[10px] text-gray-400">{u.email}</div>
                             </div>
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

// --- 6. Employee Dashboard (Updated) ---
const EmployeeDashboard = ({ user, area, logout }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [todaysClaim, setTodaysClaim] = useState(null);
  const [showCoupon, setShowCoupon] = useState(false);
  
  useEffect(() => {
    // Filter Inventory by Area
    const q = query(collection(db, 'inventory'), where('area', '==', area), orderBy('name'));
    return onSnapshot(q, (snap) => setMenuItems(snap.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [area]);

  useEffect(() => {
    // Check Claim for Today + Area
    const q = query(collection(db, 'claims'), where('userId', '==', user.uid), where('date', '==', getTodayString()), where('status', '!=', 'rejected'));
    return onSnapshot(q, (snap) => {
      if (!snap.empty) setTodaysClaim({ id: snap.docs[0].id, ...snap.docs[0].data() });
      else setTodaysClaim(null);
    });
  }, [user]);

  const handleOrder = async (item) => {
    if (todaysClaim) return;
    if (item.warehouseStock <= 0) { alert("Stok Habis!"); return; }

    try {
        const claimData = {
            userId: user.uid,
            userName: user.displayName,
            inventoryId: item.id,
            drinkName: item.name,
            date: getTodayString(),
            status: 'pending',
            location: area,
            area: area, // Important for admin filtering
            timestamp: serverTimestamp()
        };
        const docRef = await addDoc(collection(db, 'claims'), claimData);
        setTodaysClaim({ id: docRef.id, ...claimData });
        setShowCoupon(true);
    } catch (e) { alert("Gagal klaim: " + e.message); }
  };

  return (
    <MobileWrapper className="bg-slate-50">
      {showCoupon && <CouponModal data={todaysClaim} onClose={() => setShowCoupon(false)} />}
      
      <div className="bg-white p-6 pb-4 rounded-b-3xl shadow-sm sticky top-0 z-10">
         <div className="flex justify-between items-start">
             <div>
                 <p className="text-xs text-slate-400 font-bold mb-1"><MapPin size={10} className="inline mr-1"/> {area}</p>
                 <h2 className="text-lg font-bold text-slate-800">Halo, {user.displayName}</h2>
             </div>
             <button onClick={logout} className="p-2 bg-slate-100 rounded-full"><LogOut size={16}/></button>
         </div>
      </div>

      <div className="p-6 overflow-y-auto pb-24">
         {/* Status Card */}
         <div className={`p-5 rounded-3xl text-white shadow-xl mb-6 relative overflow-hidden ${todaysClaim ? 'bg-slate-800' : 'bg-gradient-to-r from-blue-600 to-indigo-600'}`}>
             <div className="relative z-10">
                 <p className="text-xs opacity-80 mb-1">Status Hari Ini</p>
                 <h3 className="text-2xl font-bold flex items-center gap-2">
                     {todaysClaim ? 'Sudah Klaim' : 'Belum Klaim'}
                     {todaysClaim && <CheckCircle size={20} className="text-green-400"/>}
                 </h3>
                 {todaysClaim && (
                     <button onClick={()=>setShowCoupon(true)} className="mt-3 bg-white/20 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-white/30 transition-all">
                         <Ticket size={14}/> Lihat E-Tiket
                     </button>
                 )}
             </div>
             <ClipboardList className="absolute right-4 bottom-4 text-white/10" size={60} />
         </div>

         {/* Menu Grid */}
         <h3 className="font-bold text-slate-700 mb-4">Menu Tersedia</h3>
         <div className="space-y-3">
             {menuItems.length === 0 && <p className="text-gray-400 text-center text-sm">Tidak ada item di area ini.</p>}
             {menuItems.map(item => (
                 <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
                             <Coffee size={24}/>
                         </div>
                         <div>
                             <div className="font-bold text-slate-800">{item.name}</div>
                             <div className={`text-xs font-bold px-2 py-0.5 rounded w-fit mt-1 ${item.warehouseStock > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                 Stok: {item.warehouseStock}
                             </div>
                         </div>
                     </div>
                     <button 
                        disabled={todaysClaim || item.warehouseStock <= 0}
                        onClick={()=>handleOrder(item)}
                        className={`px-4 py-2 rounded-xl font-bold text-xs ${todaysClaim || item.warehouseStock <= 0 ? 'bg-gray-100 text-gray-400' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                     >
                         {todaysClaim ? 'Besok' : item.warehouseStock <= 0 ? 'Habis' : 'Klaim'}
                     </button>
                 </div>
             ))}
         </div>
      </div>
    </MobileWrapper>
  );
};

// --- 7. Main App Orchestrator ---
const App = () => {
  const [user, setUser] = useState(null);
  const [selectedArea, setSelectedArea] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setSelectedArea(null);
  };

  // 1. Belum Login
  if (!user) {
    return <LoginScreen onLoginSuccess={setUser} />;
  }

  // 2. Sudah Login, Belum Pilih Area
  if (!selectedArea) {
    return <AreaSelectionScreen user={user} onSelectArea={setSelectedArea} onLogout={handleLogout} />;
  }

  // 3. Masuk Dashboard Sesuai Role
  if (user.role === 'admin_area' || user.role === 'general_admin') {
      return <AdminDashboard user={user} area={selectedArea} logout={handleLogout} />;
  }

  return <EmployeeDashboard user={user} area={selectedArea} logout={handleLogout} />;
};

export default App;