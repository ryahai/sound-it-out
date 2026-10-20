(function(){
var d=document,w=window,H=d.documentElement,vh=innerHeight,still=!!w.__mStill,fine=w.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
var idle=w.requestIdleCallback||function(f){return setTimeout(f,120)};
function cs(e){return getComputedStyle(e)}
function clear(c){return !c||c==='transparent'||/rgba\([^)]*,\s*0\)$/.test(c)}
function skip(e){return e.closest('#mkout,.shw,[data-prev],.pbk,.pbsec,.pbres,.pbhero,#zoom')}
/* 4. shimmer skeletons for photos of sheets, covers and thumbnails that are still loading */
[].forEach.call(d.images,function(i){if(i.complete||!/\.jpe?g(\?|$)/i.test(i.currentSrc||i.src)||/ico/.test(i.className)||skip(i))return;var low=!still&&i.getBoundingClientRect().top>vh;i.classList.add('m-sk');var f=function(){i.classList.remove('m-sk');if(low&&i.naturalWidth){i.classList.add('m-ld');setTimeout(function(){i.classList.remove('m-ld')},600)}};i.addEventListener('load',f,{once:true});i.addEventListener('error',f,{once:true})});
/* 2. everything you can press: lift, soft shadow, press; big cards tilt toward the pointer */
function dur(s){return Math.max.apply(0,String(s.transitionDuration).split(',').map(function(x){return parseFloat(x)*(/ms/.test(x)?1:1000)||0}))}
var cards=[];
function lifts(list){list.forEach(function(e){if(skip(e))return;var s=cs(e);if(s.display==='inline'&&clear(s.backgroundColor)&&!e.querySelector('img'))return;
  var boxy=!clear(s.backgroundColor)||parseFloat(s.borderTopWidth)>0||s.boxShadow!=='none'||e.tagName==='BUTTON'||!!e.querySelector('img');if(!boxy)return;
  if(/transform|all/.test(s.transitionProperty)&&dur(s)>=150&&s.transitionDuration.indexOf('0s')!==0)return;      // already has its own smooth motion
  e.classList.add('m-lift');var r=e.getBoundingClientRect();
  if(e.querySelector('img')||(r.width>=200&&r.height>=140))e.classList.add('m-card');
  if(s.boxShadow==='none'&&!clear(s.backgroundColor))e.classList.add('m-sh');
  if(fine&&!still&&r.width>=240&&r.height>=200)cards.push(e)})}
function tilt(e){var ok=null;e.addEventListener('pointermove',function(v){if(ok===null){ok=cs(e).transform==='none';}if(!ok)return;var r=e.getBoundingClientRect(),x=(v.clientX-r.left)/r.width-.5,y=(v.clientY-r.top)/r.height-.5;e.style.transform='perspective(900px) rotateX('+(-y*5).toFixed(2)+'deg) rotateY('+(x*6).toFixed(2)+'deg)'});
  e.addEventListener('pointerleave',function(){ok=null;e.style.transform=''})}
/* 3. scroll: lower parts rise in, staggered; hero pictures move at a slower depth; big numbers count up */
function reveal(){if(still||!('IntersectionObserver' in w))return;var units=[];
  function add(e){if(!e||e.nodeType!==1||skip(e)||e.closest('nav,.menu,details,[hidden]')||e.classList.contains('m-rv'))return;if(e.querySelector('#mkout,[data-prev],dialog,[class*=dock]'))return;var r=e.getBoundingClientRect();if(!r.height||r.top<vh+8||r.right<=0||r.left>=innerWidth)return;units.push(e)}
  [].forEach.call(d.querySelectorAll('.m-card'),function(c){if(!c.closest('nav,.menu'))add(c)});
  [].forEach.call(d.querySelectorAll('body section,body>footer'),function(s){if(s.closest('nav')||s.parentElement.closest('section'))return;var box=s.querySelector(':scope>.wrap')||s;
    [].forEach.call(box.children,function(k){if(/^(SCRIPT|STYLE|LINK)$/.test(k.tagName))return;if(k.classList.contains('m-card')||k.querySelector('.m-card'))return;add(k)})});
  [].forEach.call(d.querySelectorAll('article h2,article figure,article table'),add);
  if(!units.length)return;units.forEach(function(e){e.classList.add('m-rv')});
  function done(e){e.classList.remove('m-rv','m-in');e.style.removeProperty('--m-d')}
  var io=new IntersectionObserver(function(es){var n=0;es.filter(function(x){return x.isIntersecting}).sort(function(a,b){return a.boundingClientRect.top-b.boundingClientRect.top||a.boundingClientRect.left-b.boundingClientRect.left}).forEach(function(x){var e=x.target;io.unobserve(e);var dl=Math.min(n++*70,350);e.style.setProperty('--m-d',dl+'ms');e.classList.add('m-in');e.addEventListener('animationend',function(){done(e)},{once:true});setTimeout(function(){done(e)},dl+900)})},{rootMargin:'100000px 0px 0px 0px'});
  units.forEach(function(e){io.observe(e)});
  var tm,pend=units.slice();w.addEventListener('scroll',function(){clearTimeout(tm);tm=setTimeout(function(){pend=pend.filter(function(e){if(!e.classList.contains('m-rv')||e.classList.contains('m-in'))return false;var r=e.getBoundingClientRect();if(r.top>=innerHeight)return true;io.unobserve(e);if(r.bottom<=0)done(e);else{e.classList.add('m-in');setTimeout(function(){done(e)},900)}return false})},200)},{passive:true});      // safety net: nothing above or in view stays hidden
  w.addEventListener('beforeprint',function(){units.forEach(done)})}
function depth(){if(still||!fine||innerWidth<960)return;var ims=[].filter.call(d.querySelectorAll('header img,.hero img,[class*=hero] img'),function(i){var r=i.getBoundingClientRect();return r.width>=120&&r.top<vh&&!i.closest('nav,a,button')});if(!ims.length)return;var go=0;
  function set(){go=0;var y=Math.min(scrollY,vh*1.2);ims.forEach(function(i,k){i.style.translate='0 '+(y*(k%2?.1:.06)).toFixed(1)+'px'})}
  w.addEventListener('scroll',function(){if(!go){go=1;requestAnimationFrame(set)}},{passive:true})}
function counts(){if(still||!('IntersectionObserver' in w))return;var list=[].filter.call(d.querySelectorAll('main b,main strong,section b,section strong,.num,[class*=stat] b'),function(e){var t=e.textContent.trim();return /^\d{1,3}(,\d{3})*\+?$/.test(t)&&parseInt(t.replace(/,/g,''),10)>=5&&parseFloat(cs(e).fontSize)>=22&&!e.closest('nav,.menu,details,#mkout')&&e.getBoundingClientRect().top>vh});
  if(!list.length)return;var io=new IntersectionObserver(function(es){es.forEach(function(x){if(!x.isIntersecting)return;io.unobserve(x.target);run(x.target)})},{threshold:.6});
  list.forEach(function(e){io.observe(e)});
  function run(e){var t=e.textContent.trim(),plus=/\+$/.test(t)?'+':'',n=parseInt(t.replace(/[,+]/g,''),10),comma=/,/.test(t),t0=0;e.style.minWidth=e.getBoundingClientRect().width+'px';e.classList.add('m-num');
    function f(s){if(!t0)t0=s;var p=Math.min(1,(s-t0)/900),v=Math.round(n*(1-Math.pow(1-p,3)));e.textContent=(comma?v.toLocaleString('en-US'):v)+(p<1?'':plus);if(p<1)requestAnimationFrame(f);else e.textContent=t}requestAnimationFrame(f)}}
function start(){var all=[].slice.call(d.querySelectorAll('a[href],button,summary,[role=button]')),i=0;
  (function chunk(dl){var end=Math.min(all.length,i+80);lifts(all.slice(i,end));i=end;if(i<all.length)idle(chunk);else{cards.forEach(tilt);reveal();depth();counts()}})()}
if(d.readyState==='loading')d.addEventListener('DOMContentLoaded',function(){idle(start)});else idle(start);
})();
