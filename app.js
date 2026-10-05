let PROMPTS=[], CATS=[];
let state={q:"",cat:"All",sort:"new",page:1};
const PER_PAGE=12;

const grid=document.getElementById("grid"), pills=document.getElementById("pills"),
      pages=document.getElementById("pages"), count=document.getElementById("count"),
      empty=document.getElementById("empty"), search=document.getElementById("search"),
      sort=document.getElementById("sort");

function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;")}

function filtered(){
  let r=PROMPTS.filter(p=>{
    const okCat=state.cat==="All"||p.category===state.cat;
    const q=state.q.trim().toLowerCase();
    const okQ=!q||p.title.toLowerCase().includes(q)||p.category.toLowerCase().includes(q);
    return okCat&&okQ;
  });
  const by={
    "new":(a,b)=>+b.id-+a.id, "old":(a,b)=>+a.id-+b.id,
    "az":(a,b)=>a.title.localeCompare(b.title),
    "words":(a,b)=>b.words-a.words
  }[state.sort];
  return r.sort(by);
}

function card(p){
  const cover=p.cover
    ? `<img src="images/${p.cover}" alt="" loading="lazy">`
    : `<div class="card-noimg">M</div>`;
  return `<article class="card">
    <a class="card-cover" href="prompt.html?id=${p.id}">${cover}
      ${p.category?`<span class="cat-badge">${esc(p.category)}</span>`:""}</a>
    <div class="card-body">
      <h3 class="card-title"><a href="prompt.html?id=${p.id}">${esc(p.title)}</a></h3>
      <div class="card-meta"><span>📝 ${p.words.toLocaleString()} words</span><span>·</span><span>ID ${p.id}</span></div>
      <a class="card-link" href="prompt.html?id=${p.id}">View prompt →</a>
    </div></article>`;
}

function render(){
  const r=filtered();
  const totalPages=Math.max(1,Math.ceil(r.length/PER_PAGE));
  if(state.page>totalPages)state.page=totalPages;
  const slice=r.slice((state.page-1)*PER_PAGE,state.page*PER_PAGE);
  grid.innerHTML=slice.map(card).join("");
  empty.style.display=r.length?"none":"block";
  count.textContent=`${r.length} prompt${r.length!==1?"s":""}`+(state.cat!=="All"?` in ${state.cat}`:"")+(state.q?` matching “${state.q}”`:"");
  // pagination
  let h="";
  h+=`<button class="pgbtn" data-pg="${state.page-1}" ${state.page===1?"disabled":""}>‹</button>`;
  const win=[];
  for(let i=1;i<=totalPages;i++){
    if(i===1||i===totalPages||Math.abs(i-state.page)<=2)win.push(i);
    else if(win[win.length-1]!=="…")win.push("…");
  }
  for(const i of win){
    h+= i==="…"
      ? `<button class="pgbtn" disabled>…</button>`
      : `<button class="pgbtn ${i===state.page?"active":""}" data-pg="${i}">${i}</button>`;
  }
  h+=`<button class="pgbtn" data-pg="${state.page+1}" ${state.page===totalPages?"disabled":""}>›</button>`;
  pages.innerHTML=h;
  pages.querySelectorAll("[data-pg]").forEach(b=>b.onclick=()=>{
    const pg=+b.dataset.pg;
    if(pg>=1&&pg<=totalPages){state.page=pg;render();window.scrollTo({top:0,behavior:"smooth"})}
  });
}

function renderPills(){
  pills.innerHTML=["All",...CATS].map(c=>
    `<button class="pill ${c===state.cat?"active":""}" data-cat="${esc(c)}">${esc(c)}</button>`).join("");
  pills.querySelectorAll("[data-cat]").forEach(b=>b.onclick=()=>{
    state.cat=b.dataset.cat;state.page=1;renderPills();render();
  });
}

let deb;
search.addEventListener("input",e=>{clearTimeout(deb);deb=setTimeout(()=>{
  state.q=e.target.value;state.page=1;render();
},220)});
sort.addEventListener("change",e=>{state.sort=e.target.value;state.page=1;render()});

Promise.all([
  fetch("prompts.json").then(r=>r.json()),
  fetch("categories.json").then(r=>r.json())
]).then(([p,c])=>{
  PROMPTS=p;CATS=c;
  document.getElementById("stat-prompts").textContent=p.length;
  document.getElementById("stat-cats").textContent=c.length;
  const qp=new URLSearchParams(location.search);
  if(qp.get("category")&&["All",...c].includes(qp.get("category")))state.cat=qp.get("category");
  renderPills();render();
});
