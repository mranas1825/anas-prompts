const id=new URLSearchParams(location.search).get("id");
const titleEl=document.getElementById("title"), meta=document.getElementById("meta"),
      crumbs=document.getElementById("crumbs"), ptext=document.getElementById("ptext"),
      toast=document.getElementById("toast");

function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function showToast(msg){toast.textContent=msg;toast.classList.add("show");setTimeout(()=>toast.classList.remove("show"),1800)}

if(!id){ptext.innerHTML='<div class="prompt-loading">This prompt isn’t in the library. <a href="index.html" style="color:var(--accent)">Back to home</a></div>'}
else{
  fetch("prompts.json").then(r=>r.json()).then(all=>{
    const p=all.find(x=>String(x.id)===String(id));
    if(!p){ptext.innerHTML='<div class="prompt-loading">This prompt isn’t in the library. <a href="index.html" style="color:var(--accent)">Back to home</a></div>';return}
    document.title=p.title+" · Manjan Prompts";
    titleEl.textContent=p.title;
    crumbs.innerHTML=`<a href="index.html">Home</a><span>›</span>${
      p.category?`<a href="index.html?category=${encodeURIComponent(p.category)}">${esc(p.category)}</a><span>›</span>`:""
    }<span>ID ${p.id}</span>`;
    meta.innerHTML=`
      ${p.category?`<span class="meta-chip cat">${esc(p.category)}</span>`:""}
      <span class="meta-chip">📝 ${p.words.toLocaleString()} words</span>
      <span class="meta-chip">ID ${p.id}</span>
      <span class="meta-chip free">Free</span>`;
    if(p.cover){
      const w=document.getElementById("coverWrap"),img=document.getElementById("cover");
      img.src="images/"+p.cover;w.style.display="block";
    }
    return fetch(`prompts/${p.id}.txt`).then(r=>r.text()).then(txt=>{
      ptext.textContent=txt.trim();
      document.getElementById("actionbar").style.display="block";
      const fileName=p.id+"-"+p.title.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,80)+".txt";
      document.getElementById("copyBtn").onclick=()=>{
        navigator.clipboard.writeText(txt.trim()).then(
          ()=>showToast("Copied! ✅"),
          ()=>showToast("Copy failed — select manually"));
      };
      document.getElementById("dlBtn").onclick=()=>{
        const a=document.createElement("a");
        a.href=URL.createObjectURL(new Blob([txt.trim()],{type:"text/plain"}));
        a.download=fileName;a.click();URL.revokeObjectURL(a.href);
        showToast("Downloaded ⬇");
      };
    });
  }).catch(()=>{
    ptext.innerHTML='<div class="prompt-loading">Could not load this prompt. <a href="index.html" style="color:var(--accent)">Back to home</a></div>';
  });
}
