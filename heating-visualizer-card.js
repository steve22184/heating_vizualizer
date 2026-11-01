function t(t,e,o,i){var n,r=arguments.length,a=r<3?e:null===i?i=Object.getOwnPropertyDescriptor(e,o):i;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)a=Reflect.decorate(t,e,o,i);else for(var s=t.length-1;s>=0;s--)(n=t[s])&&(a=(r<3?n(a):r>3?n(e,o,a):n(e,o))||a);return r>3&&a&&Object.defineProperty(e,o,a),a}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,o=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,i=Symbol(),n=new WeakMap;let r=class{constructor(t,e,o){if(this._$cssResult$=!0,o!==i)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(o&&void 0===t){const o=void 0!==e&&1===e.length;o&&(t=n.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),o&&n.set(e,t))}return t}toString(){return this.cssText}};const a=(t,...e)=>{const o=1===t.length?t[0]:e.reduce((e,o,i)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(o)+t[i+1],t[0]);return new r(o,t,i)},s=o?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const o of t.cssRules)e+=o.cssText;return(t=>new r("string"==typeof t?t:t+"",void 0,i))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:p,getOwnPropertySymbols:h,getPrototypeOf:u}=Object,_=globalThis,v=_.trustedTypes,y=v?v.emptyScript:"",m=_.reactiveElementPolyfillSupport,f=(t,e)=>t,$={toAttribute(t,e){switch(e){case Boolean:t=t?y:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let o=t;switch(e){case Boolean:o=null!==t;break;case Number:o=null===t?null:Number(t);break;case Object:case Array:try{o=JSON.parse(t)}catch(t){o=null}}return o}},g=(t,e)=>!l(t,e),b={attribute:!0,type:String,converter:$,reflect:!1,useDefault:!1,hasChanged:g};Symbol.metadata??=Symbol("metadata"),_.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=b){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const o=Symbol(),i=this.getPropertyDescriptor(t,o,e);void 0!==i&&d(this.prototype,t,i)}}static getPropertyDescriptor(t,e,o){const{get:i,set:n}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:i,set(e){const r=i?.call(this);n?.call(this,e),this.requestUpdate(t,r,o)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??b}static _$Ei(){if(this.hasOwnProperty(f("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(f("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(f("properties"))){const t=this.properties,e=[...p(t),...h(t)];for(const o of e)this.createProperty(o,t[o])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,o]of e)this.elementProperties.set(t,o)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const o=this._$Eu(t,e);void 0!==o&&this._$Eh.set(o,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const o=new Set(t.flat(1/0).reverse());for(const t of o)e.unshift(s(t))}else void 0!==t&&e.push(s(t));return e}static _$Eu(t,e){const o=e.attribute;return!1===o?void 0:"string"==typeof o?o:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const o of e.keys())this.hasOwnProperty(o)&&(t.set(o,this[o]),delete this[o]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,i)=>{if(o)t.adoptedStyleSheets=i.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const o of i){const i=document.createElement("style"),n=e.litNonce;void 0!==n&&i.setAttribute("nonce",n),i.textContent=o.cssText,t.appendChild(i)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,o){this._$AK(t,o)}_$ET(t,e){const o=this.constructor.elementProperties.get(t),i=this.constructor._$Eu(t,o);if(void 0!==i&&!0===o.reflect){const n=(void 0!==o.converter?.toAttribute?o.converter:$).toAttribute(e,o.type);this._$Em=t,null==n?this.removeAttribute(i):this.setAttribute(i,n),this._$Em=null}}_$AK(t,e){const o=this.constructor,i=o._$Eh.get(t);if(void 0!==i&&this._$Em!==i){const t=o.getPropertyOptions(i),n="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:$;this._$Em=i;const r=n.fromAttribute(e,t.type);this[i]=r??this._$Ej?.get(i)??r,this._$Em=null}}requestUpdate(t,e,o,i=!1,n){if(void 0!==t){const r=this.constructor;if(!1===i&&(n=this[t]),o??=r.getPropertyOptions(t),!((o.hasChanged??g)(n,e)||o.useDefault&&o.reflect&&n===this._$Ej?.get(t)&&!this.hasAttribute(r._$Eu(t,o))))return;this.C(t,e,o)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:o,reflect:i,wrapped:n},r){o&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,r??e??this[t]),!0!==n||void 0!==r)||(this._$AL.has(t)||(this.hasUpdated||o||(e=void 0),this._$AL.set(t,e)),!0===i&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,o]of t){const{wrapped:t}=o,i=this[e];!0!==t||this._$AL.has(e)||void 0===i||this.C(e,void 0,o,i)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[f("elementProperties")]=new Map,x[f("finalized")]=new Map,m?.({ReactiveElement:x}),(_.reactiveElementVersions??=[]).push("2.1.2");const w=globalThis,k=t=>t,A=w.trustedTypes,M=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,S="$lit$",z=`lit$${Math.random().toFixed(9).slice(2)}$`,I="?"+z,C=`<${I}>`,P=document,E=()=>P.createComment(""),N=t=>null===t||"object"!=typeof t&&"function"!=typeof t,L=Array.isArray,O="[ \t\n\f\r]",j=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,T=/-->/g,H=/>/g,D=RegExp(`>|${O}(?:([^\\s"'>=/]+)(${O}*=${O}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),V=/'/g,K=/"/g,R=/^(?:script|style|textarea|title)$/i,U=t=>(e,...o)=>({_$litType$:t,strings:e,values:o}),B=U(1),q=U(2),Z=Symbol.for("lit-noChange"),F=Symbol.for("lit-nothing"),W=new WeakMap,J=P.createTreeWalker(P,129);function Y(t,e){if(!L(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==M?M.createHTML(e):e}const X=(t,e)=>{const o=t.length-1,i=[];let n,r=2===e?"<svg>":3===e?"<math>":"",a=j;for(let e=0;e<o;e++){const o=t[e];let s,l,d=-1,c=0;for(;c<o.length&&(a.lastIndex=c,l=a.exec(o),null!==l);)c=a.lastIndex,a===j?"!--"===l[1]?a=T:void 0!==l[1]?a=H:void 0!==l[2]?(R.test(l[2])&&(n=RegExp("</"+l[2],"g")),a=D):void 0!==l[3]&&(a=D):a===D?">"===l[0]?(a=n??j,d=-1):void 0===l[1]?d=-2:(d=a.lastIndex-l[2].length,s=l[1],a=void 0===l[3]?D:'"'===l[3]?K:V):a===K||a===V?a=D:a===T||a===H?a=j:(a=D,n=void 0);const p=a===D&&t[e+1].startsWith("/>")?" ":"";r+=a===j?o+C:d>=0?(i.push(s),o.slice(0,d)+S+o.slice(d)+z+p):o+z+(-2===d?e:p)}return[Y(t,r+(t[o]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),i]};class G{constructor({strings:t,_$litType$:e},o){let i;this.parts=[];let n=0,r=0;const a=t.length-1,s=this.parts,[l,d]=X(t,e);if(this.el=G.createElement(l,o),J.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(i=J.nextNode())&&s.length<a;){if(1===i.nodeType){if(i.hasAttributes())for(const t of i.getAttributeNames())if(t.endsWith(S)){const e=d[r++],o=i.getAttribute(t).split(z),a=/([.?@])?(.*)/.exec(e);s.push({type:1,index:n,name:a[2],strings:o,ctor:"."===a[1]?it:"?"===a[1]?nt:"@"===a[1]?rt:ot}),i.removeAttribute(t)}else t.startsWith(z)&&(s.push({type:6,index:n}),i.removeAttribute(t));if(R.test(i.tagName)){const t=i.textContent.split(z),e=t.length-1;if(e>0){i.textContent=A?A.emptyScript:"";for(let o=0;o<e;o++)i.append(t[o],E()),J.nextNode(),s.push({type:2,index:++n});i.append(t[e],E())}}}else if(8===i.nodeType)if(i.data===I)s.push({type:2,index:n});else{let t=-1;for(;-1!==(t=i.data.indexOf(z,t+1));)s.push({type:7,index:n}),t+=z.length-1}n++}}static createElement(t,e){const o=P.createElement("template");return o.innerHTML=t,o}}function Q(t,e,o=t,i){if(e===Z)return e;let n=void 0!==i?o._$Co?.[i]:o._$Cl;const r=N(e)?void 0:e._$litDirective$;return n?.constructor!==r&&(n?._$AO?.(!1),void 0===r?n=void 0:(n=new r(t),n._$AT(t,o,i)),void 0!==i?(o._$Co??=[])[i]=n:o._$Cl=n),void 0!==n&&(e=Q(t,n._$AS(t,e.values),n,i)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:o}=this._$AD,i=(t?.creationScope??P).importNode(e,!0);J.currentNode=i;let n=J.nextNode(),r=0,a=0,s=o[0];for(;void 0!==s;){if(r===s.index){let e;2===s.type?e=new et(n,n.nextSibling,this,t):1===s.type?e=new s.ctor(n,s.name,s.strings,this,t):6===s.type&&(e=new at(n,this,t)),this._$AV.push(e),s=o[++a]}r!==s?.index&&(n=J.nextNode(),r++)}return J.currentNode=P,i}p(t){let e=0;for(const o of this._$AV)void 0!==o&&(void 0!==o.strings?(o._$AI(t,o,e),e+=o.strings.length-2):o._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,o,i){this.type=2,this._$AH=F,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=o,this.options=i,this._$Cv=i?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),N(t)?t===F||null==t||""===t?(this._$AH!==F&&this._$AR(),this._$AH=F):t!==this._$AH&&t!==Z&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>L(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==F&&N(this._$AH)?this._$AA.nextSibling.data=t:this.T(P.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:o}=t,i="number"==typeof o?this._$AC(t):(void 0===o.el&&(o.el=G.createElement(Y(o.h,o.h[0]),this.options)),o);if(this._$AH?._$AD===i)this._$AH.p(e);else{const t=new tt(i,this),o=t.u(this.options);t.p(e),this.T(o),this._$AH=t}}_$AC(t){let e=W.get(t.strings);return void 0===e&&W.set(t.strings,e=new G(t)),e}k(t){L(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let o,i=0;for(const n of t)i===e.length?e.push(o=new et(this.O(E()),this.O(E()),this,this.options)):o=e[i],o._$AI(n),i++;i<e.length&&(this._$AR(o&&o._$AB.nextSibling,i),e.length=i)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class ot{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,o,i,n){this.type=1,this._$AH=F,this._$AN=void 0,this.element=t,this.name=e,this._$AM=i,this.options=n,o.length>2||""!==o[0]||""!==o[1]?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=F}_$AI(t,e=this,o,i){const n=this.strings;let r=!1;if(void 0===n)t=Q(this,t,e,0),r=!N(t)||t!==this._$AH&&t!==Z,r&&(this._$AH=t);else{const i=t;let a,s;for(t=n[0],a=0;a<n.length-1;a++)s=Q(this,i[o+a],e,a),s===Z&&(s=this._$AH[a]),r||=!N(s)||s!==this._$AH[a],s===F?t=F:t!==F&&(t+=(s??"")+n[a+1]),this._$AH[a]=s}r&&!i&&this.j(t)}j(t){t===F?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class it extends ot{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===F?void 0:t}}class nt extends ot{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==F)}}class rt extends ot{constructor(t,e,o,i,n){super(t,e,o,i,n),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??F)===Z)return;const o=this._$AH,i=t===F&&o!==F||t.capture!==o.capture||t.once!==o.once||t.passive!==o.passive,n=t!==F&&(o===F||i);i&&this.element.removeEventListener(this.name,this,o),n&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class at{constructor(t,e,o){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const st=w.litHtmlPolyfillSupport;st?.(G,et),(w.litHtmlVersions??=[]).push("3.3.3");const lt=globalThis;class dt extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,o)=>{const i=o?.renderBefore??e;let n=i._$litPart$;if(void 0===n){const t=o?.renderBefore??null;i._$litPart$=n=new et(e.insertBefore(E(),t),t,void 0,o??{})}return n._$AI(t),n})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return Z}}dt._$litElement$=!0,dt.finalized=!0,lt.litElementHydrateSupport?.({LitElement:dt});const ct=lt.litElementPolyfillSupport;ct?.({LitElement:dt}),(lt.litElementVersions??=[]).push("4.2.2");const pt=t=>(e,o)=>{void 0!==o?o.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},ht={attribute:!0,type:String,converter:$,reflect:!1,hasChanged:g},ut=(t=ht,e,o)=>{const{kind:i,metadata:n}=o;let r=globalThis.litPropertyMetadata.get(n);if(void 0===r&&globalThis.litPropertyMetadata.set(n,r=new Map),"setter"===i&&((t=Object.create(t)).wrapped=!0),r.set(o.name,t),"accessor"===i){const{name:i}=o;return{set(o){const n=e.get.call(this);e.set.call(this,o),this.requestUpdate(i,n,t,!0,o)},init(e){return void 0!==e&&this.C(i,void 0,t,e),e}}}if("setter"===i){const{name:i}=o;return function(o){const n=this[i];e.call(this,o),this.requestUpdate(i,n,t,!0,o)}}throw Error("Unsupported decorator location: "+i)};function _t(t){return(e,o)=>"object"==typeof o?ut(t,e,o):((t,e,o)=>{const i=e.hasOwnProperty(o);return e.constructor.createProperty(o,t),i?Object.getOwnPropertyDescriptor(e,o):void 0})(t,e,o)}function vt(t){return _t({...t,state:!0,attribute:!1})}const yt=["top_left","top_right","bottom_left","bottom_right"];function mt(t){return`${t.nodeId}.${t.portId}`}function ft(t){const e=t.lastIndexOf(".");if(!(e<=0||e===t.length-1))return{nodeId:t.slice(0,e),portId:t.slice(e+1)}}function $t(t){return`${t.from}>${t.to}`}const gt={nodes:[],connections:[],overlays:[]};function bt(t){return{nodes:t.nodes??[],connections:t.connections??[],overlays:t.overlays??[]}}function xt(t){return"undefined"!=typeof crypto&&"function"==typeof crypto.randomUUID?`${t}_${crypto.randomUUID().slice(0,8)}`:`${t}_${Math.random().toString(36).slice(2,10)}`}const wt=["top","upper","middle","lower","bottom"],kt=["top","middle","bottom"],At={type:"alarm",max:1},Mt={type:"mode",max:1},St={type:"setpoint",max:1},zt=t=>({type:"value",max:t}),It=(...t)=>({type:"temperature",max:t.length,slots:t}),Ct=t=>10*Math.round(t/10),Pt={type:"valve_3way",labelKey:"devices.valve_3way.name",width:80,height:80,ports:[{id:"in",labelKey:"devices.valve_3way.ports.in",kind:"inlet",position:{x:0,y:40}},{id:"out_a",labelKey:"devices.valve_3way.ports.out_a",kind:"outlet",position:{x:80,y:40}},{id:"out_b",labelKey:"devices.valve_3way.ports.out_b",kind:"outlet",position:{x:40,y:80}}],addons:[zt(1),At]},Et=100;function Nt(t){const e=t&&t>0?t:200,o=110+38*Math.log2(e/50);return Math.round(Math.min(300,Math.max(100,o)))}const Lt=["source_in","coil_in","coil_out","coil2_in","coil2_out","source_out"],Ot=["hot_out","supply_out","circulation_in","return_in","cold_in"],jt=new Set(["source_out","coil_out","coil2_out","hot_out","hot_out2","supply_out"]),Tt=.15;const Ht="dual_coil",Dt=new Set(["coil_out","coil2_in","return_in"]);function Vt(t,e,o){const i=Ct(o*Tt),n=Ct(.85*o),r=Ct(.2*(e-40))+20,a=e-r;return[["hot_out",r,0],["hot_out2",a,0],["coil_in",0,i],["source_in",0,Ct(.4*o)],["source_out",0,Ct(.6*o)],["coil_out",0,n],["coil2_out",e,i],["supply_out",e,Ct(.5*o)],["circulation_in",e,Ct(.68*o)],["coil2_in",e,n],["return_in",a,o]].filter(([e])=>t.has(e)).map(([t,e,o])=>((t,e,o)=>({id:t,labelKey:`devices.tank.ports.${t}`,kind:jt.has(t)?"outlet":"inlet",tone:Dt.has(t)?"cold":"hot",position:{x:e,y:o}}))(t,e,o))}function Kt(t,e,o){return t.map((i,n)=>({id:i,labelKey:`devices.tank.ports.${i}`,kind:jt.has(i)?"outlet":"inlet",position:{x:e,y:Ct(o*(1===t.length?.5:Tt+.7*n/(t.length-1)))}}))}function Rt(t){return t.addons?.some(t=>"dhw"===t.type)?"tank_dhw":"tank_buffer"}const Ut={type:"tank",labelKey:"devices.tank.name",width:Et,height:Nt(void 0),ports:[],volume:!0,variants:["standard",Ht],addons:[It(...wt),zt(2),{type:"electric_heater",max:2},{type:"pump",max:1},Mt,St,At,{type:"heat_exchanger",max:2},{type:"direct_source",max:1},{type:"direct_heating",max:1},{type:"dhw",max:1},{type:"circulation",max:1}],resolve:t=>{const e=function(t){const e=Number(t.scale??1);return!Number.isFinite(e)||e<=0?1:Math.min(2,Math.max(.5,e))}(t),o=1===e?Et:Ct(Et*e),i=o+(t.variant===Ht?40:0),n=1===e?Nt(t.volume):Ct(Nt(t.volume)*e),r=t.variant===Ht?Ct(n+20+o/Et*28):n,a=function(t){const e=e=>t.addons?.filter(t=>t.type===e).length??0,o=new Set;return e("direct_source")&&["source_in","source_out"].forEach(t=>o.add(t)),e("heat_exchanger")>=1&&["coil_in","coil_out"].forEach(t=>o.add(t)),e("heat_exchanger")>=2&&["coil2_in","coil2_out"].forEach(t=>o.add(t)),e("dhw")&&["hot_out","cold_in"].forEach(t=>o.add(t)),e("dhw")&&t.variant===Ht&&(o.delete("cold_in"),o.add("hot_out2")),e("direct_heating")&&["supply_out","return_in"].forEach(t=>o.add(t)),e("circulation")&&o.add("circulation_in"),o}(t);return{...Ut,labelKey:"devices.tank."+("tank_dhw"===Rt(t)?"name_dhw":a.size?"name_buffer":"name"),width:i,height:r,ports:t.variant===Ht?Vt(a,i,r):[...Kt(Lt.filter(t=>a.has(t)),0,r),...Kt(Ot.filter(t=>a.has(t)),i,r)]}}},Bt=20,qt=10,Zt={type:"junction",labelKey:"devices.junction.name",width:Bt,height:Bt,hideLabel:!0,variants:["split","merge"],ports:[{id:"in",labelKey:"devices.junction.ports.in",kind:"inlet",position:{x:0,y:qt}},{id:"out_top",labelKey:"devices.junction.ports.out_top",kind:"outlet",position:{x:qt,y:0}},{id:"out_bottom",labelKey:"devices.junction.ports.out_bottom",kind:"outlet",position:{x:qt,y:Bt}}],resolve:t=>"merge"===t.variant?{...Zt,ports:[{id:"in_top",labelKey:"devices.junction.ports.in_top",kind:"inlet",position:{x:qt,y:0}},{id:"in_bottom",labelKey:"devices.junction.ports.in_bottom",kind:"inlet",position:{x:qt,y:Bt}},{id:"out",labelKey:"devices.junction.ports.out",kind:"outlet",position:{x:Bt,y:qt}}]}:Zt},Ft={type:"circulation_pump",labelKey:"devices.circulation_pump.name",width:80,height:80,ports:[{id:"in",labelKey:"devices.circulation_pump.ports.in",kind:"inlet",position:{x:0,y:40}},{id:"out",labelKey:"devices.circulation_pump.ports.out",kind:"outlet",position:{x:80,y:40}}],addons:[zt(3),Mt,At]},Wt={type:"floor_heating",labelKey:"devices.floor_heating.name",width:140,height:80,ports:[{id:"in",labelKey:"devices.floor_heating.ports.in",kind:"inlet",position:{x:0,y:40}},{id:"out",labelKey:"devices.floor_heating.ports.out",kind:"outlet",position:{x:140,y:40}}],addons:[It("room","floor"),{type:"actuator",max:1},St,{type:"window",max:1}]};const Jt={type:"manifold",labelKey:"devices.manifold.name",width:184,height:130,ports:[{id:"supply_in",labelKey:"devices.manifold.ports.supply_in",kind:"inlet",position:{x:0,y:30}},{id:"return_out",labelKey:"devices.manifold.ports.return_out",kind:"outlet",position:{x:0,y:100}}],addons:[{type:"loop",max:12},It("supply","return"),zt(2),{type:"pump",max:1}],resolve:t=>function(t){const e=[];for(let o=0;o<t;o++){const t=50+40*o,i=String(o+1);e.push({id:`loop_${i}_out`,labelKey:"devices.manifold.ports.loop_out",labelArgs:[i],kind:"outlet",position:{x:t,y:0}},{id:`loop_${i}_in`,labelKey:"devices.manifold.ports.loop_in",labelArgs:[i],kind:"inlet",position:{x:t,y:130}})}return{...Jt,width:50+40*t-10,ports:[...Jt.ports,...e]}}(Math.max(1,t.addons?.filter(t=>"loop"===t.type).length??0))},Yt={type:"mixing_valve",labelKey:"devices.mixing_valve.name",width:100,height:110,ports:[{id:"hot_in",labelKey:"devices.mixing_valve.ports.hot_in",kind:"inlet",position:{x:0,y:70}},{id:"return_in",labelKey:"devices.mixing_valve.ports.return_in",kind:"inlet",position:{x:50,y:110}},{id:"mixed_out",labelKey:"devices.mixing_valve.ports.mixed_out",kind:"outlet",position:{x:100,y:70}}],addons:[It("mixed","return"),zt(1),St,At]},Xt={type:"electric_heater",labelKey:"devices.electric_heater.name",width:120,height:60,ports:[{id:"in",labelKey:"devices.electric_heater.ports.in",kind:"inlet",position:{x:0,y:30}},{id:"out",labelKey:"devices.electric_heater.ports.out",kind:"outlet",position:{x:120,y:30}}],addons:[It("inlet","outlet"),zt(2),Mt,At]},Gt="v2";const Qt={type:"heat_pump",labelKey:"devices.heat_pump.name",width:170,height:120,variants:["monoblock","split"],resolve:t=>t.variant===Gt?function(){const t=150;return{...Qt,width:t,height:t,ports:[{id:"hot_out",labelKey:"devices.heat_pump.ports.hot_out",kind:"outlet",position:{x:t,y:40}},{id:"cold_in",labelKey:"devices.heat_pump.ports.cold_in",kind:"inlet",position:{x:t,y:90}},{id:"hot_out_left",labelKey:"devices.heat_pump.ports.hot_out",kind:"outlet",position:{x:0,y:40}},{id:"cold_in_left",labelKey:"devices.heat_pump.ports.cold_in",kind:"inlet",position:{x:0,y:90}}]}}():Qt,ports:[{id:"hot_out",labelKey:"devices.heat_pump.ports.hot_out",kind:"outlet",position:{x:170,y:40}},{id:"cold_in",labelKey:"devices.heat_pump.ports.cold_in",kind:"inlet",position:{x:170,y:90}}],addons:[It("supply","return","evaporator","outdoor","hx_outlet","suction","discharge","refrigerant_gas","refrigerant_liquid","inverter"),{type:"value",max:12,slots:["frequency","compressor_current","high_pressure","low_pressure","voltage","current","power","flow","heat_output","cop"],slotsOptional:!0},{type:"electric_heater",max:3},{type:"pump",max:1},{type:"fan",max:1},{type:"compressor",max:1},{type:"operation",max:4,slots:["status","heating","dhw","cooling"]},Mt,St,{type:"defrost",max:1},At]};const te={type:ee="pipe_sensor",labelKey:`devices.${ee}.name`,width:80,height:44,ports:[{id:"in",labelKey:"devices.inline.ports.in",kind:"inlet",position:{x:0,y:30}},{id:"out",labelKey:"devices.inline.ports.out",kind:"outlet",position:{x:80,y:30}}],valueDisplay:"only"};var ee;const oe={type:"outdoor_temperature",labelKey:"devices.outdoor_temperature.name",width:100,height:50,valueDisplay:"only",ports:[],addons:[zt(1)]};const ie={...function(t){return{type:t,labelKey:`devices.${t}.name`,width:100,height:130,valueDisplay:"with_state",ports:[{id:"supply_out",labelKey:"devices.heat_source.ports.supply_out",kind:"outlet",position:{x:100,y:30}},{id:"return_in",labelKey:"devices.heat_source.ports.return_in",kind:"inlet",position:{x:100,y:100}}]}}("heating_boiler"),addons:[It("supply","return"),zt(4),{type:"pump",max:1},Mt,St,At]},ne={type:"solar_collector",labelKey:"devices.solar_collector.name",width:150,height:100,valueDisplay:"with_state",ports:[{id:"hot_out",labelKey:"devices.solar_collector.ports.hot_out",kind:"outlet",position:{x:150,y:20}},{id:"cold_in",labelKey:"devices.solar_collector.ports.cold_in",kind:"inlet",position:{x:150,y:80}}],addons:[It("collector"),zt(2),{type:"pump",max:1},At]};function re(t,e,o){const i=(t,e,o,i)=>({id:t,labelKey:`devices.four_port.ports.${t}`,kind:e,position:{x:o,y:i}});return{type:t,labelKey:`devices.${t}.name`,width:e,height:o,ports:[i("primary_in","inlet",0,30),i("primary_out","outlet",0,o-30),i("secondary_out","outlet",e,30),i("secondary_in","inlet",e,o-30)]}}const ae=It("primary_supply","primary_return","secondary_supply","secondary_return"),se={...re("hydraulic_separator",80,160),valueDisplay:"only",addons:[ae,zt(2)]},le={...re("plate_heat_exchanger",100,120),addons:[ae,zt(2)]},de={type:"expansion_vessel",labelKey:"devices.expansion_vessel.name",width:80,height:110,valueDisplay:"only",ports:[{id:"connection",labelKey:"devices.expansion_vessel.ports.connection",kind:"inlet",position:{x:40,y:110}}],addons:[zt(1),At]},ce={type:"safety_valve",labelKey:"devices.safety_valve.name",width:70,height:90,ports:[{id:"in",labelKey:"devices.safety_valve.ports.in",kind:"inlet",position:{x:30,y:90}},{id:"discharge",labelKey:"devices.safety_valve.ports.discharge",kind:"outlet",position:{x:70,y:60}}],addons:[At]},pe={type:"zone_valve",labelKey:"devices.zone_valve.name",width:80,height:70,ports:[{id:"in",labelKey:"devices.inline.ports.in",kind:"inlet",position:{x:0,y:50}},{id:"out",labelKey:"devices.inline.ports.out",kind:"outlet",position:{x:80,y:50}}],addons:[It("room"),At]};function he(t){return{type:t,labelKey:`devices.${t}.name`,width:130,height:80,valueDisplay:"with_state",ports:[{id:"in",labelKey:"devices.terminal.ports.in",kind:"inlet",position:{x:0,y:70}},{id:"out",labelKey:"devices.terminal.ports.out",kind:"outlet",position:{x:130,y:70}}]}}const ue={...he("radiator"),addons:[It("room"),{type:"actuator",max:1},St,At,{type:"window",max:1}]},_e={...he("fancoil"),addons:[It("room","supply"),{type:"actuator",max:1},{type:"fan",max:1},Mt,St,At]},ve={type:"water_supply",labelKey:"devices.water_supply.name",width:80,height:60,ports:[{id:"out",labelKey:"devices.inline.ports.out",kind:"outlet",position:{x:80,y:30}}],addons:[zt(2),At]},ye={type:"dhw_outlet",labelKey:"devices.dhw_outlet.name",width:80,height:60,ports:[{id:"in",labelKey:"devices.inline.ports.in",kind:"inlet",position:{x:0,y:30}}],addons:[zt(2)]},me=[Qt,{type:"ground_collector",labelKey:"devices.ground_collector.name",width:100,height:60,ports:[{id:"hot_out",labelKey:"devices.ground_collector.ports.hot_out",kind:"outlet",tone:"hot",position:{x:100,y:20}},{id:"cold_in",labelKey:"devices.ground_collector.ports.cold_in",kind:"inlet",tone:"cold",position:{x:100,y:40}}],addons:[]},ie,ne,Ut,se,le,de,ce,Pt,Yt,pe,Ft,Jt,Wt,ue,_e,Xt,Zt,te,oe,ve,ye];me.map(t=>t.type);const fe=[{id:"tank_buffer",type:Ut.type,labelKey:"devices.tank.name_buffer",addons:[{type:"direct_source"},{type:"direct_heating"}]},{id:"tank_dhw",type:Ut.type,labelKey:"devices.tank.name_dhw",addons:[{type:"heat_exchanger"},{type:"dhw"}]},{id:"tank_dhw_2coil",type:Ut.type,labelKey:"devices.tank.name_dhw_2coil",addons:[{type:"heat_exchanger"},{type:"heat_exchanger"},{type:"dhw"},{type:"direct_heating"}],scale:1.2,variant:Ht}],$e=[{id:Qt.type,type:Qt.type,labelKey:"devices.heat_pump.name"},{id:"heat_pump_v2",type:Qt.type,labelKey:"devices.heat_pump.name_v2",variant:Gt}],ge=me.flatMap(t=>t.type===Ut.type?fe:t.type===Qt.type?$e:[{id:t.type,type:t.type,labelKey:t.labelKey}]);function be(t){return t.type===Ut.type?Rt(t):t.type}const xe=new Map(me.map(t=>[t.type,t]));function we(t){return xe.get(t)}function ke(t){const e=xe.get(t.type);return e?.resolve?e.resolve(t):e}const Ae="custom:heating-visualizer-card",Me={outdoor_unit:"heat_pump",gas_boiler:"heating_boiler",electric_boiler:"heating_boiler",solid_fuel_boiler:"heating_boiler",flow_meter:"pipe_sensor",pressure_gauge:"pipe_sensor",heat_meter:"pipe_sensor",dhw_circulation_pump:"circulation_pump"},Se={1:["middle"],2:["top","bottom"],3:["top","middle","bottom"],4:["top","upper","lower","bottom"],5:[...wt]};function ze(t){const e=Me[t.type]??t.type,o=[];return t.channels?.length&&o.push(...function(t,e){if("manifold"===t)return e.map(t=>({...t,type:"loop"}));const o=e.filter(t=>t.entity_id);if("buffer_tank"===t){const t=Se[Math.min(o.length,5)]??[];return o.slice(0,5).map((e,o)=>({...e,type:"temperature",slot:t[o]}))}if("boiler"===t){const t=[kt[0],kt[2]];return o.slice(0,2).map((e,o)=>({...e,type:"temperature",slot:t[o]}))}return o.map(t=>({...t,type:"value"}))}(e,t.channels)),"manifold"!==e||t.channels?.length||o.push(...Array.from({length:4},()=>({type:"loop"}))),t.heater?.entity_id&&o.push({...t.heater,type:"electric_heater"}),{id:t.id,type:e,name:t.name,position:t.position??{x:0,y:0},rotation:t.rotation,...t.state,addons:o.length?o:void 0}}function Ie(t){const e=t,o=("number"==typeof e.schema_version?e.schema_version:e.schema?1:2)<2?function(t){const{schema:e,language:o,translations:i,...n}=t,r=(e?.edges??[]).map(t=>({from:`${t.from.nodeId}.${t.from.portId}`,to:`${t.to.nodeId}.${t.to.portId}`})),a=(e?.overlays??[]).map(({labelKey:t,...e})=>e);return{...n,type:Ae,schema_version:2,nodes:(e?.nodes??[]).map(ze),connections:r,overlays:a}}(e):{...e};return{...o,type:"string"==typeof e.type?e.type:Ae,schema_version:2,nodes:(o.nodes??[]).map(t=>function(t){const e=t.addons??[];if("boiler"===t.type){const o=e.some(t=>"heat_exchanger"===t.type)?2:1;return{...t,type:"tank",addons:[...e.filter(t=>"heat_exchanger"!==t.type),...Array.from({length:o},()=>({type:"heat_exchanger"})),{type:"dhw"}]}}if("buffer_tank"===t.type)return{...t,type:"tank",addons:[...e,{type:"direct_source"},{type:"direct_heating"}]};return t}(Me[t.type]?{...t,type:Me[t.type]}:t)),connections:o.connections??[],overlays:o.overlays??[]}}const Ce="en",Pe={en:{devices:{ground_collector:{name:"Ground collector",ports:{cold_in:"Cold water in",hot_out:"Warm water out"}},heat_pump:{name:"Heat pump",name_v2:"Heat pump v2 (square)",ports:{cold_in:"Heating water return",hot_out:"Heating water out"},variants:{monoblock:"Monoblock",split:"Split (outdoor + indoor unit)"}},valve_3way:{name:"3-way valve",ports:{in:"Inlet",out_a:"Outlet A",out_b:"Outlet B"}},tank:{name:"Tank",name_buffer:"Buffer tank",name_dhw:"DHW tank",name_dhw_2coil:"DHW tank (2 coils)",ports:{source_in:"From heat source",source_out:"Back to heat source",coil_in:"Heat exchanger coil supply",coil_out:"Heat exchanger coil return",coil2_in:"Second coil supply",coil2_out:"Second coil return",hot_out:"Hot water outlet",hot_out2:"Hot water outlet 2",supply_out:"To heating system",circulation_in:"Hot water circulation",return_in:"Return from heating system",cold_in:"Cold water inlet"},variants:{standard:"Standard",dual_coil:"Two coils (one per wall)"}},junction:{name:"Junction",ports:{in:"Inlet",out_top:"Top outlet",out_bottom:"Bottom outlet",in_top:"Top inlet",in_bottom:"Bottom inlet",out:"Outlet"},variants:{split:"Split (1 → 2)",merge:"Merge (2 → 1)"}},circulation_pump:{name:"Circulation pump",ports:{in:"Inlet",out:"Outlet"}},floor_heating:{name:"Floor heating",ports:{in:"Supply",out:"Return"}},manifold:{name:"Floor heating manifold",ports:{supply_in:"Supply",return_out:"Return",loop_out:"Loop {0} supply",loop_in:"Loop {0} return"}},mixing_valve:{name:"Mixing valve",ports:{hot_in:"Hot branch",return_in:"Return (bypass)",mixed_out:"Mixed water"}},electric_heater:{name:"Electric flow heater",ports:{in:"Inlet",out:"Outlet"}},inline:{ports:{in:"Inlet",out:"Outlet"}},pipe_sensor:{name:"Sensor / meter"},heat_source:{ports:{supply_out:"Supply",return_in:"Return"}},heating_boiler:{name:"Heating boiler"},solar_collector:{name:"Solar collector",ports:{hot_out:"Hot outlet",cold_in:"Cold inlet"}},four_port:{ports:{primary_in:"Primary supply",primary_out:"Primary return",secondary_out:"Secondary supply",secondary_in:"Secondary return"}},hydraulic_separator:{name:"Hydraulic separator"},plate_heat_exchanger:{name:"Plate heat exchanger"},expansion_vessel:{name:"Expansion vessel",ports:{connection:"Connection"}},safety_valve:{name:"Safety valve",ports:{in:"Inlet",discharge:"Discharge"}},zone_valve:{name:"Zone valve"},terminal:{ports:{in:"Supply",out:"Return"}},radiator:{name:"Radiator"},fancoil:{name:"Fan coil / convector"},outdoor_temperature:{name:"Outdoor temperature"},water_supply:{name:"Cold water supply"},dhw_outlet:{name:"Hot water taps"}},addons:{temperature:{name:"Temperature sensor"},value:{name:"Value"},electric_heater:{name:"Electric immersion heater"},pump:{name:"Pump"},compressor:{name:"Compressor"},operation:{name:"Operating status"},actuator:{name:"Actuator"},fan:{name:"Fan"},mode:{name:"Operating mode"},setpoint:{name:"Setpoint"},defrost:{name:"Defrost"},alarm:{name:"Alarm"},window:{name:"Window"},heat_exchanger:{name:"Heat exchanger coil",hint:"Coil heated by a heat source; adds its supply and return."},direct_source:{name:"Heat source connection",hint:"Heating water from the heat source flows straight into the tank."},direct_heating:{name:"Heating system connection",hint:"Supply to and return from the heating system."},dhw:{name:"Domestic hot water",hint:"Cold water inlet and hot water outlet."},circulation:{name:"Hot water circulation",hint:"Return of the hot water circulation loop."},loop:{name:"Loop"}},slots:{top:"top",upper:"upper",middle:"middle",lower:"lower",bottom:"bottom",supply:"supply",return:"return",outdoor:"outdoor",evaporator:"evaporator",room:"room",floor:"floor",mixed:"mixed water",inlet:"inlet",outlet:"outlet",collector:"collector",primary_supply:"primary supply",primary_return:"primary return",secondary_supply:"secondary supply",secondary_return:"secondary return",status:"status text",heating:"heating",dhw:"hot water",cooling:"cooling",hx_outlet:"heat exchanger outlet",suction:"suction",discharge:"discharge",refrigerant_gas:"refrigerant gas",refrigerant_liquid:"refrigerant liquid",inverter:"inverter",frequency:"compressor frequency",compressor_current:"compressor current",high_pressure:"high pressure",low_pressure:"low pressure",voltage:"voltage",current:"unit current",power:"power input",flow:"water flow",heat_output:"heat output",cop:"COP"},operation:{heating:"Heating",dhw:"Hot water",cooling:"Cooling",defrost:"Defrosting",idle:"Idle"},templates:{heat_pump_floor:"Heat pump + floor heating",heat_pump_dhw_floor:"Heat pump + DHW tank + floor heating",heat_pump_buffer_radiators:"Heat pump + buffer tank + radiators",boiler_radiators:"Boiler + radiators"},editor:{schema_tab:"Schema",overlay_tab:"Overlays",device_type:"Device type",add_device:"Add device",add_from_entity:"Add from entity",add_from_entity_helper:"Pick the device's main entity; the device type is suggested",choose_type:"Choose device type",suggested_title:"Suggested add-ons",suggested_hint:"Other entities of the same Home Assistant device.",add_all:"Add all",template:"Template",insert_template:"Insert template",auto_layout:"Arrange automatically",undo_layout:"Undo arrangement",actions_title:"Actions",tap_action:"Tap",hold_action:"Hold",double_tap_action:"Double tap",action_default_tap:"Default (more info)",action_default:"Default (nothing)",action_more_info:"More info",action_toggle:"Toggle",action_navigate:"Navigate",action_none:"Nothing",action_detail:"Device detail",detail_pin:"Pinned detail",detail_pin_helper:'A compact detail (refrigerant circuit, compressor, key temperatures) stays in a corner of the card; tap it for the full view. The "Device detail" action opens the full view too.',detail_pin_none:"Not pinned",detail_pin_top_left:"Top left",detail_pin_top_right:"Top right",detail_pin_bottom_left:"Bottom left",detail_pin_bottom_right:"Bottom right",detail_size:"Pinned detail size (%)",detail_size_helper:"Window width in percent of the schema width, {0}–{1} %. Empty = 40 %.",show_cop:"Show the computed COP on the unit",show_cop_helper:"COP from flow, temperatures and power input; always shown in the detail.",show_on_schema:"Show in the schema",show_on_schema_helper:"Off = no badge below the device.",show_on_schema_heat_pump:"Off = not shown on the unit or as a badge; the heat pump detail always shows it.",hidden_on_schema:"hidden in the schema",navigation_path:"Navigation path",pipe_style:"Pipe style",pipe_style_orthogonal:"Right-angled pipes",pipe_style_curved:"Curved pipes",pipe_colors:"Colored pipes",flow_animation:"Show water flow",drawing_mode:"Drawing mode",drawing_hint:"Drag devices; click two ports to connect them.",select_hint:"Click a device to select it; arrow keys move it (Shift = faster).",move_left:"Move left",move_up:"Move up",move_down:"Move down",move_right:"Move right",empty_hint:"Add a device to start building your schema.",devices_title:"Devices",no_entity:"No entity",ports_connected:"{0}/{1} connected",addon_count:"{0} add-ons",back:"Back",name:"Name",name_helper:"Empty = device type name",variant:"Variant",volume:"Volume (l)",volume_helper:"Sets the size of the drawing.",tank_size:"Size (%)",tank_size_helper:"Scales the tank drawing and its ports (50–200). A DHW tank with two coils starts at 120.",entity:"Entity",state_entity:"State entity (optional)",state_entity_helper:"Shows whether the device is running (green frame, animation) and opens on tap. Leave empty if the device has no entity of its own – add-ons then show the activity.",value_entity:"Value entity",ha_device:"Home Assistant device (optional)",ha_device_helper:"Where the entities come from, e.g. the heat pump integration. Its entities are offered first and suggested as add-ons.",active_state:"Active state",active_state_helper:"Empty = hvac_action, otherwise on / heat / open",value_attribute:"Displayed attribute",value_attribute_helper:"Empty = entity state, e.g. current_temperature",actuator_entity:"Actuator entity",position_attribute:"Position attribute (%)",position_attribute_helper:"Empty = current_position or the entity state",valve_attribute:"Valve position attribute",valve_attribute_helper:"Default: position",branch_a:"Value for branch A",branch_a_helper:"Default: a",branch_b:"Value for branch B",branch_b_helper:"Default: b",loop_temperature:"Room temperature entity",addons_title:"Add-ons",addons_empty:"No add-ons yet.",addon_type:"Add-on type",add_addon:"Add add-on",remove_addon:"Remove add-on",remaining:"{0} left",slot:"Position",slot_none:"Other",addon_name_helper:"Empty = add-on type and position",operation_status_helper:"Text such as Heating / DHW / Defrost / Idle, or a climate entity (hvac_action)",connections_title:"Connections",not_connected:"Not connected",connect_to:"Connect to",disconnect:"Disconnect",connection_pending:"Connecting from {0} — click a compatible port",delete_connection:"Delete selected connection",reset_route:"Automatic routing",route_hint:"Drag the squares on the pipe to move its segments.",invalid_connections:"{0} connections point to missing or incompatible ports.",remove_invalid:"Remove",position_title:"Position",rotate:"Rotate",delete_device:"Delete device",add_overlay:"Add overlay",overlays_empty:"No overlays yet.",overlay_n:"Overlay {0}",remove_overlay:"Remove overlay"},overlay:{entity:"Entity",name:"Name",name_helper:"Empty = entity name",name_yaml:"The name is configured in YAML.",template:"Display template",template_helper:"Placeholders: {{ state }}, {{ attr('attribute') }}. Empty = formatted state",rules:"Conditional rules",add_rule:"Add rule",remove_rule:"Remove rule",rule:{condition:"Condition",condition_state:"State equals",condition_numeric:"Numeric value",entity:"Entity",entity_helper:"Empty = overlay entity",state:"State",above:"Above",below:"Below",color:"Text color",color_helper:"Home Assistant color name or any CSS color",hide:"Hide overlay"}},card:{empty:"No schema configured. Edit this card to design your heating layout."},detail:{open:"Open detail: {0}",close:"Close detail",monoblock:"Monoblock",split:"Split",outdoor_unit:"Outdoor unit",indoor_unit:"Indoor unit",expansion_valve:"Expansion valve",plate_exchanger:"Plate heat exchanger",voltage_current:"Voltage / current",unit:"Unit",heat_output:"Heat output"},a11y:{schema:"Heating schema",active:"running"}},cs:{devices:{ground_collector:{name:"Zemní kolektor",ports:{cold_in:"Studená voda vstup",hot_out:"Teplá voda výstup"}},heat_pump:{name:"Tepelné čerpadlo",name_v2:"Tepelné čerpadlo v2 (štvorcové)",ports:{cold_in:"Vratka topné vody",hot_out:"Výstup topné vody"},variants:{monoblock:"Monoblok",split:"Split (venkovní + vnitřní jednotka)"}},valve_3way:{name:"Třícestný ventil",ports:{in:"Vstup",out_a:"Výstup A",out_b:"Výstup B"}},tank:{name:"Nádrž",name_buffer:"Akumulační nádrž",name_dhw:"Zásobník teplé vody (bojler)",name_dhw_2coil:"Zásobník teplé vody (2 výměníky)",ports:{source_in:"Od zdroje tepla",source_out:"Zpět ke zdroji tepla",coil_in:"Výměník – přívod",coil_out:"Výměník – vratka",coil2_in:"Druhý výměník – přívod",coil2_out:"Druhý výměník – vratka",hot_out:"Teplá voda – výstup",hot_out2:"Výstup teplé vody 2",supply_out:"Do topného systému",circulation_in:"Cirkulace teplé vody",return_in:"Vratka z topného systému",cold_in:"Studená voda – vstup"},variants:{standard:"Standardní",dual_coil:"Dva výměníky (každý na jedné straně)"}},junction:{name:"Uzel",ports:{in:"Vstup",out_top:"Horní výstup",out_bottom:"Spodní výstup",in_top:"Horní vstup",in_bottom:"Spodní vstup",out:"Výstup"},variants:{split:"Rozbočení (1 → 2)",merge:"Sloučení (2 → 1)"}},circulation_pump:{name:"Oběhové čerpadlo",ports:{in:"Vstup",out:"Výstup"}},floor_heating:{name:"Podlahové topení",ports:{in:"Přívod",out:"Vratka"}},manifold:{name:"Rozdělovač podlahového topení",ports:{supply_in:"Přívod",return_out:"Vratka",loop_out:"Okruh {0} – přívod",loop_in:"Okruh {0} – vratka"}},mixing_valve:{name:"Směšovací ventil",ports:{hot_in:"Teplá větev",return_in:"Vratka (bypass)",mixed_out:"Smíšená voda"}},electric_heater:{name:"Průtokový elektrický ohřívač",ports:{in:"Vstup",out:"Výstup"}},inline:{ports:{in:"Vstup",out:"Výstup"}},pipe_sensor:{name:"Čidlo / měřidlo"},heat_source:{ports:{supply_out:"Přívod",return_in:"Vratka"}},heating_boiler:{name:"Kotel"},solar_collector:{name:"Solární kolektor",ports:{hot_out:"Teplý výstup",cold_in:"Studený vstup"}},four_port:{ports:{primary_in:"Primár – přívod",primary_out:"Primár – vratka",secondary_out:"Sekundár – přívod",secondary_in:"Sekundár – vratka"}},hydraulic_separator:{name:"Hydraulický vyrovnávač"},plate_heat_exchanger:{name:"Deskový výměník"},expansion_vessel:{name:"Expanzní nádoba",ports:{connection:"Připojení"}},safety_valve:{name:"Pojistný ventil",ports:{in:"Vstup",discharge:"Výtok"}},zone_valve:{name:"Zónový ventil"},terminal:{ports:{in:"Přívod",out:"Vratka"}},radiator:{name:"Radiátor"},fancoil:{name:"Fancoil / konvektor"},outdoor_temperature:{name:"Venkovní teplota"},water_supply:{name:"Vodovodní přípojka"},dhw_outlet:{name:"Odběr teplé vody"}},addons:{temperature:{name:"Teplotní čidlo"},value:{name:"Hodnota"},electric_heater:{name:"Elektrická patrona"},pump:{name:"Čerpadlo"},compressor:{name:"Kompresor"},operation:{name:"Provozní stav"},actuator:{name:"Pohon"},fan:{name:"Ventilátor"},mode:{name:"Provozní režim"},setpoint:{name:"Požadovaná teplota"},defrost:{name:"Odmrazování"},alarm:{name:"Porucha"},window:{name:"Okno"},heat_exchanger:{name:"Výměník (topný had)",hint:"Had ohřívaný zdrojem tepla; přidá jeho přívod a vratku."},direct_source:{name:"Připojení zdroje tepla",hint:"Topná voda ze zdroje proudí přímo do nádrže."},direct_heating:{name:"Připojení topného systému",hint:"Přívod do topného systému a vratka z něj."},dhw:{name:"Teplá užitková voda",hint:"Vstup studené vody a výstup teplé vody."},circulation:{name:"Cirkulace teplé vody",hint:"Návrat cirkulačního okruhu teplé vody."},loop:{name:"Okruh"}},slots:{top:"nahoře",upper:"horní část",middle:"uprostřed",lower:"dolní část",bottom:"dole",supply:"přívod",return:"vratka",outdoor:"venkovní",evaporator:"výparník",room:"místnost",floor:"podlaha",mixed:"smíšená voda",inlet:"vstup",outlet:"výstup",collector:"kolektor",primary_supply:"primár – přívod",primary_return:"primár – vratka",secondary_supply:"sekundár – přívod",secondary_return:"sekundár – vratka",status:"stav (text)",heating:"topení",dhw:"ohřev TUV",cooling:"chlazení",hx_outlet:"za výměníkem",suction:"sání",discharge:"výtlak",refrigerant_gas:"chladivo – plyn",refrigerant_liquid:"chladivo – kapalina",inverter:"měnič",frequency:"frekvence kompresoru",compressor_current:"proud kompresoru",high_pressure:"vysoký tlak",low_pressure:"nízký tlak",voltage:"napětí",current:"proud jednotky",power:"příkon",flow:"průtok vody",heat_output:"topný výkon",cop:"COP"},operation:{heating:"Topení",dhw:"Ohřev TUV",cooling:"Chlazení",defrost:"Odmrazování",idle:"Stojí"},templates:{heat_pump_floor:"Tepelné čerpadlo + podlahové topení",heat_pump_dhw_floor:"Tepelné čerpadlo + bojler + podlahové topení",heat_pump_buffer_radiators:"Tepelné čerpadlo + akumulační nádrž + radiátory",boiler_radiators:"Kotel + radiátory"},editor:{schema_tab:"Schéma",overlay_tab:"Popisky",device_type:"Typ zařízení",add_device:"Přidat zařízení",add_from_entity:"Přidat z entity",add_from_entity_helper:"Vyberte hlavní entitu zařízení, typ se navrhne sám",choose_type:"Vyberte typ zařízení",suggested_title:"Navržené doplňky",suggested_hint:"Další entity téhož zařízení v Home Assistantu.",add_all:"Přidat vše",template:"Šablona",insert_template:"Vložit šablonu",auto_layout:"Rozmístit automaticky",undo_layout:"Vrátit rozmístění",actions_title:"Akce",tap_action:"Klepnutí",hold_action:"Podržení",double_tap_action:"Dvojité klepnutí",action_default_tap:"Výchozí (více informací)",action_default:"Výchozí (nic)",action_more_info:"Více informací",action_toggle:"Přepnout",action_navigate:"Přejít na stránku",action_none:"Nic",action_detail:"Detail zařízení",detail_pin:"Připnutý detail",detail_pin_helper:"Zmenšený detail (oběh chladiva, kompresor, hlavní teploty) trvale v rohu karty; klepnutím se otevře celý. Celý detail otevře také akce „Detail zařízení“.",detail_pin_none:"Nepřipnout",detail_pin_top_left:"Vlevo nahoře",detail_pin_top_right:"Vpravo nahoře",detail_pin_bottom_left:"Vlevo dole",detail_pin_bottom_right:"Vpravo dole",detail_size:"Velikost připnutého detailu (%)",detail_size_helper:"Šířka okna v procentech šířky schématu, {0}–{1} %. Prázdné = 40 %.",show_cop:"Zobrazit vypočtený COP na jednotce",show_cop_helper:"COP z průtoku, teplot a příkonu; v detailu je vždy.",show_on_schema:"Zobrazit ve schématu",show_on_schema_helper:"Vypnuté = odznak pod zařízením se nezobrazí.",show_on_schema_heat_pump:"Vypnuté = hodnota se nezobrazí na jednotce ani jako odznak; detail tepelného čerpadla ji ukáže vždy.",hidden_on_schema:"skryto ve schématu",navigation_path:"Cesta stránky",pipe_style:"Vzhled potrubí",pipe_style_orthogonal:"Pravoúhlé potrubí",pipe_style_curved:"Oblouky",pipe_colors:"Barevné potrubí",flow_animation:"Zobrazit proudění vody",drawing_mode:"Režim kreslení",drawing_hint:"Přetáhněte zařízení; kliknutím na dva porty je propojíte.",select_hint:"Kliknutím vyberete zařízení, šipkami ho posunete (Shift = rychleji).",move_left:"Posunout vlevo",move_up:"Posunout nahoru",move_down:"Posunout dolů",move_right:"Posunout vpravo",empty_hint:"Přidejte zařízení a začněte sestavovat schéma.",devices_title:"Zařízení",no_entity:"Bez entity",ports_connected:"připojeno {0}/{1}",addon_count:"doplňky: {0}",back:"Zpět",name:"Název",name_helper:"Prázdné = název typu zařízení",variant:"Provedení",volume:"Objem (l)",volume_helper:"Určuje velikost výkresu.",tank_size:"Velikost (%)",tank_size_helper:"Mění velikost výkresu nádrže i jejích přípojek (50–200). Zásobník se dvěma výměníky začíná na 120.",entity:"Entita",state_entity:"Stavová entita (volitelné)",state_entity_helper:"Určuje, zda zařízení běží (zelený rámeček, animace), a otevře se po klepnutí. Nemá-li zařízení vlastní entitu, nechte prázdné – činnost pak ukazují doplňky.",value_entity:"Entita hodnoty",ha_device:"Zařízení v Home Assistantu (volitelné)",ha_device_helper:"Odkud entity pocházejí, např. integrace tepelného čerpadla. Jeho entity se nabízejí jako první a navrhnou se jako doplňky.",active_state:"Aktivní stav",active_state_helper:"Prázdné = podle hvac_action, jinak on / heat / open",value_attribute:"Zobrazený atribut",value_attribute_helper:"Prázdné = stav entity, např. current_temperature",actuator_entity:"Entita pohonu",position_attribute:"Atribut polohy (%)",position_attribute_helper:"Prázdné = current_position nebo stav entity",valve_attribute:"Atribut polohy ventilu",valve_attribute_helper:"Výchozí: position",branch_a:"Hodnota pro větev A",branch_a_helper:"Výchozí: a",branch_b:"Hodnota pro větev B",branch_b_helper:"Výchozí: b",loop_temperature:"Entita teploty místnosti",addons_title:"Doplňky",addons_empty:"Zatím žádné doplňky.",addon_type:"Typ doplňku",add_addon:"Přidat doplněk",remove_addon:"Odebrat doplněk",remaining:"zbývá {0}",slot:"Umístění",slot_none:"Jiné",addon_name_helper:"Prázdné = typ doplňku a umístění",operation_status_helper:"Text jako Topení / TUV / Odmrazování / Stojí, nebo entita climate (hvac_action)",connections_title:"Propojení",not_connected:"Nepřipojeno",connect_to:"Připojit k",disconnect:"Odpojit",connection_pending:"Napojování z {0} — klikněte na kompatibilní port",delete_connection:"Smazat vybrané propojení",reset_route:"Automatické vedení",route_hint:"Táhnutím čtverčků na trubce posunete její úseky.",invalid_connections:"Propojení s neexistujícím nebo nekompatibilním portem: {0}",remove_invalid:"Odstranit",position_title:"Poloha",rotate:"Otočit",delete_device:"Smazat zařízení",add_overlay:"Přidat popisek",overlays_empty:"Zatím žádné popisky.",overlay_n:"Popisek {0}",remove_overlay:"Odebrat popisek"},overlay:{entity:"Entita",name:"Název",name_helper:"Prázdné = název entity",name_yaml:"Název je nastaven v YAML.",template:"Šablona zobrazení",template_helper:"Zástupné symboly: {{ state }}, {{ attr('atribut') }}. Prázdné = formátovaný stav",rules:"Podmíněná pravidla",add_rule:"Přidat pravidlo",remove_rule:"Odebrat pravidlo",rule:{condition:"Podmínka",condition_state:"Stav je roven",condition_numeric:"Číselná hodnota",entity:"Entita",entity_helper:"Prázdné = entita popisku",state:"Stav",above:"Nad",below:"Pod",color:"Barva textu",color_helper:"Název barvy Home Assistantu nebo libovolná barva CSS",hide:"Skrýt popisek"}},card:{empty:"Schéma není nakonfigurováno. Upravte kartu a navrhněte topné schéma."},detail:{open:"Otevřít detail: {0}",close:"Zavřít detail",monoblock:"Monoblok",split:"Split",outdoor_unit:"Venkovní jednotka",indoor_unit:"Vnitřní jednotka",expansion_valve:"Expanzní ventil",plate_exchanger:"Deskový výměník",voltage_current:"Napětí / proud",unit:"Jednotka",heat_output:"Topný výkon"},a11y:{schema:"Schéma vytápění",active:"v provozu"}}};function Ee(t,e){let o=t;for(const t of e.split(".")){if(void 0===o||"string"==typeof o)return;o=o[t]}return"string"==typeof o?o:void 0}class Ne{constructor(t){this.language=t}t(t,...e){let o=Ee(Pe[this.language],t)??Ee(Pe[Ce],t)??t;return e.forEach((t,e)=>{o=o.replace(`{${e}}`,t)}),o}}function Le(t){return new Ne(function(t){if(!t)return Ce;if(Pe[t])return t;const e=t.split("-")[0];return Pe[e]?e:Ce}(t))}const Oe="states",je="hassFormatters",Te="hassInternationalization";class He{constructor(t,e){this._host=t,this._context=e,this._callback=(t,e)=>{this._unsubscribe&&this._unsubscribe!==e&&this._unsubscribe(),this._unsubscribe=e,t!==this.value&&(this.value=t,this._host.requestUpdate())},t.addController(this)}hostConnected(){const t=new Event("context-request",{bubbles:!0,composed:!0});t.context=this._context,t.contextTarget=this._host,t.callback=this._callback,t.subscribe=!0,this._host.dispatchEvent(t)}hostDisconnected(){this._unsubscribe?.(),this._unsubscribe=void 0}}function De(t){return((t??0)%360+360)%360}function Ve(t,e){const o=e*Math.PI/180,i=Math.cos(o),n=Math.sin(o);return{x:Math.round(1e3*(t.x*i-t.y*n))/1e3||0,y:Math.round(1e3*(t.x*n+t.y*i))/1e3||0}}function Ke(t,e){const{x:o,y:i}=e.position,n=[[o,{x:-1,y:0}],[t.width-o,{x:1,y:0}],[i,{x:0,y:-1}],[t.height-i,{x:0,y:1}]];return n.sort((t,e)=>t[0]-e[0]),n[0][1]}function Re(t,e){const o=ke(t);if(!o)return;const i=o.ports.find(t=>t.id===e);if(!i)return;const n=De(t.rotation),r=o.width/2,a=o.height/2,s=Ve({x:i.position.x-r,y:i.position.y-a},n);return{nodeId:t.id,portId:i.id,x:t.position.x+r+s.x,y:t.position.y+a+s.y,kind:i.kind,direction:Ve(Ke(o,i),n)}}function Ue(t,e){const o=De(t.rotation)%180!=0,i=o?e.height:e.width,n=o?e.width:e.height;return{x:t.position.x+(e.width-i)/2,y:t.position.y+(e.height-n)/2,width:i,height:n}}const Be=(t,e,o)=>(t-e)*o>=0;function qe(t){return{x:t.x+20*t.direction.x,y:t.y+20*t.direction.y}}function Ze(t,e,o){const i=qe(t),n=qe(e),r=o?.length?o.map(([t,e])=>({x:t,y:e})):function(t,e,o,i){const n=0!==e.x,r=0!==i.x;if(n&&r){const n=(t.x+o.x)/2;if(Be(n,t.x,e.x)&&Be(n,o.x,i.x))return[{x:n,y:t.y},{x:n,y:o.y}];const r=(t.y+o.y)/2;return[{x:t.x,y:r},{x:o.x,y:r}]}if(!n&&!r){const n=(t.y+o.y)/2;if(Be(n,t.y,e.y)&&Be(n,o.y,i.y))return[{x:t.x,y:n},{x:o.x,y:n}];const r=(t.x+o.x)/2;return[{x:r,y:t.y},{x:r,y:o.y}]}if(n){const n={x:o.x,y:t.y};return Be(n.x,t.x,e.x)&&Be(n.y,o.y,i.y)?[n]:[{x:t.x,y:o.y}]}const a={x:t.x,y:o.y};return Be(a.y,t.y,e.y)&&Be(a.x,o.x,i.x)?[a]:[{x:o.x,y:t.y}]}(i,t.direction,n,e.direction),a=[{x:t.x,y:t.y},i],s=(t,e)=>{const o=a[a.length-1];o.x!==t.x&&o.y!==t.y&&a.push(e?{x:t.x,y:o.y}:{x:o.x,y:t.y}),a.push(t)};r.forEach((e,o)=>s(e,0!==o||0!==t.direction.x)),s(n,0===e.direction.x),a.push({x:e.x,y:e.y});const l=a.filter((t,e)=>0===e||t.x!==a[e-1].x||t.y!==a[e-1].y);return l.filter((t,e)=>{if(e<=1||e>=l.length-2)return!0;const o=l[e-1],i=l[e+1];return(o.x-t.x)*(i.y-t.y)!==(o.y-t.y)*(i.x-t.x)})}function Fe(t,e,o){return function(t){const e=t.filter((e,o)=>0===o||e.x!==t[o-1].x||e.y!==t[o-1].y);return e.filter((t,o)=>{if(0===o||o===e.length-1)return!0;const i=e[o-1],n=e[o+1];return(i.x-t.x)*(n.y-t.y)!==(i.y-t.y)*(n.x-t.x)})}(Ze(t,e,o))}function We(t,e,o,i=10){const n=t.map(t=>({...t})),r=n[e].y===n[e+1].y;let a=e;1===a&&(n.splice(1,0,{...n[1]}),a++);let s=a+1;if(s===n.length-2&&n.splice(s+1,0,{...n[s]}),r){const t=Je(n[a].y+o,i);n[a].y=t,n[s].y=t}else{const t=Je(n[a].x+o,i);n[a].x=t,n[s].x=t}return s=n.length-2,n.slice(2,s).map(t=>[t.x,t.y])}function Je(t,e=10){return Math.round(t/e)*e}function Ye(t,e,o){if(!t||!o.entity_id)return"—";const i=t[o.entity_id];if(!i)return"—";if(o.template)return function(t,e,o){return t.replace(/\{\{\s*state\s*\}\}/g,e).replace(/\{\{\s*attr\(['"](\w+)['"]\)\s*\}\}/g,(t,e)=>String(o[e]??""))}(o.template,i.state,i.attributes);if(e)return e.formatEntityState(i);const n=i.attributes.unit_of_measurement;return n?`${i.state} ${n}`:i.state}const Xe=new Set(["primary","accent","disabled","red","pink","purple","deep-purple","indigo","blue","light-blue","cyan","teal","green","light-green","lime","yellow","amber","orange","deep-orange","brown","light-grey","grey","dark-grey","blue-grey","black","white"]);function Ge(t){return Xe.has(t)?`var(--${t}-color)`:t}function Qe(t,e,o){const i=t[e.entity||o];if(!i)return!1;if("state"===e.condition)return void 0!==e.state&&i.state===e.state;if(void 0===e.above&&void 0===e.below)return!1;const n=Number(i.state);return!Number.isNaN(n)&&((void 0===e.above||n>e.above)&&(void 0===e.below||n<e.below))}const to=new Set(["heating","preheating"]);function eo(t,e,o){if(!t||!e?.entity_id)return{active:!1};const i=t[e.entity_id];if(!i)return{active:!1};const n=e.value_attribute,r=void 0!==n?i.attributes[n]:void 0,a=void 0!==r,s=a?r:i.state,l=Number(s),d=i.attributes.unit_of_measurement;let c;c=void 0!==n&&a?o?o.formatEntityAttributeValue(i,n):String(r):o?o.formatEntityState(i):d?`${i.state} ${d}`:i.state;const p=function(t,e){if(void 0!==e)return t.state===e;const o=t.attributes.hvac_action;return"string"==typeof o?to.has(o):"on"===t.state||"heat"===t.state||"open"===t.state}(i,e.active_state),h=e.mode_attribute??"position",u=String(i.attributes[h]??i.state??"");let _;return u===(e.branch_a_value??"a")&&(_="a"),u===(e.branch_b_value??"b")&&(_="b"),{active:p,valveBranch:_,value:c,numeric:""!==String(s??"").trim()&&Number.isFinite(l)?l:void 0,raw:null==s?void 0:String(s),hvacAction:"string"==typeof i.attributes.hvac_action?i.attributes.hvac_action:void 0,position:oo(i,e.mode_attribute),unit:d,fromAttribute:a,deviceClass:i.attributes.device_class}}function oo(t,e){const o=e?t.attributes[e]:t.attributes.current_position??t.state,i=Number(o);if(null!=o&&""!==o&&Number.isFinite(i))return Math.min(100,Math.max(0,i))}const io="detail";function no(t){return void 0!==t&&"none"!==t.action}function ro(t){return t.tap_action?no(t.tap_action):Boolean(t.entity)}function ao(t,e){if(e.overlayId){const o=t.overlays.find(t=>t.id===e.overlayId);if(!o)return;return{entity:o.entity_id||void 0,tap_action:o.tap_action,hold_action:o.hold_action,double_tap_action:o.double_tap_action}}const o=t.nodes.find(t=>t.id===e.nodeId);if(!o)return;const i=void 0!==e.addonIndex?o.addons?.[e.addonIndex]:void 0;return i?.entity_id?{entity:i.entity_id}:{entity:o.entity_id,tap_action:o.tap_action,hold_action:o.hold_action,double_tap_action:o.double_tap_action}}function so(t){const e=t.numeric;if(void 0===e||e<=0)return;const o="%"===t.unit?.25+1.75*Math.min(e,100)/100:e/600;return Math.round(100*Math.min(4,Math.max(.25,1/o)))/100}function lo(t,e){return void 0!==t.active_state||void 0===e.numeric?e:{...e,active:e.numeric>0}}const co=["pump","fan","electric_heater","loop"];function po(t){return t.some(t=>t.config.entity_id&&co.includes(t.config.type)&&t.state.active)}const ho="#ef5350",uo="#42a5f5",_o="#4caf50",vo="#ff7043",yo="#b0bec5",mo="#4fc3f7",fo="var(--card-background-color, #1c1c1c)",$o="var(--divider-color, #888)",go="var(--primary-color, #03a9f4)",bo={heating:"var(--state-climate-heat-color, #ff8100)",dhw:"var(--deep-orange-color, #ff6f22)",cooling:"var(--state-climate-cool-color, #2b9af9)",defrost:mo,idle:void 0};function xo(t){return t?bo[t]:void 0}const wo=20,ko=60;function Ao(t){if(void 0===t)return $o;const e=Math.min(1,Math.max(0,(t-wo)/(ko-wo)));return`hsl(${Math.round(220*(1-e))}, 75%, 50%)`}function Mo(t,e,o=_o){return t.active?o:e?go:$o}function So(t){return t?2.5:1.5}function zo(t,e){return t.ports.map(t=>q`
    <circle
      class="port port-${t.kind}"
      data-port-id="${t.id}"
      cx="${t.position.x}" cy="${t.position.y}" r="5"
      fill="${fo}"
      stroke="${"cold"===(t.tone??("inlet"===t.kind?"cold":"hot"))?"#4fc3f7":"#ff8a65"}"
      stroke-width="2"
    ><title>${e.t(t.labelKey,...t.labelArgs??[])}</title></circle>
  `)}function Io(t,e,o,i,n=8){const r=o/6;let a=`M ${t} ${e}`;for(let o=1;o<=6;o++)a+=` L ${t+o*r} ${e+(o%2==0?0:-n)}`;const s=i.active?vo:yo;return q`
    <path class="heater ${i.active?"active":""}" d="${a}" fill="none"
      stroke="${s}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" />
  `}function Co(t,e){return t.ports.map(o=>{const{x:i,y:n}=o.position,r=0===i?e:i===t.width?-e:0,a=0===n?e:n===t.height?-e:0;return q`<line x1="${i}" y1="${n}" x2="${i+r}" y2="${n+a}" stroke="${$o}" stroke-width="2" />`})}function Po(t){return void 0!==t.numeric||t.fromAttribute?t.value:void 0}const Eo=[["defrost",/defrost|odmraz|odtav|abtau/],["dhw",/dhw|hot.?water|water.?heat|tuv|tepla voda|warmwasser|domestic/],["cooling",/cool|chlaz|kuhl/],["heating",/heat|topen|topi|heiz/],["idle",/idle|off|standby|stand.?by|stoji|vypn|klid|aus|pause|stop/]],No={heating:"heating",preheating:"heating",cooling:"cooling",defrosting:"defrost",idle:"idle",off:"idle"},Lo=["defrost","dhw","heating","cooling"];function Oo(t){return(t.hvacAction?No[t.hvacAction]:void 0)??function(t){if(!t)return;const e=t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();return Eo.find(([,t])=>t.test(e))?.[0]}(t.raw)}function jo(t,e){const o=e.find(t=>"fan"===t.config.type&&t.config.entity_id);return o?{active:o.state.active,duration:so(o.state)}:{active:t.active&&"defrost"!==t.operation}}function To(t,e,o){return t.find(t=>t.config.type===e&&t.config.slot===o&&t.config.entity_id)?.state}function Ho(t){if(void 0===t?.numeric)return;const e=t.unit?.toLowerCase();return"w"===e?t.numeric/1e3:"mw"===e?1e3*t.numeric:t.numeric}const Do={"m³/h":1,"m3/h":1,"l/min":.06,"l/h":.001,"l/s":3.6,"m³/s":3600};function Vo(t){const e=e=>To(t,"temperature",e),o=e=>To(t,"value",e),i=e("hx_outlet")??e("supply"),n=e("return"),r="°F"===i?.unit,a=void 0!==i?.numeric&&void 0!==n?.numeric?(i.numeric-n.numeric)*(r?5/9:1):void 0,s=function(t){if(void 0===t?.numeric)return;const e=t.unit?Do[t.unit.toLowerCase()]:1;return void 0===e?void 0:t.numeric*e}(o("flow")),l=Ho(o("power")),d=Ho(o("heat_output"))??(void 0!==s&&void 0!==a?1.163*s*a:void 0),c=o("cop")?.numeric;return{powerKw:l,heatKw:d,cop:c??(void 0!==d&&d>0&&void 0!==l&&l>.05?d/l:void 0),flowM3h:s,deltaT:a}}const Ko="#ffb300";function Ro(t,e){return`M ${t} ${e-7} C ${t+5} ${e-1}, ${t+5} ${e+6}, ${t} ${e+6} C ${t-5} ${e+6}, ${t-5} ${e-1}, ${t} ${e-7} Z`}function Uo(t,e,o,i,n){switch(t){case"heating_boiler":return function(t,e,o,i){const n=t.width/2-4,r=t.height/2+14,a=Po(i),s=i.active?vo:$o,l=[-14,0,14].map(t=>{const e=n+t;return q`
      <path d="M ${e} ${r+18} C ${e-6} ${r+10}, ${e+6} ${r+2}, ${e} ${r-6}
        C ${e-6} ${r-14}, ${e+6} ${r-20}, ${e} ${r-26}"
        fill="none" stroke="${s}" stroke-width="2.5" stroke-linecap="round" />
    `});return q`
    <g class="device device-heat-source">
      ${Co(t,12)}
      <rect x="8" y="10" width="${t.width-20}" height="${t.height-20}" rx="8"
        fill="${fo}" stroke="${Mo(i,o,vo)}"
        stroke-width="${So(o)}" />
      ${a?q`<text x="${n}" y="30" text-anchor="middle" class="device-value">${a}</text>`:q``}
      ${l}
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"solar_collector":return function(t,e,o,i){const n=Mo(i,o,Ko),r=Po(i);return q`
    <g class="device device-solar-collector">
      <path d="M 124 20 L ${t.width} 20 M 100 80 L ${t.width} 80" stroke="${$o}" stroke-width="2" />
      <path d="M 10 80 L 36 20 L 124 20 L 100 80 Z" fill="${fo}"
        stroke="${n}" stroke-width="${So(o)}" stroke-linejoin="round" />
      <path d="M 58 20 L 32 80 M 80 20 L 54 80 M 102 20 L 76 80 M 23 50 L 112 50"
        stroke="${$o}" stroke-width="1" />
      <circle cx="20" cy="14" r="6" fill="${i.active?Ko:"none"}" stroke="${Ko}" stroke-width="1.5" />
      ${r?q`<text x="67" y="${t.height-2}" text-anchor="middle" class="device-value">${r}</text>`:q``}
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"hydraulic_separator":return function(t,e,o,i){const n=25,r=t.width-25,a=t.height-8,s=t.height/2,l=Po(i);return q`
    <g class="device device-hydraulic-separator">
      ${Co(t,n)}
      <rect x="${n}" y="${8}" width="${r-n}" height="${s-8}" fill="${ho}" opacity="0.25" />
      <rect x="${n}" y="${s}" width="${r-n}" height="${a-s}" fill="${uo}" opacity="0.25" />
      <rect x="${n}" y="${8}" width="${r-n}" height="${a-8}" rx="${(r-n)/2}"
        fill="none" stroke="${Mo(i,o)}" stroke-width="${So(o)}" />
      ${l?q`<text x="${t.width/2}" y="${s+4}" text-anchor="middle" class="device-value">${l}</text>`:q``}
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"plate_heat_exchanger":return function(t,e,o,i){const n=t.width-22,r=[];for(let e=29,o=0;e<n-3;e+=7,o++)r.push(q`<line x1="${e}" y1="18" x2="${e}" y2="${t.height-18}"
      stroke="${o%2==0?ho:uo}" stroke-width="2" opacity="0.8" />`);return q`
    <g class="device device-plate-heat-exchanger">
      ${Co(t,22)}
      <rect x="${22}" y="10" width="${n-22}" height="${t.height-20}" rx="4"
        fill="${fo}" stroke="${Mo(i,o)}" stroke-width="${So(o)}" />
      ${r}
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"expansion_vessel":return function(t,e,o,i){const n=t.width/2,r=47,a=Po(i);return q`
    <g class="device device-expansion-vessel">
      <line x1="${n}" y1="${86}" x2="${n}" y2="${t.height}" stroke="${$o}" stroke-width="2" />
      <rect x="13" y="${r}" width="${t.width-26}" height="${31}" fill="${uo}" opacity="0.2" />
      <rect x="12" y="${8}" width="${t.width-24}" height="${78}" rx="${(t.width-24)/2}"
        fill="none" stroke="${Mo(i,o)}" stroke-width="${So(o)}" />
      <path d="M 13 ${r} Q ${n} ${55} ${t.width-13} ${r}"
        fill="none" stroke="${$o}" stroke-width="1.5" stroke-dasharray="3 2" />
      ${a?q`<text x="${n}" y="${37}" text-anchor="middle" class="device-value">${a}</text>`:q``}
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"safety_valve":return function(t,e,o,i){const n=Mo(i,o,ho),r=So(o),a=30,s=60;return q`
    <g class="device device-safety-valve">
      <line x1="${a}" y1="${74}" x2="${a}" y2="${t.height}" stroke="${$o}" stroke-width="2" />
      <line x1="${44}" y1="${s}" x2="${t.width}" y2="${s}" stroke="${$o}" stroke-width="2" />
      <path d="M ${18} ${74} L ${42} ${74} L ${a} ${s} Z M ${44} ${48} L ${44} ${72} L ${a} ${s} Z"
        fill="${i.active?ho:fo}" fill-opacity="${i.active?.5:1}"
        stroke="${n}" stroke-width="${r}" stroke-linejoin="round" />
      <path d="M ${a} ${s} L ${a} ${52} L ${23} ${48} L ${37} ${42} L ${23} ${36}
        L ${37} ${30} L ${23} ${24} L ${a} ${20}"
        fill="none" stroke="${n}" stroke-width="1.5" stroke-linejoin="round" />
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"zone_valve":return function(t,e,o,i){const n=Mo(i,o),r=So(o),a=t.width/2,s=50;return q`
    <g class="device device-zone-valve">
      <line x1="0" y1="${s}" x2="${a-16}" y2="${s}" stroke="${$o}" stroke-width="2" />
      <line x1="${a+16}" y1="${s}" x2="${t.width}" y2="${s}" stroke="${$o}" stroke-width="2" />
      <path d="M ${a-16} ${39} L ${a} ${s} L ${a-16} ${61} Z M ${a+16} ${39} L ${a} ${s} L ${a+16} ${61} Z"
        fill="${i.active?_o:fo}" fill-opacity="${i.active?.45:1}"
        stroke="${n}" stroke-width="${r}" stroke-linejoin="round" />
      <line x1="${a}" y1="${s}" x2="${a}" y2="30" stroke="${n}" stroke-width="2" />
      <rect x="${a-12}" y="10" width="24" height="20" rx="3"
        fill="${i.active?_o:fo}" stroke="${n}" stroke-width="${r}" />
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"radiator":return function(t,e,o,i){const n=Po(i),r=[];for(let e=26;e<=t.width-24;e+=10)r.push(q`<line x1="${e}" y1="22" x2="${e}" y2="58" stroke="${$o}" stroke-width="1.5" />`);return q`
    <g class="device device-radiator">
      <path d="M 0 70 L 16 70 L 16 62 M ${t.width-16} 62 L ${t.width-16} 70 L ${t.width} 70"
        fill="none" stroke="${$o}" stroke-width="2" />
      <rect x="16" y="16" width="${t.width-32}" height="46" rx="4"
        fill="${i.active?vo:fo}" fill-opacity="${i.active?.2:1}"
        stroke="${Mo(i,o,vo)}" stroke-width="${So(o)}" />
      ${r}
      <rect x="4" y="26" width="10" height="18" rx="3" fill="${fo}" stroke="${$o}" stroke-width="1.5" />
      ${n?q`<text x="${t.width/2}" y="10" text-anchor="middle" class="device-value">${n}</text>`:q``}
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"fancoil":return function(t,e,o,i){const n=Po(i);return q`
    <g class="device device-fancoil">
      <path d="M 0 70 L 16 70 M ${t.width-16} 70 L ${t.width} 70" stroke="${$o}" stroke-width="2" />
      <rect x="16" y="12" width="${t.width-32}" height="58" rx="6"
        fill="${fo}" stroke="${Mo(i,o)}" stroke-width="${So(o)}" />
      <circle cx="${46}" cy="${38}" r="20" fill="none" stroke="${$o}" stroke-width="1.5" />
      <g class="fan ${i.active?"spinning":""}">
        ${[0,90,180,270].map(t=>q`
          <path d="${"M 0 0 C 4 -7, 13 -9, 17 -4 C 12 -1, 5 0, 0 0 Z"}" transform="translate(${46} ${38}) rotate(${t})" fill="${go}" opacity="0.75" />
        `)}
        <circle cx="${46}" cy="${38}" r="3.5" fill="${go}" />
      </g>
      <path d="M 76 50 L 104 50 M 76 56 L 104 56" stroke="${$o}" stroke-width="1.5" />
      ${n?q`<text x="90" y="36" text-anchor="middle" class="device-value">${n}</text>`:q``}
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"outdoor_temperature":return function(t,e,o){const i=e?go:$o;return q`
    <g class="device device-outdoor-temperature">
      <rect x="2" y="6" width="${t.width-4}" height="${t.height-12}" rx="${(t.height-12)/2}"
        fill="${fo}" stroke="${i}" stroke-width="${So(e)}" />
      <circle cx="22" cy="${t.height/2}" r="6" fill="none" stroke="#ffb300" stroke-width="1.5" />
      <path d="M 22 13 V 16 M 22 34 V 37 M 10 25 H 13 M 31 25 H 34 M 14 17 L 16 19 M 28 31 L 30 33 M 14 33 L 16 31 M 28 19 L 30 17"
        stroke="#ffb300" stroke-width="1.5" stroke-linecap="round" />
      <text x="${t.width/2+14}" y="${t.height/2+4}" text-anchor="middle" class="device-value">
        ${o.value??"—"}
      </text>
    </g>
  `}(e,i,n);case"water_supply":return function(t,e,o,i){const n=t.height/2;return q`
    <g class="device device-water-supply">
      <line x1="36" y1="${n}" x2="${t.width}" y2="${n}" stroke="${uo}" stroke-width="3" />
      <circle cx="22" cy="${n}" r="16" fill="${fo}" stroke="${Mo(i,o,uo)}"
        stroke-width="${So(o)}" />
      <path d="${Ro(22,n)}" fill="${uo}" opacity="0.85" />
      <path d="M 50 ${n-8} L 62 ${n+8} M 50 ${n+8} L 62 ${n-8} M 50 ${n-8} V ${n+8} M 62 ${n-8} V ${n+8}"
        stroke="${$o}" stroke-width="1.5" />
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"dhw_outlet":return function(t,e,o,i){const n=t.height/2,r=i.active?ho:$o;return q`
    <g class="device device-dhw-outlet">
      <line x1="0" y1="${n}" x2="40" y2="${n}" stroke="${ho}" stroke-width="3" />
      <path d="M 40 ${n-6} H 58 Q 66 ${n-6} 66 ${n+2} V ${n+6} M 40 ${n+6} H 54 Q 58 ${n+6} 58 ${n+10}"
        fill="none" stroke="${o?go:$o}" stroke-width="${So(o)+1}" stroke-linecap="round" />
      <path d="M 46 ${n-6} V ${n-14} M 42 ${n-14} H 50" stroke="${$o}" stroke-width="2" stroke-linecap="round" />
      <path d="${Ro(62,n+18)}" fill="${r}" opacity="0.85" />
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);default:return}}const Bo=["supply","return","outdoor"];function qo(t,e,o,i,n,r=0){const a=Math.max(2,Math.floor((e-t)/8)),s=(e-t)/a,l=t=>o+n*(r+t);let d=`M ${o} ${t}`;r&&(d+=` L ${l(0)} ${t}`);for(let e=1;e<a;e++)d+=` L ${l(e%2?i:4)} ${t+e*s}`;return r&&(d+=` L ${l(0)} ${e}`),`${d} L ${o} ${e}`}function Zo(t,e,o,i,n,r){const a=i.active?"#4caf50":o?"var(--primary-color, #03a9f4)":"var(--divider-color, #888)",s=o?2.5:1.5,l=t.ports.some(e=>0===e.position.y||e.position.y===t.height),d=l?40:0,c=(t.width-d)/100,p=14*c,h=t.width-14*c,u=l?p:10,_=t.height-(l?p:4),v=u+6,y=_-6,m=(y-v-36)/(wt.length-1),f=wt.map((t,e)=>({y:v+18+e*m,state:n.get(t)})).filter(t=>void 0!==t.state),$=e=>t.ports.find(t=>t.id===e)?.position.y,g=[["coil_in","coil_out"],["coil2_in","coil2_out"]].map(([e,o])=>{return{ya:$(e),yb:$(o),onRight:(i=e,t.ports.find(t=>t.id===i)?.position.x===t.width)};var i}).filter(t=>void 0!==t.ya&&void 0!==t.yb).map(t=>({y1:Math.min(t.ya,t.yb),y2:Math.max(t.ya,t.yb),onRight:t.onRight})),b=2===g.length&&g[0].onRight!==g[1].onRight,x=b?3:0,w=b?(h-p)/2-5-3-5:32*c,k=t=>v+18+t*m,A=$("supply_out"),M=$("coil2_in"),S=[b&&void 0!==A&&void 0!==M?(A+M)/2:k(3)+m/2,k(1)+m/2];return q`
    <g class="device device-tank">
      ${t.ports.map(e=>{const o=0===e.position.y||e.position.y===t.height,i=o?e.position.x:0===e.position.x?p:h,n=o?0===e.position.y?u:_:e.position.y;return q`<line x1="${e.position.x}" y1="${e.position.y}" x2="${i}" y2="${n}"
          stroke="var(--divider-color, #888)" stroke-width="2" />`})}
      <rect x="${p}" y="${u}" width="${h-p}" height="${_-u}" rx="12"
        fill="var(--card-background-color, #1c1c1c)" stroke="${a}" stroke-width="${s}" />
      ${function(t,e,o,i,n){return n.map((r,a)=>{const s=0===a?o:(n[a-1].y+r.y)/2,l=a===n.length-1?i:(r.y+n[a+1].y)/2;return q`<rect class="water" x="${t}" y="${s}" width="${e}" height="${l-s}"
      fill="${Ao(r.state.numeric)}" opacity="0.3" />`})}(p+3,h-p-6,v,y,f)}
      ${f.map(t=>q`<circle cx="${p+4}" cy="${t.y}" r="3" fill="${Ao(t.state.numeric)}" />`)}
      ${g.map(({y1:t,y2:e,onRight:o},i)=>q`
        <path class="coil" d="${o?qo(t,e,h,w,-1,x):qo(t,e,p,w,1,x)}" fill="none" stroke="${ho}"
          stroke-width="2" stroke-linejoin="round" opacity="${0===i?.85:.65}" />
      `)}
      ${r.slice(0,2).map((t,e)=>function(t,e,o,i,n=1){const r=i.active?vo:yo;return q`
    <g class="heating-rod ${i.active?"active":""}">
      <title>${i.label??""}</title>
      <rect x="${t-4*n}" y="${e-6*n}" width="${8*n}" height="${12*n}" rx="2" fill="${fo}" stroke="${r}" stroke-width="1.5" />
      ${Io(t-4*n-o,e+4*n,o,i,8*n)}
    </g>
  `}(h,S[e],30*c*1.7,t,1.7))}
      ${f.map(t=>function(t,e,o,i=!1){const n=o.value??"—",r=6.5*n.length+8,a=i&&void 0!==o.numeric?`fill: ${Ao(o.numeric)}`:"";return q`
    <rect x="${t-r/2}" y="${e-11}" width="${r}" height="15" rx="3" fill="${fo}" opacity="0.85" />
    <text x="${t}" y="${e}" text-anchor="middle" class="device-value" style="${a}">
      <title>${o.label??""}</title>${n}
    </text>
  `}((p+h)/2+8*c,t.y+4,t.state,!0))}
      ${zo(t,e)}
    </g>
  `}function Fo(t,e,o,i,n){const r=xo(i.operation)??Mo(i,o),a=So(o),s=t.width===t.height,l=s?t.width/2:58,d=s?t.height/2:60,c="defrost"===i.operation,p=s?d-40:d-44,h=jo(i,n.addons??[]),u=c?mo:"var(--primary-color, #03a9f4)",_=(n.addons??[]).filter(t=>"electric_heater"===t.config.type&&!t.config.hidden).map(t=>t.state),v=function(t,e,o=!0){const i=t.filter(t=>t.config.entity_id&&!t.config.hidden&&("temperature"===t.config.type||"value"===t.config.type)),n=t=>{const e="temperature"===t.config.type?Bo.indexOf(t.config.slot??""):-1;return e<0?Bo.length:e},r=[...i].sort((t,e)=>n(t)-n(e)).map(t=>({label:t.config.name??(t.config.slot?e.t(`slots.${t.config.slot}`):""),text:t.state.value??"—",color:"temperature"===t.config.type?Ao(t.state.numeric):void 0})),a=i.some(t=>"value"===t.config.type&&"cop"===t.config.slot),{cop:s}=Vo(t);if(o&&void 0!==s&&!a){const t=Math.min(r.length,i.filter(t=>n(t)<Bo.length).length),o=new Intl.NumberFormat(e.language,{minimumFractionDigits:1,maximumFractionDigits:1}).format(s);r.splice(t,0,{label:e.t("slots.cop"),text:`COP ${o}`})}return r.slice(0,6)}(n.addons??[],e,!n.hideCop);return q`
    <g class="device device-outdoor-unit">
      <rect x="10" y="12" width="${t.width-20}" height="${t.height-24}" rx="6"
        fill="var(--card-background-color, #1c1c1c)" stroke="${r}" stroke-width="${a}" />
      <circle cx="${l}" cy="${d}" r="${s?30:34}" fill="none" stroke="${c?u:"var(--divider-color, #888)"}" stroke-width="1.5" />
      <g class="fan ${h.active?"spinning":""}" style="${h.duration?`animation-duration: ${h.duration}s`:""}">
        ${[0,90,180,270].map(t=>q`
          <path d="${"M 0 0 C 6 -10, 20 -14, 26 -6 C 18 -2, 8 0, 0 0 Z"}" transform="translate(${l} ${d}) rotate(${t})"
            fill="${u}" opacity="0.75" />
        `)}
        <circle cx="${l}" cy="${d}" r="5" fill="${u}" />
      </g>
      ${c?q`<path class="defrost" d="M ${l} ${p} v 14 M ${l-6} ${p+4} l 12 6 M ${l-6} ${p+10} l 12 -6"
            stroke="${u}" stroke-width="2" stroke-linecap="round" />`:q``}
      ${v.map((t,e)=>q`
        <text x="${s?l+36:104}" y="${s?d-30+13*e:30+15*e}" class="device-value" style="${t.color?`fill: ${t.color}`:""}">
          <title>${t.label}</title>${t.text}
        </text>
      `)}
      ${_.slice(0,3).map((e,o)=>q`
        <g class="heating-rod ${e.active?"active":""}">
          ${Io(24+34*o,t.height-18,26,e)}
        </g>
      `)}
      ${zo(t,e)}
    </g>
  `}const Wo={temperature:"temperature",pressure:"pressure",volume_flow_rate:"flow",energy:"energy",power:"energy"};function Jo(t,e,o,i){const n=function(t){const e=t.deviceClass?Wo[t.deviceClass]:void 0;return e||(t.unit?.includes("°")?"temperature":"generic")}(i),r=t.width/2,a=t.height-14,s=o?"var(--primary-color, #03a9f4)":"temperature"===n?Ao(i.numeric):"var(--primary-color, #03a9f4)",l="energy"===n||"generic"===n;return q`
    <g class="device device-inline-sensor">
      <line x1="0" y1="${a}" x2="${t.width}" y2="${a}" stroke="var(--divider-color, #888)" stroke-width="3" />
      <circle cx="${r}" cy="${a}" r="11" fill="var(--card-background-color, #1c1c1c)"
        stroke="${s}" stroke-width="${o?2.5:2}" />
      <path d="${function(t,e,o){switch(t){case"temperature":return`M ${e-1.5} ${o+2} V ${o-6} A 1.5 1.5 0 0 1 ${e+1.5} ${o-6} V ${o+2} M ${e-3} ${o+4.5} A 3 3 0 1 0 ${e+3} ${o+4.5} A 3 3 0 1 0 ${e-3} ${o+4.5}`;case"flow":return`M ${e-6} ${o} L ${e+5} ${o} M ${e+1} ${o-4} L ${e+5} ${o} L ${e+1} ${o+4}`;case"pressure":return`M ${e-6} ${o+3} A 6 6 0 1 1 ${e+6} ${o+3} M ${e} ${o+1} L ${e+4} ${o-4}`;case"energy":return`M ${e+1} ${o-7} L ${e-4} ${o+1} L ${e} ${o+1} L ${e-1} ${o+7} L ${e+4} ${o-1} L ${e} ${o-1} Z`;case"generic":return`M ${e-3} ${o} A 3 3 0 1 0 ${e+3} ${o} A 3 3 0 1 0 ${e-3} ${o} Z`}}(n,r,a)}" fill="${l?s:"none"}"
        stroke="${s}" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      <text x="${r}" y="${a-17}" text-anchor="middle" class="device-value">${i.value??"—"}</text>
      ${zo(t,e)}
    </g>
  `}function Yo(t,e,o,i,n,r={}){switch(t){case"heat_pump":return Fo(e,o,i,n,r);case"ground_collector":return function(t,e,o){const i=t.height-16,n=[90,74,58,42,26],r=t.ports.find(t=>"cold_in"===t.id).position,a=t.ports.find(t=>"hot_out"===t.id).position,s=[`M ${t.width} ${r.y} L ${n[0]} ${r.y}`,`L ${n[0]} 16`];n.forEach((t,e)=>{if(e===n.length-1)return;const o=n[e+1],r=e%2==0;s.push(`A 8 8 0 0 ${r?0:1} ${o} ${r?16:i}`),s.push(`L ${o} ${r?i:16}`)});const l=n[n.length-1];s.push(`L ${l} 0`,`L ${t.width} 0`,`L ${a.x} ${a.y}`);const d=o?"var(--primary-color, #03a9f4)":"#42a5f5";return q`
    <g class="device device-ground-collector">
      <path d="${s.join(" ")}" fill="none" stroke="${d}" stroke-width="3"
        stroke-linejoin="round" stroke-linecap="round" />
      ${zo(t,e)}
    </g>
  `}(e,o,i);case"valve_3way":return function(t,e,o,i){const n=i.active?"#4caf50":o?"var(--primary-color, #03a9f4)":"var(--divider-color, #888)",r=o?2.5:1.5,a="#4caf50",s="var(--divider-color, #888)",l="var(--card-background-color, #1c1c1c)",d="a"===i.valveBranch,c="b"===i.valveBranch;return q`
    <g class="device device-valve-3way">
      <path d="M 0 40 H 14" stroke="${s}" stroke-width="2" />
      <path d="M 66 40 H 80" stroke="${d?a:s}" stroke-width="2" />
      <path d="M 40 66 V 80" stroke="${c?a:s}" stroke-width="2" />
      <path d="M 40 40 V 18" stroke="${n}" stroke-width="1.5" />
      <rect x="30" y="6" width="20" height="12" rx="2" fill="${l}" stroke="${n}" stroke-width="${r}" />
      <polygon points="14,28 14,52 40,40" fill="${l}" stroke="${n}" stroke-width="${r}" stroke-linejoin="round" />
      <polygon points="66,28 66,52 40,40" fill="${d?a:l}" fill-opacity="${d?.8:1}"
        stroke="${d?a:n}" stroke-width="${r}" stroke-linejoin="round" />
      <polygon points="28,66 52,66 40,40" fill="${c?a:l}" fill-opacity="${c?.8:1}"
        stroke="${c?a:n}" stroke-width="${r}" stroke-linejoin="round" />
      <text x="72" y="33" text-anchor="middle" class="device-label">A</text>
      <text x="50" y="77" text-anchor="middle" class="device-label">B</text>
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"tank":return Zo(e,o,i,n,function(t){const e=new Map;for(const o of t.addons??[])"temperature"===o.config.type&&o.config.slot&&e.set(o.config.slot,o.state);return e}(r),function(t){return(t.addons??[]).filter(t=>"electric_heater"===t.config.type).map(t=>t.state)}(r));case"junction":return function(t,e,o,i){const n=i.active?"#4caf50":o?"var(--primary-color, #03a9f4)":"var(--divider-color, #888)",r=o?2.5:1.5,a=t.width/2;return q`
    <g class="device device-junction">
      ${t.ports.map(t=>q`
        <line x1="${t.position.x}" y1="${t.position.y}" x2="${a}" y2="${a}"
          stroke="var(--divider-color, #888)" stroke-width="3" stroke-linecap="round" />
      `)}
      <circle cx="${a}" cy="${a}" r="4.5" fill="${n}" stroke="${n}" stroke-width="${r}" />
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"circulation_pump":return function(t,e,o,i){const n=i.active?"#4caf50":o?"var(--primary-color, #03a9f4)":"var(--divider-color, #888)",r=o?2.5:1.5,a=t.width/2,s=[0,120,240].map(t=>{const e=t*Math.PI/180;return`${Math.round(10*(a+16*Math.cos(e)))/10},${Math.round(10*(a+16*Math.sin(e)))/10}`}).join(" ");return q`
    <g class="device device-circulation-pump">
      <path d="M 0 ${a} H ${a-26} M ${a+26} ${a} H ${t.width}" stroke="var(--divider-color, #888)" stroke-width="2" />
      <circle
        cx="${a}" cy="${a}" r="26"
        fill="var(--card-background-color, #1c1c1c)"
        stroke="${n}" stroke-width="${r}"
      />
      <g class="impeller ${i.active?"spinning":""}">
        <!-- Invisible circle keeps the bounding box centered, so the rotation does not wobble. -->
        <circle cx="${a}" cy="${a}" r="${16}" fill="none" stroke="none" />
        <polygon points="${s}" fill="var(--primary-color, #03a9f4)" fill-opacity="${i.active?.85:.35}"
          stroke="var(--primary-color, #03a9f4)" stroke-width="1.5" stroke-linejoin="round" />
      </g>
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"floor_heating":return function(t,e,o,i){const n=i.active?"#4caf50":o?"var(--primary-color, #03a9f4)":"var(--divider-color, #888)";return q`
    <g class="device device-floor-heating">
      <rect
        x="10" y="14" width="120" height="52" rx="8"
        fill="var(--card-background-color, #1c1c1c)"
        stroke="${n}" stroke-width="${o?2.5:1.5}"
      />
      <path d="M 20 40 C 35 30, 50 50, 65 40 C 80 30, 95 50, 110 40 C 115 37, 120 37, 126 40"
        fill="none" stroke="var(--primary-color, #03a9f4)" stroke-width="2" />
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"manifold":return function(t,e,o,i,n){const r=i.active?"#4caf50":o?"var(--primary-color, #03a9f4)":"var(--divider-color, #888)",a=o?2.5:1.5,s=t.width-8,l=t.ports.filter(t=>t.id.startsWith("loop_")&&"outlet"===t.kind);return q`
    <g class="device device-manifold">
      <rect x="2" y="18" width="${t.width-4}" height="94" rx="6"
        fill="none" stroke="${r}" stroke-width="${a}" stroke-dasharray="4 3" />
      <rect x="4" y="22" width="${s}" height="16" rx="4"
        fill="var(--card-background-color, #1c1c1c)" stroke="${ho}" stroke-width="2" />
      <rect x="4" y="92" width="${s}" height="16" rx="4"
        fill="var(--card-background-color, #1c1c1c)" stroke="${uo}" stroke-width="2" />
      ${l.map((e,o)=>{const i=e.position.x,r=n[o]?.active??!1;return q`
          <line x1="${i}" y1="0" x2="${i}" y2="22" stroke="${ho}" stroke-width="2" />
          <rect class="actuator ${r?"active":""}" x="${i-7}" y="6" width="14" height="11" rx="2"
            fill="${r?"#4caf50":"var(--card-background-color, #1c1c1c)"}"
            stroke="${r?"#4caf50":"var(--divider-color, #888)"}" stroke-width="1.5" />
          <line x1="${i}" y1="108" x2="${i}" y2="${t.height}" stroke="${uo}" stroke-width="2" />
          <text x="${i}" y="69" text-anchor="middle" class="device-label">${o+1}</text>
        `})}
      ${zo(t,e)}
    </g>
  `}(e,o,i,n,function(t,e){return(t.addons??[]).filter(t=>t.config.type===e).map(t=>t.state)}(r,"loop"));case"mixing_valve":return function(t,e,o,i){const n=o?"var(--primary-color, #03a9f4)":"var(--divider-color, #888)",r=o?2.5:1.5,a=i.position,s=void 0===a?"var(--divider-color, #888)":`hsl(${Math.round(210*(1-a/100))}, 75%, 55%)`;return q`
    <g class="device device-mixing-valve">
      <line x1="0" y1="70" x2="22" y2="70" stroke="${ho}" stroke-width="3" />
      <line x1="50" y1="96" x2="50" y2="${t.height}" stroke="${uo}" stroke-width="3" />
      <line x1="78" y1="70" x2="${t.width}" y2="70" stroke="${s}" stroke-width="3" />
      <path d="M 22 56 L 50 70 L 22 84 Z M 78 56 L 50 70 L 78 84 Z M 36 98 L 50 70 L 64 98 Z"
        fill="var(--card-background-color, #1c1c1c)" stroke="${n}" stroke-width="${r}"
        stroke-linejoin="round" />
      <line x1="50" y1="36" x2="50" y2="70" stroke="${n}" stroke-width="2" />
      <rect x="28" y="10" width="44" height="26" rx="4"
        fill="var(--card-background-color, #1c1c1c)" stroke="${n}" stroke-width="${r}" />
      ${void 0===a?q``:q`<rect x="30" y="12" width="${40*a/100}" height="22" rx="3" fill="${s}" opacity="0.35" />`}
      <text x="50" y="27" text-anchor="middle" class="device-value">
        ${void 0===a?"—":`${Math.round(a)} %`}
      </text>
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"electric_heater":return function(t,e,o,i){const n=i.active?vo:o?"var(--primary-color, #03a9f4)":"var(--divider-color, #888)",r=o?2.5:1.5;return q`
    <g class="device device-electric-heater">
      <rect x="10" y="12" width="${t.width-20}" height="${t.height-24}" rx="8"
        fill="var(--card-background-color, #1c1c1c)" stroke="${n}" stroke-width="${r}" />
      ${Io(24,t.height/2+4,t.width-48,i)}
      ${zo(t,e)}
    </g>
  `}(e,o,i,n);case"pipe_sensor":return Jo(e,o,i,n);default:return Uo(t,e,o,i,n)}}const Xo={temperature:{type:"temperature",display:"value",domains:["sensor"],deviceClasses:["temperature"]},value:{type:"value",display:"value",domains:["sensor","number"]},electric_heater:{type:"electric_heater",display:"binary",domains:["switch","binary_sensor","sensor","input_boolean"],deviceClasses:["power","heat","running"]},pump:{type:"pump",display:"binary",domains:["switch","binary_sensor","sensor"],deviceClasses:["running"]},compressor:{type:"compressor",display:"binary",domains:["binary_sensor","sensor","switch"],deviceClasses:["running","frequency"]},operation:{type:"operation",display:"text",domains:["sensor","binary_sensor","climate","select"],deviceClasses:["enum","running"]},actuator:{type:"actuator",display:"position",domains:["valve","switch","binary_sensor","number","sensor"]},fan:{type:"fan",display:"binary",domains:["fan","sensor","binary_sensor"]},mode:{type:"mode",display:"text",domains:["select","sensor","input_select","climate","water_heater"],deviceClasses:["enum"]},setpoint:{type:"setpoint",display:"value",domains:["number","input_number","climate","water_heater","sensor"],deviceClasses:["temperature"]},defrost:{type:"defrost",display:"binary",domains:["binary_sensor","sensor"]},alarm:{type:"alarm",display:"binary",domains:["binary_sensor","sensor"],deviceClasses:["problem"]},window:{type:"window",display:"binary",domains:["binary_sensor"],deviceClasses:["window","opening"]},heat_exchanger:{type:"heat_exchanger",display:"none",entityless:!0},direct_source:{type:"direct_source",display:"none",entityless:!0},direct_heating:{type:"direct_heating",display:"none",entityless:!0},dhw:{type:"dhw",display:"none",entityless:!0},circulation:{type:"circulation",display:"none",entityless:!0},loop:{type:"loop",display:"binary",domains:["valve","switch","binary_sensor","climate"]}};function Go(t){return t.slots&&!t.slotsOptional?t.slots.length:t.max}const Qo={heat_pump:["temperature","value","electric_heater","fan","defrost","operation"],tank:["temperature","electric_heater"],manifold:["loop"]},ti={electric_heater:vo,defrost:"#4fc3f7",alarm:"var(--error-color, #db4437)",window:"var(--warning-color, #ffa600)"},ei={heat_pump:["temperature","value","electric_heater"]};function oi(t,e){const o=Qo[t]??[];return e.filter(t=>t.config.entity_id&&!t.config.hidden&&!Xo[t.config.type].entityless&&!o.includes(t.config.type))}function ii(t){const{state:e}=t;switch(Xo[t.config.type].display){case"binary":return"compressor"===t.config.type&&void 0!==e.numeric?e.value:void 0;case"position":return void 0!==e.position?`${Math.round(e.position)} %`:e.value??"—";default:return e.value??"—"}}function ni(t,e){if(t.config.name)return t.config.name;const o=e.t(`addons.${t.config.type}.name`);return t.config.slot?`${o} – ${e.t(`slots.${t.config.slot}`)}`:o}function ri(t,e){const o=[];let i=0,n=0;for(const r of t){const t=ii(r),a=16+(t?6.5*t.length+6:2);i>0&&i+a>e&&(i=0,n+=22),o.push({addon:r,text:t,x:i,y:n,width:a}),i+=a+4}return{boxes:o,height:o.length?n+18:0}}function ai(t,e,o,i,n){const{boxes:r}=ri(t,n);return q`
    <g class="addon-badges" transform="translate(${o} ${i})">
      ${r.map(({addon:t,text:o,x:i,y:n,width:r})=>{const a=function(t){const{type:e}=t.config,o=Xo[e].display;return"temperature"===e?Ao(t.state.numeric):"value"===o||"text"===o?go:t.state.active||"position"===o&&(t.state.position??0)>0?ti[e]??_o:$o}(t),s=n+9,l="pump"===t.config.type||"alarm"===t.config.type;return q`
          <g
            class="addon-badge addon-${t.config.type} ${t.state.active?"active":""}"
            data-addon-index="${t.index??""}"
          >
            <title>${ni(t,e)}: ${t.state.value??"—"}</title>
            <rect x="${i}" y="${n}" width="${r}" height="${18}" rx="${9}"
              fill="${fo}" stroke="${a}" stroke-width="1" />
            <path d="${function(t,e,o){switch(t){case"temperature":return`M ${e-1.5} ${o+1} V ${o-5} A 1.5 1.5 0 0 1 ${e+1.5} ${o-5} V ${o+1} M ${e-3} ${o+3} A 3 3 0 1 0 ${e+3} ${o+3} A 3 3 0 1 0 ${e-3} ${o+3}`;case"setpoint":return`M ${e-5} ${o} A 5 5 0 1 0 ${e+5} ${o} A 5 5 0 1 0 ${e-5} ${o} M ${e-1.5} ${o} A 1.5 1.5 0 1 0 ${e+1.5} ${o} A 1.5 1.5 0 1 0 ${e-1.5} ${o}`;case"pump":return`M ${e-5} ${o} A 5 5 0 1 0 ${e+5} ${o} A 5 5 0 1 0 ${e-5} ${o} M ${e-2} ${o-3} L ${e+3} ${o} L ${e-2} ${o+3} Z`;case"compressor":return`M ${e-5} ${o} A 5 5 0 1 0 ${e+5} ${o} A 5 5 0 1 0 ${e-5} ${o} M ${e} ${o} m -1 0 a 1 1 0 1 1 2 0 a 2.5 2.5 0 1 1 -5 0`;case"fan":return`M ${e} ${o} L ${e} ${o-5} M ${e} ${o} L ${e+4.3} ${o+2.5} M ${e} ${o} L ${e-4.3} ${o+2.5}`;case"electric_heater":return`M ${e-5} ${o+2} L ${e-3} ${o-3} L ${e-1} ${o+2} L ${e+1} ${o-3} L ${e+3} ${o+2} L ${e+5} ${o-3}`;case"defrost":return`M ${e} ${o-5} V ${o+5} M ${e-4.3} ${o-2.5} L ${e+4.3} ${o+2.5} M ${e-4.3} ${o+2.5} L ${e+4.3} ${o-2.5}`;case"alarm":return`M ${e} ${o-5} L ${e+5} ${o+4} L ${e-5} ${o+4} Z M ${e} ${o-1.5} V ${o+1.5}`;case"window":return`M ${e-4} ${o-4} H ${e+4} V ${o+4} H ${e-4} Z M ${e} ${o-4} V ${o+4} M ${e-4} ${o} H ${e+4}`;case"actuator":return`M ${e-4} ${o+4} H ${e+4} M ${e} ${o+4} V ${o-2} M ${e-3} ${o-2} H ${e+3} V ${o-5} H ${e-3} Z`;case"mode":return`M ${e-5} ${o-3} H ${e+5} M ${e-5} ${o} H ${e+5} M ${e-5} ${o+3} H ${e+5}`;case"loop":return`M ${e-5} ${o-3} V ${o+3} H ${e+5} V ${o-3}`;default:return`M ${e-2.5} ${o} A 2.5 2.5 0 1 0 ${e+2.5} ${o} A 2.5 2.5 0 1 0 ${e-2.5} ${o} Z`}}(t.config.type,i+9,s)}" fill="${l&&t.state.active?a:"none"}"
              stroke="${a}" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" />
            ${o?q`<text x="${i+16}" y="${s+4}" class="device-value addon-value">${o}</text>`:q``}
          </g>
        `})}
    </g>
  `}function si(t){return t.charAt(0).toUpperCase()+t.slice(1)}const li="#ef5350",di="#ffa726",ci="#80deea",pi="#42a5f5",hi=[["16 24",.15],["0 6 10 24",.35],["0 11 5 24",.85]];function ui(t,e,o){return Math.min(o,Math.max(e,t))}function _i(t){const e=t.values.frequency?.numeric;return e&&e>0?Math.round(100*ui(90/e,.5,3))/100:1.5}function vi(t){return xo(t.operation)??(t.running?_o:$o)}function yi(t,e){return hi.map(([o,i])=>q`<path class="${e}" d="${t}" stroke-dasharray="${o}" stroke-opacity="${i}" />`)}function mi(t,e,o,i="start"){if(!o)return q``;const n=6.6*Math.max(o.label.length,o.text.length)+14,r="end"===i?t-n:"middle"===i?t-n/2:t;return q`
    <g class="chip">
      <rect class="chip-bg" x="${r}" y="${e-13}" width="${n}" height="32" rx="6" />
      <text class="chip-label" x="${r+7}" y="${e}">${o.label}</text>
      <text class="chip-value" x="${r+7}" y="${e+14}" style="${o.color?`fill: ${o.color}`:""}">
        ${o.text}
      </text>
    </g>
  `}function fi(t,e,o,i,n){const r=n?mo:go,a=`M 0 0 C ${9*o} ${-16*o}, ${32*o} ${-22*o}, ${42*o} ${-9*o} C ${29*o} ${-3*o}, ${13*o} 0, 0 0 Z`;return q`
    <g class="${i.active?"spin":""}" style="${i.active?`animation-duration: ${i.duration??1.6}s`:""}">
      <circle cx="${t}" cy="${e}" r="${58*o}" fill="none" stroke="none" />
      ${[0,90,180,270].map(o=>q`<path d="${a}" transform="translate(${t} ${e}) rotate(${o})"
          fill="${r}" opacity="${i.active?.8:.35}" />`)}
      <circle cx="${t}" cy="${e}" r="${7*o}" fill="${r}" />
    </g>
  `}function $i(t,e,o,i){const n=o,r=`M ${t} ${e} m ${-4*n} 0 a ${4*n} ${4*n} 0 1 1 ${8*n} 0 a ${9*n} ${9*n} 0 1 1 ${-18*n} 0 a ${14*n} ${14*n} 0 1 1 ${28*n} 0 a ${19*n} ${19*n} 0 1 1 ${-38*n} 0 a ${24*n} ${24*n} 0 1 1 ${48*n} 0`;return q`
    <circle cx="${t}" cy="${e}" r="${48*n}" fill="${fo}" stroke="${i.running?_o:$o}" stroke-width="2.5" />
    <g class="${i.running?"spin":""}" style="${i.running?`animation-duration: ${function(t){const e=t.values.frequency?.numeric;return e&&e>0?Math.round(100*ui(30/e,.15,2))/100:.8}(i)}s`:""}">
      <circle cx="${t}" cy="${e}" r="${30*n}" fill="none" stroke="none" />
      <path d="${r}" fill="none" stroke="${go}" stroke-width="2.5" stroke-linecap="round" opacity="${i.running?.9:.35}" />
    </g>
  `}function gi(t,e,o,i){const n=[180,300,60].map(i=>{const n=i*Math.PI/180;return`${Math.round(10*(t+.6*o*Math.cos(n)))/10},${Math.round(10*(e+.6*o*Math.sin(n)))/10}`}).join(" ");return q`
    <circle cx="${t}" cy="${e}" r="${o}" fill="${fo}" stroke="${i?_o:$o}" stroke-width="2" />
    <g class="${i?"spin":""}" style="${i?"animation-duration: 1.1s":""}">
      <circle cx="${t}" cy="${e}" r="${.6*o}" fill="none" stroke="none" />
      <polygon points="${n}" fill="${go}" fill-opacity="${i?.85:.35}" />
    </g>
  `}function bi(t){return t?{suction:li,discharge:pi,liquid:ci,mixed:di}:{suction:pi,discharge:li,liquid:di,mixed:ci}}function xi(t,e,o){return new Intl.NumberFormat(t.language,{minimumFractionDigits:o,maximumFractionDigits:o}).format(e)}const wi="M 120 120 V 96 H 410 V 170 H 432",ki="M 528 170 H 610 V 150 H 700",Ai="M 700 360 H 600 V 440 H 362",Mi="M 318 440 H 120 V 400",Si="M 950 430 H 870 M 834 430 H 800 V 360 H 760",zi="M 760 150 H 800 V 110 H 840 M 880 110 H 950",Ii="M 760 150 H 800 V 110 H 950";function Ci(t,e){const{temperatures:o,values:i}=t,n="defrost"===t.operation,r=vi(t),a=bi(n),s=t.pump.active,l=t.operation?`${n?"❄ ":""}${e.t(`operation.${t.operation}`)}`:void 0,d=26+8.6*t.name.length+14,c=[i.voltage?.text,i.compressor_current?.text].filter(Boolean);return B`
    <svg class="hp-detail ${n?"reverse":""}" viewBox="0 0 960 540" role="img"
      aria-label="${function(t,e){const o=[t.name,t.operation?e.t(`operation.${t.operation}`):void 0,...Object.values(t.temperatures).map(t=>`${t.label}: ${t.text}`),...Object.values(t.values).map(t=>`${t.label}: ${t.text}`),void 0!==t.performance.cop?`COP ${xi(e,t.performance.cop,1)}`:void 0];return o.filter(Boolean).join("; ")}(t,e)}" style="--ref-speed: ${_i(t)}s">
      ${t.split?q`
          <rect x="14" y="54" width="606" height="452" rx="16" fill="none" stroke="${r}" stroke-width="2.5" />
          <rect x="640" y="54" width="306" height="452" rx="16" fill="none" stroke="${r}" stroke-width="2.5" stroke-dasharray="8 5" />
          <text class="chip-label" x="610" y="74" text-anchor="end">${e.t("detail.outdoor_unit")}</text>
          <text class="chip-label" x="936" y="496" text-anchor="end">${e.t("detail.indoor_unit")}</text>`:q`<rect x="14" y="54" width="932" height="452" rx="16" fill="none" stroke="${r}" stroke-width="2.5" />`}
      <text class="title" x="26" y="36">${t.name}</text>
      ${l?q`
          <rect x="${d}" y="20" width="${8*l.length+22}" height="24" rx="12"
            fill="${r}" fill-opacity="0.2" stroke="${r}" />
          <text class="pill" x="${d+11}" y="36" style="fill: ${r}">${l}</text>`:q``}
      <text class="chip-label" x="940" y="36" text-anchor="end">${e.t(t.split?"detail.split":"detail.monoblock")}</text>

      ${mi(26,70,o.outdoor)}
      <path d="M 30 210 h 34 m -10 -8 l 10 8 l -10 8 M 30 260 h 34 m -10 -8 l 10 8 l -10 8 M 30 310 h 34 m -10 -8 l 10 8 l -10 8"
        stroke="${$o}" stroke-width="2" fill="none" opacity="${t.fan.active?1:.4}" />
      <rect x="74" y="120" width="92" height="280" rx="6" fill="${n?mo:fo}"
        fill-opacity="${n?.18:1}" stroke="${$o}" />
      ${Array.from({length:13},(t,e)=>q`<line x1="${82+6.5*e}" y1="128" x2="${82+6.5*e}" y2="392" stroke="${$o}" stroke-opacity="0.6" />`)}
      <text class="chip-label" x="120" y="416" text-anchor="middle">${si(e.t("slots.evaporator"))}</text>
      ${n?q`<text x="120" y="268" text-anchor="middle" style="fill: ${mo}; font-size: 34px">❄</text>`:q``}
      ${mi(120,470,o.evaporator,"middle")}

      <circle cx="252" cy="260" r="66" fill="none" stroke="${$o}" stroke-width="1.5" />
      ${fi(252,260,1,t.fan,n)}
      ${mi(252,354,t.fan.reading,"middle")}

      <path class="ref" d="${wi}" stroke="${a.suction}" />
      <path class="ref" d="${ki}" stroke="${a.discharge}" />
      <path class="ref" d="${Ai}" stroke="${a.liquid}" />
      <path class="ref" d="${Mi}" stroke="${a.mixed}" />
      ${t.running?[wi,ki,Ai,Mi].map(t=>yi(t,"ref-flow")):q``}

      ${mi(250,70,o.suction,"middle")}
      ${mi(355,70,i.low_pressure,"middle")}
      ${mi(t.split?560:612,196,i.high_pressure,"middle")}
      ${mi(t.split?560:612,112,o.discharge,"middle")}

      ${$i(480,170,1,t)}
      <text class="chip-label" x="480" y="236" text-anchor="middle">${t.compressorLabel}</text>
      ${mi(430,270,i.frequency?{...i.frequency,color:t.running?_o:void 0}:void 0)}
      ${mi(430,310,c.length?{label:e.t("detail.voltage_current"),text:c.join(" · ")}:void 0)}
      ${mi(432,360,o.inverter)}

      <path d="M 318 428 L 340 440 L 318 452 Z M 362 428 L 340 440 L 362 452 Z" fill="${fo}" stroke="${$o}" stroke-width="1.5" />
      <text class="chip-label" x="340" y="470" text-anchor="middle">${e.t("detail.expansion_valve")}</text>
      ${t.split?mi(652,470,o.refrigerant_liquid):mi(648,470,o.refrigerant_liquid,"middle")}
      ${mi(700,70,o.refrigerant_gas,"middle")}

      <rect x="700" y="130" width="60" height="250" rx="6" fill="${fo}" stroke="${$o}" stroke-width="1.5" />
      ${Array.from({length:10},(t,e)=>q`<path d="M 706 ${150+22*e} l 24 10 l 24 -10" fill="none"
        stroke="${e%2?li:uo}" stroke-width="1.5" opacity="0.7" />`)}
      <text class="chip-label" x="730" y="398" text-anchor="middle">${e.t("detail.plate_exchanger")}</text>

      <path class="water" d="${Si}" stroke="${uo}" />
      <path class="water" d="${t.heater?zi:Ii}" stroke="${ho}" />
      ${s?[Si,t.heater?zi:Ii].map(t=>yi(t,"water-flow")):q``}
      ${gi(852,430,18,t.pump.active)}
      <text class="chip-label" x="852" y="466" text-anchor="middle">${t.pump.label}</text>
      ${t.heater?q`
          <path class="heater ${t.heater.active?"on":""}" d="M 840 110 l 5 -8 l 5 16 l 5 -16 l 5 16 l 5 -16 l 5 16 l 5 -8"
            fill="none" stroke="${t.heater.active?vo:$o}" stroke-width="2.5" stroke-linejoin="round" />
          <text class="chip-label" x="860" y="136" text-anchor="middle">${t.heater.label}</text>`:q``}

      ${mi(880,404,o.return,"middle")}
      ${mi(800,196,o.hx_outlet)}
      ${mi(940,72,o.supply,"end")}
      ${mi(940,262,t.setpoint,"end")}

      ${function(t,e){const{values:o,performance:i}=t,n=[o.voltage,o.current,o.power].filter(t=>void 0!==t),r=o.heat_output?.text??(void 0!==i.heatKw?`${xi(e,i.heatKw,2)} kW`:void 0),a=void 0!==i.cop?xi(e,i.cop,1):void 0,s=[o.flow?.text,void 0!==i.deltaT?`ΔT ${xi(e,i.deltaT,1)} K`:void 0].filter(Boolean);return q`
    <line x1="26" y1="492" x2="934" y2="492" stroke="${$o}" stroke-opacity="0.5" />
    ${n.length?q`<text class="chip-label" x="26" y="524">⚡ ${e.t("detail.unit")}</text>
          <text class="chip-value" x="100" y="524">${n.map(t=>t.text).join(" · ")}</text>`:q``}
    ${r?q`<text class="chip-label" x="420" y="524">${e.t("detail.heat_output")}</text>
          <text class="chip-value" x="500" y="524">${r}</text>`:q``}
    ${a||void 0!==i.powerKw?q`<text class="chip-label" x="640" y="524">COP</text>
          <text class="chip-value" x="672" y="524" style="fill: ${a?_o:$o}">${a??"—"}</text>`:q``}
    ${s.length?q`<text class="chip-label" x="940" y="524" text-anchor="end">${s.join(" · ")}</text>`:q``}
  `}(t,e)}
    </svg>
  `}const Pi="M 124 90 H 212",Ei="M 268 90 H 340",Ni="M 340 165 H 252",Li="M 228 165 H 124",Oi="M 380 85 H 470",ji="M 470 160 H 444 M 420 160 H 380";function Ti(t,e){const o="defrost"===t.operation,i=vi(t),n=bi(o),r=t.operation?`${o?"❄ ":""}${e.t(`operation.${t.operation}`)}`:t.name,a=t.values.frequency,s=function(t,e){const{temperatures:o,values:i,performance:n}=t,r=void 0!==n.cop?{label:"COP",text:xi(e,n.cop,1),color:_o}:i.power??t.setpoint;return[o.outdoor,o.hx_outlet??o.supply,o.return,r].filter(t=>void 0!==t)}(t,e);return B`
    <svg class="hp-detail compact ${o?"reverse":""}" viewBox="0 0 480 300" aria-hidden="true"
      style="--ref-speed: ${_i(t)}s">
      <rect x="3" y="3" width="474" height="294" rx="14" fill="${fo}" stroke="${i}" stroke-width="3" />
      <rect x="14" y="12" width="${10*r.length+26}" height="32" rx="16" fill="${i}" fill-opacity="0.2" stroke="${i}" />
      <text class="compact-header" x="27" y="34" style="fill: ${i}">${r}</text>
      ${a?q`<text class="compact-header" x="466" y="34" text-anchor="end"
            style="fill: ${t.running?_o:"var(--secondary-text-color, #9b9b9b)"}">${a.text}</text>`:q``}

      <rect x="24" y="62" width="100" height="120" rx="8" fill="${o?mo:fo}"
        fill-opacity="${o?.18:1}" stroke="${$o}" />
      ${fi(74,122,.8,t.fan,o)}
      <path class="ref" d="${Pi}" stroke="${n.suction}" />
      <path class="ref" d="${Ei}" stroke="${n.discharge}" />
      <path class="ref" d="${Ni}" stroke="${n.liquid}" />
      <path class="ref" d="${Li}" stroke="${n.mixed}" />
      ${t.running?[Pi,Ei,Ni,Li].map(t=>yi(t,"ref-flow")):q``}
      ${$i(240,90,.6,t)}
      <path d="M 228 157 L 240 165 L 228 173 Z M 252 157 L 240 165 L 252 173 Z" fill="${fo}" stroke="${$o}" stroke-width="1.5" />
      <rect x="340" y="62" width="40" height="120" rx="5" fill="${fo}" stroke="${$o}" stroke-width="1.5" />
      ${Array.from({length:5},(t,e)=>q`<path d="M 344 ${78+22*e} l 16 8 l 16 -8" fill="none"
        stroke="${e%2?li:uo}" stroke-width="1.5" opacity="0.7" />`)}
      <path class="water" d="${Oi}" stroke="${ho}" />
      <path class="water" d="${ji}" stroke="${uo}" />
      ${t.pump.active?[Oi,ji].map(t=>yi(t,"water-flow")):q``}
      ${gi(432,160,12,t.pump.active)}

      ${s.map((t,e)=>{const o=12+116*e,i=t.label.length>14?`${t.label.slice(0,13)}…`:t.label;return q`
          <rect class="chip-bg" x="${o}" y="196" width="108" height="90" rx="10" />
          <text class="tile-label" x="${o+10}" y="224">${i}</text>
          <text class="tile-value" x="${o+10}" y="264" style="${t.color?`fill: ${t.color}`:""}">${t.text}</text>
        `})}
    </svg>
  `}function Hi(t,e,o=!1){return o?Ti(t,e):Ci(t,e)}const Di=a`
  .hp-detail {
    display: block;
    width: 100%;
    height: auto;
    min-height: 0;
    background: none;
  }
  .hp-detail .title {
    fill: var(--primary-text-color, #e1e1e1);
    font-size: 15px;
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .hp-detail .pill {
    font-size: 13px;
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .hp-detail .chip-bg {
    fill: var(--card-background-color, #1c1c1c);
    stroke: var(--divider-color, #3a3a3a);
    stroke-width: 1;
  }
  .hp-detail .chip-label,
  .hp-detail .tile-label {
    fill: var(--secondary-text-color, #9b9b9b);
    font-size: 11px;
  }
  .hp-detail .chip-value,
  .hp-detail .tile-value {
    fill: var(--primary-text-color, #e1e1e1);
    font-size: 12px;
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .hp-detail .tile-label {
    font-size: 15px;
  }
  .hp-detail .tile-value {
    font-size: 26px;
  }
  .hp-detail .compact-header {
    font-size: 19px;
    font-weight: var(--ha-font-weight-medium, 500);
  }
  .hp-detail .ref,
  .hp-detail .water {
    fill: none;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  .hp-detail .ref {
    stroke-width: 3.5;
  }
  .hp-detail .water {
    stroke-width: 5;
  }
  .hp-detail .ref-flow,
  .hp-detail .water-flow {
    fill: none;
    stroke: #fff;
    stroke-linejoin: round;
    animation: flow linear infinite;
  }
  .hp-detail .ref-flow {
    stroke-width: 2;
    animation-duration: var(--ref-speed, 1.5s);
  }
  .hp-detail .water-flow {
    stroke-width: 2.5;
    animation-duration: 1.2s;
  }
  .hp-detail.reverse .ref-flow {
    animation-direction: reverse;
  }
  .hp-detail .spin {
    transform-box: fill-box;
    transform-origin: center;
    animation: spin linear infinite;
  }
  .hp-detail .heater.on {
    filter: drop-shadow(0 0 3px #ff7043);
  }
  @media (prefers-reduced-motion: reduce) {
    .hp-detail .ref-flow,
    .hp-detail .water-flow,
    .hp-detail .spin {
      animation: none;
    }
  }
`,Vi={in:"supply",out:"return"},Ki={primary_in:"supply",primary_out:"return",secondary_out:"supply",secondary_in:"return"},Ri={heat_pump:{hot_out:"supply",cold_in:"return"},ground_collector:{cold_in:"return",hot_out:"supply"},heating_boiler:{supply_out:"supply",return_in:"return"},solar_collector:{hot_out:"supply",cold_in:"return"},tank:{source_in:"supply",source_out:"return",coil_in:"supply",coil_out:"return",coil2_in:"supply",coil2_out:"return",supply_out:"supply",return_in:"return",hot_out:"hot_water",cold_in:"cold_water",circulation_in:"hot_water"},manifold:{supply_in:"supply",return_out:"return"},floor_heating:Vi,radiator:Vi,fancoil:Vi,mixing_valve:{hot_in:"supply",return_in:"return",mixed_out:"supply"},hydraulic_separator:Ki,plate_heat_exchanger:Ki,electric_heater:{out:"supply"},water_supply:{out:"cold_water"},dhw_outlet:{in:"hot_water"}},Ui=/^loop_(\d+)_(in|out)$/,Bi={coil2_in:"cold_water",coil2_out:"hot_water",hot_out2:"hot_water"};function qi(t,e){if("tank"===t.type&&"dual_coil"===t.variant&&Bi[e])return Bi[e];if("manifold"===t.type){const t=Ui.exec(e);if(t)return"out"===t[2]?"supply":"return"}return Ri[t.type]?.[e]}const Zi=new Set(["circulation_pump","heat_pump","heating_boiler","solar_collector"]),Fi={coil_in:["coil_out"],coil2_in:["coil2_out"],source_in:["source_out"],return_in:["supply_out"],cold_in:["hot_out"],circulation_in:["hot_out"]},Wi={primary_in:["primary_out"],secondary_in:["secondary_out"]};function Ji(t,e,o){const i=(ke(t)?.ports??[]).filter(t=>"outlet"===t.kind).map(t=>t.id);switch(t.type){case"tank":return(("dual_coil"===t.variant&&"return_in"===e?["supply_out","hot_out","hot_out2"]:Fi[e])??[]).filter(t=>i.includes(t));case"hydraulic_separator":case"plate_heat_exchanger":return Wi[e]??[];case"valve_3way":return o.valveBranch?[`out_${o.valveBranch}`]:i;case"zone_valve":return t.entity_id&&!o.active?[]:i;case"manifold":{if(Ui.test(e))return["return_out"];const t=i.filter(t=>{const e=Ui.exec(t);return e&&!1!==o.loops?.[Number(e[1])-1]});return t.length?[...t,"return_out"]:[]}default:return i}}function Yi(t,e,o){const i=new Map(t.nodes.map(t=>[t.id,t])),n=new Set,r=[...e];for(;r.length;){const e=r.pop();for(const a of t.connections.filter(t=>t.from===e)){const t=ft(a.to),e=t&&i.get(t.nodeId);if(t&&e&&!n.has(a.to)&&(n.add(a.to),o(e,t.portId)))for(const o of Ji(e,t.portId,{active:!0}))r.push(mt({nodeId:e.id,portId:o}))}}}const Xi=new Set(["coil_in","coil2_in","source_in"]);function Gi(t,e){const o=t.nodes.find(t=>t.id===e);if(!o)return;const i=(ke(o)?.ports??[]).filter(t=>"outlet"===t.kind).map(t=>mt({nodeId:e,portId:t.id}));let n;if(Yi(t,i,t=>("valve_3way"===t.type&&(n??=t),!n&&t.id!==e)),!n)return;const r=n.id,a=o=>{let i=!1;return Yi(t,[`${r}.out_${o}`],(t,o)=>{const n=Xi.has(o)&&!("dual_coil"===t.variant&&"coil2_in"===o);return"tank"===t.type&&"tank_dhw"===Rt(t)&&n&&(i=!0),!i&&t.id!==e&&t.id!==r}),i},s=a("a");return s!==a("b")?{valveId:r,branch:s?"a":"b"}:void 0}const Qi={supply:"#ef5350",return:"#42a5f5",hot_water:"#ffa726",cold_water:"#4dd0e1"},tn=[{dash:"16 24",opacity:.15},{dash:"0 6 10 24",opacity:.35},{dash:"0 11 5 24",opacity:.85}];const en=10,on={ArrowLeft:{x:-1,y:0},ArrowRight:{x:1,y:0},ArrowUp:{x:0,y:-1},ArrowDown:{x:0,y:1}};let nn=class extends dt{constructor(){super(...arguments),this.schema={nodes:[],connections:[],overlays:[]},this.editable=!1,this.drawing=!1,this.pipeStyle="orthogonal",this.pipeColors=!0,this.flowAnimation=!0,this._states=new He(this,Oe),this._formatters=new He(this,je),this._i18n=new He(this,Te)}updated(t){t.has("editable")&&this.toggleAttribute("editable",this.editable),(t.has("drawing")||t.has("editable"))&&this.toggleAttribute("drawing",this.editable&&this.drawing);const e=this.renderRoot.querySelector("dialog.detail");e&&!e.open&&e.showModal()}render(){const t=this._translator(),{nodes:e,connections:o,overlays:i}=this.schema,n=this._dragBounds??this._computeBounds(e),r=new Map(e.map(t=>[t.id,this._resolveNode(t)]));this._inferOperations(r);const a=this.pipeColors?function(t){const e=new Map(t.nodes.map(t=>[t.id,t])),o=new Map,i=new Map;for(const n of t.connections){const t=ft(n.from),r=ft(n.to),a=t&&e.get(t.nodeId),s=r&&e.get(r.nodeId);if(!(t&&r&&a&&s))continue;const l=$t(n),d=qi(a,t.portId)??qi(s,r.portId);d&&o.set(l,d);for(const e of[t.nodeId,r.nodeId])i.set(e,[...i.get(e)??[],l])}const n=t.nodes.filter(t=>!Ri[t.type]);let r=!0;for(;r;){r=!1;for(const t of n){const e=i.get(t.id)??[],n=e.map(t=>o.get(t)).find(t=>void 0!==t);if(n)for(const t of e)o.has(t)||(o.set(t,n),r=!0)}}return o}(this.schema):new Map,s=this.flowAnimation?function(t,e){const o=new Map(t.nodes.map(t=>[t.id,e(t)])),i=new Map(t.nodes.map(t=>[t.id,t])),n=new Map;for(const e of t.connections)n.set(e.from,[...n.get(e.from)??[],e]);const r=t.nodes.some(t=>"dhw_outlet"===t.type&&o.get(t.id)?.active),a=t.nodes.filter(t=>{const e=o.get(t.id);return"water_supply"===t.type?r:Zi.has(t.type)&&e?.active&&!e.pumpBound||e?.pumpActive}),s=new Set,l=a.flatMap(t=>(ke(t)?.ports??[]).filter(t=>"outlet"===t.kind).map(e=>mt({nodeId:t.id,portId:e.id})));for(;l.length;){const t=l.pop();for(const e of n.get(t)??[]){const t=$t(e);if(s.has(t))continue;s.add(t);const n=ft(e.to),r=n&&i.get(n.nodeId);if(!n||!r)continue;const a=o.get(r.id)??{active:!1};for(const t of Ji(r,n.portId,a))l.push(mt({nodeId:r.id,portId:t}))}}return s}(this.schema,t=>function(t){if(!t)return{active:!1};const e=e=>t.addons.filter(t=>t.config.type===e);return{active:t.visual.active,valveBranch:t.visual.valveBranch,pumpActive:e("pump").some(t=>t.config.entity_id&&t.state.active),pumpBound:e("pump").some(t=>t.config.entity_id),loops:e("loop").map(t=>!t.config.entity_id||t.state.active)}}(r.get(t.id))):new Set,l=o.map(t=>this._layoutPipe(t)).filter(t=>void 0!==t),d=function(t){return t.flatMap(t=>(t.points??[]).slice(1).flatMap((e,o)=>{const i=(t.points??[])[o];return i.x===e.x&&i.y!==e.y?[{id:t.id,x:i.x,y1:Math.min(i.y,e.y),y2:Math.max(i.y,e.y)}]:[]}))}(l);return B`
      <div class="stage">
      <svg
        class="schema"
        viewBox="${n.x} ${n.y} ${n.width} ${n.height}"
        role="group"
        aria-label="${t.t("a11y.schema")}"
        tabindex="${this.editable?"0":F}"
        @keydown="${this._onKeyDown}"
        @pointerdown="${this._onCanvasPointerDown}"
        @pointermove="${this._onCanvasPointerMove}"
        @pointerup="${this._onCanvasPointerUp}"
        @pointerleave="${this._onCanvasPointerLeave}"
        @pointercancel="${this._onCanvasPointerLeave}"
      >
        ${this.editable&&this.drawing?q`
            <defs>
              <pattern id="grid" width="${20}" height="${20}" patternUnits="userSpaceOnUse">
                <circle class="grid-dot" cx="0" cy="0" r="1" />
              </pattern>
            </defs>
            <rect x="${n.x}" y="${n.y}" width="${n.width}" height="${n.height}" fill="url(#grid)" aria-hidden="true" />
          `:F}
        ${l.map(t=>this._renderConnection(t,a,s,d))}
        ${e.map(e=>this._renderNode(e,t,r.get(e.id)))}
        ${i.map(t=>this._renderOverlay(t))}
      </svg>
      ${this.editable?F:this._renderPinnedDetails(t,r)}
      ${this._renderDetailDialog(t,r)}
      </div>
    `}_detailOf(t,e,o){const i=t.name||e.t("devices.heat_pump.name"),{visual:n,addons:r}=o??this._resolveNode(t);return function(t,e,o,i,n){const r=i.filter(t=>t.config.entity_id),a=t=>r.filter(e=>e.config.type===t),s=(t,e,o=!1)=>({label:t.config.name??e,text:t.state.value??"—",numeric:t.state.numeric,color:o?Ao(t.state.numeric):void 0}),l=t=>si(n.t(`slots.${t}`)),d={},c={};for(const t of r){const e=t.config.slot;e&&("temperature"===t.config.type&&(d[e]=s(t,l(e),!0)),"value"===t.config.type&&(c[e]=s(t,l(e))))}const p=a("compressor")[0];c.frequency||void 0===p?.state.numeric||(c.frequency={...s(p,l("frequency")),label:l("frequency")});const h=a("fan")[0],u=a("pump")[0],_=a("electric_heater"),v=a("setpoint")[0];return{name:t,split:"split"===e,operation:o.operation,running:o.active,fan:{...jo(o,i),reading:h?s(h,n.t("addons.fan.name")):void 0},pump:{active:u?u.state.active:o.active,label:u?.config.name??n.t("addons.pump.name")},heater:_.length?{active:_.some(t=>t.state.active),label:_[0].config.name??n.t("addons.electric_heater.name")}:void 0,compressorLabel:p?.config.name??n.t("addons.compressor.name"),temperatures:d,values:c,setpoint:v?s(v,n.t("addons.setpoint.name"),!0):void 0,performance:Vo(i)}}(i,t.variant,n,r,e)}_renderPinnedDetails(t,e){return this.schema.nodes.filter(t=>"heat_pump"===t.type&&t.detail_pin).map(o=>{const i=this._detailOf(o,t,e.get(o.id)),n=i.operation?`, ${t.t(`operation.${i.operation}`)}`:"";return B`
          <div
            class="pinned ${o.detail_pin}"
            style="--pin-size: ${function(t){const e=Number(t.detail_size??40);return Number.isFinite(e)?Math.min(80,Math.max(15,e)):40}(o)}%"
            role="button"
            tabindex="0"
            aria-label="${t.t("detail.open",i.name)}${n}"
            @click="${()=>this._openDetail(o.id)}"
            @keydown="${t=>{"Enter"!==t.key&&" "!==t.key||(t.preventDefault(),this._openDetail(o.id))}}"
          >
            ${Hi(i,t,!0)}
          </div>
        `})}_renderDetailDialog(t,e){const o=this.schema.nodes.find(t=>t.id===this._detailNodeId&&"heat_pump"===t.type);if(!o)return F;const i=this._detailOf(o,t,e.get(o.id));return B`
      <dialog
        class="detail"
        aria-label="${i.name}"
        @close="${()=>{this._detailNodeId=void 0}}"
        @click="${t=>{t.target===t.currentTarget&&t.currentTarget.close()}}"
        @keydown="${t=>{"Escape"===t.key&&t.currentTarget.close()}}"
      >
        <div class="detail-head">
          <button
            type="button"
            aria-label="${t.t("detail.close")}"
            @click="${t=>t.target.closest("dialog").close()}"
          >×</button>
        </div>
        ${Hi(i,t)}
      </dialog>
    `}_openDetail(t){this._detailNodeId=t}_translator(){return Le(this._i18n.value?.language)}_computeBounds(t){if(!t.length)return{x:0,y:0,width:800,height:400};let e=1/0,o=1/0,i=-1/0,n=-1/0;for(const r of t){const t=ke(r);if(!t)continue;const a=Ue(r,t),s=ri(oi(r.type,this._resolveAddons(r)),this._badgeWidth(a));e=Math.min(e,a.x),o=Math.min(o,a.y-28),i=Math.max(i,a.x+Math.max(a.width,s.height?this._badgeWidth(a):0)),n=Math.max(n,a.y+a.height+10+(s.height?s.height+6:0))}for(const[t,r]of this.schema.connections.flatMap(t=>t.route??[]))e=Math.min(e,t),o=Math.min(o,r),i=Math.max(i,t),n=Math.max(n,r);return{x:e-40,y:o-40,width:i-e+80,height:n-o+80}}_layoutPipe(t){const e=ft(t.from),o=ft(t.to),i=this.schema.nodes.find(t=>t.id===e?.nodeId),n=this.schema.nodes.find(t=>t.id===o?.nodeId);if(!(e&&o&&i&&n))return;const r=Re(i,e.portId),a=Re(n,o.portId);if(!r||!a)return;const s=$t(t),l=this._routePreview?.id===s?this._routePreview.route:t.route;return"curved"!==this.pipeStyle||l?.length?{connection:t,id:s,from:r,to:a,points:Fe(r,a,l),skeleton:Ze(r,a,l)}:{connection:t,id:s,from:r,to:a}}_renderConnection(t,e,o,i){const{id:n,from:r,to:a,points:s}=t,l=s?function(t,e){const o=(t,o,i,n)=>{const r=t.y===o.y&&t.x!==o.x&&e?e(i,n):[];if(!r.length)return` L ${o.x} ${o.y}`;const a=Math.sign(o.x-t.x);let s="",l=t.x;for(const e of[...r].sort((t,e)=>(t-e)*a))(e-l)*a<6||(o.x-e)*a<6||(s+=` L ${e-5*a} ${t.y} A 5 5 0 0 ${a>0?1:0} ${e+5*a} ${t.y}`,l=e+5*a);return`${s} L ${o.x} ${o.y}`};let i=`M ${t[0].x} ${t[0].y}`,n=t[0];for(let e=1;e<t.length;e++){const[r,a,s]=[t[e-1],t[e],t[e+1]];if(!s){i+=o(n,a,r,a);break}const l=Math.hypot(a.x-r.x,a.y-r.y),d=Math.hypot(s.x-a.x,s.y-a.y),c=Math.min(8,l/2,d/2),p={x:a.x-(a.x-r.x)/l*c,y:a.y-(a.y-r.y)/l*c},h={x:a.x+(s.x-a.x)/d*c,y:a.y+(s.y-a.y)/d*c};i+=`${o(n,p,r,a)} Q ${a.x} ${a.y} ${h.x} ${h.y}`,n=h}return i}(s,(t,e)=>i.filter(o=>o.id!==n&&o.x>Math.min(t.x,e.x)&&o.x<Math.max(t.x,e.x)&&t.y>o.y1+1&&t.y<o.y2-1).map(t=>t.x)):function(t,e){const o=Math.hypot(e.x-t.x,e.y-t.y),i=Math.max(30,o/2),n=t.x+t.direction.x*i,r=t.y+t.direction.y*i,a=e.x+e.direction.x*i,s=e.y+e.direction.y*i;return`M ${t.x} ${t.y} C ${n} ${r}, ${a} ${s}, ${e.x} ${e.y}`}(r,a),d=this.selectedEdgeId===n,c=e.get(n),p=this.editable&&this.drawing&&d?t.skeleton:void 0,h=p?function(t){const e=[];for(let o=1;o<t.length-2;o++)e.push(o);return e}(p):[];return q`
      <path class="pipe ${d?"selected":""}" d="${l}" aria-hidden="true"
        style="${c&&!d?`stroke: ${Qi[c]}`:""}" />
      ${o.has(n)?q`<g aria-hidden="true">
            ${tn.map(t=>q`<path class="flow" d="${l}" stroke-dasharray="${t.dash}" stroke-opacity="${t.opacity}" />`)}
          </g>`:F}
      ${this.editable?q`<path class="pipe-hit" data-edge-id="${n}" d="${l}" />`:F}
      ${h.map(t=>{const[e,o]=[(p??[])[t],(p??[])[t+1]],i=e.y===o.y;return q`<rect class="segment-handle ${i?"horizontal":"vertical"}"
          data-edge="${n}" data-segment="${t}"
          x="${(e.x+o.x)/2-5}" y="${(e.y+o.y)/2-5}" width="10" height="10" rx="2" />`})}
    `}_resolveNode(t){const e=this._resolveAddons(t),o=eo(this._states.value,t,this._formatters.value);if("heat_pump"===t.type){const i=function(t,e,o){const i=e.filter(t=>t.config.entity_id),n=t=>i.filter(e=>e.config.type===t),r=n("operation"),a=n("compressor")[0],s=new Set;n("defrost").some(t=>t.state.active)&&s.add("defrost");for(const t of r){const e=t.config.slot;if(e&&"status"!==e){t.state.active&&s.add(e);continue}const o=Oo(t.state);o&&s.add(o)}if(!r.length&&o){const e=t.hvacAction?No[t.hvacAction]:void 0;e&&s.add(e)}const l=Lo.find(t=>s.has(t));let d;d=a?a.state.active:r.length||s.size?void 0!==l:o?t.active:po(e),"defrost"===l&&(d=!0);const c=r.length>0||s.size>0;return{running:d,operation:l??(!d&&c?"idle":void 0)}}(o,e,Boolean(t.entity_id));o.active=i.running,o.operation=i.operation}else t.entity_id||(o.active=po(e));return{visual:o,addons:e}}_inferOperations(t){for(const e of this.schema.nodes){const o=t.get(e.id)?.visual;if("heat_pump"!==e.type||!o?.active)continue;const i=e.addons?.some(t=>"operation"===t.type&&t.entity_id);if(o.operation&&(i||"heating"!==o.operation))continue;const n=Gi(this.schema,e.id),r=n&&t.get(n.valveId)?.visual.valveBranch;n&&r&&(o.operation=r===n.branch?"dhw":"heating")}}_resolveAddons(t){const e=this._states.value,o=this._formatters.value;return(t.addons??[]).map((t,i)=>{const n={...eo(e,t,o),label:t.name};return{config:t,index:i,state:"binary"===Xo[t.type]?.display?lo(t,n):n}})}_isActionable(t){if(this.editable)return!1;const e=ao(this.schema,t);return void 0!==e&&(ro(e)||no(e.hold_action)||no(e.double_tap_action))}_badgeWidth(t){return Math.max(t.width,120)}_renderNode(t,e,o=this._resolveNode(t)){const i=ke(t);if(!i)return B``;const n=this.selectedNodeId===t.id,{addons:r,visual:a}=o,s=Yo(t.type,i,e,n,a,{addons:r,hideCop:t.hide_cop});if(!s)return B``;const l=De(t.rotation),d=Ue(t,i),c=i.ports.some(e=>(Re(t,e.id)?.y??1/0)<=d.y+1),p=d.y-t.position.y-(c?12:4),h=oi(t.type,r),u=t.name||e.t(i.labelKey),_=a.operation?`${u} · ${e.t(`operation.${a.operation}`)}`:u,v=this._isActionable({nodeId:t.id});return q`
      <g
        class="node ${this._dragNodeId===t.id?"dragging":""} ${v?"actionable":""}"
        data-node-id="${t.id}"
        role="${v?"button":"img"}"
        tabindex="${v?"0":F}"
        aria-label="${function(t,e,o,i,n){let r=t;if(o){const t=[e.value,e.active?n.t("a11y.active"):void 0].filter(Boolean);t.length&&(r+=`: ${t.join(", ")}`)}const a=i.filter(t=>t.config.entity_id).map(t=>`${ni(t,n)}: ${t.state.value??"—"}`);return[r,...a].join("; ")}(_,a,Boolean(t.entity_id),r,e)}"
        transform="translate(${t.position.x} ${t.position.y})"
      >
        <g transform="rotate(${l} ${i.width/2} ${i.height/2})">
          ${s}
        </g>
        ${i.hideLabel&&!t.name?F:q`<text x="${i.width/2}" y="${p}" text-anchor="middle" class="device-label">${_}</text>`}
        ${h.length?ai(h,e,d.x-t.position.x,d.y-t.position.y+d.height+6,this._badgeWidth(d)):F}
      </g>
    `}_renderOverlay(t){const e=this._states.value,o=this._formatters.value,i=Ye(e,o,t),n=function(t,e){let o,i,n=!0;if(!t||!e.rules?.length)return{color:o,className:i,visible:n};for(const r of e.rules)Qe(t,r,e.entity_id)&&(r.effect.color&&(o=Ge(r.effect.color)),r.effect.class&&(i=r.effect.class),void 0!==r.effect.visible&&(n=r.effect.visible));return{color:o,className:i,visible:n}}(e,t);if(!n.visible)return B``;const r=function(t,e,o){const i=t?.[o.entity_id];return i&&e?e.formatEntityName(i,o.name):"string"==typeof o.name?o.name:o.entity_id}(e,o,t),a=`${r}: ${i}`,s=Math.max(80,7*a.length+16),l=this._isActionable({overlayId:t.id});return q`
      <g
        class="overlay-group ${n.className??""} ${l?"actionable":""}"
        data-overlay-id="${t.id}"
        role="${l?"button":"img"}"
        tabindex="${l?"0":F}"
        aria-label="${a}"
        transform="translate(${t.position.x} ${t.position.y})"
      >
        <rect class="overlay-bg" x="0" y="0" width="${s}" height="22" rx="4" />
        <text class="overlay-text" x="8" y="15" style="${n.color?`fill: ${n.color}`:""}">
          ${a}
        </text>
      </g>
    `}_onCanvasPointerDown(t){if(!this.editable)return void this._startPress(t);const e=t.target,o=e?.getAttribute?.("data-edge"),i=e?.getAttribute?.("data-segment");if(this.drawing&&o&&i)return void this._startSegmentDrag(t,o,Number(i),e);const n=e?.getAttribute?.("data-edge-id");if(n)return void this.dispatchEvent(new CustomEvent("edge-select",{detail:{edgeId:n},bubbles:!0,composed:!0}));const r=e?.closest?.("[data-node-id]");if(!r)return void this._dispatchSelect(void 0);const a=r.getAttribute("data-node-id");if(!a)return;const s=this.schema.nodes.find(t=>t.id===a);if(!s)return;const l=e?.closest?.("[data-port-id]");if(l&&this.drawing){const e=l.getAttribute("data-port-id");if(e)return this._dispatchPortClick(a,e),void t.stopPropagation()}if(!this.drawing)return void this._dispatchSelect(a);this._dragNodeId=a;const d=this._toLocal(t);this._dragOffset=d?{x:d.x-s.position.x,y:d.y-s.position.y}:{x:0,y:0},this._dragBounds=this._computeBounds(this.schema.nodes),r.setPointerCapture(t.pointerId),this._dispatchSelect(a),t.preventDefault()}_startSegmentDrag(t,e,o,i){const n=this.schema.connections.find(t=>$t(t)===e),r=n?this._layoutPipe(n)?.skeleton:void 0,a=this._toLocal(t);r&&a&&r[o+1]&&(this._segmentDrag={id:e,index:o,horizontal:r[o].y===r[o+1].y,start:a,skeleton:r},this._dragBounds=this._computeBounds(this.schema.nodes),i?.setPointerCapture(t.pointerId),t.preventDefault(),t.stopPropagation())}_moveSegment(t){const e=this._segmentDrag,o=e&&this._toLocal(t);if(!e||!o)return;const i=e.horizontal?o.y-e.start.y:o.x-e.start.x;this._routePreview={id:e.id,route:We(e.skeleton,e.index,i,en)},this.requestUpdate()}_endSegmentDrag(){const t=this._routePreview;this._segmentDrag=void 0,this._routePreview=void 0,this._dragBounds=void 0,t&&this.dispatchEvent(new CustomEvent("connection-route",{detail:{connectionId:t.id,route:t.route},bubbles:!0,composed:!0})),this.requestUpdate()}_onKeyDown(t){if(!this.editable)return void this._onActionKey(t);const e=on[t.key],o=this.schema.nodes.find(t=>t.id===this.selectedNodeId);if(!this.editable||!e||!o)return;t.preventDefault();const i=t.shiftKey?50:10;this.dispatchEvent(new CustomEvent("node-move",{detail:{nodeId:o.id,position:{x:Je(o.position.x+e.x*i,en),y:Je(o.position.y+e.y*i,en)}},bubbles:!0,composed:!0}))}_onActionKey(t){if("Enter"!==t.key&&" "!==t.key)return;const e=t.target,o=e?.getAttribute?.("data-node-id")??void 0,i=e?.getAttribute?.("data-overlay-id")??void 0;if(!o&&!i)return;const n=ao(this.schema,{nodeId:o,overlayId:i});n&&ro(n)&&(t.preventDefault(),this._fireAction(n,"tap",o))}_toLocal(t){const e=this.renderRoot.querySelector("svg.schema"),o=e?.getScreenCTM();if(!e||!o)return;const i=e.createSVGPoint();return i.x=t.clientX,i.y=t.clientY,i.matrixTransform(o.inverse())}_onCanvasPointerMove(t){const e=this._press;if(e&&Math.hypot(t.clientX-e.x,t.clientY-e.y)>10&&this._cancelPress(),this._segmentDrag)return void this._moveSegment(t);if(!this.editable||!this._dragNodeId)return;const o=this.schema.nodes.find(t=>t.id===this._dragNodeId),i=this._toLocal(t);if(!o||!i)return;const n=this._dragOffset??{x:0,y:0},r={x:Je(i.x-n.x,en),y:Je(i.y-n.y,en)};r.x===o.position.x&&r.y===o.position.y||this.dispatchEvent(new CustomEvent("node-move",{detail:{nodeId:o.id,position:r},bubbles:!0,composed:!0}))}_onCanvasPointerUp(t){if(this._segmentDrag)this._endSegmentDrag();else if(this._press)this._endPress();else if(this._dragNodeId){const e=this.renderRoot.querySelector(`[data-node-id="${this._dragNodeId}"]`);e?.releasePointerCapture(t.pointerId),this._dragNodeId=void 0,this._dragOffset=void 0,this._dragBounds=void 0,this.requestUpdate()}}_onCanvasPointerLeave(t){this._cancelPress(),this._onCanvasPointerUp(t)}_startPress(t){const e=t.target,o=e?.closest?.("[data-node-id]")?.getAttribute("data-node-id")??void 0,i=e?.closest?.("[data-overlay-id]")?.getAttribute("data-overlay-id")??void 0,n=e?.closest?.("[data-addon-index]")?.getAttribute("data-addon-index")??void 0,r=ao(this.schema,{nodeId:o,overlayId:i,addonIndex:void 0===n||""===n?void 0:Number(n)});if(!r)return;const a={key:`${i??o}/${n??""}`,config:r,nodeId:i?void 0:o,x:t.clientX,y:t.clientY,held:!1};no(r.hold_action)&&(a.timer=window.setTimeout(()=>{a.held=!0,this._fireAction(r,"hold",a.nodeId)},500)),this._press=a}_cancelPress(){window.clearTimeout(this._press?.timer),this._press=void 0}_endPress(){const t=this._press;if(this._cancelPress(),!t||t.held)return;const{config:e,key:o,nodeId:i}=t;if(no(e.double_tap_action)){if(this._pendingTap?.key===o)return window.clearTimeout(this._pendingTap.timer),this._pendingTap=void 0,void this._fireAction(e,"double_tap",i);window.clearTimeout(this._pendingTap?.timer),this._pendingTap={key:o,timer:window.setTimeout(()=>{this._pendingTap=void 0,ro(e)&&this._fireAction(e,"tap",i)},250)}}else ro(e)&&this._fireAction(e,"tap",i)}_fireAction(t,e,o){t[`${e}_action`]?.action!==io?this.dispatchEvent(new CustomEvent("hass-action",{detail:{config:t,action:e},bubbles:!0,composed:!0})):o&&this._openDetail(o)}disconnectedCallback(){super.disconnectedCallback(),this._cancelPress(),window.clearTimeout(this._pendingTap?.timer),this._pendingTap=void 0}_dispatchSelect(t){this.dispatchEvent(new CustomEvent("node-select",{detail:{nodeId:t},bubbles:!0,composed:!0}))}_dispatchPortClick(t,e){this.dispatchEvent(new CustomEvent("port-click",{detail:{nodeId:t,portId:e},bubbles:!0,composed:!0}))}};function rn(t,e){const o=t.nodes.find(t=>t.id===e.nodeId);return o?ke(o)?.ports.find(t=>t.id===e.portId):void 0}function an(t,e,o){if(e.nodeId===o.nodeId&&e.portId===o.portId)return;const i=rn(t,e),n=rn(t,o);return i&&n&&i.kind!==n.kind?"outlet"===i.kind?{from:mt(e),to:mt(o)}:{from:mt(o),to:mt(e)}:void 0}function sn(t,e){return t.connections.some(t=>t.from===e.from&&t.to===e.to)}function ln(t,e){const o=mt(e);return t.connections.filter(t=>t.from===o||t.to===o)}function dn(t,e){const o=t.nodes.find(t=>t.id===e),i=new Set(o?(ke(o)?.ports??[]).map(t=>t.id):[]);return t.connections.filter(t=>[t.from,t.to].every(t=>{const o=ft(t);return!o||o.nodeId!==e||i.has(o.portId)}))}nn.styles=[Di,a`
    :host {
      display: block;
      width: 100%;
      overflow: auto;
    }
    svg.schema {
      width: 100%;
      min-height: 280px;
      background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
      border-radius: var(--ha-card-border-radius, 12px);
      user-select: none;
    }
    .pipe {
      fill: none;
      stroke: #78909c;
      stroke-width: 4;
      stroke-linecap: round;
    }
    .pipe.selected {
      stroke: var(--primary-color, #03a9f4);
      stroke-width: 6;
    }
    .pipe-hit {
      fill: none;
      stroke: transparent;
      stroke-width: 16;
      pointer-events: stroke;
      cursor: pointer;
    }
    .segment-handle {
      fill: var(--primary-color, #03a9f4);
      stroke: var(--card-background-color, #1c1c1c);
      stroke-width: 2;
    }
    .segment-handle.horizontal {
      cursor: row-resize;
    }
    .segment-handle.vertical {
      cursor: col-resize;
    }
    .flow {
      fill: none;
      stroke: #fff;
      stroke-width: 2.5;
      pointer-events: none;
      animation: flow 1.2s linear infinite;
    }
    @keyframes flow {
      to {
        stroke-dashoffset: -40;
      }
    }
    .grid-dot {
      fill: var(--divider-color, #555);
    }
    .spinning {
      transform-box: fill-box;
      transform-origin: center;
      animation: spin 1.6s linear infinite;
    }
    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .spinning,
      .flow {
        animation: none;
      }
    }
    .device-label {
      fill: var(--primary-text-color, #e0e0e0);
      font-size: var(--ha-font-size-xs, 11px);
      pointer-events: none;
    }
    .device-value {
      fill: var(--primary-text-color, #e0e0e0);
      font-size: var(--ha-font-size-s, 12px);
      font-weight: var(--ha-font-weight-medium, 500);
      pointer-events: none;
    }
    .node {
      cursor: default;
    }
    :host([editable]) .node {
      cursor: pointer;
    }
    :host([drawing]) .node {
      cursor: grab;
    }
    :host([drawing]) .node.dragging {
      cursor: grabbing;
    }
    :host([drawing]) svg {
      touch-action: none;
    }
    svg:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }
    .actionable:focus {
      outline: none;
    }
    .actionable:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 4px;
    }
    .overlay-group {
      pointer-events: none;
    }
    :host(:not([editable])) .actionable {
      cursor: pointer;
    }
    :host(:not([editable])) .overlay-group.actionable {
      pointer-events: auto;
    }
    .addon-value {
      font-size: var(--ha-font-size-xs, 11px);
    }
    .heating-rod.active {
      filter: drop-shadow(0 0 3px #ff7043);
    }
    .overlay-bg {
      fill: var(--card-background-color, #1c1c1c);
      stroke: var(--divider-color, #555);
      stroke-width: 1;
      opacity: 0.92;
    }
    .overlay-text {
      fill: var(--primary-text-color, #e0e0e0);
      font-size: var(--ha-font-size-s, 12px);
    }
    .port-highlight {
      stroke: var(--primary-color, #03a9f4) !important;
      stroke-width: 3 !important;
    }
    .stage {
      position: relative;
      container-type: inline-size;
    }
    .pinned {
      position: absolute;
      width: max(200px, var(--pin-size, 40%));
      max-width: 100%;
      border-radius: 14px;
      box-shadow: 0 4px 14px rgba(0, 0, 0, 0.45);
      cursor: pointer;
    }
    /* On narrow cards a corner window would be too small to read, so it goes below the schema. */
    @container (max-width: 560px) {
      .pinned {
        position: static;
        width: auto;
        margin-top: 8px;
        box-shadow: none;
      }
    }
    .pinned:focus-visible {
      outline: 2px solid var(--primary-color, #03a9f4);
      outline-offset: 2px;
    }
    .pinned.top_left {
      top: 8px;
      left: 8px;
    }
    .pinned.top_right {
      top: 8px;
      right: 8px;
    }
    .pinned.bottom_left {
      bottom: 8px;
      left: 8px;
    }
    .pinned.bottom_right {
      bottom: 8px;
      right: 8px;
    }
    dialog.detail {
      width: min(96vw, 1040px);
      max-height: 96vh;
      padding: 8px 12px 12px;
      color: var(--primary-text-color, #e0e0e0);
      background: var(--ha-card-background, var(--card-background-color, #1c1c1c));
      border: none;
      border-radius: var(--ha-card-border-radius, 12px);
      box-sizing: border-box;
    }
    dialog.detail::backdrop {
      background: rgba(0, 0, 0, 0.6);
    }
    .detail-head {
      display: flex;
      justify-content: flex-end;
    }
    .detail-head button {
      width: 36px;
      height: 36px;
      font-size: 22px;
      color: inherit;
      background: none;
      border: none;
      border-radius: 50%;
      cursor: pointer;
    }
    .detail-head button:hover {
      background: rgba(127, 127, 127, 0.2);
    }
  `],t([_t({attribute:!1})],nn.prototype,"schema",void 0),t([_t({type:Boolean})],nn.prototype,"editable",void 0),t([_t({type:Boolean})],nn.prototype,"drawing",void 0),t([_t({attribute:!1})],nn.prototype,"pipeStyle",void 0),t([_t({attribute:!1})],nn.prototype,"pipeColors",void 0),t([_t({attribute:!1})],nn.prototype,"flowAnimation",void 0),t([_t({attribute:!1})],nn.prototype,"selectedNodeId",void 0),t([_t({attribute:!1})],nn.prototype,"selectedEdgeId",void 0),t([_t({attribute:!1})],nn.prototype,"selectedPort",void 0),t([vt()],nn.prototype,"_detailNodeId",void 0),nn=t([pt("heating-schema-canvas")],nn);const cn=/^loop_(\d+)_(in|out)$/;function pn(t){const e="string"==typeof t.attributes.friendly_name?t.attributes.friendly_name:"";return hn(`${t.entity_id} ${e}`)}function hn(t){return` ${t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ")} `}const un=(t,e)=>new RegExp(` (?:${e})`).test(t);function _n(t){return t.entity_id.split(".",1)[0]}function vn(t){const e=t.attributes.device_class;return"string"==typeof e?e:void 0}const yn=[["heat ?pump|heatpump|tepeln\\w* cerpadl|tc ","heat_pump"],["buffer|akumul|nadrz","tank_buffer"],["boiler|dhw|hot ?water|tuv|bojler|zasobnik","tank_dhw"],["kotel|furnace|gas ","heating_boiler"],["solar|kolektor","solar_collector"],["manifold|rozdelovac","manifold"],["floor|podlah","floor_heating"],["fan ?coil|fancoil|konvektor","fancoil"],["radiator|trv|hlavic","radiator"],["mixing|smesov","mixing_valve"],["3 ?way|diverter|trojcest|tricest|prepinac","valve_3way"],["pump|cerpadl","circulation_pump"],["outdoor|outside|venkov","outdoor_temperature"]],mn=new Set(["temperature","pressure","volume_flow_rate","energy","power"]),fn=new Set(["circulation_pump","outdoor_temperature"]);function $n(t){const e=yn.find(([e])=>un(t,e))?.[1];return e&&!fn.has(e)?e:void 0}const gn=new Set(["heat_pump","heating_boiler","solar_collector"]);function bn(t){const e=pn(t),o=_n(t),i=vn(t);if("problem"===i||un(e,"alarm|fault|error|porucha|chyba"))return"alarm";if("window"===i||"opening"===i||un(e,"window|okno"))return"window";if(un(e,"defrost|odmraz|odtav"))return"defrost";if(un(e,"heater|heating element|backup|booster|spiral|topn\\w* tyc|bivalen"))return"electric_heater";if(un(e,"pump|cerpadl"))return"pump";if(un(e,"compressor|kompresor"))return un(e,"current|proud|voltage|napeti")?"value":"compressor";const n="binary_sensor"!==o||un(e,"heating|topeni|dhw|hot water|tuv|cool|chlaz");return un(e,"operating|operation|hvac action|provozni stav")||un(e,"status|stav")&&n?"operation":"fan"===o||un(e,"fan|ventilator")?"fan":"select"===o||"input_select"===o||"enum"===i||un(e,"mode|rezim")?"mode":"number"===o||"input_number"===o||un(e,"setpoint|target|pozadovan|zadan")?"setpoint":"valve"===o||un(e,"actuator|pohon|valve|ventil")?"actuator":"temperature"===i?"temperature":"sensor"===o&&Number.isFinite(Number(t.state))?"value":void 0}const xn={top:"top|nahore|horni",upper:"upper",middle:"middle|stred|uprostred",lower:"lower",bottom:"bottom|dole|spodni|dolni",supply:"supply|flow|outlet|leaving|vystup|privod|topna voda|t1 ",return:"return|inlet|entering|vratk|zpatec|vstup|tw ?in|twin",outdoor:"outdoor|outside|ambient|venkov|t4 ",evaporator:"evaporator|vyparnik|coil|t3 ",room:"room|indoor|inside|mistnost|pokoj|vnitrni",floor:"floor|podlah",mixed:"mixed|smis",inlet:"inlet|vstup",outlet:"outlet|vystup",collector:"collector|panel|kolektor",status:"operating|operation|status|state|stav|provoz|hvac",heating:"heating|topeni",dhw:"dhw|hot water|domestic|tuv|tepla voda",cooling:"cool|chlaz",hx_outlet:"tw ?out|twout|plate|deskov|vymenik|heat exchanger|hx ",suction:"suction|sani|th ",discharge:"discharge|vytlak|tp ",refrigerant_gas:"t2b|gas|plyn",refrigerant_liquid:"t2 |liquid|kapal",inverter:"tf |inverter|module|modul|menic|ipm",frequency:"frequency|frekvenc|hz ",compressor_current:"compressor current|kompresor\\w* proud",high_pressure:"high pressure|pressure high|vysok\\w* tlak|discharge pressure",low_pressure:"low pressure|pressure low|nizk\\w* tlak|suction pressure",voltage:"voltage|napeti",current:"current|proud",power:"power|prikon|consumption|spotreb",flow:"flow|prutok",heat_output:"heat output|heating capacity|thermal power|topny vykon|vykon",cop:"cop "},wn=new Set(["status","supply","return","current","power"]);function kn(t,e,o,i=!1){const n=pn(t),r=e.filter(t=>!o.has(t)),a=[...r.filter(t=>!wn.has(t)),...r.filter(t=>wn.has(t))];return a.find(t=>xn[t]&&un(n,xn[t]))??(i?void 0:r[0])}const An=()=>Array.from({length:4},()=>({type:"loop"})),Mn=[{id:"heat_pump_floor",nodes:[{id:"hp",type:"heat_pump",x:0,y:20},{id:"pump",type:"circulation_pump",x:240,y:15},{id:"manifold",type:"manifold",x:400,y:30,addons:An()}],connections:[["hp.hot_out","pump.in"],["pump.out","manifold.supply_in"],["manifold.return_out","hp.cold_in"]]},{id:"heat_pump_dhw_floor",nodes:[{id:"hp",type:"heat_pump",x:0,y:140},{id:"valve",type:"valve_3way",x:240,y:130},{id:"dhw",type:"tank",x:420,y:0,addons:[{type:"heat_exchanger"},{type:"dhw"}]},{id:"pump",type:"circulation_pump",x:420,y:220},{id:"manifold",type:"manifold",x:580,y:220,addons:An()}],connections:[["hp.hot_out","valve.in"],["valve.out_a","dhw.coil_in"],["dhw.coil_out","hp.cold_in"],["valve.out_b","pump.in"],["pump.out","manifold.supply_in"],["manifold.return_out","hp.cold_in"]]},{id:"heat_pump_buffer_radiators",nodes:[{id:"hp",type:"heat_pump",x:0,y:40},{id:"buffer",type:"tank",x:260,y:0,addons:[{type:"direct_source"},{type:"direct_heating"}]},{id:"pump",type:"circulation_pump",x:440,y:0},{id:"radiator",type:"radiator",x:600,y:20}],connections:[["hp.hot_out","buffer.source_in"],["buffer.source_out","hp.cold_in"],["buffer.supply_out","pump.in"],["pump.out","radiator.in"],["radiator.out","buffer.return_in"]]},{id:"boiler_radiators",nodes:[{id:"boiler",type:"heating_boiler",x:0,y:0},{id:"pump",type:"circulation_pump",x:180,y:0},{id:"radiator",type:"radiator",x:340,y:10}],connections:[["boiler.supply_out","pump.in"],["pump.out","radiator.in"],["radiator.out","boiler.return_in"]]}];function Sn(t,e,o){const i=new Set(e.nodes.map(t=>t.id)),n=new Map;for(const e of t.nodes){let t=o(e.id);for(;i.has(t);)t=o(e.id);i.add(t),n.set(e.id,t)}const r=function(t){return t.reduce((t,e)=>{const o=ke(e)?.height??0;return Math.max(t,e.position.y+o+60)},0)}(e.nodes),a=t.nodes.map(t=>({id:n.get(t.id)??t.id,type:t.type,position:{x:40+t.x,y:40+r+t.y},addons:t.addons?.map(t=>({...t}))})),s=t=>{const e=t.indexOf(".");return`${n.get(t.slice(0,e))??t.slice(0,e)}${t.slice(e)}`};return{nodes:a,connections:t.connections.map(([t,e])=>({from:s(t),to:s(e)}))}}const zn=new Set(["heat_pump","heating_boiler","solar_collector"]);function In(t){const e=function(t){const e=new Map(t.nodes.map(t=>[t.id,t])),o=[];for(const i of t.connections){const t=ft(i.from),n=ft(i.to),r=t&&e.get(t.nodeId);if(!(t&&n&&r&&e.has(n.nodeId)&&t.nodeId!==n.nodeId))continue;const a=ke(r)?.ports.find(e=>e.id===t.portId);o.push({from:t.nodeId,to:n.nodeId,order:a?.position.y??0})}return o}(t),o=new Map,i=new Set(e.map(t=>t.to)),n=new Set(e.flatMap(t=>[t.from,t.to]));for(const t of e)o.set(t.from,[...o.get(t.from)??[],t]);for(const t of o.values())t.sort((t,e)=>t.order-e.order);const r=new Map,a=t=>{let e=[t];for(r.set(t,0);e.length;){const t=[];for(const i of e)for(const e of o.get(i)??[])r.has(e.to)||(r.set(e.to,(r.get(i)??0)+1),t.push(e.to));e=t}},s=t.nodes.filter(t=>n.has(t.id)),l=[...s.filter(t=>zn.has(t.type)),...s.filter(t=>!i.has(t.id)),...s];for(const t of l)r.has(t.id)||a(t.id);const d=[];for(const[t,e]of r)d[e]=[...d[e]??[],t];return{columns:d.filter(t=>t.length),unconnected:t.nodes.filter(t=>!n.has(t.id)).map(t=>t.id)}}function Cn(t,e,o){const i=ke(t);if(!i)return t;const n=Ue({...t,position:{x:0,y:0}},i);return{...t,position:{x:Je(e-n.x,10),y:Je(o-n.y,10)}}}function Pn(t){const e=ke(t);return e?Ue(t,e):{width:0,height:0}}const En=new Set(["friendly_name","icon","entity_picture","supported_features","device_class","unit_of_measurement","state_class","attribution","assumed_state","restored","editable","id"]),Nn=["on","off","heat","heating","open","idle"],Ln=["options","hvac_modes","operation_list","preset_modes","fan_modes"];function On(t){const e=t.attributes.friendly_name;return"string"==typeof e&&e?e:t.entity_id}function jn(t,e){return e?t.entities?.[e]?.device_id??void 0:void 0}function Tn(t,e={}){if(!t)return[];const o=e.deviceId??jn(t,e.relatedTo),i=Object.values(t.states).map(i=>{const n=i.entity_id.split(".",1)[0],r=i.attributes.device_class;let a=0;return o&&jn(t,i.entity_id)===o&&(a+=4),e.domains?.includes(n)&&(a+=2),"string"==typeof r&&e.deviceClasses?.includes(r)&&(a+=1),{entity:i,score:a,name:On(i)}});return i.sort((t,e)=>e.score-t.score||t.name.localeCompare(e.name)),i.map(({entity:t,name:e})=>({value:t.entity_id,label:e}))}function Hn(t,e){const o=e?t?.states[e]:void 0;return o?Object.keys(o.attributes).filter(t=>!En.has(t)).sort().map(t=>({value:t,label:String(o.attributes[t])})):[]}function Dn(t,e,o){const i=e?t?.states[e]:void 0,n=new Set;if(i){const t=o?i.attributes[o]:i.state;if(null!=t&&n.add(String(t)),!o){for(const t of Ln){const e=i.attributes[t];Array.isArray(e)&&e.forEach(t=>n.add(String(t)))}const t=i.attributes.hvac_action;"string"==typeof t&&n.add(t)}}return Nn.forEach(t=>n.add(t)),[...n].map(t=>({value:t}))}function Vn(t,e){const o=t?jn(t,e):void 0,i=o?t?.devices?.[o]:void 0;return i?.name_by_user||i?.name||void 0}function Kn(t,e){const o=e?t?.states[e]:void 0;if(!o||!t)return;const i="function"==typeof t.formatEntityState?t.formatEntityState(o):o.state;return`${On(o)} · ${i}`}function Rn(t){return t.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()}function Un(t,e,o=50){const i=Rn(e).split(/\s+/).filter(Boolean),n=i.length?t.filter(t=>{const e=Rn(`${t.value} ${t.label??""}`);return i.every(t=>e.includes(t))}):t;return n.slice(0,o)}let Bn=0,qn=class extends dt{constructor(){super(...arguments),this.kind="text",this.label="",this.options=[],this.strict=!1,this._open=!1,this._query="",this._typed=!1,this._active=-1,this._listId="hv-list-"+ ++Bn,this._inputId=`hv-input-${Bn}`}render(){if("boolean"===this.kind)return B`
        <label class="check">
          <input type="checkbox" .checked="${Boolean(this.value)}" @change="${this._onCheck}" />
          ${this.label}
        </label>
        ${this._renderHelper()}
      `;if("select"===this.kind){const t=void 0===this.value?"":String(this.value);return B`
        <label for="${this._inputId}">${this.label}</label>
        <select id="${this._inputId}" @change="${this._onInput}">
          ${this.options.map(e=>B`<option value="${e.value}" ?selected="${e.value===t}">${e.label??e.value}</option>`)}
        </select>
        ${this._renderHelper()}
      `}return"combo"===this.kind?this._renderCombo():B`
      <label for="${this._inputId}">${this.label}</label>
      <input
        id="${this._inputId}"
        type="${"number"===this.kind?"number":"text"}"
        step="any"
        autocomplete="off"
        placeholder="${this.placeholder??""}"
        .value="${void 0===this.value?"":String(this.value)}"
        @change="${this._onInput}"
      />
      ${this._renderHelper()}
    `}_matches(){return Un(this.options,this._typed?this._query:"")}_renderCombo(){const t=this._open?this._matches():[],e=this._displayValue();return B`
      <label for="${this._inputId}">${this.label}</label>
      <input
        id="${this._inputId}"
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        aria-expanded="${this._open}"
        aria-controls="${this._listId}"
        aria-activedescendant="${this._active>=0?`${this._listId}-${this._active}`:F}"
        placeholder="${this.placeholder??""}"
        .value="${this._open?this._query:e}"
        @focus="${this._onFocus}"
        @input="${this._onType}"
        @keydown="${this._onKey}"
        @blur="${this._onBlur}"
      />
      ${this._open?B`<ul id="${this._listId}" class="listbox" role="listbox">
            ${t.length?t.map((t,e)=>B`<li
                    id="${this._listId}-${e}"
                    role="option"
                    class="${e===this._active?"active":""}"
                    aria-selected="${e===this._active}"
                    @mousedown="${t=>t.preventDefault()}"
                    @click="${()=>this._select(t.value)}"
                  >
                    <span>${t.label??t.value}</span>
                    ${t.label?B`<span class="option-value">${t.value}</span>`:F}
                  </li>`):B`<li class="empty" role="presentation">—</li>`}
          </ul>`:F}
      ${this._renderHelper()}
    `}updated(t){t.has("_active")&&this._active>=0&&this.renderRoot.querySelector("li.active")?.scrollIntoView({block:"nearest"})}_displayValue(){if(void 0===this.value)return"";const t=String(this.value);return this.strict?this.options.find(e=>e.value===t)?.label??t:t}_onFocus(){this._query=this._displayValue(),this._typed=!1,this._active=-1,this._open=!0}_onType(t){this._query=t.target.value,this._typed=!0,this._active=-1,this._open=!0}_onKey(t){const e=this._matches();switch(t.key){case"ArrowDown":t.preventDefault(),this._open=!0,this._active=Math.min(this._active+1,e.length-1);break;case"ArrowUp":t.preventDefault(),this._active=Math.max(this._active-1,0);break;case"Enter":t.preventDefault(),this._open&&this._active>=0&&e[this._active]?this._select(e[this._active].value):this._commitTyped();break;case"Escape":this._open&&(t.preventDefault(),t.stopPropagation(),this._open=!1)}}_onBlur(){this._open&&this._commitTyped()}_commitTyped(){if(this._open=!1,!this._typed)return;const t=this._query.trim();if(""===t)this._emit(void 0);else if(this.strict){const e=Un(this.options,t,1)[0];e&&this._emit(e.value)}else this._emit(t)}_select(t){this._query=t,this._typed=!1,this._open=!1,this._emit(t)}_renderHelper(){return this.helper?B`<div class="helper">${this.helper}</div>`:F}_onCheck(t){this._emit(t.target.checked)}_onInput(t){const e=t.target.value.trim();"number"===this.kind?this._emit(""===e?void 0:Number(e)):this._emit(""===e?void 0:e)}_emit(t){this.dispatchEvent(new CustomEvent("hv-change",{detail:{value:t}}))}};qn.styles=a`
    :host {
      display: block;
      margin-bottom: 10px;
    }
    label {
      display: block;
      margin-bottom: 4px;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
    }
    input:not([type="checkbox"]),
    select {
      box-sizing: border-box;
      width: 100%;
      min-height: 40px;
      padding: 8px 10px;
      font: inherit;
      color: var(--primary-text-color);
      background: var(--ha-color-form-background, var(--secondary-background-color));
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-border-radius-md, 8px);
    }
    input:focus-visible,
    select:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -1px;
    }
    .check {
      display: flex;
      gap: 8px;
      align-items: center;
      font-size: inherit;
      color: var(--primary-text-color);
    }
    .check input {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
    }
    .helper {
      margin-top: 3px;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
    }
    .listbox {
      max-height: 240px;
      margin: 4px 0 0;
      padding: 4px 0;
      overflow-y: auto;
      list-style: none;
      background: var(--card-background-color);
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-border-radius-md, 8px);
      box-shadow: var(--ha-box-shadow-m, 0 2px 8px rgba(0, 0, 0, 0.3));
    }
    .listbox li {
      display: flex;
      flex-direction: column;
      padding: 6px 10px;
      cursor: pointer;
    }
    .listbox li.active,
    .listbox li:hover {
      background: var(--secondary-background-color);
    }
    .option-value {
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
    }
    .empty {
      padding: 6px 10px;
      color: var(--secondary-text-color);
    }
  `,t([_t()],qn.prototype,"kind",void 0),t([_t()],qn.prototype,"label",void 0),t([_t()],qn.prototype,"helper",void 0),t([_t()],qn.prototype,"placeholder",void 0),t([_t({attribute:!1})],qn.prototype,"value",void 0),t([_t({attribute:!1})],qn.prototype,"options",void 0),t([_t({type:Boolean})],qn.prototype,"strict",void 0),t([vt()],qn.prototype,"_open",void 0),t([vt()],qn.prototype,"_query",void 0),t([vt()],qn.prototype,"_typed",void 0),t([vt()],qn.prototype,"_active",void 0),qn=t([pt("hv-field")],qn);const Zn={key:"entity_id",label:"editor.entity"},Fn={key:"entity_id",label:"editor.state_entity",helper:"editor.state_entity_helper"},Wn={key:"entity_id",label:"editor.value_entity"},Jn={key:"active_state",label:"editor.active_state",helper:"editor.active_state_helper"},Yn={key:"value_attribute",label:"editor.value_attribute",helper:"editor.value_attribute_helper"},Xn={key:"mode_attribute",label:"editor.position_attribute",helper:"editor.position_attribute_helper"};const Gn=4,Qn=200,tr=180,er=40,or=40,ir=["orthogonal","curved"],nr=["more-info","toggle","navigate","none"],rr=["tap_action","hold_action","double_tap_action"];function ar(t,e){const o={};return o[t]=e,o}const sr=["climate","water_heater","valve","fan","switch","sensor","binary_sensor"],lr=["primary","accent","red","pink","purple","indigo","blue","light-blue","cyan","teal","green","light-green","lime","yellow","amber","orange","deep-orange","brown","grey","blue-grey"],dr=t=>"string"==typeof t.detail.value?t.detail.value:void 0,cr=t=>"number"==typeof t.detail.value&&Number.isFinite(t.detail.value)?t.detail.value:void 0;let pr=class extends dt{constructor(){super(...arguments),this._tab="schema",this._view={kind:"list"},this._newDeviceType=Qt.type,this._templateId=Mn[0].id,this._drawing=!1}set hass(t){this._hass=t}get hass(){return this._hass}setConfig(t){this._config=Ie(t)}render(){if(!this._config)return B``;const t=Le(this._hass?.language),e=bt(this._config);return B`
      <div class="editor">
        <div class="tabs" role="tablist">
          ${this._renderTab(t,"schema","editor.schema_tab")}
          ${this._renderTab(t,"overlays","editor.overlay_tab")}
        </div>
        ${"schema"===this._tab?this._renderSchemaTab(t,e):this._renderOverlaysTab(t,e)}
      </div>
    `}_renderTab(t,e,o){return B`
      <button
        type="button"
        role="tab"
        aria-selected="${this._tab===e}"
        @click="${()=>{this._tab=e}}"
      >${t.t(o)}</button>
    `}_renderSchemaTab(t,e){const o=this._view,i="list"===o.kind?void 0:e.nodes.find(t=>t.id===o.nodeId);if(i&&"addon"===o.kind){const n=i.addons?.[o.index];if(n)return this._renderAddonView(t,e,i,n,o.index)}return i?this._renderNodeView(t,e,i):this._renderListView(t,e)}_renderCanvas(t,e){return B`
      <div class="toolbar">
        <button
          type="button"
          class="${this._drawing?"primary":""}"
          aria-pressed="${this._drawing}"
          @click="${this._toggleDrawing}"
        >✎ ${t.t("editor.drawing_mode")}</button>
        <span class="hint" style="flex: 1">
          ${t.t(this._drawing?"editor.drawing_hint":"editor.select_hint")}
        </span>
      </div>
      <heating-schema-canvas
        .schema="${e}"
        .editable="${!0}"
        .drawing="${this._drawing}"
        .pipeStyle="${this._pipeStyle()}"
        .pipeColors="${!1!==this._config?.pipe_colors}"
        .flowAnimation="${!1!==this._config?.flow_animation}"
        .selectedNodeId="${this._selectedNodeId}"
        .selectedEdgeId="${this._selectedEdgeId}"
        .selectedPort="${this._pendingPort}"
        @node-select="${this._onNodeSelect}"
        @edge-select="${this._onEdgeSelect}"
        @node-move="${this._onNodeMove}"
        @port-click="${this._onPortClick}"
        @connection-route="${this._onConnectionRoute}"
      ></heating-schema-canvas>
      ${this._pendingPort?B`<p class="notice" role="status">
            ${t.t("editor.connection_pending",this._portRefLabel(t,e,this._pendingPort))}
          </p>`:F}
      ${this._selectedEdgeId?B`<div class="toolbar">
            <button type="button" class="danger" @click="${this._deleteSelectedConnection}">
              ${t.t("editor.delete_connection")}
            </button>
            ${e.connections.find(t=>$t(t)===this._selectedEdgeId)?.route?B`<button type="button" @click="${()=>this._setRoute(this._selectedEdgeId,void 0)}">
                  ${t.t("editor.reset_route")}
                </button>`:F}
            ${this._drawing?B`<span class="hint">${t.t("editor.route_hint")}</span>`:F}
          </div>`:F}
    `}_renderListView(t,e){const o=function(t){return t.connections.filter(e=>{const o=ft(e.from),i=ft(e.to);return!o||!i||"outlet"!==rn(t,o)?.kind||"inlet"!==rn(t,i)?.kind})}(e);return B`
      <div class="toolbar">
        <select
          aria-label="${t.t("editor.device_type")}"
          @change="${t=>{this._newDeviceType=t.target.value}}"
        >
          ${ge.map(e=>B`<option value="${e.id}" ?selected="${e.id===this._newDeviceType}">
              ${t.t(e.labelKey)}
            </option>`)}
        </select>
        <button type="button" class="primary" @click="${()=>this._addDevice(this._newDeviceType)}">
          ${t.t("editor.add_device")}
        </button>
      </div>
      <div class="toolbar">
        <select
          aria-label="${t.t("editor.template")}"
          @change="${t=>{this._templateId=t.target.value}}"
        >
          ${Mn.map(e=>B`<option value="${e.id}" ?selected="${e.id===this._templateId}">
              ${t.t(`templates.${e.id}`)}
            </option>`)}
        </select>
        <button type="button" @click="${this._insertTemplate}">${t.t("editor.insert_template")}</button>
      </div>
      ${e.nodes.length>1?B`<div class="toolbar">
            <button type="button" @click="${this._autoLayout}">${t.t("editor.auto_layout")}</button>
            ${this._layoutUndo?B`<button type="button" @click="${this._undoLayout}">${t.t("editor.undo_layout")}</button>`:F}
            <select
              aria-label="${t.t("editor.pipe_style")}"
              @change="${t=>this._setPipeStyle(t.target.value)}"
            >
              ${ir.map(e=>B`<option value="${e}" ?selected="${e===this._pipeStyle()}">
                  ${t.t(`editor.pipe_style_${e}`)}
                </option>`)}
            </select>
            ${["pipe_colors","flow_animation"].map(e=>B`<label class="check">
                <input
                  type="checkbox"
                  .checked="${!1!==this._config?.[e]}"
                  @change="${t=>this._setDisplayOption(e,t.target.checked)}"
                />
                ${t.t(`editor.${e}`)}
              </label>`)}
          </div>`:F}
      ${this._renderAddFromEntity(t)}

      ${this._renderCanvas(t,e)}

      ${o.length?B`<p class="warning" role="alert">
            ${t.t("editor.invalid_connections",String(o.length))}
            <button type="button" @click="${()=>this._removeConnections(o)}">
              ${t.t("editor.remove_invalid")}
            </button>
          </p>`:F}

      ${e.nodes.length?B`
            <h3>${t.t("editor.devices_title")}</h3>
            <ul class="list">
              ${e.nodes.map(o=>this._renderNodeRow(t,e,o))}
            </ul>
          `:B`<p class="hint">${t.t("editor.empty_hint")}</p>`}
    `}_renderAddFromEntity(t){const e=this._hass;if(!e)return F;const o=this._entityToAdd?e.states[this._entityToAdd]:void 0,i=this._entityDeviceType??(o?function(t){const e=pn(t),o=_n(t),i=yn.find(([t])=>un(e,t))?.[1];return i||("water_heater"===o?"tank_dhw":"climate"===o?"radiator":"valve"===o?"zone_valve":"fan"===o?"fancoil":"sensor"===o&&mn.has(vn(t)??"")?"pipe_sensor":void 0)}(o):void 0);return B`
      <section class="card">
        <hv-field
          kind="combo"
          .label="${t.t("editor.add_from_entity")}"
          .helper="${Kn(e,this._entityToAdd)??t.t("editor.add_from_entity_helper")}"
          .options="${Tn(e,{domains:sr})}"
          .value="${this._entityToAdd}"
          @hv-change="${t=>{this._entityToAdd=dr(t),this._entityDeviceType=void 0}}"
        ></hv-field>
        ${o?B`<div class="toolbar">
              <select
                aria-label="${t.t("editor.device_type")}"
                @change="${t=>{this._entityDeviceType=t.target.value||void 0}}"
              >
                ${i?F:B`<option value="" selected>${t.t("editor.choose_type")}</option>`}
                ${ge.map(e=>B`<option value="${e.id}" ?selected="${e.id===i}">
                    ${t.t(e.labelKey)}
                  </option>`)}
              </select>
              <button
                type="button"
                class="primary"
                ?disabled="${!i}"
                @click="${()=>{i&&this._addDevice(i,o.entity_id)}}"
              >${t.t("editor.add_device")}</button>
            </div>`:F}
      </section>
    `}_renderNodeRow(t,e,o){const[i,n]=function(t,e){const o=ke(e)?.ports??[],i=o.filter(o=>ln(t,{nodeId:e.id,portId:o.id}).length).length;return[i,o.length]}(e,o),r=[o.entity_id?Kn(this._hass,o.entity_id)??o.entity_id:t.t("editor.no_entity")];return n&&r.push(t.t("editor.ports_connected",String(i),String(n))),o.addons?.length&&r.push(t.t("editor.addon_count",String(o.addons.length))),B`
      <li>
        <button
          type="button"
          class="row ${o.id===this._selectedNodeId?"selected":""}"
          @click="${()=>this._openNode(o.id)}"
        >
          <span class="row-main">
            <span>${this._nodeName(t,o)}</span>
            <span class="row-sub">${r.join(" · ")}</span>
          </span>
          <span aria-hidden="true">›</span>
        </button>
      </li>
    `}_renderHeader(t,e,o){return B`
      <div class="header">
        <button type="button" class="icon" aria-label="${t.t("editor.back")}" @click="${o}">‹</button>
        <h3>${e}</h3>
      </div>
    `}_renderNodeView(t,e,o){const i=o,n=ke(o);return B`
      ${this._renderHeader(t,this._nodeName(t,o),()=>this._openList())}
      ${this._renderCanvas(t,e)}

      <section class="card">
        <hv-field
          .label="${t.t("editor.name")}"
          .helper="${t.t("editor.name_helper")}"
          .placeholder="${t.t(n?.labelKey??`devices.${o.type}.name`)}"
          .value="${o.name}"
          @hv-change="${t=>this._patchNode(o.id,{name:dr(t)})}"
        ></hv-field>
        ${n?.variants&&o.variant!==Gt?B`<hv-field
              kind="select"
              .label="${t.t("editor.variant")}"
              .options="${n.variants.map(e=>({value:e,label:t.t(`devices.${o.type}.variants.${e}`)}))}"
              .value="${o.variant??n.variants[0]}"
              @hv-change="${t=>this._setVariant(o.id,dr(t),n.variants?.[0])}"
            ></hv-field>`:F}
        ${"heat_pump"===o.type?B`<hv-field
              kind="select"
              .label="${t.t("editor.detail_pin")}"
              .helper="${t.t("editor.detail_pin_helper")}"
              .options="${[{value:"",label:t.t("editor.detail_pin_none")},...yt.map(e=>({value:e,label:t.t(`editor.detail_pin_${e}`)}))]}"
              .value="${o.detail_pin??""}"
              @hv-change="${t=>this._patchNode(o.id,{detail_pin:dr(t)})}"
            ></hv-field>
            ${o.detail_pin?B`<hv-field
                  kind="number"
                  .label="${t.t("editor.detail_size")}"
                  .helper="${t.t("editor.detail_size_helper",String(15),String(80))}"
                  .placeholder="${String(40)}"
                  .value="${o.detail_size}"
                  @hv-change="${t=>this._patchNode(o.id,{detail_size:cr(t)})}"
                ></hv-field>`:F}
            <hv-field
              kind="boolean"
              .label="${t.t("editor.show_cop")}"
              .helper="${t.t("editor.show_cop_helper")}"
              .value="${!o.hide_cop}"
              @hv-change="${t=>this._patchNode(o.id,{hide_cop:!t.detail.value||void 0})}"
            ></hv-field>`:F}
        ${n?.volume?B`<hv-field
              kind="number"
              .label="${t.t("editor.volume")}"
              .helper="${t.t("editor.volume_helper")}"
              .placeholder="${String(200)}"
              .value="${o.volume}"
              @hv-change="${t=>{const e=cr(t);this._patchNode(o.id,{volume:e&&e>0?e:void 0})}}"
            ></hv-field>`:F}
        ${n?.volume?B`<hv-field
              kind="number"
              .label="${t.t("editor.tank_size")}"
              .helper="${t.t("editor.tank_size_helper")}"
              .placeholder="100"
              .value="${void 0===o.scale?void 0:Math.round(100*o.scale)}"
              @hv-change="${t=>{const e=cr(t),i=e&&e>0?Math.min(2,Math.max(.5,e/100)):void 0;this._patchNode(o.id,{scale:1===i?void 0:i})}}"
            ></hv-field>`:F}
        <hv-field
          kind="combo"
          strict
          .label="${t.t("editor.ha_device")}"
          .helper="${t.t("editor.ha_device_helper")}"
          .options="${function(t){if(!t?.devices)return[];const e=new Set(Object.values(t.entities??{}).map(t=>t.device_id));return Object.values(t.devices).filter(t=>e.has(t.id)).map(t=>({value:t.id,label:t.name_by_user||t.name||t.id})).sort((t,e)=>t.label.localeCompare(e.label))}(this._hass)}"
          .value="${o.device_id}"
          @hv-change="${t=>this._patchNode(o.id,{device_id:dr(t)})}"
        ></hv-field>
        ${this._renderBinding(t,i,function(t){const e=we(t)?.valueDisplay;return"only"===e?[Wn,Yn]:"with_state"===e?[Fn,Jn,Yn]:"mixing_valve"===t?[{...Zn,label:"editor.actuator_entity"},Xn]:"valve_3way"===t?[Zn,Jn,{key:"mode_attribute",label:"editor.valve_attribute",helper:"editor.valve_attribute_helper"},{key:"branch_a_value",label:"editor.branch_a",helper:"editor.branch_a_helper"},{key:"branch_b_value",label:"editor.branch_b",helper:"editor.branch_b_helper"}]:[Fn,Jn]}(o.type),{deviceId:o.device_id},t=>this._patchNode(o.id,t))}
      </section>

      ${this._renderAddons(t,o)}
      ${this._renderSuggestions(t,o)}
      ${this._renderConnections(t,e,o)}
      ${this._renderActions(t,o,t=>this._patchNode(o.id,t),"heat_pump"===o.type?[io]:[])}

      <section class="card">
        <h3>${t.t("editor.position_title")}</h3>
        <div class="grid2">
          <hv-field
            kind="number"
            label="X"
            .value="${o.position.x}"
            @hv-change="${t=>this._moveNode(o.id,{x:cr(t)})}"
          ></hv-field>
          <hv-field
            kind="number"
            label="Y"
            .value="${o.position.y}"
            @hv-change="${t=>this._moveNode(o.id,{y:cr(t)})}"
          ></hv-field>
        </div>
        <div class="toolbar">
          <button type="button" class="icon" aria-label="${t.t("editor.move_left")}" @click="${()=>this._nudge(o,-1,0)}">←</button>
          <button type="button" class="icon" aria-label="${t.t("editor.move_up")}" @click="${()=>this._nudge(o,0,-1)}">↑</button>
          <button type="button" class="icon" aria-label="${t.t("editor.move_down")}" @click="${()=>this._nudge(o,0,1)}">↓</button>
          <button type="button" class="icon" aria-label="${t.t("editor.move_right")}" @click="${()=>this._nudge(o,1,0)}">→</button>
          <button type="button" @click="${()=>this._rotateNode(o.id)}">↻ ${t.t("editor.rotate")}</button>
          <button type="button" class="danger" @click="${()=>this._deleteNode(o.id)}">
            ${t.t("editor.delete_device")}
          </button>
        </div>
      </section>
    `}_renderBinding(t,e,o,i,n){return B`${o.map(o=>{const{kind:r,options:a,helper:s}=this._fieldSource(t,e,o,i);return B`
        <hv-field
          .kind="${r}"
          .label="${t.t(o.label)}"
          .helper="${s}"
          .options="${a}"
          .value="${e[o.key]}"
          @hv-change="${t=>n({[o.key]:dr(t)})}"
        ></hv-field>
      `})}`}_fieldSource(t,e,o,i){const n=this._hass,r=o.helper?t.t(o.helper):void 0;switch(o.key){case"entity_id":case"temperature_entity_id":return{kind:"combo",options:Tn(n,i),helper:Kn(n,e[o.key])??r};case"value_attribute":case"mode_attribute":return{kind:"combo",options:Hn(n,e.entity_id),helper:r};case"branch_a_value":case"branch_b_value":return{kind:"combo",options:Dn(n,e.entity_id,e.mode_attribute),helper:r};default:return{kind:"combo",options:Dn(n,e.entity_id),helper:r}}}_renderActions(t,e,o,i=[]){const n=[...i,...nr];return B`
      <section class="card">
        <h3>${t.t("editor.actions_title")}</h3>
        ${rr.map(i=>{const r=e[i],a=r&&!n.includes(r.action)?[...n,r.action]:n,s=[{value:"",label:t.t("tap_action"===i?"editor.action_default_tap":"editor.action_default")},...a.map(e=>({value:e,label:n.includes(e)?t.t(`editor.action_${e.replace("-","_")}`):e}))];return B`
            <hv-field
              kind="select"
              .label="${t.t(`editor.${i}`)}"
              .options="${s}"
              .value="${r?.action??""}"
              @hv-change="${t=>{const e=dr(t);o(ar(i,e?{action:e}:void 0))}}"
            ></hv-field>
            ${"navigate"===r?.action?B`<hv-field
                  .label="${t.t("editor.navigation_path")}"
                  placeholder="/lovelace/heating"
                  .value="${"string"==typeof r.navigation_path?r.navigation_path:void 0}"
                  @hv-change="${t=>o(ar(i,{...r,navigation_path:dr(t)}))}"
                ></hv-field>`:F}
          `})}
      </section>
    `}_renderAddons(t,e){const o=we(e.type)?.addons??[];if(!o.length)return F;const i=e.addons??[],n=o.filter(t=>this._remaining(e,t)>0),r=n.find(t=>t.type===this._newAddonType)?.type??n[0]?.type;return B`
      <section class="card">
        <h3>${t.t("editor.addons_title")}</h3>
        ${i.length?B`<ul class="list">
              ${i.map((o,i)=>B`
                <li>
                  <button type="button" class="row" @click="${()=>this._openAddon(e.id,i)}">
                    <span class="row-main">
                      <span>${this._addonName(t,e,o,i)}</span>
                      <span class="row-sub">${this._addonSummary(t,o)}</span>
                    </span>
                    <span aria-hidden="true">›</span>
                  </button>
                  <button
                    type="button"
                    class="icon danger"
                    aria-label="${t.t("editor.remove_addon")}"
                    @click="${()=>this._removeAddon(e.id,i)}"
                  >×</button>
                </li>
              `)}
            </ul>`:B`<p class="hint">${t.t("editor.addons_empty")}</p>`}
        ${r?B`<div class="toolbar" style="margin-top: 8px">
              <select
                aria-label="${t.t("editor.addon_type")}"
                @change="${t=>{this._newAddonType=t.target.value}}"
              >
                ${n.map(o=>B`
                  <option value="${o.type}" ?selected="${o.type===r}">
                    ${t.t(`addons.${o.type}.name`)} (${t.t("editor.remaining",String(this._remaining(e,o)))})
                  </option>
                `)}
              </select>
              <button type="button" @click="${()=>this._addAddon(e.id,r)}">
                ${t.t("editor.add_addon")}
              </button>
            </div>`:F}
      </section>
    `}_renderSuggestions(t,e){const o=this._config?bt(this._config):void 0,i=new Set((o?.nodes??[]).flatMap(t=>[t.entity_id,...(t.addons??[]).map(t=>t.entity_id)]).filter(t=>Boolean(t))),n=function(t,e,o=new Set){const i=e.device_id??(e.entity_id?t?.entities?.[e.entity_id]?.device_id:void 0),n=we(e.type)?.addons??[];if(!t||!i||!n.length)return[];const r=[...e.addons??[]],a=new Set([e.entity_id,...r.map(t=>t.entity_id),...r.map(t=>t.temperature_entity_id)]),s=[],l=t.devices?.[i],d=$n(hn(l?.name_by_user||l?.name||"")),c=d?be(e)===d:gn.has(e.type),p=Object.values(t.entities??{}).filter(t=>t.device_id===i&&!a.has(t.entity_id)&&!o.has(t.entity_id)).map(e=>t.states[e.entity_id]).filter(t=>void 0!==t).filter(t=>{const o=$n(pn(t));return o?o===be(e):c}).sort((t,e)=>t.entity_id.localeCompare(e.entity_id));for(const t of p){const e=bn(t),o="temperature"===e||"compressor"===e?[e,"value"]:e?[e]:[];for(const e of o){const o=n.find(t=>t.type===e),i=r.filter(t=>t.type===e);if(!o||i.length>=Go(o))continue;const a={type:o.type,entity_id:t.entity_id};o.slots&&(a.slot=kn(t,o.slots,new Set(i.map(t=>t.slot)),o.slotsOptional)),r.push(a),s.push(a);break}}return s}(this._hass,e,i);if(!n.length)return F;return B`
      <section class="card">
        <div class="header">
          <h3>${t.t("editor.suggested_title")}</h3>
          <button type="button" @click="${()=>this._addAddons(e.id,n)}">
            ${t.t("editor.add_all")}
          </button>
        </div>
        <p class="hint">${t.t("editor.suggested_hint")}</p>
        <ul class="list" style="margin-top: 8px">
          ${n.map(o=>B`
            <li>
              <div class="row static">
                <span class="row-main">
                  <span>${(e=>e.slot?`${t.t(`addons.${e.type}.name`)} – ${t.t(`slots.${e.slot}`)}`:t.t(`addons.${e.type}.name`))(o)}</span>
                  <span class="row-sub">${Kn(this._hass,o.entity_id)??o.entity_id}</span>
                </span>
              </div>
              <button
                type="button"
                class="icon"
                aria-label="${t.t("editor.add_addon")}"
                @click="${()=>this._addAddons(e.id,[o])}"
              >+</button>
            </li>
          `)}
        </ul>
      </section>
    `}_renderAddonView(t,e,o,i,n){const r=we(o.type)?.addons?.find(t=>t.type===i.type),a=Xo[i.type],s=new Set((o.addons??[]).filter((t,e)=>e!==n&&t.type===i.type).map(t=>t.slot)),l=(r?.slots??[]).filter(t=>!s.has(t)).map(e=>({value:e,label:t.t(`slots.${e}`)}));r?.slotsOptional&&l.unshift({value:"",label:t.t("editor.slot_none")});const d={domains:a.domains,deviceClasses:a.deviceClasses,deviceId:o.device_id,relatedTo:o.entity_id};return B`
      ${this._renderHeader(t,this._addonName(t,o,i,n),()=>this._openNode(o.id))}
      ${this._renderCanvas(t,e)}
      <section class="card">
        <p class="hint">${this._nodeName(t,o)} › ${t.t(`addons.${i.type}.name`)}</p>
        ${l.length?B`<hv-field
              kind="select"
              .label="${t.t("editor.slot")}"
              .options="${l}"
              .value="${i.slot}"
              @hv-change="${t=>this._patchAddon(o.id,n,{slot:dr(t)})}"
            ></hv-field>`:F}
        <hv-field
          .label="${t.t("editor.name")}"
          .helper="${t.t("editor.addon_name_helper")}"
          .value="${i.name}"
          @hv-change="${t=>this._patchAddon(o.id,n,{name:dr(t)})}"
        ></hv-field>
        ${a.entityless?B`<p class="hint">${t.t(`addons.${i.type}.hint`)}</p>`:this._renderBinding(t,i,function(t,e){if("loop"===t)return[{...Zn,label:"editor.actuator_entity"},Jn,{key:"temperature_entity_id",label:"editor.loop_temperature"}];if("operation"===t)return e&&"status"!==e?[Zn,Jn]:[{...Zn,helper:"editor.operation_status_helper"},Yn];switch(Xo[t].display){case"value":case"text":return[Zn,Yn];case"binary":return[Zn,Jn];case"position":return[Zn,Xn];default:return[]}}(i.type,i.slot),d,t=>this._patchAddon(o.id,n,t))}
        ${function(t,e){return!Xo[e].entityless&&(!(Qo[t]??[]).includes(e)||(ei[t]??[]).includes(e))}(o.type,i.type)?B`<hv-field
              kind="boolean"
              .label="${t.t("editor.show_on_schema")}"
              .helper="${t.t("heat_pump"===o.type?"editor.show_on_schema_heat_pump":"editor.show_on_schema_helper")}"
              .value="${!i.hidden}"
              @hv-change="${t=>this._patchAddon(o.id,n,{hidden:!t.detail.value||void 0})}"
            ></hv-field>`:F}
      </section>
      <div class="toolbar">
        <button type="button" class="danger" @click="${()=>this._removeAddon(o.id,n)}">
          ${t.t("editor.remove_addon")}
        </button>
      </div>
    `}_renderConnections(t,e,o){const i=ke(o)?.ports??[];return i.length?B`
      <section class="card">
        <h3>${t.t("editor.connections_title")}</h3>
        ${i.map(i=>{const n={nodeId:o.id,portId:i.id},r=ln(e,n),a=function(t,e){const o=rn(t,e);if(!o)return[];const i=[];for(const n of t.nodes)if(n.id!==e.nodeId)for(const r of ke(n)?.ports??[]){if(r.kind===o.kind)continue;const a={nodeId:n.id,portId:r.id},s=an(t,e,a);s&&!sn(t,s)&&i.push(a)}return i}(e,n);return B`
            <div class="port">
              <div class="port-label">
                ${"outlet"===i.kind?"→":"←"} ${t.t(i.labelKey,...i.labelArgs??[])}
              </div>
              <div class="chips">
                ${r.length?r.map(o=>{const i=function(t,e){const o=mt(e);return ft(t.from===o?t.to:t.from)}(o,n);return B`<span class="chip">
                        ${i?this._portRefLabel(t,e,i):"?"}
                        <button
                          type="button"
                          aria-label="${t.t("editor.disconnect")}"
                          @click="${()=>this._removeConnections([o])}"
                        >×</button>
                      </span>`}):B`<span class="hint">${t.t("editor.not_connected")}</span>`}
              </div>
              ${a.length?B`<select
                    aria-label="${t.t("editor.connect_to")}"
                    @change="${t=>{const e=t.target,o=ft(e.value);e.value="",o&&this._connect(n,o)}}"
                  >
                    <option value="">${t.t("editor.connect_to")}…</option>
                    ${a.map(o=>B`<option value="${mt(o)}">${this._portRefLabel(t,e,o)}</option>`)}
                  </select>`:F}
            </div>
          `})}
      </section>
    `:F}_renderOverlaysTab(t,e){return B`
      <div class="toolbar">
        <button type="button" class="primary" @click="${this._addOverlay}">${t.t("editor.add_overlay")}</button>
      </div>
      <heating-schema-canvas
        .schema="${e}"
        .pipeStyle="${this._pipeStyle()}"
        .pipeColors="${!1!==this._config?.pipe_colors}"
        .flowAnimation="${!1!==this._config?.flow_animation}"
        .editable="${!1}"
      ></heating-schema-canvas>
      ${e.overlays.length?F:B`<p class="hint">${t.t("editor.overlays_empty")}</p>`}
      ${e.overlays.map((e,o)=>this._renderOverlay(t,e,o))}
    `}_renderOverlay(t,e,o){const i=this._hass,n=t=>this._patchOverlay(e.id,t),r=void 0!==e.name&&"string"!=typeof e.name;return B`
      <section class="card">
        <div class="header">
          <h3>${e.entity_id||t.t("editor.overlay_n",String(o+1))}</h3>
          <button
            type="button"
            class="icon danger"
            aria-label="${t.t("editor.remove_overlay")}"
            @click="${()=>this._removeOverlay(e.id)}"
          >×</button>
        </div>
        <hv-field
          kind="combo"
          .label="${t.t("overlay.entity")}"
          .options="${Tn(i)}"
          .helper="${Kn(i,e.entity_id)}"
          .value="${e.entity_id}"
          @hv-change="${t=>n({entity_id:dr(t)??""})}"
        ></hv-field>
        <hv-field
          .label="${t.t("overlay.name")}"
          .helper="${r?t.t("overlay.name_yaml"):t.t("overlay.name_helper")}"
          .value="${"string"==typeof e.name?e.name:void 0}"
          @hv-change="${t=>n({name:dr(t)})}"
        ></hv-field>
        <hv-field
          .label="${t.t("overlay.template")}"
          .helper="${t.t("overlay.template_helper")}"
          .value="${e.template}"
          @hv-change="${t=>n({template:dr(t)})}"
        ></hv-field>
        <div class="grid2">
          <hv-field
            kind="number"
            label="X"
            .value="${e.position.x}"
            @hv-change="${t=>n({position:{...e.position,x:cr(t)??0}})}"
          ></hv-field>
          <hv-field
            kind="number"
            label="Y"
            .value="${e.position.y}"
            @hv-change="${t=>n({position:{...e.position,y:cr(t)??0}})}"
          ></hv-field>
        </div>

        <div class="header">
          <h3>${t.t("overlay.rules")}</h3>
          <button type="button" @click="${()=>this._addRule(e)}">${t.t("overlay.add_rule")}</button>
        </div>
        ${(e.rules??[]).map((o,i)=>this._renderRule(t,e,o,i))}
        ${this._renderActions(t,e,t=>n(t))}
      </section>
    `}_renderRule(t,e,o,i){const n=t=>this._updateRule(e.id,i,t),r=o.entity||e.entity_id;return B`
      <div class="rule">
        <div class="header">
          <hv-field
            style="flex: 1"
            kind="select"
            .label="${t.t("overlay.rule.condition")}"
            .options="${[{value:"state",label:t.t("overlay.rule.condition_state")},{value:"numeric",label:t.t("overlay.rule.condition_numeric")}]}"
            .value="${o.condition}"
            @hv-change="${t=>n(e=>({condition:"numeric"===dr(t)?"numeric":"state",entity:e.entity,effect:e.effect}))}"
          ></hv-field>
          <button
            type="button"
            class="icon danger"
            aria-label="${t.t("overlay.remove_rule")}"
            @click="${()=>n(()=>{})}"
          >×</button>
        </div>
        <hv-field
          kind="combo"
          .label="${t.t("overlay.rule.entity")}"
          .helper="${t.t("overlay.rule.entity_helper")}"
          .options="${Tn(this._hass)}"
          .value="${o.entity}"
          @hv-change="${t=>n(e=>({...e,entity:dr(t)}))}"
        ></hv-field>
        ${"state"===o.condition?B`<hv-field
              kind="combo"
              .label="${t.t("overlay.rule.state")}"
              .options="${Dn(this._hass,r)}"
              .value="${o.state}"
              @hv-change="${t=>n(e=>({...e,state:dr(t)}))}"
            ></hv-field>`:B`<div class="grid2">
              <hv-field
                kind="number"
                .label="${t.t("overlay.rule.above")}"
                .value="${o.above}"
                @hv-change="${t=>n(e=>({...e,above:cr(t)}))}"
              ></hv-field>
              <hv-field
                kind="number"
                .label="${t.t("overlay.rule.below")}"
                .value="${o.below}"
                @hv-change="${t=>n(e=>({...e,below:cr(t)}))}"
              ></hv-field>
            </div>`}
        <hv-field
          kind="combo"
          .label="${t.t("overlay.rule.color")}"
          .helper="${t.t("overlay.rule.color_helper")}"
          .options="${lr.map(t=>({value:t}))}"
          .value="${o.effect.color}"
          @hv-change="${t=>n(e=>({...e,effect:{...e.effect,color:dr(t)}}))}"
        ></hv-field>
        <hv-field
          kind="boolean"
          .label="${t.t("overlay.rule.hide")}"
          .value="${!1===o.effect.visible}"
          @hv-change="${t=>n(e=>({...e,effect:{...e.effect,visible:!t.detail.value&&void 0}}))}"
        ></hv-field>
      </div>
    `}_nodeName(t,e){return e.name||t.t(ke(e)?.labelKey??`devices.${e.type}.name`)}_addonName(t,e,o,i){if(o.name)return o.name;const n=t.t(`addons.${o.type}.name`);if(o.slot)return`${n} – ${t.t(`slots.${o.slot}`)}`;const r=(e.addons??[]).filter(t=>t.type===o.type);if(r.length<2)return n;const a=(e.addons??[]).slice(0,i+1).filter(t=>t.type===o.type).length;return`${n} ${a}`}_addonSummary(t,e){if(Xo[e.type].entityless)return t.t(`addons.${e.type}.hint`);if(!e.entity_id)return t.t("editor.no_entity");const o=Kn(this._hass,e.entity_id)??e.entity_id;return e.hidden?`${o} · ${t.t("editor.hidden_on_schema")}`:o}_portRefLabel(t,e,o){const i=e.nodes.find(t=>t.id===o.nodeId),n=rn(e,o),r=n?t.t(n.labelKey,...n.labelArgs??[]):o.portId;return i?`${this._nodeName(t,i)} › ${r}`:mt(o)}_openList(){this._view={kind:"list"}}_openNode(t){this._view={kind:"node",nodeId:t},this._selectedNodeId=t,this._selectedEdgeId=void 0}_openAddon(t,e){this._view={kind:"addon",nodeId:t,index:e}}_update(t){if(!this._config)return;this._layoutUndo=void 0;const e=structuredClone(bt(this._config));t(e),this._emit({...this._config,...e})}_emit(t){const e=JSON.parse(JSON.stringify({...t,schema_version:2}));this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}_pipeStyle(){return this._config?.pipe_style??"orthogonal"}_setDisplayOption(t,e){this._config&&this._emit({...this._config,[t]:!!e&&void 0})}_setPipeStyle(t){this._config&&this._emit({...this._config,pipe_style:"orthogonal"===t?void 0:t})}_patchNode(t,e){this._update(o=>{const i=o.nodes.find(e=>e.id===t);i&&Object.assign(i,e)})}_moveNode(t,e){this._update(o=>{const i=o.nodes.find(e=>e.id===t);i&&(i.position={x:e.x??i.position.x,y:e.y??i.position.y})})}_setVariant(t,e,o){this._update(i=>{const n=i.nodes.find(e=>e.id===t);n&&(n.variant=e===o?void 0:e,i.connections=dn(i,t))})}_nudge(t,e,o){this._moveNode(t.id,{x:t.position.x+10*e,y:t.position.y+10*o})}_toggleDrawing(){this._drawing=!this._drawing,this._pendingPort=void 0}_rotateNode(t){this._update(e=>{const o=e.nodes.find(e=>e.id===t);o&&(o.rotation=De((o.rotation??0)+90)||void 0)})}_addDevice(t,e){const o=function(t){return ge.find(e=>e.id===t)}(t);if(!o||!we(o.type))return;const{type:i}=o,n=xt(i);this._update(t=>{const r=t.nodes.length,a={id:n,type:i,name:Vn(this._hass,e),entity_id:e,device_id:e?this._hass?.entities?.[e]?.device_id??void 0:void 0,position:{x:er+r%Gn*Qn,y:or+Math.floor(r/Gn)*tr},addons:o.addons?.map(t=>({...t})),scale:o.scale,variant:o.variant};i===Jt.type&&(a.addons=Array.from({length:4},()=>({type:"loop"}))),t.nodes.push(a)}),this._entityToAdd=void 0,this._entityDeviceType=void 0,this._openNode(n)}_autoLayout(){if(!this._config)return;const t=Object.fromEntries(bt(this._config).nodes.map(t=>[t.id,{...t.position}]));this._update(t=>{t.nodes=function(t){const e=new Map(t.nodes.map(t=>[t.id,t])),o=new Map,{columns:i,unconnected:n}=In(t);let r=40,a=40;for(const t of i){let i=40,n=0;for(const a of t){const t=e.get(a);if(!t)continue;const s=Pn(t);o.set(a,Cn(t,r,i)),i+=s.height+50,n=Math.max(n,s.width)}a=Math.max(a,i),r+=n+80}let s=40;for(const t of n){const i=e.get(t);i&&(o.set(t,Cn(i,s,a)),s+=Pn(i).width+80)}return t.nodes.map(t=>o.get(t.id)??t)}(t)}),this._layoutUndo=t}_undoLayout(){const t=this._layoutUndo;t&&this._update(e=>{for(const o of e.nodes)o.position=t[o.id]??o.position})}_insertTemplate(){const t=Mn.find(t=>t.id===this._templateId);t&&this._update(e=>{const o=Sn(t,e,t=>xt(t));e.nodes.push(...o.nodes),e.connections.push(...o.connections)})}_addAddons(t,e){this._update(o=>{const i=o.nodes.find(e=>e.id===t);i&&(i.addons=[...i.addons??[],...e])})}_deleteNode(t){this._update(e=>{e.nodes=e.nodes.filter(e=>e.id!==t),e.connections=e.connections.filter(e=>ft(e.from)?.nodeId!==t&&ft(e.to)?.nodeId!==t)}),this._selectedNodeId=void 0,this._pendingPort=void 0,this._openList()}_remaining(t,e){const o=(t.addons??[]).filter(t=>t.type===e.type).length;return Go(e)-o}_addAddon(t,e){let o=-1;this._update(i=>{const n=i.nodes.find(e=>e.id===t),r=n&&we(n.type)?.addons?.find(t=>t.type===e);if(!n||!r||this._remaining(n,r)<=0)return;const a=new Set((n.addons??[]).filter(t=>t.type===e).map(t=>t.slot)),s={type:e,slot:r.slotsOptional?void 0:r.slots?.find(t=>!a.has(t))};n.addons=[...n.addons??[],s],o=n.addons.length-1}),o>=0&&!Xo[e].entityless&&this._openAddon(t,o)}_patchAddon(t,e,o){this._update(i=>{const n=i.nodes.find(e=>e.id===t)?.addons?.[e];n&&Object.assign(n,o)})}_removeAddon(t,e){this._update(o=>{const i=o.nodes.find(e=>e.id===t),n=i?.addons?.[e];if(i?.addons&&n){if("loop"===n.type){const n=i.addons.slice(0,e+1).filter(t=>"loop"===t.type).length;o.connections=function(t,e,o){const i=t=>{const i=ft(t),n=i?.nodeId===e?cn.exec(i.portId):null;if(!i||!n)return t;const r=Number(n[1]);return r!==o?r<o?t:mt({nodeId:e,portId:`loop_${r-1}_${n[2]}`}):void 0},n=[];for(const e of t.connections){const t=i(e.from),o=i(e.to);t&&o&&n.push({...e,from:t,to:o})}return n}(o,t,n)}i.addons=i.addons.filter((t,o)=>o!==e),i.addons.length||(i.addons=void 0),o.connections=dn(o,t)}}),this._openNode(t)}_connect(t,e){this._update(o=>{const i=an(o,t,e);i&&!sn(o,i)&&o.connections.push(i)})}_removeConnections(t){const e=new Set(t.map($t));this._update(t=>{t.connections=t.connections.filter(t=>!e.has($t(t)))})}_deleteSelectedConnection(){const t=this._selectedEdgeId;t&&(this._update(e=>{e.connections=e.connections.filter(e=>$t(e)!==t)}),this._selectedEdgeId=void 0)}_addOverlay(){this._update(t=>{t.overlays.push({id:xt("ov"),position:{x:40,y:40+30*t.overlays.length},entity_id:"",template:"{{ state }}"})})}_removeOverlay(t){this._update(e=>{e.overlays=e.overlays.filter(e=>e.id!==t)})}_patchOverlay(t,e){this._update(o=>{const i=o.overlays.find(e=>e.id===t);i&&Object.assign(i,e)})}_addRule(t){this._update(e=>{const o=e.overlays.find(e=>e.id===t.id);o&&(o.rules=[...o.rules??[],{condition:"state",effect:{}}])})}_updateRule(t,e,o){this._update(i=>{const n=i.overlays.find(e=>e.id===t),r=n?.rules?.[e];if(!n?.rules||!r)return;const a=o(r);n.rules=a?n.rules.map((t,o)=>o===e?a:t):n.rules.filter((t,o)=>o!==e),n.rules.length||(n.rules=void 0)})}_onNodeSelect(t){const{nodeId:e}=t.detail;this._selectedEdgeId=void 0,"list"!==this._view.kind&&e?e!==this._view.nodeId&&this._openNode(e):this._selectedNodeId=e}_onEdgeSelect(t){this._selectedEdgeId=t.detail.edgeId,this._pendingPort=void 0}_onNodeMove(t){this._moveNode(t.detail.nodeId,t.detail.position)}_onConnectionRoute(t){this._setRoute(t.detail.connectionId,t.detail.route)}_setRoute(t,e){t&&this._update(o=>{const i=o.connections.find(e=>$t(e)===t);i&&(i.route=e?.length?e:void 0)})}_onPortClick(t){const e={nodeId:t.detail.nodeId,portId:t.detail.portId},o=this._pendingPort;o?(this._pendingPort=void 0,o.nodeId===e.nodeId&&o.portId===e.portId||this._connect(o,e)):this._pendingPort=e}};pr.styles=a`
    :host {
      display: block;
    }
    .editor {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 8px 0;
    }
    h3 {
      margin: 8px 0 6px;
      font-size: var(--ha-font-size-m, 14px);
      font-weight: var(--ha-font-weight-medium, 500);
      color: var(--primary-text-color);
    }
    button {
      min-height: 36px;
      padding: 6px 12px;
      font: inherit;
      color: var(--primary-text-color);
      background: transparent;
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-border-radius-md, 8px);
      cursor: pointer;
    }
    button:focus-visible,
    select:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: 1px;
    }
    button.primary {
      color: var(--text-primary-color, #fff);
      background: var(--primary-color);
      border-color: var(--primary-color);
    }
    button.danger {
      color: var(--error-color, #db4437);
      border-color: var(--error-color, #db4437);
    }
    button.icon {
      min-width: 36px;
      padding: 4px 8px;
    }
    select {
      min-height: 36px;
      padding: 6px 10px;
      font: inherit;
      color: var(--primary-text-color);
      background: var(--ha-color-form-background, var(--secondary-background-color));
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-border-radius-md, 8px);
    }
    .tabs {
      display: flex;
      gap: 4px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--divider-color);
    }
    .tabs button {
      flex: 1;
      border: none;
    }
    .tabs button[aria-selected="true"] {
      color: var(--text-primary-color, #fff);
      background: var(--primary-color);
    }
    .toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .toolbar select {
      flex: 1;
      min-width: 160px;
    }
    .check {
      display: inline-flex;
      gap: 6px;
      align-items: center;
      color: var(--primary-text-color);
    }
    .check input {
      width: 18px;
      height: 18px;
      accent-color: var(--primary-color);
    }
    .header {
      display: flex;
      gap: 8px;
      align-items: center;
    }
    .header h3 {
      flex: 1;
      margin: 0;
    }
    .hint {
      margin: 0;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
    }
    .notice {
      margin: 0;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--primary-color);
    }
    .warning {
      display: flex;
      gap: 8px;
      align-items: center;
      justify-content: space-between;
      margin: 0;
      color: var(--warning-color, #ffa600);
    }
    ul.list {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    ul.list li {
      display: flex;
      gap: 6px;
    }
    .row {
      display: flex;
      flex: 1;
      gap: 8px;
      align-items: center;
      text-align: start;
    }
    .row.selected {
      border-color: var(--primary-color);
    }
    .row.static {
      padding: 6px 12px;
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-border-radius-md, 8px);
    }
    .row-main {
      display: flex;
      flex: 1;
      flex-direction: column;
      min-width: 0;
    }
    .row-sub {
      overflow: hidden;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    section.card {
      padding: 10px;
      border: 1px solid var(--divider-color);
      border-radius: var(--ha-card-border-radius, 12px);
    }
    .grid2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .port {
      padding: 6px 0;
      border-top: 1px solid var(--divider-color);
    }
    .port-label {
      margin-bottom: 4px;
      font-size: var(--ha-font-size-s, 12px);
      color: var(--secondary-text-color);
    }
    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-bottom: 6px;
    }
    .chip {
      display: inline-flex;
      gap: 4px;
      align-items: center;
      padding: 2px 4px 2px 10px;
      background: var(--secondary-background-color);
      border-radius: 16px;
    }
    .chip button {
      min-width: 28px;
      min-height: 28px;
      padding: 0;
      border: none;
      border-radius: 50%;
    }
    .port select {
      width: 100%;
    }
    .rule {
      margin-top: 8px;
      padding: 8px;
      background: var(--secondary-background-color);
      border-radius: var(--ha-border-radius-md, 8px);
    }
  `,t([vt()],pr.prototype,"_hass",void 0),t([vt()],pr.prototype,"_config",void 0),t([vt()],pr.prototype,"_tab",void 0),t([vt()],pr.prototype,"_view",void 0),t([vt()],pr.prototype,"_selectedNodeId",void 0),t([vt()],pr.prototype,"_selectedEdgeId",void 0),t([vt()],pr.prototype,"_pendingPort",void 0),t([vt()],pr.prototype,"_newDeviceType",void 0),t([vt()],pr.prototype,"_newAddonType",void 0),t([vt()],pr.prototype,"_entityToAdd",void 0),t([vt()],pr.prototype,"_entityDeviceType",void 0),t([vt()],pr.prototype,"_templateId",void 0),t([vt()],pr.prototype,"_layoutUndo",void 0),t([vt()],pr.prototype,"_drawing",void 0),pr=t([pt("heating-visualizer-editor")],pr);let hr=class extends dt{constructor(){super(...arguments),this._i18n=new He(this,Te)}setConfig(t){if(!t||"object"!=typeof t)throw new Error("Invalid card configuration");this._config=Ie(t)}getCardSize(){return 6}getGridOptions(){return{columns:12,min_columns:6}}static getConfigElement(){return document.createElement("heating-visualizer-editor")}static getStubConfig(){return{schema_version:2,...gt}}render(){if(!this._config)return B``;const t=bt(this._config),e=Le(this._i18n.value?.language);return B`
      <ha-card>
        ${t.nodes.length||t.overlays.length?B`
            <heating-schema-canvas
              .schema="${t}"
              .pipeStyle="${this._config.pipe_style??"orthogonal"}"
              .pipeColors="${!1!==this._config.pipe_colors}"
              .flowAnimation="${!1!==this._config.flow_animation}"
              .editable="${!1}"
            ></heating-schema-canvas>
          `:B`<div class="empty">${e.t("card.empty")}</div>`}
      </ha-card>
    `}};hr.styles=a`
    :host {
      display: block;
    }
    ha-card {
      display: block;
      overflow: hidden;
    }
    .empty {
      padding: 24px;
      text-align: center;
      opacity: 0.8;
      color: var(--primary-text-color, #e0e0e0);
    }
  `,t([vt()],hr.prototype,"_config",void 0),hr=t([pt("heating-visualizer-card")],hr),window.customCards=window.customCards??[],window.customCards.push({type:"heating-visualizer-card",name:"Heating Visualizer",description:"Design and visualize heating system schemas with live sensor overlays.",preview:!0,documentationURL:"https://github.com/vasicekmilan90-eng/heating_vizualizer"}),console.info("%c HEATING-VISUALIZER-CARD %c v0.11.0 ","color: white; background: #039be5; font-weight: bold;","color: #039be5; background: white; font-weight: bold;");export{hr as HeatingVisualizerCard};
//# sourceMappingURL=heating-visualizer-card.js.map
