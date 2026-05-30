import { useState, useEffect } from "react";

// ── CONFIG ────────────────────────────────────────────────────────────────────
const ADMIN_PHONE = "77076337222"; // номер водителя
const ADMIN_PASS  = "Zamanbek";    // пароль для панели дяди

const TRUCKS = [
  { id: "16", label: "КамАЗ 16 куб.", icon: "🚛", desc: "Подходит для небольших ям" },
  { id: "22", label: "КамАЗ 22 куб.", icon: "🚚", desc: "Для больших объёмов" },
];

const HOURS = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"];

// ── STORAGE ───────────────────────────────────────────────────────────────────
async function loadBookings() {
  try { const r = await window.storage.get("bookings_v1", true); return r ? JSON.parse(r.value) : []; }
  catch { return []; }
}
async function saveBookings(b) {
  try { await window.storage.set("bookings_v1", JSON.stringify(b), true); } catch {}
}

function today() {
  return new Date().toISOString().slice(0,10);
}
function formatDate(d) {
  const [y,m,day] = d.split("-");
  return `${day}.${m}.${y}`;
}
function getDays(n=7) {
  const days = [];
  for(let i=0;i<n;i++){
    const d = new Date(); d.setDate(d.getDate()+i);
    days.push(d.toISOString().slice(0,10));
  }
  return days;
}
function waLink(phone) {
  const clean = phone.replace(/\D/g,"");
  return `https://wa.me/${clean}`;
}

// ── STYLES ────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;600&family=Golos+Text:wght@400;500&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#f5f0e8;--surface:#fff;--border:#e0d8c8;--border2:#ccc4b0;
  --blue:#1a3a5c;--blue2:#2a5a8c;--blue-dim:#1a3a5c18;--blue-mid:#1a3a5c44;
  --orange:#e8720c;--orange-dim:#e8720c15;
  --text:#1a1610;--muted:#7a7060;--dim:#b0a890;
}
body{background:var(--bg);font-family:'Golos Text',sans-serif}
.root{min-height:100vh;background:var(--bg);display:flex;flex-direction:column;align-items:center;padding:0 0 40px}

/* HEADER */
.header{width:100%;background:var(--blue);padding:16px 20px;display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.logo{font-family:'Unbounded',sans-serif;font-size:14px;font-weight:600;color:#fff;letter-spacing:.02em}
.logo span{color:#f0a040}
.header-sub{font-size:10px;color:#ffffff66;margin-top:2px;font-family:'Golos Text',sans-serif}
.admin-link{font-size:11px;color:#ffffff55;cursor:pointer;border:1px solid #ffffff22;padding:5px 12px;border-radius:6px;transition:all .2s;background:none;font-family:'Golos Text',sans-serif}
.admin-link:hover{color:#fff;border-color:#ffffff55}

.wrap{width:100%;max-width:480px;padding:0 16px}

/* CARDS */
.card{background:var(--surface);border:1px solid var(--border);border-radius:16px;padding:24px;margin-bottom:16px;animation:fadeUp .4s ease both}
.card-title{font-family:'Unbounded',sans-serif;font-size:13px;font-weight:400;color:var(--blue);margin-bottom:16px;letter-spacing:.02em}

/* PHONE INPUT */
.phone-hero{text-align:center;padding:32px 24px}
.truck-icon{font-size:52px;margin-bottom:16px}
.phone-hero h1{font-family:'Unbounded',sans-serif;font-size:18px;font-weight:300;color:var(--blue);line-height:1.3;margin-bottom:8px}
.phone-hero p{color:var(--muted);font-size:13px;line-height:1.7;margin-bottom:28px}
.inp-group{display:flex;gap:8px;margin-bottom:10px}
.inp{flex:1;background:var(--bg);border:1.5px solid var(--border2);color:var(--text);font-family:'Golos Text',sans-serif;font-size:15px;padding:13px 16px;border-radius:10px;outline:none;transition:border-color .2s}
.inp:focus{border-color:var(--blue)}
.inp::placeholder{color:var(--dim);font-size:13px}
.btn{background:var(--blue);color:#fff;border:none;font-family:'Unbounded',sans-serif;font-size:11px;font-weight:400;padding:13px 20px;border-radius:10px;cursor:pointer;transition:all .2s;letter-spacing:.04em;white-space:nowrap}
.btn:hover:not(:disabled){background:var(--blue2);transform:translateY(-1px)}
.btn:disabled{opacity:.4;cursor:not-allowed}
.btn.orange{background:var(--orange)}
.btn.orange:hover:not(:disabled){background:#d0620a}
.btn.ghost{background:none;color:var(--blue);border:1.5px solid var(--blue-mid)}
.btn.ghost:hover{background:var(--blue-dim)}
.btn.full{width:100%}
.hint{font-size:11px;color:var(--dim);text-align:center}

/* STEPS */
.steps{display:flex;gap:0;margin-bottom:20px}
.step{flex:1;height:3px;background:var(--border);border-radius:99px;transition:background .3s}
.step.done{background:var(--blue)}
.step+.step{margin-left:4px}

/* TRUCKS */
.trucks{display:flex;flex-direction:column;gap:10px}
.truck-card{background:var(--bg);border:2px solid var(--border);border-radius:12px;padding:16px;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:14px}
.truck-card:hover{border-color:var(--blue-mid);background:var(--blue-dim)}
.truck-card.selected{border-color:var(--blue);background:var(--blue-dim)}
.truck-emoji{font-size:32px}
.truck-info h3{font-family:'Unbounded',sans-serif;font-size:12px;font-weight:400;color:var(--blue);margin-bottom:3px}
.truck-info p{font-size:12px;color:var(--muted)}
.truck-check{margin-left:auto;width:22px;height:22px;border-radius:50%;border:2px solid var(--border2);display:flex;align-items:center;justify-content:center;font-size:12px;color:transparent;transition:all .2s}
.truck-card.selected .truck-check{background:var(--blue);border-color:var(--blue);color:#fff}

/* CALENDAR */
.days{display:flex;gap:6px;overflow-x:auto;padding-bottom:4px;margin-bottom:16px}
.days::-webkit-scrollbar{display:none}
.day-btn{flex-shrink:0;width:52px;padding:10px 6px;border-radius:10px;border:1.5px solid var(--border);background:var(--bg);cursor:pointer;text-align:center;transition:all .2s;font-family:'Golos Text',sans-serif}
.day-btn:hover{border-color:var(--blue-mid)}
.day-btn.active{background:var(--blue);border-color:var(--blue)}
.day-name{font-size:10px;color:var(--muted);display:block;margin-bottom:3px}
.day-num{font-family:'Unbounded',sans-serif;font-size:16px;font-weight:400;color:var(--text)}
.day-btn.active .day-name,.day-btn.active .day-num{color:#fff}

.hours{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}
.hour-btn{padding:10px 4px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg);cursor:pointer;font-size:12px;font-family:'Golos Text',sans-serif;color:var(--text);transition:all .2s;text-align:center}
.hour-btn:hover:not(.taken){border-color:var(--blue-mid)}
.hour-btn.active{background:var(--blue);border-color:var(--blue);color:#fff}
.hour-btn.taken{background:#f5f0e8;color:var(--dim);cursor:not-allowed;text-decoration:line-through}

/* ADDRESS */
.textarea{width:100%;background:var(--bg);border:1.5px solid var(--border2);color:var(--text);font-family:'Golos Text',sans-serif;font-size:14px;padding:13px 16px;border-radius:10px;outline:none;resize:none;transition:border-color .2s;line-height:1.6}
.textarea:focus{border-color:var(--blue)}
.textarea::placeholder{color:var(--dim)}

/* CONFIRM */
.confirm-rows{display:flex;flex-direction:column;gap:10px;margin-bottom:20px}
.confirm-row{display:flex;justify-content:space-between;align-items:center;font-size:13px;padding:10px 0;border-bottom:1px solid var(--border)}
.confirm-row:last-child{border-bottom:none}
.confirm-label{color:var(--muted)}
.confirm-val{font-weight:500;color:var(--blue);text-align:right}

/* SUCCESS */
.success{text-align:center;padding:16px 0}
.success-icon{font-size:52px;margin-bottom:16px}
.success h2{font-family:'Unbounded',sans-serif;font-size:16px;font-weight:400;color:var(--blue);margin-bottom:10px}
.success p{color:var(--muted);font-size:13px;line-height:1.7;margin-bottom:24px}

/* ADMIN */
.admin-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px}
.admin-head h2{font-family:'Unbounded',sans-serif;font-size:14px;font-weight:400;color:var(--blue)}
.tab-row{display:flex;gap:6px;margin-bottom:20px}
.tab{padding:8px 16px;border-radius:8px;border:1.5px solid var(--border);background:var(--bg);font-size:12px;font-family:'Golos Text',sans-serif;cursor:pointer;color:var(--muted);transition:all .2s}
.tab.active{background:var(--blue);border-color:var(--blue);color:#fff}
.booking-card{background:var(--bg);border:1px solid var(--border);border-radius:12px;padding:16px;margin-bottom:10px;animation:fadeUp .3s ease both}
.booking-card:hover{border-color:var(--border2)}
.bc-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.bc-datetime{font-family:'Unbounded',sans-serif;font-size:12px;color:var(--blue)}
.bc-truck{font-size:11px;background:var(--orange-dim);color:var(--orange);border:1px solid #e8720c33;padding:3px 10px;border-radius:99px}
.bc-rows{display:flex;flex-direction:column;gap:6px}
.bc-row{display:flex;gap:8px;font-size:12px;align-items:flex-start}
.bc-icon{width:16px;flex-shrink:0;margin-top:1px}
.bc-text{color:var(--text);line-height:1.5}
.wa-btn{display:inline-flex;align-items:center;gap:6px;background:#25d366;color:#fff;border:none;font-family:'Golos Text',sans-serif;font-size:12px;padding:7px 14px;border-radius:8px;cursor:pointer;text-decoration:none;margin-top:8px;transition:all .2s}
.wa-btn:hover{background:#1fb857}
.empty-state{text-align:center;padding:40px 20px;color:var(--dim);font-size:13px}
.badge{display:inline-block;background:var(--blue-dim);color:var(--blue);font-size:10px;padding:2px 8px;border-radius:99px;font-family:'Unbounded',sans-serif;margin-left:6px}

/* LOGIN */
.login-wrap{text-align:center;max-width:340px;margin:40px auto}
.login-wrap h2{font-family:'Unbounded',sans-serif;font-size:16px;font-weight:300;color:var(--blue);margin-bottom:6px}
.login-wrap p{color:var(--muted);font-size:12px;margin-bottom:24px}
.err{color:#c0392b;font-size:12px;margin-bottom:10px}

@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
`;

const DAY_NAMES = ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"];

export default function App() {
  const [page, setPage] = useState("home"); // home|book|success|adminlogin|admin
  const [step, setStep] = useState(1); // 1=truck 2=datetime 3=address 4=confirm
  const [phone, setPhone] = useState("");
  const [truck, setTruck] = useState(null);
  const [selDay, setSelDay] = useState(today());
  const [selHour, setSelHour] = useState(null);
  const [address, setAddress] = useState("");
  const [bookings, setBookings] = useState([]);
  const [adminPass, setAdminPass] = useState("");
  const [adminErr, setAdminErr] = useState("");
  const [adminTab, setAdminTab] = useState("today");

  useEffect(() => { loadBookings().then(setBookings); }, []);

  const takenSlots = (day) =>
    bookings.filter(b => b.day === day).map(b => b.hour);

  const myBookings = bookings.filter(b => b.phone === phone);

  const days = getDays(7);

  const doBook = async () => {
    const b = {
      id: Date.now().toString(),
      phone,
      truck,
      day: selDay,
      hour: selHour,
      address,
      createdAt: new Date().toISOString(),
    };
    const updated = [...bookings, b];
    setBookings(updated);
    await saveBookings(updated);
    setPage("success");
  };

  const cancelBooking = async (id) => {
    const updated = bookings.filter(b => b.id !== id);
    setBookings(updated);
    await saveBookings(updated);
  };

  const adminBookings = adminTab === "today"
    ? bookings.filter(b => b.day === today()).sort((a,b)=>a.hour.localeCompare(b.hour))
    : [...bookings].sort((a,b)=> (a.day+a.hour).localeCompare(b.day+b.hour));

  // ── RENDER ──────────────────────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      <div className="root">
        <div className="header">
          <div>
            <div className="logo">Ассени<span>затор</span></div>
            <div className="header-sub">Откачка септиков · 2 КамАЗа</div>
          </div>
          <button className="admin-link" onClick={() => setPage(page==="adminlogin"||page==="admin"?"home":"adminlogin")}>
            {page==="admin"?"← Выйти":"Панель"}
          </button>
        </div>

        <div className="wrap">

          {/* ── HOME ── */}
          {page === "home" && (
            <>
              <div className="card phone-hero">
                <div className="truck-icon">🚛</div>
                <h1>Запись на откачку</h1>
                <p>Введи свой номер WhatsApp — мы найдём тебя в базе и запишем быстро.</p>
                <div className="inp-group">
                  <input className="inp" placeholder="7700 000 00 00" value={phone}
                    onChange={e=>setPhone(e.target.value.replace(/\D/g,""))}
                    onKeyDown={e=>e.key==="Enter"&&phone.length>=10&&(setStep(1),setPage("book"))}
                    maxLength={12} type="tel" />
                  <button className="btn" disabled={phone.length<10}
                    onClick={()=>{setStep(1);setPage("book")}}>Далее →</button>
                </div>
                <p className="hint">Номер используется только для связи с водителем</p>
              </div>

              {myBookings.length > 0 && (
                <div className="card">
                  <div className="card-title">Мои записи</div>
                  {myBookings.map(b=>(
                    <div className="booking-card" key={b.id}>
                      <div className="bc-top">
                        <span className="bc-datetime">{formatDate(b.day)} · {b.hour}</span>
                        <span className="bc-truck">{b.truck} куб.</span>
                      </div>
                      <div className="bc-rows">
                        <div className="bc-row"><span className="bc-icon">📍</span><span className="bc-text">{b.address}</span></div>
                      </div>
                      <button style={{marginTop:10,background:"none",border:"1px solid #e0d8c8",color:"#c0392b",fontSize:11,padding:"5px 12px",borderRadius:7,cursor:"pointer",fontFamily:"'Golos Text',sans-serif"}}
                        onClick={()=>cancelBooking(b.id)}>Отменить</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ── BOOKING ── */}
          {page === "book" && (
            <div className="card">
              <div className="steps">
                {[1,2,3,4].map(s=><div key={s} className={`step ${step>=s?"done":""}`}/>)}
              </div>

              {/* STEP 1 — TRUCK */}
              {step === 1 && <>
                <div className="card-title">Выбери КамАЗ</div>
                <div className="trucks">
                  {TRUCKS.map(t=>(
                    <div key={t.id} className={`truck-card ${truck===t.id?"selected":""}`} onClick={()=>setTruck(t.id)}>
                      <span className="truck-emoji">{t.icon}</span>
                      <div className="truck-info">
                        <h3>{t.label}</h3>
                        <p>{t.desc}</p>
                      </div>
                      <div className="truck-check">✓</div>
                    </div>
                  ))}
                </div>
                <div style={{marginTop:20,display:"flex",gap:8}}>
                  <button className="btn ghost" onClick={()=>setPage("home")}>← Назад</button>
                  <button className="btn full" disabled={!truck} onClick={()=>setStep(2)}>Далее →</button>
                </div>
              </>}

              {/* STEP 2 — DATE & TIME */}
              {step === 2 && <>
                <div className="card-title">Выбери дату и время</div>
                <div className="days">
                  {days.map(d=>{
                    const dt = new Date(d);
                    return (
                      <button key={d} className={`day-btn ${selDay===d?"active":""}`} onClick={()=>{setSelDay(d);setSelHour(null)}}>
                        <span className="day-name">{DAY_NAMES[dt.getDay()]}</span>
                        <span className="day-num">{dt.getDate()}</span>
                      </button>
                    );
                  })}
                </div>
                <div className="hours">
                  {HOURS.map(h=>{
                    const taken = takenSlots(selDay).includes(h);
                    return (
                      <button key={h} className={`hour-btn ${taken?"taken":""} ${selHour===h&&!taken?"active":""}`}
                        onClick={()=>!taken&&setSelHour(h)}>
                        {h}
                      </button>
                    );
                  })}
                </div>
                <div style={{marginTop:20,display:"flex",gap:8}}>
                  <button className="btn ghost" onClick={()=>setStep(1)}>← Назад</button>
                  <button className="btn full" disabled={!selHour} onClick={()=>setStep(3)}>Далее →</button>
                </div>
              </>}

              {/* STEP 3 — ADDRESS */}
              {step === 3 && <>
                <div className="card-title">Адрес откачки</div>
                <textarea className="textarea" rows={3} placeholder="Например: ул. Абая 12, частный дом, зелёные ворота" value={address} onChange={e=>setAddress(e.target.value)} />
                <div style={{marginTop:16,display:"flex",gap:8}}>
                  <button className="btn ghost" onClick={()=>setStep(2)}>← Назад</button>
                  <button className="btn full" disabled={address.trim().length<5} onClick={()=>setStep(4)}>Далее →</button>
                </div>
              </>}

              {/* STEP 4 — CONFIRM */}
              {step === 4 && <>
                <div className="card-title">Подтверди запись</div>
                <div className="confirm-rows">
                  <div className="confirm-row"><span className="confirm-label">WhatsApp</span><span className="confirm-val">+{phone}</span></div>
                  <div className="confirm-row"><span className="confirm-label">КамАЗ</span><span className="confirm-val">{truck} кубовый</span></div>
                  <div className="confirm-row"><span className="confirm-label">Дата</span><span className="confirm-val">{formatDate(selDay)}</span></div>
                  <div className="confirm-row"><span className="confirm-label">Время</span><span className="confirm-val">{selHour}</span></div>
                  <div className="confirm-row"><span className="confirm-label">Адрес</span><span className="confirm-val" style={{maxWidth:"60%"}}>{address}</span></div>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button className="btn ghost" onClick={()=>setStep(3)}>← Назад</button>
                  <button className="btn orange full" onClick={doBook}>✓ Записаться</button>
                </div>
              </>}
            </div>
          )}

          {/* ── SUCCESS ── */}
          {page === "success" && (
            <div className="card">
              <div className="success">
                <div className="success-icon">✅</div>
                <h2>Запись оформлена!</h2>
                <p>Ждите звонка от водителя.<br />Если нужно уточнить — напишите нам в WhatsApp.</p>
                <a className="wa-btn" href={waLink(ADMIN_PHONE)} target="_blank" rel="noreferrer">
                  <span>💬</span> Написать водителю
                </a>
                <div style={{marginTop:16}}>
                  <button className="btn ghost full" onClick={()=>{setStep(1);setTruck(null);setSelHour(null);setAddress("");setPage("home")}}>
                    На главную
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── ADMIN LOGIN ── */}
          {page === "adminlogin" && (
            <div className="login-wrap card">
              <h2>Панель дяди 🔐</h2>
              <p>Введи пароль для просмотра всех записей</p>
              {adminErr && <div className="err">{adminErr}</div>}
              <input className="inp" style={{width:"100%",marginBottom:10}} type="password"
                placeholder="Пароль" value={adminPass} onChange={e=>setAdminPass(e.target.value)}
                onKeyDown={e=>e.key==="Enter"&&(adminPass===ADMIN_PASS?(setPage("admin"),setAdminErr("")):(setAdminErr("Неверный пароль")))} />
              <button className="btn full" onClick={()=>adminPass===ADMIN_PASS?(setPage("admin"),setAdminErr("")):(setAdminErr("Неверный пароль"))}>
                Войти →
              </button>
            </div>
          )}

          {/* ── ADMIN PANEL ── */}
          {page === "admin" && (
            <>
              <div className="admin-head">
                <h2>Записи <span className="badge">{bookings.length}</span></h2>
                <button className="btn ghost" onClick={()=>setPage("home")}>← Выйти</button>
              </div>
              <div className="tab-row">
                <button className={`tab ${adminTab==="today"?"active":""}`} onClick={()=>setAdminTab("today")}>
                  Сегодня ({bookings.filter(b=>b.day===today()).length})
                </button>
                <button className={`tab ${adminTab==="all"?"active":""}`} onClick={()=>setAdminTab("all")}>
                  Все записи
                </button>
              </div>
              {adminBookings.length === 0
                ? <div className="empty-state">Записей пока нет 🙂</div>
                : adminBookings.map(b=>(
                  <div className="booking-card" key={b.id}>
                    <div className="bc-top">
                      <span className="bc-datetime">{formatDate(b.day)} · {b.hour}</span>
                      <span className="bc-truck">{b.truck} куб.</span>
                    </div>
                    <div className="bc-rows">
                      <div className="bc-row"><span className="bc-icon">📱</span><span className="bc-text">+{b.phone}</span></div>
                      <div className="bc-row"><span className="bc-icon">📍</span><span className="bc-text">{b.address}</span></div>
                    </div>
                    <a className="wa-btn" href={waLink(b.phone)} target="_blank" rel="noreferrer">
                      <span>💬</span> Открыть WhatsApp клиента
                    </a>
                    <button style={{marginLeft:8,background:"none",border:"1px solid #e0d8c8",color:"#c0392b",fontSize:11,padding:"7px 12px",borderRadius:8,cursor:"pointer",fontFamily:"'Golos Text',sans-serif"}}
                      onClick={()=>cancelBooking(b.id)}>Удалить</button>
                  </div>
                ))
              }
            </>
          )}

        </div>
      </div>
    </>
  );
}
