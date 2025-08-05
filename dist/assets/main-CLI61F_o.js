(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))a(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&a(r)}).observe(document,{childList:!0,subtree:!0});function o(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function a(n){if(n.ep)return;n.ep=!0;const s=o(n);fetch(n.href,s)}})();const h=["auto","light","dark"],x=["mode_icon_1.png","mode_icon_2.png","mode_icon_3.png"];let f=0;function A(){const e=document.getElementById("themeToggleIcon");if(!e){console.warn("⚠️ themeToggleIcon not found");return}const t=localStorage.getItem("theme");t&&h.includes(t)?(y(t,e),f=h.indexOf(t)):y("auto",e),e.addEventListener("click",()=>{f=(f+1)%h.length;const o=h[f];y(o,e)})}function y(e,t){const o=e==="auto"?M():e;document.documentElement.setAttribute("data-theme",o),localStorage.setItem("theme",e);const a=`img/${x[h.indexOf(e)]}`;t&&(t.src=a)}function M(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}let w={},C=[],$={};function D({terms:e,list:t,aliases:o}){e&&(w=e),t&&(C=t),o&&($=o)}function u(){return{termsData:w,termList:C,aliasLookup:$}}function v(e,t){const{termsData:o,aliasLookup:a}=u(),n=a[e.toLowerCase()],s=a[t.toLowerCase()],r=o[n],i=o[s],c=document.getElementById("compareOutput");if(c){if(!r||!i){c.innerHTML="<p>Could not compare these terms.</p>",c.classList.remove("hidden");return}c.classList.remove("hidden"),c.innerHTML=`
    <h2>Comparing: ${n.toUpperCase()} vs ${s.toUpperCase()}</h2>
    <div class="compare-columns">
      <div class="compare-box">
        <h4>${n.toUpperCase()}</h4>
        <p><strong>ELI5:</strong> ${r.eli5}</p>
        <p><strong>Boss:</strong> ${r.boss}</p>
        <p><strong>Sysadmin:</strong> ${r.sysadmin}</p>
      </div>
      <div class="compare-box">
        <h4>${s.toUpperCase()}</h4>
        <p><strong>ELI5:</strong> ${i.eli5}</p>
        <p><strong>Boss:</strong> ${i.boss}</p>
        <p><strong>Sysadmin:</strong> ${i.sysadmin}</p>
      </div>
    </div>
  `,T()}}document.addEventListener("click",e=>{const t=e.target.closest(".compare-suggest-btn");if(t){const o=t.dataset.compare;if(o&&o.includes("-vs-")){const[a,n]=o.split("-vs-").map(s=>s.toLowerCase());I([mainTerm,relatedTerm]),history.pushState(null,"",`?compare=${a}-vs-${n}`)}}});window.addEventListener("popstate",()=>{const e=new URLSearchParams(window.location.search),t=e.get("compare"),o=e.get("term");if(t){const[a,n]=t.toLowerCase().split("-vs-");a&&n&&v(a,n)}else o?fetchAndDisplayTerm(o.toLowerCase()):results.innerHTML=""});function I(e){const{termsData:t,aliasLookup:o}=u(),a=document.getElementById("compareOutput");if(!a)return;a.innerHTML="";const n=document.createElement("div");n.className="compare-columns",e.forEach(s=>{const r=s.toLowerCase(),i=o[r]||r,c=t[i];if(!c)return;const l=document.createElement("div");l.className="compare-box",l.innerHTML=`
      <h3>${i.toUpperCase()}</h3>
      <p><strong>ELI5:</strong> ${c.eli5}</p>
      <p><strong>Boss:</strong> ${c.boss}</p>
      <p><strong>Sysadmin:</strong> ${c.sysadmin}</p>
    `,n.appendChild(l)}),a.appendChild(n),T()}function T(){document.getElementById("compareModal").classList.remove("hidden")}function E(){document.getElementById("compareModal").classList.add("hidden"),B()}document.addEventListener("DOMContentLoaded",()=>{const e=document.getElementById("compareModal");document.querySelector(".modal-close").addEventListener("click",E),e.addEventListener("click",t=>{t.target===e&&E()})});function U(){const e=document.querySelectorAll(".tab-button"),t=document.querySelectorAll(".tab-panel");!e.length||!t.length||e.forEach(o=>{o.addEventListener("click",()=>{const a=o.dataset.tab;e.forEach(s=>s.classList.remove("active")),t.forEach(s=>s.classList.remove("active")),o.classList.add("active");const n=document.getElementById(`${a}-panel`);n&&n.classList.add("active")})})}function j(e){return{1:"Totally beginner-friendly.",2:"Mild tech terms, mostly safe.",3:"Tech-savvy folk preferred.",4:"Now we're getting spicy.",5:"Only your network engineer cousin gets this."}[e]||"Tech lingo level unknown."}function O(e,t){document.title=`${e.toUpperCase()} | Tech Decoded`;let o=document.querySelector("meta[name='description']");o||(o=document.createElement("meta"),o.setAttribute("name","description"),document.head.appendChild(o)),o.setAttribute("content",t)}function H(e,t){const o=document.getElementById("term-schema");o&&o.remove();const a={"@context":"https://schema.org","@type":"TechArticle",name:e,description:t.eli5,about:t.categories||[],audience:{"@type":"Audience",audienceType:t.level||"General"}},n=document.createElement("script");n.type="application/ld+json",n.id="term-schema",n.textContent=JSON.stringify(a),document.head.appendChild(n)}function P(e){const t=_();let o=localStorage.getItem(t);if(!o){const s=Object.keys(e).filter(i=>e[i]?.eli5),r=s[Math.floor(Math.random()*s.length)];localStorage.setItem(t,r),o=r}const a=e[o],n=document.getElementById("dailyTerm");a&&n&&(n.innerHTML=`
      <h3><span class="term-emoji">${a.emoji||"📘"}</span> Term of the Day: <strong>${o.toUpperCase()}</strong></h3>
      <p class="term-explainer">${a.eli5}</p>
      <button onclick="window.location.search='?term=${encodeURIComponent(o)}'">Learn More</button>
    `,n.classList.remove("hidden"))}function q(){const e=document.getElementById("dailyTerm"),t=document.getElementById("container");if(!e||!t)return;const o=e.offsetHeight+64;t.style.paddingTop=`${o}px`}function _(){const e=new Date;return`termOfDay-${e.getFullYear()}-${e.getMonth()+1}-${e.getDate()}`}function F(e){const t=window.location.origin,o=encodeURIComponent(`${t}?term=${e}`),a=encodeURIComponent(`Check out this explanation of "${e}" on Tech Decoded!`),n=document.getElementById("twitterShare"),s=document.getElementById("facebookShare"),r=document.getElementById("redditShare"),i=document.getElementById("shareButtons");n&&s&&r&&(n.href=`https://twitter.com/intent/tweet?url=${o}&text=${a}`,s.href=`https://www.facebook.com/sharer/sharer.php?u=${o}`,r.href=`https://www.reddit.com/submit?url=${o}&title=${a}`),i&&i.classList.remove("hidden")}function p(e){if(!e||typeof e!="string"||e.trim()===""){console.warn("⚠️ Invalid term passed to fetchAndDisplayTerm:",e);return}const{termsData:t,aliasLookup:o}=u(),a=e.toLowerCase(),n=o[a]||a,s=t[n],r=document.getElementById("results");if(!r)return;if(!s){r.innerHTML=`
      <div class="definition-card">
        <div class="no-results">
          <h2 class="term-title">
            <span class="term-main">${e.toUpperCase()}</span>
          </h2>
          <p>No explanation found for "<strong>${e}</strong>".</p>
          <button id="requestBtn">Request this term</button>
        </div>
      </div>
    `,document.getElementById("requestBtn").addEventListener("click",()=>{alert(`Coming soon! This will trigger an n8n workflow to log the request for "${e}" 😎`)});return}const i=s.aliases||[];r.innerHTML=`
        <div class="definition-card">
            <div class="explanation card">
                <h2 class="term-title">
                <span class="term-main">${n.toUpperCase()}</span>
                ${i.length?`<span class="term-aliases">(${i.join('<span class="divider"> | </span>')})</span>`:""}
                </h2>
                
                <div class="term-meta-bar">
                  ${s.level?`<div class="fluency-section"><strong>🎓 Fluency: </strong>${s.level}</div>`:""}

                  <div class="term-emoji-display">${s.emoji||"📘"}</div>
                  
                  ${s.jargon_score?`
                    <div class="jargon-section">
                      <span class="tooltip" title="${j(s.jargon_score)}">
                        ${"★".repeat(s.jargon_score)}${"☆".repeat(5-s.jargon_score)}
                      </span></div>`:""}
                </div>

                <div class="tab-wrapper">
                  <div class="tabs">
                      <button class="tab-button active" data-tab="eli5"><strong>🧒 Explain Like I’m 5</strong></button>
                      <button class="tab-button" data-tab="boss"><strong>💼 Explain to a Boss</strong></button>
                      <button class="tab-button" data-tab="sysadmin"><strong>🧑‍💻 Explain to a Sysadmin</strong></button>
                  </div>
                  
                  <div class="tab-content">
                      <div class="tab-panel active" id="eli5-panel"><p>${s.eli5}</p></div>
                      <div class="tab-panel" id="boss-panel"><p>${s.boss}</p></div>
                      <div class="tab-panel" id="sysadmin-panel"><p>${s.sysadmin}</p></div>
                  </div>
                </div>

                ${s.use_case||s.categories||s.related?`
                  <details class="term-taxonomy-details">
                    <summary>📚 More About This Term</summary>
                    <div class="term-taxonomy">
                      ${s.use_case?`
                        <div class="usecase-section">
                          <strong>🛠️ Use Case:</strong> ${s.use_case}
                        </div>`:""}
                      ${s.categories?`
                        <div class="cat-section">
                          <strong>📚 Categories:</strong>
                          ${s.categories.map(c=>`<span class="category-tag">${c}</span>`).join(" ")}
                        </div>`:""}
                      ${s.related?`
                        <div class="related-section">
                          <strong>🔗 Related Terms:</strong>
                          ${s.related.map(c=>`<button class="related-btn" data-term="${c}">${c}</button>`).join(" ")}
                        </div>`:""}
                        <div id="comparePlaceholder"></div>
                    </div>
                  </details>
                `:""}
                
                <div id="shareButtons" class="share-buttons hidden">
                  <strong>📣 Share this explanation: </strong>
                  <a id="twitterShare" href="#" target="_blank" title="Share on X/Twitter">
                    <img src="img/x.svg" alt="Share on X" class="share-icon" />
                  </a>
                  <a id="facebookShare" href="#" target="_blank" title="Share on Facebook">
                    <img src="img/facebook.svg" alt="Share on Facebook" class="share-icon" />
                  </a>
                  <a id="redditShare" href="#" target="_blank" title="Share on Reddit">
                    <img src="img/reddit.svg" alt="Share on Reddit" class="share-icon" />
                  </a>
                </div>
            </div>
        </div>
    `,q(),U(),F(n),O(e,s.eli5),H(e,s),B(),s.related?.length&&R(n,s.related),document.getElementById("main")?.scrollIntoView({behavior:"smooth",block:"start"})}function R(e,t){if(!Array.isArray(t)||t.length===0)return;const o=document.createElement("div");o.className="label",o.innerHTML=`
    <div class="label">
    <div id="compareButtons" class="compare-buttons"></div></div>
  `;const a=document.getElementById("comparePlaceholder");a&&a.replaceWith(o);const{termsData:n,aliasLookup:s}=u(),r=o.querySelector("#compareButtons");t.filter(i=>n[s[i.toLowerCase()]]).forEach(i=>{const c=document.createElement("button");c.type="button",c.textContent=`Compare with ${i}`,c.className="compare-btn",c.addEventListener("click",()=>{v(e,i),history.pushState(null,"",`?compare=${e}-vs-${i}`)}),r.appendChild(c)})}document.addEventListener("click",e=>{const t=e.target.closest(".related-btn"),o=e.target.closest(".compare-suggest-btn");if(t?.dataset.term){const a=t.dataset.term,n=document.getElementById("termInput");n&&(n.value=a),p(a)}if(o?.dataset.compare?.includes("-vs-")){const[a,n]=o.dataset.compare.split("-vs-").map(s=>s.toLowerCase());v(a,n),history.pushState(null,"",`?compare=${a}-vs-${n}`)}});function B(){if(window.history.replaceState){const e=new URL(window.location);e.search="",window.history.replaceState({},document.title,e.pathname)}}let m=-1;function N(){const e=document.getElementById("termInput"),t=document.getElementById("suggestions");if(!e||!t){console.warn("⚠️ Term input or suggestions element missing");return}e.addEventListener("input",()=>{const o=e.value.toLowerCase();if(t.innerHTML="",m=-1,!o){t.style.display="none";return}const{termList:a}=u(),n=a.filter(s=>s.toLowerCase().startsWith(o)).slice(0,5);n.forEach((s,r)=>{const i=document.createElement("li");i.textContent=s,i.dataset.index=r,i.addEventListener("mousedown",()=>{e.value=s,t.style.display="none",p(s)}),t.appendChild(i)}),t.style.display=n.length?"block":"none"}),e.addEventListener("keydown",o=>{const a=t.querySelectorAll("li");if(o.key==="ArrowDown"||o.key==="ArrowUp"){if(o.preventDefault(),!a.length)return;m=o.key==="ArrowDown"?(m+1)%a.length:(m-1+a.length)%a.length,K(a)}else if(o.key==="Enter")if(o.preventDefault(),m>-1&&a[m]){const n=a[m].textContent;e.value=n,t.style.display="none",p(n)}else p(e.value.trim()),t.style.display="none"}),e.addEventListener("blur",()=>{t.style.display="none"})}function K(e,t){e.forEach((o,a)=>{const n=a===m;o.classList.toggle("highlighted",n),n&&(t.value=o.textContent)})}function X(e){const{termsData:t,aliasLookup:o}=u(),a=document.getElementById("categoryFilter");if(!a)return;a.innerHTML="";const n=new Set;for(const r in t)(t[r].categories||[]).forEach(c=>n.add(c));["All",...Array.from(n).sort()].forEach(r=>{const i=document.createElement("button");i.textContent=r,i.className="category-tag",i.addEventListener("click",()=>{document.querySelectorAll(".category-filter button").forEach(l=>l.classList.remove("active")),i.classList.add("active");const c=r==="All"?e:e.filter(l=>{const d=o[l.toLowerCase()];return t[d]?.categories?.includes(r)});S(c),b(c)}),a.appendChild(i)})}function S(e){const t=z(e),o=document.getElementById("alphabetFilter");if(!o)return;o.innerHTML="",["*","#",..."ABCDEFGHIJKLMNOPQRSTUVWXYZ"].forEach(n=>{const s=document.createElement("button");s.textContent=n,n==="*"||t[n]?.length>0||(s.disabled=!0,s.classList.add("disabled")),s.addEventListener("click",()=>{document.querySelectorAll("#alphabetFilter button").forEach(c=>c.classList.remove("active")),s.classList.add("active");const i=n==="*"?e:t[n]||[];b(i)}),o.appendChild(s)})}function z(e){return e.reduce((t,o)=>{const a=o.charAt(0).toUpperCase();let n;if(/^[0-9]/.test(a))n="#";else if(/^[A-Z]$/.test(a))n=a;else return t;return t[n]||(t[n]=[]),t[n].push(o),t},{})}function b(e){const{termsData:t,aliasLookup:o}=u(),a=document.getElementById("termLinks"),n=document.getElementById("sitemapCountTop"),s=document.getElementById("sitemapCountBottom");a.innerHTML="",e.sort().forEach(l=>{const d=l.toLowerCase(),k=o[d]||d,L=t[k],g=document.createElement("a");g.href=`?term=${encodeURIComponent(l)}`,g.textContent=l,g.classList.add("related-btn"),L?.eli5&&(g.setAttribute("data-term",l),g.setAttribute("data-definition",L.eli5)),a.appendChild(g)}),G();const r=Object.keys(t).length,c=`Showing ${e.length.toLocaleString()} of ${r.toLocaleString()} terms`;n&&(n.textContent=c),s&&(s.textContent=c)}function G(){const e=document.getElementById("customTooltip"),t=e.querySelector(".glossary-title"),o=e.querySelector(".glossary-body");document.querySelectorAll("#termLinks a").forEach(a=>{const n=a.dataset.term,s=a.dataset.definition;a.addEventListener("mouseenter",()=>{t.textContent=n,o.textContent=s,e.classList.add("visible")}),a.addEventListener("mousemove",r=>{e.style.top=`${r.pageY+15}px`,e.style.left=`${r.pageX+15}px`}),a.addEventListener("mouseleave",()=>{e.classList.remove("visible")})})}async function J(){try{const t=await(await fetch("/data/terms.json")).json(),o={},a=Object.keys(t);for(const[c,l]of Object.entries(t))o[c.toLowerCase()]=c,Array.isArray(l.aliases)&&l.aliases.forEach(d=>{o[d.toLowerCase()]=c});D({terms:t,list:a,aliases:o}),P?.(t);const n=a.filter(c=>{const l=o[c.toLowerCase()]||c.toLowerCase();return t[l]});X(n),S(n),b(n);const s=new URLSearchParams(window.location.search),r=s.get("term"),i=s.get("compare");if(i){const[c,l]=i.split("-vs-").map(d=>decodeURIComponent(d.trim().toLowerCase()));if(c&&l){const d=setInterval(()=>{document.getElementById("compareOutput")&&(clearInterval(d),v(c,l))},50);return}}r&&p(r.toLowerCase())}catch(e){console.error("❌ Failed to load terms.json",e)}}document.addEventListener("DOMContentLoaded",()=>{A(),N(),J();const e=document.getElementById("explainBtn"),t=document.getElementById("termInput"),o=document.getElementById("results"),a=document.getElementById("randomBtn"),s=new URLSearchParams(window.location.search).get("compare");if(e&&t&&o&&e.addEventListener("click",()=>{console.log("🖱️ Explain button clicked:",t?.value);const r=t.value.trim().toLowerCase();if(!r){o.innerHTML="<p>Please enter a tech term first.</p>";return}p(r)}),a&&a.addEventListener("click",()=>{const{termList:r}=u();if(r.length){const i=r[Math.floor(Math.random()*r.length)],c=document.getElementById("termInput");c&&(c.value=i),p(i)}}),s){const r=s.split(",").map(i=>i.trim());I(r)}});
