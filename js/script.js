const $=s=>document.querySelector(s);

const C=[
{
id:"c1",
co:"Acme",
cat:"Pricing",
sev:"High",
date:"Sep 28, 2026",
t:"Pro pricing increased",
from:"$49/mo",
to:"$59/mo",
pct:"+20%",
age:3,
src:"acme.com/pricing (snapshot)",
obs:"Acme Pro pricing increased from $49 to $59.",
ai:"Third pricing change in six months; may indicate enterprise positioning.",
why:[
"Acme moved its entry-level price upward.",
"This may affect our pricing comparison.",
"Nova and Orbit should be reviewed."
],
rows:[
["Pricing","$49 → $59"],
["Enterprise features","2 → 5"],
["Hiring","4 → 17 openings"],
["Positioning","SMB → Mid-market"]
],
knew:[
"Nova had launched a cheaper plan.",
"Several related changes had been detected."
]
},
{
id:"c2",
co:"Nova",
cat:"Product",
sev:"High",
date:"Sep 15, 2026",
t:"AI Agents launched",
from:"—",
to:"AI Agents",
pct:"New",
age:30,
src:"nova.io/product (snapshot)",
obs:"Nova published a new AI Agents product page.",
ai:"Follows five months of AI-focused updates and hiring.",
why:[
"Nova is expanding into AI-agent features.",
"Our roadmap comparison is now out of date."
],
rows:[
["AI features","0 → 1 product"],
["Positioning","Tool → Platform"]
],
knew:[
"Nova had posted AI engineering roles."
]
},
{
id:"c3",
co:"Orbit",
cat:"Messaging",
sev:"Low",
date:"Aug 27, 2026",
t:"Messaging shifted to 'platform'",
from:"Tool",
to:"Platform",
pct:"Text",
age:74,
src:"orbit.com (homepage snapshot)",
obs:"Orbit changed homepage wording from 'Tool' to 'Platform'.",
ai:"Consistent with earlier API and partner activity.",
why:[
"Orbit may be repositioning toward partners."
],
rows:[
["Homepage","Tool → Platform"]
],
knew:[
"Orbit had announced partner integrations."
]
}
];

const store=()=>{
try{
return JSON.parse(localStorage.getItem(KEY()));
}catch(e){}
};

let S=store()||{
saved:{},
ver:{},
dec:{},
read:{}
};

const persist=()=>{
try{
localStorage.setItem(KEY(),JSON.stringify(S));
}catch(e){}
};

const toast=t=>{
const e=$("#toast");
e.textContent=t;
e.style.display="block";
setTimeout(()=>e.style.display="none",1600);
};

let AU={
users:{},
cur:null
};

try{
AU=JSON.parse(localStorage.getItem("ml-auth"))||AU;
}catch(e){}

AU.cur=null;

try{
AU.cur=sessionStorage.getItem("ml-cur");
}catch(e){}

if(!AU.users||!AU.users[AU.cur])
AU.cur=null;

const KEY=()=>"ml-full-"+(AU.cur||"");

const saveAU=()=>{
try{
localStorage.setItem(
"ml-auth",
JSON.stringify({users:AU.users})
);

AU.cur
?sessionStorage.setItem("ml-cur",AU.cur)
:sessionStorage.removeItem("ml-cur");
}catch(e){}
};

const hp=p=>{
let h=5381;

for(const c of p)
h=(h*33^c.charCodeAt(0))>>>0;

return h.toString(36);
};

let AM="login";
let AE="";

const esc=s=>
String(s).replace(
/[&<>"]/g,
c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;"
}[c])
);

const age=c=>
S.ver[c.id]?0:c.age;

const fresh=c=>{
const a=age(c);

return a<14
?["Fresh","t-ok"]
:a<=60
?["Aging","t-warn"]
:["Stale","t-bad"];
};

const ftag=c=>{
const f=fresh(c);

return `<span class="tag ${f[1]}">${f[0]}</span>`;
};

const sevc=s=>
s=="High"
?"t-bad"
:s=="Low"
?"t-obs"
:"t-warn";

const pend=()=>
C.filter(
c=>S.dec[c.id]&&S.dec[c.id].st!="Completed"
);

let V="dash";
let sel=null;
let B=false;
let LOG=[];

function notifs(){

const l=[];

C.forEach(c=>{

l.push({
id:"n"+c.id,
x:`${c.co} ${c.t}`,
o:c.id,
r:S.read["n"+c.id]
});

if(fresh(c)[0]!="Fresh")
l.push({
id:"s"+c.id,
x:`Memory needs verification: ${c.co} ${c.cat}`,
o:c.id,
r:S.read["s"+c.id]
});

const d=S.dec[c.id];

if(d&&d.st!="Completed")
l.push({
id:"d"+c.id,
x:`Reminder: ${d.d} (${d.st})`,
o:c.id,
r:S.read["d"+c.id]
});

});

return l;
}

function answer(q){

q=q.toLowerCase();

const w=q
.split(/\W+/)
.filter(x=>x.length>2);

const has=(...k)=>
k.some(x=>q.includes(x));

if(has("stale","verify","verification","old"))

return `
<b>Memories needing verification</b>
<ul>
${
C
.filter(c=>fresh(c)[0]!="Fresh")
.map(c=>
`<li>
${c.co} ${c.cat}: ${fresh(c)[0]},
last verified ${age(c)} days ago
</li>`
)
.join("")
||
"<li>None.</li>"
}
</ul>
`;

if(has("decid","decision","outcome","pending")){

const l=C.filter(c=>S.dec[c.id]);

return l.length
?`
<b>Recorded decisions</b>
<ul>
${
l.map(c=>{
const d=S.dec[c.id];

return `
<li>
${c.co} ${c.cat}:
${esc(d.d)}
(${d.st}, ${d.dt})
${
d.out
?" · Outcome: "+esc(d.out)
:" · no outcome yet"
}
</li>
`;
}).join("")
}
</ul>
`
:"No decisions are recorded yet. Open a change and press + Add Decision.";
}

const m=C.filter(c=>
w.some(t=>
[
c.co,
c.cat,
c.t,
c.obs,
S.saved[c.id]||""
]
.join(" ")
.toLowerCase()
.includes(t)
)
||
has("what changed","everything","all changes")
);

if(!m.length)
return "I couldn't find that in stored memories. Try a competitor (Acme, Nova, Orbit) or a topic like pricing, product, decisions or stale memories.";

m.sort(
(a,b)=>
new Date(a.date)-new Date(b.date)
);

return `
<b>From stored memories, oldest first</b>

<ul>
${
m.map(c=>{
const d=S.dec[c.id];

return `
<li>
<b>${c.date}</b>:
${c.co} ${esc(c.t)}
(${esc(c.from)} → ${esc(c.to)}).
Source: ${esc(c.src)}.
${S.ver[c.id]?"Verified by you":"Needs review"}.

${
S.saved[c.id]
?" Your note: "+esc(S.saved[c.id])
:""
}

${
d
?" Decision: "+esc(d.d)+" ("+d.st+")."
:""
}

<a
href="#"
data-open="${c.id}"
style="color:var(--ac)"
>
Open
</a>
</li>
`;
}).join("")
}
</ul>

<span class="mut">
Answers come only from stored changes,
notes and decisions.
</span>
`;
}

const PAGES=[
["dash","Dashboard"],
["comp","Competitors"],
["feed","Change Feed"],
["time","Timeline"],
["ins","Insights"],
["alerts","Alerts"],
["ask","Ask MemoryLens"],
["mem","Saved Memories"],
["prof","Profile"]
];

function go(v,id){

V=v;
sel=id||null;

draw();

scrollTo(0,0);
}

function card(c){

return `
<div class="card item" data-open="${c.id}">

<span class="tag ${sevc(c.sev)}">
${c.sev}
</span>

<span class="tag">
${c.cat}
</span>

<b>${c.co}</b>

<span class="mut">
${c.date}
</span>

<h2 style="margin:6px 0 4px">
${c.co} ${esc(c.t)}
</h2>

<div class="ba" style="font-size:20px">
<s>${esc(c.from)}</s>
→
${esc(c.to)}
</div>

${ftag(c)}

${
S.saved[c.id]!=null
?'<span class="tag t-ok">Saved</span>'
:""
}

</div>
`;
}

function detail(c){

const d=S.dec[c.id];
const sv=S.saved[c.id]!=null;

return `

<button class="b alt" data-go="feed">
← Change Feed
</button>

<h1 style="margin-top:14px">
${c.co} ${esc(c.t)}
</h1>

<p class="mut">
Detected ${c.date} · ${esc(c.src)}
</p>

<div class="card">

<div class="ba">

<s>${esc(c.from)}</s>
→
${esc(c.to)}

<span class="tag t-warn">
${c.pct}
</span>

</div>

<div class="row">

<span class="tag t-obs">
Observed
</span>

${esc(c.obs)}

</div>

<div class="row ai">

<span class="tag t-ai">
AI interpretation
</span>

${esc(c.ai)}

</div>

<h2 style="margin-top:16px">
Before → After
</h2>

<div class="grid">

${
c.rows.map(r=>
`
<div class="row">
${r[0]}
<br>
<b>${esc(r[1])}</b>
</div>
`
).join("")
}

</div>

</div>

<div class="card">

<h2>
Why does this matter?
</h2>

<ul>
${
c.why.map(w=>
`<li>${esc(w)}</li>`
).join("")
}
</ul>

<div class="chain">

${
["Change","Why it matters","Decision","Outcome"]
.map((n,i)=>
`
<span class="${
i<2 ||
(i==2&&d) ||
(i==3&&d&&d.out)
?"done"
:""
}">
${n}
</span>
`
).join("→")
}

</div>

</div>

<div class="card">

<h2>
Evidence

<span class="tag ${
S.ver[c.id]
?"t-ok"
:"t-warn"
}">

${
S.ver[c.id]
?"Verified by you"
:"Needs review"
}

</span>

</h2>

<p style="margin:4px 0">

Source: ${esc(c.src)}
· Detected ${c.date}
· Previous ${esc(c.from)}
· Current ${esc(c.to)}

</p>

<p class="mut" style="margin:4px 0">

Snapshot capture:
<b>Evidence unavailable</b>
in this demo.

</p>

<button
class="b alt"
data-ver="${c.id}"
>
${
S.ver[c.id]
?"Verified"
:"Mark as verified"
}
</button>

<p style="margin:12px 0 0">

Freshness:
${ftag(c)}

<span class="mut">
Last verified
${
age(c)==0
?"today"
:age(c)+" days ago"
}
</span>

</p>

</div>

<div class="card">

<h2>
Save to Memory
</h2>

<label for="note">
My note
</label>

<input
id="note"
value="${
sv
?esc(S.saved[c.id])
:""
}"
placeholder="Check our pricing before next campaign."
>

<p style="margin:12px 0 0">

<button
class="b"
data-save="${c.id}"
>
${
sv
?"Update memory"
:"Save to Memory"
}
</button>

</p>

</div>

<div class="card">

<h2>
What did we decide?
</h2>

${
d
?`

<div class="row">

<b>
${esc(d.d)}
</b>

<br>

<span class="mut">
Owner: ${esc(d.o)}
· ${d.dt}
· ${d.st}
</span>

</div>

<div class="row">

${
d.out
?`
<span class="tag t-ok">
Outcome
</span>
${esc(d.out)}
`
:`
<span class="mut">
No outcome recorded yet.
</span>
`
}

</div>

<details>

<summary>
What did we know then?
</summary>

<ul>

<li>
${esc(c.co)}:
${esc(c.obs)}
</li>

${
c.knew.map(k=>
`<li>${esc(k)}</li>`
).join("")
}

<li>
${
sv
?"The team had saved this change."
:"This change was not saved yet."
}
</li>

</ul>

</details>

<p>

<button
class="b alt"
data-adddec="${c.id}"
>
Edit
</button>

</p>

`
:`

<span class="mut">
No decision recorded yet.
</span>

<button
class="b alt"
data-adddec="${c.id}"
>
+ Add Decision
</button>

`
}

<div id="df" hidden>

<label for="d">
Decision
</label>

<input
id="d"
value="${
d
?esc(d.d)
:"Review pricing strategy"
}"
>

<div class="grid">

<div>

<label for="o">
Owner
</label>

<input
id="o"
value="${
d
?esc(d.o)
:"Aastha"
}"
>

</div>

<div>

<label for="dt">
Date
</label>

<input
id="dt"
type="date"
value="${
d
?d.dt
:"2026-09-29"
}"
>

</div>

</div>

<label for="st">
Status
</label>

<select id="st">

${
["Pending","In Progress","Completed"]
.map(s=>
`
<option ${
d&&d.st==s
?"selected"
:""
}>
${s}
</option>
`
).join("")
}

</select>

<label for="out">
What happened afterward? (optional)
</label>

<textarea
id="out"
rows="2"
>${d?esc(d.out):""}</textarea>

<p>

<button
class="b"
data-sdec="${c.id}"
>
Save decision
</button>

</p>

</div>

</div>

`;
}

const P={

dash:()=>`

<h1>
Good morning,
${esc(
AU.users[AU.cur]
?AU.users[AU.cur].name
:"team"
)}
</h1>

<p class="mut">
MemoryLens found
${C.length}
meaningful competitor changes.
</p>

<div class="grid g3">

<div class="card stat">
<b>3</b>
Competitors tracked
</div>

<div class="card stat">
<b>${C.length}</b>
Changes detected
</div>

<div class="card stat">
<b>${pend().length}</b>
Pending decisions
</div>

</div>

<h2>
Memory health
</h2>

<div class="card">

${
C.map(c=>
`${c.co} ${c.cat}: ${ftag(c)}`
).join("<br>")
}

</div>

<h2>
What changed while you were away
</h2>

${
C.slice(0,2)
.map(card)
.join("")
}

`,

comp:()=>`

<h1>
Competitors
</h1>

${
["Acme","Nova","Orbit"]
.map(n=>{

const l=C.filter(c=>c.co==n);

return `

<div class="card">

<h2>
${n}
</h2>

<p class="mut">
${l.length}
change(s) tracked
</p>

${
l.map(c=>
`
<div
class="row item"
data-open="${c.id}"
>
${c.cat}:
${esc(c.t)}
${ftag(c)}
</div>
`
).join("")
}

</div>

`;

}).join("")
}

`,

feed:()=>`

<h1>
Change Feed
</h1>

<p class="mut">
Select a change to open its memory.
</p>

${
C.map(card).join("")
}

`,

time:()=>{

const items=[];

C.forEach(c=>{

items.push([
c.date,
`<span class="tag t-obs">Change</span>${c.co} ${esc(c.t)}`,
c.id
]);

const d=S.dec[c.id];

if(d){

items.push([
d.dt,
`<span class="tag t-warn">Decision</span>${esc(d.d)} (${d.st})`,
c.id
]);

if(d.out)
items.push([
d.dt,
`<span class="tag t-ok">Outcome</span>${esc(d.out)}`,
c.id
]);

}

});

return `

<h1>
Timeline
</h1>

<div class="tl">

${
items
.sort(
(a,b)=>
new Date(a[0])-new Date(b[0])
)
.map(i=>
`
<div
class="card item"
data-open="${i[2]}"
>

<span class="mut">
${i[0]}
</span>

<br>

${i[1]}

</div>
`
).join("")
}

</div>

`;

},

ins:()=>`

<h1>
Insights
</h1>

<div class="card">

<span class="tag t-ai">
AI interpretation
</span>

Acme and Orbit are both moving toward enterprise positioning.

</div>

<div class="card">

<span class="tag t-ai">
AI interpretation
</span>

Nova's AI launch follows months of AI hiring.

</div>

<div class="card">

<span class="tag t-obs">
Observed
</span>

${
C.filter(c=>fresh(c)[0]!="Fresh").length
}

memories need verification.

</div>

`,

alerts:()=>{

const g=s=>
C.filter(
c=>c.sev==s||
(s=="Important"&&c.sev=="Medium")
);

return `

<h1>
Alerts
</h1>

${
[["High","Critical"],["Low","Informational"]]
.map(([s,l])=>
`

<h2>
${l}
</h2>

${
C.filter(c=>c.sev==s)
.map(c=>
`
<div
class="card item"
data-open="${c.id}"
data-read="${c.id}"
style="${
S.read[c.id]
?"opacity:.6"
:""
}"
>

${
S.read[c.id]
?""
:'<span class="tag t-bad">New</span>'
}

${c.co}
${esc(c.t)}

<div class="mut">

${ftag(c)}

${
fresh(c)[0]!="Fresh"
?"Memory needs verification"
:""
}

</div>

</div>
`
).join("")
}

`
).join("")
}

<button
class="b alt"
data-readall
>
Mark all as read
</button>

`;

},

ask:()=>`

<h1>
Ask MemoryLens
</h1>

<p class="mut">
Answers come from your stored memories,
with sources. It does not guess.
</p>

<div>

${
[
"What changed with Acme pricing?",
"Which memories are stale?",
"What did we decide?",
"Tell me about Nova"
]
.map(x=>
`
<button
class="b alt chip"
data-ask="${x}"
>
${x}
</button>
`
).join("")
}

</div>

${
LOG.map(l=>
`
<div class="q">
${esc(l[0])}
</div>

<div class="card">
${l[1]}
</div>
`
).join("")
}

<div class="chat">

<input
id="qi"
placeholder="Ask about a competitor, pricing, decisions..."
aria-label="Question"
>

<button
class="b"
data-send
>
Ask
</button>

</div>

`,

prof:()=>{

const u=AU.users[AU.cur]||{};

return `

<h1>
Profile
</h1>

<div class="card">

<p>

<b>
${esc(u.name||"")}
</b>

<br>

<span class="mut">
${esc(AU.cur||"")}
</span>

</p>

<p class="mut">

Saved memories:
${Object.keys(S.saved).length}

·

Decisions:
${Object.keys(S.dec).length}

</p>

<button
class="b alt"
data-logout
>
Log out
</button>

</div>

`;

},

mem:()=>{

const l=C.filter(
c=>S.saved[c.id]!=null
);

return `

<h1>
Saved Memories
</h1>

${
l.length

?l.map(c=>
`
<div class="card">

<b>
${c.co}
${esc(c.t)}
</b>

${ftag(c)}

<p class="mut">

${c.date}
·
${
S.ver[c.id]
?"Verified by you"
:"Needs review"
}

</p>

<div class="row">

My note:
${
esc(S.saved[c.id])
||
"<i>none</i>"
}

</div>

<button
class="b alt"
data-open="${c.id}"
>
Open
</button>

<button
class="b alt"
data-del="${c.id}"
>
Remove
</button>

</div>
`
).join("")

:`
<div class="card mut">
Nothing saved yet.
Open a change and press Save to Memory.
</div>
`
}

`;

}

};

function authView(){

const t={
login:"Log in",
signup:"Create account",
forgot:"Reset password"
}[AM];

$("#m").innerHTML=`

<div class="auth card">

<h1 style="font-size:24px">
MemoryLens AI
</h1>

<p class="mut">

${t}.

Demo only:
accounts are stored in this browser,
not on a server.

</p>

${
AM=="signup"
?`
<label for="an">
Name
</label>

<input
id="an"
autocomplete="name"
>
`
:""
}

<label for="ae">
Email
</label>

<input
id="ae"
type="email"
autocomplete="email"
value="${esc(AE)}"
>

<label for="ap">

${
AM=="forgot"
?"New password"
:"Password"
}

</label>

<input
id="ap"
type="password"
autocomplete="${
AM=="login"
?"current-password"
:"new-password"
}"
>

<p
class="err"
id="er"
role="alert"
></p>

<button
class="b"
data-asubmit
style="width:100%"
>
${t}
</button>

<p
style="margin:14px 0 0;font-size:15px"
>

${
AM=="login"

?`
<button
class="lk"
data-amode="signup"
>
Create account
</button>

·

<button
class="lk"
data-amode="forgot"
>
Forgot password?
</button>
`

:`
<button
class="lk"
data-amode="login"
>
Back to log in
</button>
`
}

</p>

</div>

`;

$("#ap").addEventListener(
"keydown",
e=>{
if(e.key=="Enter")
asubmit();
}
);

}

function asubmit(){

const e=$("#ae").value
.trim()
.toLowerCase();

const p=$("#ap").value;

const n=$("#an")&&
$("#an").value.trim();

const er=m=>
$("#er").textContent=m;

AE=e;

if(!/^\S+@\S+\.\S+$/.test(e))
return er(
"Enter a valid email address."
);

if(p.length<6)
return er(
"Password must be at least 6 characters."
);

if(AM=="signup"){

if(!n)
return er(
"Enter your name."
);

if(AU.users[e])
return er(
"An account with this email already exists. Log in instead."
);

AU.users[e]={
name:n,
h:hp(p)
};

}

else if(!AU.users[e])
return er(
"No account found for this email."
);

else if(AM=="forgot")
AU.users[e].h=hp(p);

else if(AU.users[e].h!=hp(p))
return er(
"Incorrect password."
);

const fg=AM=="forgot";

AU.cur=e;

saveAU();

S=store()||{
saved:{},
ver:{},
dec:{},
read:{}
};

V="dash";
sel=null;
AM="login";

draw();

toast(
fg
?"Password reset"
:"Welcome, "+AU.users[e].name
);

}

function draw(){

$("#nav").hidden=!AU.cur;

if(!AU.cur)
return authView();

$("#nav").innerHTML=

"<b>MemoryLens AI</b>"

+

PAGES.map(
([k,n])=>
`
<button
class="${
(V==k||(sel&&k=="feed"))
?"on"
:""
}"
data-go="${k}"
>

${n}

${
k=="mem"
?" ("+
Object.keys(S.saved).length+
")"
:""
}

</button>
`
).join("")

+

`
<button
data-logout
style="margin-top:14px"
>
Sign out
</button>
`;

const N=notifs();

const u=N.filter(
n=>!n.r
).length;

$("#m").innerHTML=`

<div class="bell">

<span
class="mut"
style="align-self:center;margin-right:10px"
>
${esc(AU.users[AU.cur].name)}
</span>

<button
class="b alt"
data-logout
style="margin-right:8px"
>
Sign out
</button>

<button
class="b alt"
data-bell
aria-label="Notifications"
>
🔔 ${u}
</button>

${
B
?`

<div class="np">

<b>
Notifications
</b>

<button
class="b alt"
data-nall
style="float:right;padding:3px 10px"
>
Mark all as read
</button>

${
N.map(n=>
`
<div
class="n"
data-nopen="${n.id}|${n.o}"
style="${
n.r
?"opacity:.55"
:""
}"
>

${
n.r
?""
:"● "
}

${esc(n.x)}

</div>
`
).join("")
}

</div>

`
:""
}

</div>

`

+

(
sel
?detail(
C.find(
c=>c.id==sel
)
)
:P[V]()
);

if(V=="ask"&&!sel){

const i=$("#qi");

i&&i.addEventListener(
"keydown",
e=>{
if(e.key=="Enter")
send();
}
);

}

}

function send(t){

const i=$("#qi");

const q=
t||
(i&&i.value.trim());

if(!q)
return;

LOG.push([
q,
answer(q)
]);

draw();

}

document.addEventListener(
"click",
e=>{

const t=e.target.closest(
"[data-go],[data-open],[data-ver],[data-save],[data-adddec],[data-sdec],[data-del],[data-readall]"
);

if(!t)
return;

const D=t.dataset;

if("go"in D)
return go(D.go);

if("open"in D){

S.read[D.open]=1;

persist();

return go(
"feed",
D.open
);

}

if("ver"in D){

S.ver[D.ver]=1;

persist();

draw();

return toast(
"Marked as verified"
);

}

if("save"in D){

S.saved[D.save]=
$("#note").value;

persist();

draw();

return toast(
"Saved to memory"
);

}

if("adddec"in D){

t.hidden=true;

return void(
$("#df").hidden=false
);

}

if("sdec"in D){

S.dec[D.sdec]={
d:$("#d").value,
o:$("#o").value,
dt:$("#dt").value,
st:$("#st").value,
out:$("#out").value
};

persist();

draw();

return toast(
"Decision saved"
);

}

if("del"in D){

delete S.saved[D.del];

persist();

draw();

return toast(
"Removed"
);

}

if("readall"in D){

C.forEach(
c=>S.read[c.id]=1
);

persist();

draw();

}

}
);

document.addEventListener(
"click",
e=>{

const t=e.target.closest(
"[data-bell],[data-nall],[data-nopen],[data-ask],[data-send]"
);

if(!t)
return;

const D=t.dataset;

if("bell"in D){

B=!B;

return draw();

}

if("nall"in D){

notifs().forEach(
n=>S.read[n.id]=1
);

persist();

return draw();

}

if("nopen"in D){

const[id,o]=
D.nopen.split("|");

S.read[id]=1;

persist();

B=false;

return go(
"feed",
o
);

}

if("ask"in D)
return send(D.ask);

if("send"in D)
send();

}
);

document.addEventListener(
"click",
e=>{

const t=e.target.closest(
"[data-amode],[data-asubmit],[data-logout]"
);

if(!t)
return;

const D=t.dataset;

if("amode"in D){

AM=D.amode;

return draw();

}

if("asubmit"in D)
return asubmit();

if("logout"in D){

AU.cur=null;

saveAU();

B=false;

AM="login";

draw();

}

}
);

draw();