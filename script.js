let products=[
 {id:1,name:"เสื้อเจอร์ซีย์ทีมชาติ",cat:"เสื้อผ้า",icon:"🎽",price:1290,sale:990,stock:15,sizes:["S","M","L","XL"],rating:4.7,reviews:210,badge:"best"},
 {id:2,name:"กางเกงวิ่ง โปร",cat:"กางเกง",icon:"🩳",price:690,stock:20,sizes:["S","M","L","XL"],rating:4.4,reviews:88,badge:"new"},
 {id:3,name:"รองเท้าฟุตบอล สตั๊ด",cat:"รองเท้า",icon:"👟",price:2490,sale:1990,stock:6,sizes:["40","41","42","43","44"],rating:4.8,reviews:341,badge:"best"},
 {id:4,name:"กระเป๋าใส่รองเท้า",cat:"กระเป๋า",icon:"👜",price:590,stock:18,rating:4.2,reviews:52},
 {id:5,name:"หมวกกีฬา",cat:"อุปกรณ์",icon:"🧢",price:390,stock:25,rating:4.1,reviews:39},
 {id:6,name:"ถุงเท้ากีฬา (3 คู่)",cat:"อุปกรณ์",icon:"🧦",price:250,stock:30,rating:4.5,reviews:120},
 {id:7,name:"เสื้อแขนกุดวิ่ง",cat:"เสื้อผ้า",icon:"🎽",price:590,stock:14,sizes:["S","M","L","XL"],rating:4.3,reviews:64,badge:"new"},
 {id:8,name:"กางเกงบาสเก็ตบอล",cat:"กางเกง",icon:"🩳",price:790,sale:590,stock:10,sizes:["S","M","L","XL"],rating:4.6,reviews:97},
 {id:9,name:"รองเท้าวิ่ง อัลตร้า",cat:"รองเท้า",icon:"👟",price:3290,stock:8,sizes:["40","41","42","43","44"],rating:4.9,reviews:412,badge:"best"},
 {id:10,name:"กระบอกน้ำกีฬา",cat:"อุปกรณ์",icon:"🧴",price:290,stock:22,rating:4.0,reviews:31},
 {id:11,name:"เป้สะพายหลังกีฬา",cat:"กระเป๋า",icon:"🎒",price:990,sale:790,stock:9,rating:4.4,reviews:76},
 {id:12,name:"ผ้าคาดผมกีฬา",cat:"อุปกรณ์",icon:"🎗️",price:150,stock:40,rating:3.9,reviews:18},
];
const categories=["ทั้งหมด","เสื้อผ้า","กางเกง","รองเท้า","กระเป๋า","อุปกรณ์"];
const FREE_SHIP_THRESHOLD=1000;
const PROMO_CODES={"SPORT10":0.10,"SALE20":0.20};
 
let cart=[]; let wishlist=new Set(); let activeCat="ทั้งหมด"; let selectedSize={};
let promoRate=0; let currentUser=null;
 
const $=id=>document.getElementById(id);
const productGrid=$("productGrid"),searchInput=$("searchInput"),resultCount=$("resultCount");
const catTabs=$("catTabs"),sortSelect=$("sortSelect"),wishCount=$("wishCount"),bestScroll=$("bestScroll");
const cartPanel=$("cartPanel"),overlay=$("overlay"),openCartBtn=$("openCartBtn"),closeCartBtn=$("closeCartBtn");
const cartItemsEl=$("cartItems"),emptyCartMsg=$("emptyCartMsg"),cartTotalEl=$("cartTotal"),cartSubtotalEl=$("cartSubtotal");
const discountRow=$("discountRow"),cartDiscountEl=$("cartDiscount"),cartCountEl=$("cartCount"),checkoutBtn=$("checkoutBtn");
const shipFill=$("shipFill"),shipNote=$("shipNote");
const checkoutOverlay=$("checkoutOverlay"),closeCheckoutBtn=$("closeCheckoutBtn"),payTotalEl=$("payTotal"),confirmPayBtn=$("confirmPayBtn");
const promoInput=$("promoInput"),promoApplyBtn=$("promoApplyBtn"),promoMsg=$("promoMsg");
const successOverlay=$("successOverlay"),successModal=$("successModal"),successDetail=$("successDetail"),backToShopBtn=$("backToShopBtn");
const toastEl=$("toast"),scrollTopBtn=$("scrollTopBtn"),countdownText=$("countdownText");
 
function baht(n){return n.toLocaleString("th-TH",{minimumFractionDigits:2,maximumFractionDigits:2})+" บาท"}
function effPrice(p){return p.sale||p.price}
function showToast(m){toastEl.textContent=m;toastEl.classList.add("show");setTimeout(()=>toastEl.classList.remove("show"),1800)}
function stars(r){const full=Math.round(r);return "★".repeat(full)+"☆".repeat(5-full)}
 
const dealEnd=Date.now()+3*60*60*1000;
setInterval(()=>{
  const diff=Math.max(0,dealEnd-Date.now());
  const h=String(Math.floor(diff/3600000)).padStart(2,"0");
  const m=String(Math.floor(diff/60000)%60).padStart(2,"0");
  const s=String(Math.floor(diff/1000)%60).padStart(2,"0");
  countdownText.textContent=`${h}:${m}:${s}`;
},1000);
 
function renderBestStrip(){
  bestScroll.innerHTML="";
  products.filter(p=>p.badge==="best").forEach(p=>{
    const c=document.createElement("div");
    c.className="best-card";
    c.innerHTML=`<div class="ic">${p.icon}</div><div class="nm">${p.name}</div><div class="pr">${baht(effPrice(p))}</div>`;
    c.addEventListener("click",()=>{
      activeCat="ทั้งหมด";renderCatTabs();renderProducts();
      requestAnimationFrame(()=>{
        const target=document.querySelector(`.product-card[data-id="${p.id}"]`);
        if(target){target.scrollIntoView({behavior:"smooth",block:"center"});
          target.classList.add("highlight-pulse");
          setTimeout(()=>target.classList.remove("highlight-pulse"),1200);}
      });
    });
    bestScroll.appendChild(c);
  });
}
 
function renderCatTabs(){
  catTabs.innerHTML="";
  categories.forEach(c=>{
    const b=document.createElement("button");
    b.className="cat-tab"+(c===activeCat?" active":"");
    b.textContent=c;
    b.addEventListener("click",()=>{activeCat=c;renderCatTabs();renderProducts();});
    catTabs.appendChild(b);
  });
}
 
function getFiltered(){
  const kw=searchInput.value.trim().toLowerCase();
  let list=products.filter(p=>(activeCat==="ทั้งหมด"||p.cat===activeCat)&&p.name.toLowerCase().includes(kw));
  const sort=sortSelect.value;
  if(sort==="price-asc")list.sort((a,b)=>effPrice(a)-effPrice(b));
  else if(sort==="price-desc")list.sort((a,b)=>effPrice(b)-effPrice(a));
  else if(sort==="name")list.sort((a,b)=>a.name.localeCompare(b.name,"th"));
  else if(sort==="discount")list.sort((a,b)=>((b.sale?b.price-b.sale:0))-((a.sale?a.price-a.sale:0)));
  else if(sort==="rating")list.sort((a,b)=>b.rating-a.rating);
  return list;
}
 
function renderProducts(){
  const list=getFiltered();
  resultCount.textContent=`แสดง ${list.length} รายการ`;
  productGrid.innerHTML="";
  if(list.length===0){productGrid.innerHTML=`<p class="empty-msg">ไม่พบสินค้าที่ค้นหา</p>`;return;}
 
  list.forEach(p=>{
    const out=p.stock<=0;
    const discount=p.sale?Math.round((1-p.sale/p.price)*100):0;
    const wished=wishlist.has(p.id);
    const sizesHtml=p.sizes?`<div class="size-row" data-id="${p.id}">${p.sizes.map(s=>
      `<button type="button" class="size-btn${selectedSize[p.id]===s?" selected":""}" data-size="${s}">${s}</button>`).join("")}</div>`:"";
 
    const card=document.createElement("div");
    card.className="product-card";
    card.dataset.id=p.id;
    card.innerHTML=`
      <div class="thumb-wrap">
        <div class="badge-stack">
          ${discount?`<span class="sale-badge">-${discount}%</span>`:""}
          ${p.badge==="best"?'<span class="tag-badge best">BEST</span>':""}
          ${p.badge==="new"?'<span class="tag-badge new">NEW</span>':""}
        </div>
        <button type="button" class="wish-btn${wished?" active":""}" data-id="${p.id}">♥</button>
        <span class="thumb-icon">${p.icon}</span>
      </div>
      <div class="card-body">
        <span class="cat-label">${p.cat}</span>
        <div class="product-name">${p.name}</div>
        <div class="stars">${stars(p.rating)}<span class="rc">(${p.reviews})</span></div>
        <div class="price-row">
          <span class="price-now${p.sale?"":" no-sale"}">${baht(effPrice(p))}</span>
          ${p.sale?`<span class="price-old">${baht(p.price)}</span>`:""}
        </div>
        <span class="stock-note${p.stock<=3?" low":""}">${out?"สินค้าหมด":"เหลือ "+p.stock+" ชิ้น"}</span>
        ${sizesHtml}
        <button type="button" class="add-btn" data-id="${p.id}" ${out?"disabled":""}>${out?"สินค้าหมด":"เพิ่มลงตะกร้า"}</button>
      </div>`;
 
    card.querySelector(".wish-btn").addEventListener("click",()=>{
      wished?wishlist.delete(p.id):wishlist.add(p.id);
      wishCount.textContent=wishlist.size;
      renderProducts();
    });
 
    const sizeRow=card.querySelector(".size-row");
    if(sizeRow){
      sizeRow.querySelectorAll(".size-btn").forEach(btn=>{
        btn.addEventListener("click",()=>{selectedSize[p.id]=btn.dataset.size;renderProducts();});
      });
    }
 
    card.querySelector(".add-btn").addEventListener("click",(e)=>{
      if(p.sizes&&!selectedSize[p.id]){showToast("กรุณาเลือกไซซ์ก่อน");return;}
      flyToCart(e.currentTarget,p.icon);
      addToCart(p.id,1,selectedSize[p.id]||null);
    });
 
    productGrid.appendChild(card);
  });
}
 
function flyToCart(fromEl,icon){
  const start=fromEl.getBoundingClientRect();
  const end=openCartBtn.getBoundingClientRect();
  const fly=document.createElement("span");
  fly.className="fly-icon";
  fly.textContent=icon;
  fly.style.left=start.left+start.width/2+"px";
  fly.style.top=start.top+"px";
  document.body.appendChild(fly);
  requestAnimationFrame(()=>{
    fly.style.left=end.left+end.width/2+"px";
    fly.style.top=end.top+end.height/2+"px";
    fly.style.transform="scale(.3)";
    fly.style.opacity="0.3";
  });
  setTimeout(()=>{
    fly.remove();
    openCartBtn.classList.add("bump");
    setTimeout(()=>openCartBtn.classList.remove("bump"),350);
  },550);
}
 
function addToCart(id,qty,size){
  const p=products.find(x=>x.id===id);
  if(!p||qty>p.stock){showToast("สินค้าในสต็อกไม่เพียงพอ");return;}
  const existing=cart.find(c=>c.productId===id&&c.size===size);
  if(existing)existing.quantity+=qty; else cart.push({productId:id,size,quantity:qty});
  p.stock-=qty;
  showToast(`เพิ่ม ${p.name}${size?" ไซซ์ "+size:""} ลงตะกร้าแล้ว!`);
  renderProducts();renderCart();
}
 
function changeQty(id,size,delta){
  const item=cart.find(c=>c.productId===id&&c.size===size);
  const p=products.find(x=>x.id===id);
  if(!item||!p)return;
  if(delta>0&&p.stock<=0){showToast("สินค้าในสต็อกไม่เพียงพอ");return;}
  if(delta<0&&item.quantity<=1)return;
  item.quantity+=delta; p.stock-=delta;
  renderProducts();renderCart();
}
 
function removeFromCart(id,size){
  const item=cart.find(c=>c.productId===id&&c.size===size);
  if(!item)return;
  const p=products.find(x=>x.id===id);
  if(p)p.stock+=item.quantity;
  cart=cart.filter(c=>!(c.productId===id&&c.size===size));
  renderProducts();renderCart();
}
 
function cartSubtotal(){return cart.reduce((s,i)=>{const p=products.find(x=>x.id===i.productId);return s+(p?effPrice(p)*i.quantity:0)},0)}
function cartTotal(){const sub=cartSubtotal();return sub-sub*promoRate}
 
function renderCart(){
  cartItemsEl.innerHTML="";
  if(cart.length===0){cartItemsEl.appendChild(emptyCartMsg);checkoutBtn.disabled=true;}
  else{
    checkoutBtn.disabled=false;
    cart.forEach(item=>{
      const p=products.find(x=>x.id===item.productId);
      if(!p)return;
      const row=document.createElement("div");
      row.className="line-item";
      row.innerHTML=`<div>
          <div class="line-name">${p.name}${item.size?" · ไซซ์ "+item.size:""}</div>
          <div class="line-sub">${baht(effPrice(p))} ต่อชิ้น</div>
          <div class="qty-stepper">
            <button type="button" class="qm">−</button>
            <span>${item.quantity}</span>
            <button type="button" class="qp">+</button>
          </div>
          <button type="button" class="line-remove">นำออก</button>
        </div>
        <div style="text-align:right;font-weight:600">${baht(effPrice(p)*item.quantity)}</div>`;
      row.querySelector(".qm").addEventListener("click",()=>changeQty(p.id,item.size,-1));
      row.querySelector(".qp").addEventListener("click",()=>changeQty(p.id,item.size,1));
      row.querySelector(".line-remove").addEventListener("click",()=>removeFromCart(p.id,item.size));
      cartItemsEl.appendChild(row);
    });
  }
 
  const sub=cartSubtotal(), total=cartTotal();
  cartSubtotalEl.textContent=baht(sub);
  if(promoRate>0){discountRow.style.display="flex";cartDiscountEl.textContent="-"+baht(sub*promoRate);}
  else discountRow.style.display="none";
  cartTotalEl.textContent=baht(total);
  cartCountEl.textContent=cart.reduce((n,c)=>n+c.quantity,0);
 
  const remain=Math.max(0,FREE_SHIP_THRESHOLD-sub);
  const pct=Math.min(100,(sub/FREE_SHIP_THRESHOLD)*100);
  shipFill.style.width=pct+"%";
  shipNote.textContent=remain>0?`ซื้อเพิ่มอีก ${baht(remain)} รับส่งฟรี!`:"🎉 คุณได้รับสิทธิ์ส่งฟรีแล้ว!";
}
 
function openCart(){cartPanel.classList.add("open");overlay.classList.add("show")}
function closeCart(){cartPanel.classList.remove("open");overlay.classList.remove("show")}
openCartBtn.addEventListener("click",openCart);
closeCartBtn.addEventListener("click",closeCart);
overlay.addEventListener("click",()=>{closeCart();closeAuth();});
 
checkoutBtn.addEventListener("click",()=>{
  if(cart.length===0){showToast("ตะกร้าว่าง");return;}
  payTotalEl.textContent=baht(cartTotal());
  checkoutOverlay.classList.add("show");
});
closeCheckoutBtn.addEventListener("click",()=>checkoutOverlay.classList.remove("show"));
 
promoApplyBtn.addEventListener("click",()=>{
  const code=promoInput.value.trim().toUpperCase();
  if(PROMO_CODES[code]){
    promoRate=PROMO_CODES[code];
    promoMsg.className="promo-msg ok";
    promoMsg.textContent=`ใช้โค้ด "${code}" สำเร็จ ลด ${promoRate*100}%`;
  }else{
    promoRate=0;
    promoMsg.className="promo-msg err";
    promoMsg.textContent="โค้ดไม่ถูกต้อง";
  }
  payTotalEl.textContent=baht(cartTotal());
  renderCart();
});
 
confirmPayBtn.addEventListener("click",()=>{
  const method=document.querySelector('input[name="payMethod"]:checked').value;
  successDetail.textContent=`ยอดชำระ ${baht(cartTotal())} ผ่านช่องทาง "${method}"`;
  cart=[];promoRate=0;promoInput.value="";promoMsg.textContent="";
  renderCart();renderProducts();
  checkoutOverlay.classList.remove("show");closeCart();
  successOverlay.classList.add("show");
  spawnConfetti();
});
backToShopBtn.addEventListener("click",()=>successOverlay.classList.remove("show"));
 
function spawnConfetti(){
  const emojis=["🎉","🎊","⭐","🥳"];
  for(let i=0;i<10;i++){
    const c=document.createElement("span");
    c.className="confetti";
    c.textContent=emojis[i%emojis.length];
    c.style.left=(10+Math.random()*80)+"%";
    c.style.animationDelay=(Math.random()*.3)+"s";
    successModal.appendChild(c);
    setTimeout(()=>c.remove(),1800);
  }
}
 
searchInput.addEventListener("input",renderProducts);
sortSelect.addEventListener("change",renderProducts);
window.addEventListener("scroll",()=>scrollTopBtn.classList.toggle("show",window.scrollY>400));
scrollTopBtn.addEventListener("click",()=>window.scrollTo({top:0,behavior:"smooth"}));
 
/* ---------- Auth (front-end only, no real backend) ---------- */
const authOverlay=$("authOverlay"),loginBtn=$("loginBtn"),closeAuthBtn=$("closeAuthBtn");
const tabLogin=$("tabLogin"),tabSignup=$("tabSignup"),loginForm=$("loginForm"),signupForm=$("signupForm");
const userChip=$("userChip"),userAvatar=$("userAvatar"),userName=$("userName"),userMenu=$("userMenu"),logoutBtn=$("logoutBtn");
 
function openAuth(){authOverlay.classList.add("show")}
function closeAuth(){authOverlay.classList.remove("show")}
loginBtn.addEventListener("click",openAuth);
closeAuthBtn.addEventListener("click",closeAuth);
 
function switchAuthTab(tab){
  const isLogin=tab==="login";
  tabLogin.classList.toggle("active",isLogin);
  tabSignup.classList.toggle("active",!isLogin);
  loginForm.style.display=isLogin?"block":"none";
  signupForm.style.display=isLogin?"none":"block";
}
tabLogin.addEventListener("click",()=>switchAuthTab("login"));
tabSignup.addEventListener("click",()=>switchAuthTab("signup"));
 
document.querySelectorAll(".toggle-pw").forEach(btn=>{
  btn.addEventListener("click",()=>{
    const input=$(btn.dataset.target);
    const showing=input.type==="text";
    input.type=showing?"password":"text";
    btn.textContent=showing?"SHOW":"HIDE";
  });
});
 
function setUser(name){
  currentUser=name;
  userChip.style.display="flex";
  loginBtn.style.display="none";
  userAvatar.textContent=name.trim().charAt(0).toUpperCase();
  userName.textContent=name.split(" ")[0];
}
 
userChip.addEventListener("click",(e)=>{
  if(e.target.id==="logoutBtn")return;
  userMenu.classList.toggle("open");
});
document.addEventListener("click",(e)=>{if(!userChip.contains(e.target))userMenu.classList.remove("open")});
 
logoutBtn.addEventListener("click",()=>{
  currentUser=null;
  userChip.style.display="none";
  loginBtn.style.display="flex";
  userMenu.classList.remove("open");
  showToast("ออกจากระบบแล้ว");
});
 
$("loginSubmit").addEventListener("click",()=>{
  const email=$("loginEmail").value.trim(), pass=$("loginPassword").value.trim();
  const err=$("loginError");
  if(!email||!pass){err.style.display="block";return;}
  err.style.display="none";
  const name=email.split("@")[0];
  setUser(name);
  closeAuth();
  showToast(`ยินดีต้อนรับกลับมา, ${name}!`);
});
 
$("signupSubmit").addEventListener("click",()=>{
  const name=$("signupName").value.trim(), email=$("signupEmail").value.trim(), pass=$("signupPassword").value.trim();
  const err=$("signupError");
  if(!name||!email||!pass){err.style.display="block";return;}
  err.style.display="none";
  setUser(name);
  closeAuth();
  showToast(`สมัครสมาชิกสำเร็จ ยินดีต้อนรับ, ${name}!`);
});
 
renderBestStrip();renderCatTabs();renderProducts();renderCart();
 
