const P=[
{id:1,n:"Palay (Rice)",e:"🌾",c:"Grains",p:28,u:"kg",s:500,sold:412},
{id:2,n:"Kamatis",e:"🍅",c:"Vegetables",p:60,u:"kg",s:80,sold:231},
{id:3,n:"Mais",e:"🌽",c:"Vegetables",p:35,u:"pc",s:120,sold:340},
{id:4,n:"Saging Lakatan",e:"🍌",c:"Fruits",p:75,u:"kg",s:60,sold:198},
{id:5,n:"Mangga (Carabao)",e:"🥭",c:"Fruits",p:120,u:"kg",s:45,sold:156},
{id:6,n:"Sibuyas",e:"🧅",c:"Vegetables",p:90,u:"kg",s:70,sold:265},
{id:7,n:"Talong",e:"🍆",c:"Vegetables",p:55,u:"kg",s:50,sold:144},
{id:8,n:"Itlog (Farm Fresh)",e:"🥚",c:"Poultry & Eggs",p:12,u:"pc",s:300,sold:980},
{id:9,n:"Pechay",e:"🥬",c:"Vegetables",p:40,u:"bundle",s:90,sold:187},
{id:10,n:"Niyog",e:"🥥",c:"Fruits",p:30,u:"pc",s:100,sold:121}
];
const $=id=>document.getElementById(id);
const php=n=>"₱"+n.toLocaleString("en-PH",{minimumFractionDigits:2,maximumFractionDigits:2});
const find=id=>P.find(x=>x.id===id);
let cart={},cat="All",term="",co=null,method="card",wallet="GCash";
try{cart=JSON.parse(localStorage.getItem("saka-cart")||"{}")}catch(e){cart={}}
let orders=[];
try{orders=JSON.parse(localStorage.getItem("saka-orders")||"[]")}catch(e){orders=[]}
Object.keys(cart).forEach(k=>{if(!find(+k))delete cart[k]});
function save(){try{localStorage.setItem("saka-cart",JSON.stringify(cart))}catch(e){}}
function toast(t){const el=$("toast");el.textContent=t;el.classList.add("show");clearTimeout(toast.t);toast.t=setTimeout(()=>el.classList.remove("show"),1800)}

/* ---------- shop ---------- */
function renderChips(){
  const cats=["All",...new Set(P.map(x=>x.c))];
  $("chips").innerHTML=cats.map(c=>`<button class="chip" aria-pressed="${c===cat}" data-c="${c}">${c}</button>`).join("");
}
function renderGrid(){
  const t=term.toLowerCase();
  const list=P.filter(x=>(cat==="All"||x.c===cat)&&x.n.toLowerCase().includes(t));
  $("grid").innerHTML=list.length?list.map(x=>`
    <article class="card"><div class="pic" aria-hidden="true">${x.e}</div>
      <div class="info"><p class="name">${x.n}</p><div class="price">${php(x.p)} <span class="meta">/ ${x.u}</span></div>
      <div class="meta">${x.s>0?x.s+" "+x.u+" left":"Sold out"} · ${x.sold} sold</div></div>
      <div class="actions"><button class="btn" data-add="${x.id}" ${x.s<1?"disabled":""}>Add to cart</button>
      <button class="btn fill" data-buy="${x.id}" ${x.s<1?"disabled":""}>Buy now</button></div></article>`).join("")
    :`<div class="empty" style="grid-column:1/-1">No products match your search. Try another word or category.</div>`;
}
function count(){return Object.values(cart).reduce((a,b)=>a+b,0)}
function cartTotal(){return Object.entries(cart).reduce((a,[k,q])=>a+find(+k).p*q,0)}
function renderCart(){
  $("cnt").textContent=count();
  const ids=Object.keys(cart);
  $("dl").innerHTML=ids.length?ids.map(k=>{const x=find(+k),q=cart[k];return `
    <div class="row"><div class="e">${x.e}</div><div><strong>${x.n}</strong><div class="meta">${php(x.p)} / ${x.u}</div>
    <div class="qty"><button data-dec="${k}" aria-label="Decrease">−</button><span>${q}</span><button data-inc="${k}" aria-label="Increase">+</button></div></div>
    <div style="text-align:right"><strong>${php(x.p*q)}</strong><br><button class="x" data-rm="${k}">Remove</button></div></div>`}).join("")
    :`<div class="empty">Your cart is empty. Add something fresh from the shop.</div>`;
  $("dt").textContent=php(cartTotal());
  $("toCheckout").disabled=!ids.length;
  save();
}
function add(id){
  const x=find(id),have=cart[id]||0;
  if(have+1>x.s){toast("No more stock for "+x.n);return false}
  cart[id]=have+1;renderCart();return true;
}
function openDrawer(o){$("drawer").classList.toggle("open",o);$("ov").classList.toggle("open",o)}

/* ---------- checkout ---------- */
function openModal(o){$("modal").classList.toggle("open",o);$("ov2").classList.toggle("open",o)}
function startCheckout(items){
  co=items;method="card";wallet="GCash";openDrawer(false);renderCheckout();openModal(true);
}
function coTotal(){return co.reduce((a,i)=>a+find(i.id).p*i.q,0)}
function renderCheckout(){
  const rows=co.map(i=>{const x=find(i.id);return `<div><span>${x.e} ${x.n} × ${i.q}</span><span>${php(x.p*i.q)}</span></div>`}).join("");
  $("sheet").innerHTML=`
  <h2 id="mt">Checkout</h2>
  <div class="sum">${rows}<div style="font-weight:800;margin-top:6px"><span>Total</span><span>${php(coTotal())}</span></div></div>
  <label for="fn">Full name</label><input id="fn" autocomplete="name">
  <div class="two"><div><label for="ph">Mobile number</label><input id="ph" inputmode="numeric" autocomplete="tel" placeholder="09XXXXXXXXX"></div>
  <div><label for="ad">Delivery address</label><input id="ad" autocomplete="street-address"></div></div>
  <div class="tabs" role="group" aria-label="Payment method">
    <button class="tab" data-m="card" aria-pressed="${method==="card"}">💳 Debit / Credit card</button>
    <button class="tab" data-m="wallet" aria-pressed="${method==="wallet"}">📱 E-wallet</button></div>
  <div id="pay"></div>
  <div class="demo">Demo checkout: no real payment is made and card details are never stored.</div>
  <div class="err" id="err" role="alert"></div>
  <div class="two" style="margin-top:8px"><button class="btn" id="cancel">Cancel</button><button class="btn fill" id="pay-btn">Pay ${php(coTotal())}</button></div>`;
  renderPay();
}
function renderPay(){
  $("pay").innerHTML=method==="card"?`
    <label for="cn">Card number</label><input id="cn" inputmode="numeric" autocomplete="cc-number" placeholder="1234 5678 9012 3456" maxlength="23">
    <label for="cm">Name on card</label><input id="cm" autocomplete="cc-name">
    <div class="two"><div><label for="ce">Expiry (MM/YY)</label><input id="ce" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/YY" maxlength="5"></div>
    <div><label for="cv">CVV</label><input id="cv" inputmode="numeric" autocomplete="cc-csc" placeholder="123" maxlength="4" type="password"></div></div>`
  :`<label>Choose e-wallet</label><div class="wallets">${["GCash","Maya","GrabPay"].map(w=>`<button class="tab" data-w="${w}" aria-pressed="${wallet===w}">${w}</button>`).join("")}</div>
    <label for="wn">${wallet} mobile number</label><input id="wn" inputmode="numeric" placeholder="09XXXXXXXXX" maxlength="11">
    <div class="meta" style="margin-top:6px">You would approve the payment in your ${wallet} app.</div>`;
}
function luhn(n){let s=0,d=false;for(let i=n.length-1;i>=0;i--){let k=+n[i];if(d){k*=2;if(k>9)k-=9}s+=k;d=!d}return s%10===0}
function validate(){
  if(!$("fn").value.trim())return"Enter your full name.";
  if(!/^09\d{9}$/.test($("ph").value.trim()))return"Enter a valid mobile number (09XXXXXXXXX).";
  if(!$("ad").value.trim())return"Enter your delivery address.";
  for(const i of co)if(i.q>find(i.id).s)return"Not enough stock for "+find(i.id).n+".";
  if(method==="card"){
    const n=$("cn").value.replace(/\s/g,"");
    if(!/^\d{13,19}$/.test(n)||!luhn(n))return"Card number is not valid.";
    if(!$("cm").value.trim())return"Enter the name on the card.";
    const m=$("ce").value.match(/^(\d{2})\/(\d{2})$/);
    if(!m||+m[1]<1||+m[1]>12)return"Enter expiry as MM/YY.";
    const now=new Date(),y=2000+ +m[2];
    if(y<now.getFullYear()||(y===now.getFullYear()&&+m[1]<now.getMonth()+1))return"This card has expired.";
    if(!/^\d{3,4}$/.test($("cv").value))return"Enter the 3 or 4 digit CVV.";
  }else if(!/^09\d{9}$/.test($("wn").value.trim()))return"Enter your "+wallet+" mobile number (09XXXXXXXXX).";
  return"";
}
function pay(){
  const e=validate();$("err").textContent=e;if(e)return;
  const btn=$("pay-btn");btn.disabled=true;btn.textContent="Processing payment…";
  const label=method==="card"?"Card ending "+$("cn").value.replace(/\s/g,"").slice(-4):wallet;
  const name=$("fn").value.trim(),total=coTotal(),items=co.slice();
  setTimeout(()=>{
    items.forEach(i=>{find(i.id).s-=i.q;find(i.id).sold+=i.q;if(cart[i.id]){cart[i.id]=Math.max(0,cart[i.id]-i.q);if(!cart[i.id])delete cart[i.id]}});
    renderCart();renderGrid();
    const no="SK-"+Date.now().toString(36).toUpperCase().slice(-6);
    orders.unshift({no,date:new Date().toLocaleString("en-PH"),items:items.map(i=>{const x=find(i.id);return {n:x.n,e:x.e,q:i.q,u:x.u,p:x.p}}),total,pay:label,status:"Preparing"});
    try{localStorage.setItem("saka-orders",JSON.stringify(orders))}catch(e){}
    $("sheet").innerHTML=`<div class="done"><div class="tick">✅</div><h2 id="mt">Order placed</h2>
      <p>Thank you, ${name.replace(/[<>&]/g,"")}! Your order <strong>${no}</strong> is being prepared.</p>
      <p class="meta">Paid ${php(total)} with ${label}</p><div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px"><button class="btn" id="viewOrders" style="padding:10px 20px">View my orders</button><button class="btn fill" id="cancel" style="padding:10px 20px">Continue shopping</button></div></div>`;
  },1300);
}

/* ---------- my orders ---------- */
function showOrders(){
  const list=orders.length?orders.map(o=>`<div class="sum"><div><strong>${o.no}</strong><span class="meta">${o.date}</span></div>${o.items.map(i=>`<div><span>${i.e} ${i.n} × ${i.q} ${i.u}</span><span>${php(i.p*i.q)}</span></div>`).join("")}<div style="font-weight:800;margin-top:6px"><span>Total · ${o.pay}</span><span>${php(o.total)}</span></div><div class="meta" style="margin-top:4px">Status: ${o.status}</div></div>`).join(""):`<div class="empty">You have no orders yet. Your orders will show up here after checkout.</div>`;
  $("sheet").innerHTML=`<h2 id="mt">My orders</h2>${list}<button class="btn fill" id="cancel" style="margin-top:8px;padding:10px 24px">Close</button>`;
  openDrawer(false);openModal(true);
}

/* ---------- events ---------- */
document.addEventListener("click",ev=>{
  const t=ev.target.closest("button");if(!t)return;
  const d=t.dataset;
  if(d.c){cat=d.c;renderChips();renderGrid()}
  else if(d.add){if(add(+d.add))toast("Added to cart")}
  else if(d.buy){startCheckout([{id:+d.buy,q:1}])}
  else if(d.inc){add(+d.inc)}
  else if(d.dec){const k=d.dec;cart[k]--;if(cart[k]<1)delete cart[k];renderCart()}
  else if(d.rm){delete cart[d.rm];renderCart()}
  else if(d.m){method=d.m;renderCheckout()}
  else if(d.w){wallet=d.w;renderPay()}
  else if(t.id==="cart"||t.id==="cartOpen"){openDrawer(true)}
  else if(t.id==="cartClose"){openDrawer(false)}
  else if(t.id==="toCheckout"){startCheckout(Object.entries(cart).map(([k,q])=>({id:+k,q})))}
  else if(t.id==="ordersOpen"||t.id==="viewOrders"){showOrders()}
  else if(t.id==="cancel"){openModal(false)}
  else if(t.id==="pay-btn"){pay()}
});
$("ov").onclick=()=>openDrawer(false);
$("ov2").onclick=()=>openModal(false);
document.addEventListener("keydown",e=>{if(e.key==="Escape"){openDrawer(false);openModal(false)}});
$("sf").addEventListener("submit",e=>{e.preventDefault();term=$("q").value.trim();renderGrid()});
$("q").addEventListener("input",e=>{term=e.target.value.trim();renderGrid()});
document.addEventListener("input",e=>{
  if(e.target.id==="cn"){const v=e.target.value.replace(/\D/g,"").slice(0,19);e.target.value=v.replace(/(.{4})/g,"$1 ").trim()}
  if(e.target.id==="ce"){let v=e.target.value.replace(/\D/g,"").slice(0,4);if(v.length>2)v=v.slice(0,2)+"/"+v.slice(2);e.target.value=v}
});
renderChips();renderGrid();renderCart();
