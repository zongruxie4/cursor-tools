#!/usr/bin/env node
"use strict";var Ie=Object.create;var ae=Object.defineProperty;var Pe=Object.getOwnPropertyDescriptor;var be=Object.getOwnPropertyNames;var Ce=Object.getPrototypeOf,ke=Object.prototype.hasOwnProperty;var Ae=(e,t)=>()=>(e&&(t=e(e=0)),t);var ce=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var _e=(e,t,o,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let i of be(t))!ke.call(e,i)&&i!==o&&ae(e,i,{get:()=>t[i],enumerable:!(n=Pe(t,i))||n.enumerable});return e};var le=(e,t,o)=>(o=e!=null?Ie(Ce(e)):{},_e(t||!e||!e.__esModule?ae(o,"default",{value:e,enumerable:!0}):o,e));var I,m=Ae(()=>{"use strict";I=require("url").pathToFileURL(__filename)});var ue=ce(q=>{"use strict";m();Object.defineProperty(q,"__esModule",{value:!0});var Se=Object.defineProperty,Te=(e,t,o)=>t in e?Se(e,t,{enumerable:!0,configurable:!0,writable:!0,value:o}):e[t]=o,M=(e,t,o)=>Te(e,typeof t!="symbol"?t+"":t,o),j=class extends Error{constructor(t,o){super(t),M(this,"type"),M(this,"field"),M(this,"value"),M(this,"line"),this.name="ParseError",this.type=o.type,this.field=o.field,this.value=o.value,this.line=o.line}};function H(e){}function Ne(e){let{onEvent:t=H,onError:o=H,onRetry:n=H,onComment:i}=e,c="",r=!0,a,s="",f="";function E(l){let p=r?l.replace(/^\xEF\xBB\xBF/,""):l,[v,b]=Oe(`${c}${p}`);for(let k of v)u(k);c=b,r=!1}function u(l){if(l===""){C();return}if(l.startsWith(":")){i&&i(l.slice(l.startsWith(": ")?2:1));return}let p=l.indexOf(":");if(p!==-1){let v=l.slice(0,p),b=l[p+1]===" "?2:1,k=l.slice(p+b);y(v,k,l);return}y(l,"",l)}function y(l,p,v){switch(l){case"event":f=p;break;case"data":s=`${s}${p}
`;break;case"id":a=p.includes("\0")?void 0:p;break;case"retry":/^\d+$/.test(p)?n(parseInt(p,10)):o(new j(`Invalid \`retry\` value: "${p}"`,{type:"invalid-retry",value:p,line:v}));break;default:o(new j(`Unknown field "${l.length>20?`${l.slice(0,20)}\u2026`:l}"`,{type:"unknown-field",field:l,value:p,line:v}));break}}function C(){s.length>0&&t({id:a,event:f||void 0,data:s.endsWith(`
`)?s.slice(0,-1):s}),a=void 0,s="",f=""}function P(l={}){c&&l.consume&&u(c),a=void 0,s="",f="",c=""}return{feed:E,reset:P}}function Oe(e){let t=[],o="",n=e.length;for(let i=0;i<n;i++){let c=e[i];c==="\r"&&e[i+1]===`
`?(t.push(o),o="",i++):c==="\r"||c===`
`?(t.push(o),o=""):o+=c}return[t,o]}q.ParseError=j;q.createParser=Ne});var pe=ce(R=>{"use strict";m();Object.defineProperty(R,"__esModule",{value:!0});var V=require("node:stream"),Re=ue(),Z="connecting",de="open",F="closed",z=()=>{};function Le(e,{getStream:t}){let o=typeof e=="string"||e instanceof URL?{url:e}:e,{onMessage:n,onConnect:i=z,onDisconnect:c=z,onScheduleReconnect:r=z}=o,{fetch:a,url:s,initialLastEventId:f}=Ge(o),E={...o.headers},u=[],y=n?[n]:[],C=d=>y.forEach(w=>w(d)),P=Re.createParser({onEvent:ve,onRetry:we}),l,p=s.toString(),v=new AbortController,b=f,k=2e3,oe,S=F;return X(),{close:re,connect:X,[Symbol.iterator]:()=>{throw new Error("EventSource does not support synchronous iteration. Use `for await` instead.")},[Symbol.asyncIterator]:he,get lastEventId(){return b},get url(){return p},get readyState(){return S}};function X(){l||(S=Z,v=new AbortController,l=a(s,xe()).then(Ee).catch(d=>{l=null,!(d.name==="AbortError"||d.type==="aborted")&&ne()}))}function re(){S=F,v.abort(),P.reset(),clearTimeout(oe),u.forEach(d=>d())}function he(){let d=[],w=[];function L(){return new Promise(g=>{let x=w.shift();x?g({value:x,done:!1}):d.push(g)})}let T=function(g){let x=d.shift();x?x({value:g,done:!1}):w.push(g)};function A(){for(y.splice(y.indexOf(T),1);d.shift(););for(;w.shift(););}function G(){let g=d.shift();g&&(g({done:!0,value:void 0}),A())}return u.push(G),y.push(T),{next(){return S===F?this.return():L()},return(){return A(),Promise.resolve({done:!0,value:void 0})},throw(g){return A(),Promise.reject(g)},[Symbol.asyncIterator](){return this}}}function ne(){r({delay:k}),S=Z,oe=setTimeout(X,k)}async function Ee(d){i(),P.reset();let{body:w,redirected:L,status:T}=d;if(T===204){c(),re();return}if(!w)throw new Error("Missing response body");L&&(p=d.url);let A=t(w),G=new TextDecoder,g=A.getReader(),x=!0;S=de;do{let{done:se,value:ie}=await g.read();ie&&P.feed(G.decode(ie,{stream:!se})),se&&(x=!1,l=null,P.reset(),ne(),c())}while(x)}function ve(d){typeof d.id=="string"&&(b=d.id),C(d)}function we(d){k=d}function xe(){let{mode:d,credentials:w,body:L,method:T,redirect:A,referrer:G,referrerPolicy:g}=o,x={Accept:"text/event-stream",...E,...b?{"Last-Event-ID":b}:void 0};return{mode:d,credentials:w,body:L,method:T,redirect:A,referrer:G,referrerPolicy:g,headers:x,cache:"no-store",signal:v.signal}}}function Ge(e){let t=e.fetch||globalThis.fetch;if(!$e(t))throw new Error("No fetch implementation provided, and one was not found on the global object.");if(typeof AbortController!="function")throw new Error("Missing AbortController implementation");let{url:o,initialLastEventId:n}=e;if(typeof o!="string"&&!(o instanceof URL))throw new Error("Invalid URL provided - must be string or URL instance");if(typeof n!="string"&&n!==void 0)throw new Error("Invalid initialLastEventId provided - must be string or undefined");return{fetch:t,url:o,initialLastEventId:n}}function $e(e){return typeof e=="function"}var je={getStream:Ke};function Ye(e){return Le(e,je)}function Ke(e){if("getReader"in e)return e;if(typeof e.pipe!="function"||typeof e.on!="function")throw new Error("Invalid response body, expected a web or node.js stream");if(typeof V.Readable.toWeb!="function")throw new Error("Node.js 18 or higher required (`Readable.toWeb()` not defined)");return V.Readable.toWeb(V.Readable.from(e))}R.CLOSED=F;R.CONNECTING=Z;R.OPEN=de;R.createEventSource=Ye});m();m();m();m();var N=require("node:fs"),$=require("node:path"),Q=require("node:os"),B=le(require("dotenv"),1),W={perplexity:{model:"sonar-pro",maxTokens:4e3},gemini:{model:"gemini-2.0-flash-thinking-exp-01-21",maxTokens:1e4}};function K(){try{let e=(0,$.join)(process.cwd(),"cursor-tools.config.json"),t=JSON.parse((0,N.readFileSync)(e,"utf-8"));return{...W,...t}}catch{try{let e=(0,$.join)((0,Q.homedir)(),".cursor-tools","config.json"),t=JSON.parse((0,N.readFileSync)(e,"utf-8"));return{...W,...t}}catch{return W}}}function O(){let e=(0,$.join)(process.cwd(),".cursor-tools.env");if((0,N.existsSync)(e)){B.default.config({path:e});return}let t=(0,$.join)((0,Q.homedir)(),".cursor-tools",".env");if((0,N.existsSync)(t)){B.default.config({path:t});return}}m();var Y=le(pe(),1),Qe=Y.default.CLOSED,He=Y.default.CONNECTING,Ve=Y.default.OPEN,me=Y.default.createEventSource;var fe=2,D=class{config;constructor(){O(),this.config=K()}async*fetchPerplexityResponse(t,o){let n=process.env.PERPLEXITY_API_KEY;if(!n)throw new Error("PERPLEXITY_API_KEY environment variable is not set");let i=!1,c=!1,r=!1,a=0,s=me({url:"https://api.perplexity.ai/chat/completions",onDisconnect:()=>{r||(c?(console.error(`
Perplexity disconnected without sending a finish_reason, we will close the connection`),s.close()):(console.error(`
Connection disconnected without recieving any messages, we will retry ${fe} times (attempt ${a})`),s.close()))},fetch:async(f,E)=>{if(a++>fe)return i=!0,console.error(`
Max retries reached. Giving up.`),{body:null,url:f.toString(),status:204,redirected:!1};let u=await fetch(f,{...E,method:"POST",headers:{...E?.headers||{},Authorization:`Bearer ${n}`,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({model:o?.model||this.config.perplexity.model,messages:[{role:"system",content:"Search the web to produce answers to questions. Your responses are for an automated system and should be precise, specific and concise. Avoid unnecessary chat and formatting. Include code and examples."},{role:"user",content:t}],stream:!0,max_tokens:o?.maxTokens||this.config.perplexity.maxTokens})});if(!u.ok){let y=await u.text();throw console.error("Perplexity API error",y),new Error(`API Error (${u.status}): ${y}`)}return u}});try{for await(let{data:f,event:E}of s){try{let u=JSON.parse(f),y=u.choices[0]?.delta?.content;if(y!==void 0&&(c=!0,yield y),"finish_reason"in u.choices[0]&&u.choices[0].finish_reason){r=!0,u.citations&&u.citations.length>0&&(yield`

citations:
`+u.citations?.map((C,P)=>`${P+1}. ${C}`).join(`
`));break}if(E?.toLowerCase()==="end"||E?.toLowerCase()==="done"){r=!0;break}}catch(u){throw console.error("Error parsing event data:",u),u}if(i)break}}finally{s.close()}}async*execute(t,o){try{yield`Querying Perplexity AI using ${o?.model||this.config.perplexity.model} for: ${t}
`,yield*this.fetchPerplexityResponse(t,o)}catch(n){n instanceof Error?yield`Error: ${n.message}`:yield"An unknown error occurred"}}};m();var ee=require("node:fs"),ye=require("repomix"),U=class{config;constructor(){O(),this.config=K()}async fetchGeminiResponse(t,o,n){let i=process.env.GEMINI_API_KEY;if(!i)throw new Error("GEMINI_API_KEY environment variable is not set");let c="";try{c=(0,ee.readFileSync)(".cursorrules","utf-8")}catch{}let r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${n?.model||this.config.gemini.model}:generateContent?key=${i}`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({contents:[{parts:[{text:c},{text:o},{text:t}]}],generationConfig:{maxOutputTokens:n?.maxTokens||this.config.gemini.maxTokens}})});if(!r.ok){let s=await r.text();throw new Error(`Gemini API error (${r.status}): ${s}`)}let a=await r.json();if(a.error)throw new Error(`Gemini API error: ${JSON.stringify(a.error,null,2)}`);return a.candidates[0].content.parts[0].text}async*execute(t,o){try{yield`Packing repository using repomix...
`,await(0,ye.pack)(process.cwd(),{output:{filePath:"repomix-output.txt",style:"xml",fileSummary:!0,directoryStructure:!0,removeComments:!1,removeEmptyLines:!0,topFilesLength:20,showLineNumbers:!1,copyToClipboard:!1,includeEmptyDirectories:!0,parsableStyle:!0},include:["**/*"],ignore:{useGitignore:!0,useDefaultPatterns:!0,customPatterns:["**/*.pbxproj","**/node_modules/**","**/dist/**","**/build/**","**/compile/**","**/.*/**"]},security:{enableSecurityCheck:!0},tokenCount:{encoding:"cl100k_base"},cwd:process.cwd()});let n=(0,ee.readFileSync)("repomix-output.txt","utf-8");yield`Querying Gemini AI using ${o?.model||this.config.gemini.model}...
`,yield await this.fetchGeminiResponse(t,n,o)}catch(n){n instanceof Error?yield`Error: ${n.message}`:yield"An unknown error occurred"}}};m();var h=require("node:fs"),_=require("node:path"),ge=require("node:os");var J=class{async*setupApiKeys(){O();let t=(0,_.join)((0,ge.homedir)(),".cursor-tools",".env"),o=(0,_.join)(process.cwd(),".cursor-tools.env");if(process.env.PERPLEXITY_API_KEY&&process.env.GEMINI_API_KEY)return;let n=(i,c,r)=>{let a=`PERPLEXITY_API_KEY=${c}
GEMINI_API_KEY=${r}
`,s=(0,_.join)(i,"..");(0,h.existsSync)(s)||(0,h.mkdirSync)(s,{recursive:!0}),(0,h.writeFileSync)(i,a,"utf-8")};try{let i=process.env.PERPLEXITY_API_KEY||"",c=process.env.GEMINI_API_KEY||"";if(!i){yield"Enter your Perplexity API key (or press Enter to skip): ";let r=await new Promise(a=>{process.stdin.once("data",s=>a(s.toString().trim()))});process.env.PERPLEXITY_API_KEY=r}if(!c){yield"Enter your Gemini API key (or press Enter to skip): ";let r=await new Promise(a=>{process.stdin.once("data",s=>a(s.toString().trim()))});process.env.GEMINI_API_KEY=r}try{n(t,process.env.PERPLEXITY_API_KEY||"",process.env.GEMINI_API_KEY||""),yield`API keys written to ~/.cursor-tools/.env
`}catch(r){console.error("Error writing API keys to home directory:",r),n(o,process.env.PERPLEXITY_API_KEY||"",process.env.GEMINI_API_KEY||""),yield`API keys written to .cursor-tools.env in the current directory
`}}catch(i){console.error("Error setting up API keys:",i),yield`Error setting up API keys. You can add them later manually.
`}}async*execute(t,o){let n=o?.packageManager||"npm/yarn/pnpm",i=(0,_.join)(process.cwd(),t),c=(0,_.join)(i,"package.json");if((0,h.existsSync)(c))try{yield"Would you like to add cursor-tools as a dev dependency to package.json? (y/N): ";let r=await new Promise(a=>{process.stdin.once("data",s=>a(s.toString().trim().toLowerCase()))});if(r==="y"||r==="yes"){yield`Adding cursor-tools as a dev dependency to package.json...
`;let a=JSON.parse((0,h.readFileSync)(c,"utf-8"));a.devDependencies||(a.devDependencies={}),a.devDependencies["cursor-tools"]="latest",(0,h.writeFileSync)(c,JSON.stringify(a,null,2)),yield`Please run \`${n} install\` to complete the installation.
`}else yield`Skipping dev dependency installation.
`}catch(r){yield`Error updating package.json: ${r instanceof Error?r.message:"Unknown error"}
`;return}else yield`No package.json found - skipping dependency installation
`;yield`Checking API keys setup...
`,yield*this.setupApiKeys();try{yield`Updating .cursorrules...
`;let r=(0,_.join)(i,".cursorrules"),a=`
<cursor-tools Integration>
Use the following commands to get AI assistance:

cursor-tools web "your question"  - Get answers from the web using Perplexity AI
cursor-tools repo "your question" - Get context-aware answers about this repository using Google Gemini

cursor-tools web is good for getting up-to-date information from the web that are not repository specific. For example, you can ask it to get the names and details of the latest OpenAI models or details about an external API.
cursor-tools repo has the entire repository context available to it so it is good for repository search and tasks that require holistic understanding such as planning, debugging and answering questions about the architecture.

if cursor-tools is not found in your PATH, you can run it with \`npm exec cursor-tools "your question"\` or \`yarn cursor-tools "your question"\` or \`pnpm cursor-tools "your question"\` depending on your package manager if cursor-tools is installed as a dependency. If cursor-tools is not installed as a dependency you should fall back to using \`npx cursor-tools "your question"\`.

Note: configuration is in cursor-tools.config.json (falling back to ~/.cursor-tools/config.json)
Note: api keys are loaded from .cursor-tools.env (falling back to ~/.cursor-tools/.env)
</cursor-tools Integration>
`,s="";(0,h.existsSync)(r)&&(s=(0,h.readFileSync)(r,"utf-8"));let f="<cursor-tools Integration>",E="</cursor-tools Integration>",u=s.indexOf(f),y=s.indexOf(E);if(u!==-1&&y!==-1){let C=s.slice(0,u)+a.trim()+s.slice(y+E.length);(0,h.writeFileSync)(r,C)}else(0,h.writeFileSync)(r,s+a);yield`Installation completed successfully!
`}catch(r){yield`Error updating .cursorrules: ${r instanceof Error?r.message:"Unknown error"}
`}}};var te={web:new D,repo:new U,install:new J};async function Me(){let[,,e,...t]=process.argv,o={},n=[];for(let r=0;r<t.length;r++){let a=t[r];if(a.startsWith("--")){let[s,f]=a.slice(2).split("=");s==="model"?o.model=f:s==="maxTokens"&&(o.maxTokens=parseInt(f,10),isNaN(o.maxTokens)&&(console.error("Error: maxTokens must be a number"),process.exit(1)))}else n.push(a)}let i=e==="install"&&n.length===0?".":n.join(" ");(!e||!i)&&(console.error('Usage: cursor-tools [--model=<model>] [--maxTokens=<number>] <command> "<query>"'),process.exit(1));let c=te[e];c||(console.error(`Unknown command: ${e}`),console.error("Available commands: "+Object.keys(te).join(", ")),process.exit(1));try{for await(let r of c.execute(i,o))await new Promise(a=>process.stdout.write(r,a));console.log("")}catch(r){console.error("Error:",r),process.exit(1)}}Me().then(()=>{process.exit(0)}).catch(e=>{console.error("Error in cursor-tools:",e),process.exit(1)});
