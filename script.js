const progress=document.querySelector('.progress');
const nav=document.querySelector('.nav');
const hero=document.querySelector('.hero');
const syncNav=()=>{if(nav&&hero)nav.classList.toggle('nav-solid',scrollY>hero.offsetHeight-120)};
window.addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;progress.style.width=(h?scrollY/h*100:0)+'%';syncNav()},{passive:true});
syncNav();

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
document.querySelectorAll('.hero-copy,.hero-visual').forEach(el=>observer.observe(el));

document.querySelectorAll('.method-item').forEach(item=>{
  item.addEventListener('mouseenter',()=>{document.querySelectorAll('.method-item').forEach(x=>x.classList.remove('active'));item.classList.add('active')});
});

document.querySelectorAll('.cap-item').forEach(item=>{
  item.addEventListener('mouseenter',()=>{
    document.querySelectorAll('.cap-item').forEach(x=>x.style.opacity='.45');
    item.style.opacity='1';
  });
  item.addEventListener('mouseleave',()=>document.querySelectorAll('.cap-item').forEach(x=>x.style.opacity='1'));
});

const menu=document.querySelector('.menu');
menu?.addEventListener('click',()=>{
  const nav=document.querySelector('.nav-links');
  const open=nav.classList.toggle('open');
  if(open){
    nav.style.cssText='display:flex;position:absolute;top:78px;left:6vw;right:6vw;flex-direction:column;gap:20px;padding:25px;background:#101010;color:#fff;mix-blend-mode:normal;border:1px solid #333';
  }else nav.style.cssText='';
});

document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{
  const nav=document.querySelector('.nav-links');
  if(nav?.classList.contains('open')){nav.classList.remove('open');nav.style.cssText='';}
}));

// Small pointer tilt on desktop demo visuals.
document.querySelectorAll('.work-card').forEach(card=>{
  const visual=card.querySelector('.demo-window');
  card.addEventListener('mousemove',e=>{
    if(innerWidth<900)return;
    const r=card.getBoundingClientRect();
    const x=(e.clientX-r.left)/r.width-.5;
    const y=(e.clientY-r.top)/r.height-.5;
    visual.style.transform=`perspective(900px) rotateX(${(-y*3).toFixed(2)}deg) rotateY(${(x*4).toFixed(2)}deg)`;
  });
  card.addEventListener('mouseleave',()=>visual.style.transform='');
});
