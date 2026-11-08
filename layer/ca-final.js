<script id="ca-final-js">
/* === Calibrated Agent · pulido final (capa aislada) · © 2026 Gustavo Mora === */
/* Configuración editorial central del preprint. Mantener status "unpublished" hasta que Gus confirme el depósito.
   Para activar: ver PUBLICATION_ACTIVATION.md. No inventar URL, versión, fecha ni DOI. */
window.CA_PUBLICATION = Object.freeze({
  status: "unpublished",           // "published" solo tras confirmación del autor
  title: "Orquestación condicionada con decisión calibrada",
  version: null,                   // p. ej. "v4.3"
  url: null,                       // URL pública verificada del depósito
  doi: null,                       // solo el DOI real, sin prefijo https://doi.org/
  publishedAt: null                // AAAA-MM-DD
});
(function(){
  "use strict";
  var html=document.documentElement;
  function L(){return (html.lang||"es").slice(0,2)==="en"?"en":"es";}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
  var ORCID="0009-0004-5276-3066";
  // Umbrales de riesgo alto: los mismos que muestra S9 con los parámetros congelados (c = 4, r = 0,646). No se recalculan aquí.
  var PA=0.548, PS=0.938;
  var REQ=[
    {id:"A",p:0.97,out:"act"},
    {id:"B",p:0.80,out:"ask"},
    {id:"C",p:0.40,out:"abs"}
  ];
  var T={
    es:{
      kicker:"Cómo decide · ilustración",replay:"Ver de nuevo",
      steps:["Llega un pedido","Se estima la confianza p","La regla la compara con los umbrales","Decide"],
      reqLbl:"Pedido",
      req:{A:"Pagar la factura ya aprobada del proveedor habitual.",B:"Transferir el anticipo al proveedor.",C:"Firmar la renovación del alquiler en nombre del inquilino."},
      reqEnd:"Tres pedidos, tres caminos.",
      out:{act:["Actuar","Ejecuta sin interrumpir."],ask:["Preguntar","Consulta antes de ejecutar."],abs:["Abstenerse","No ejecuta: la decisión vuelve a la persona."]},
      why:{A:"A · p = 0,97, arriba de p*. Aun con riesgo alto, el error es improbable.",B:"B · p = 0,80. Hay dos cuentas posibles: una pregunta corta resuelve la duda.",C:"C · p = 0,40, debajo de pₐ. Con riesgo alto preguntar aclara poco (r = 0,646): no conviene ejecutar."},
      axis0:"0",axis1:"1",
      cap:"Ilustración con tres pedidos inventados de riesgo alto (c = 4, r = 0,646, parámetros congelados): pₐ = 0,548 y p* = 0,938, como en Tres clases de riesgo. p es la probabilidad calibrada de haber entendido el pedido, no de que la ejecución salga bien.",
      sr:"Ilustración. Tres pedidos inventados de riesgo alto pasan por la misma regla. A tiene p = 0,97, arriba de p* = 0,938: el agente actúa. B tiene p = 0,80, entre pₐ = 0,548 y p*: el agente pregunta. C tiene p = 0,40, debajo de pₐ: el agente se abstiene y la decisión vuelve a la persona.",
      evTitle:"Estado de la evidencia",
      evLead:"Qué está derivado, qué está simulado y qué falta. Cada fila es un tipo de evidencia distinto, no una etapa superada.",
      ev:[
        ["k-der","Modelo matemático","Derivado matemáticamente","Los umbrales salen de una derivación. Son correctos solo bajo sus supuestos declarados."],
        ["k-sim","Simulaciones","Simulado","Generadas con datos hipotéticos. Ilustran la regla; no son evidencia sobre un agente real."],
        ["k-pil","Piloto","Observado (piloto)","8 casos evaluables de 25 registrados. Exploratorio: no confirma ni generaliza."],
        ["k-dis","Diseño experimental","Preregistrado localmente","Protocolo congelado antes de los datos, todavía sin depósito público."],
        ["k-pen","Validación empírica","Pendiente","El experimento confirmatorio no se ejecutó."],
        ["k-exp","Extensiones H4–H7","Exploratorias","Ideas en desarrollo, fuera del núcleo H1–H3."]
      ],
      protoTitle:"Dos protocolos, dos preguntas",
      protoHead:["Identificador","Objeto","Pregunta principal","Escala"],
      proto:[
        ["DG-E1","Diseño general del paper","H1b: ¿la calibración reduce el regret con umbrales derivados de costos?","650–700 casos propuestos"],
        ["PO430","Protocolo operativo derivado","H1: ¿un incentivo de autonomía desplaza o infla la confianza declarada?","430 pedidos"]
      ],
      protoNote:"Los identificadores son etiquetas de lectura: no cambian las hipótesis congeladas. Ejecutar PO430 no valida por sí solo H1b, y ninguno de los dos produjo todavía resultados confirmatorios.",
      scopeTitle:"Qué es p, y qué no",
      scopeDef:"la probabilidad de interpretar bien los atributos críticos del pedido, con la información disponible al decidir. El resultado final del entregable es otra variable, Y.",
      scopeAlc:"Alcance del modelo:",
      scopeAlcTxt:"los umbrales ilustrados se derivan bajo supuestos idealizados que vinculan interpretar correctamente con ejecutar correctamente. En un agente real son eventos distintos: comprender el pedido no garantiza producir un entregable correcto. Las decisiones y utilidades efectivas pueden cambiar si falla la ejecución.",
      scopePar:"Los valores b, c, k, r y los umbrales corresponden a esta parametrización. No son constantes universales ni garantías para cualquier agente o contexto.",
      pendTitle:"Pendientes estadísticos conocidos",
      pend:[
        "Hay una discrepancia documentada sobre los bins del ECE (ancho igual o frecuencia igual). Todavía no está decidida.",
        "Los análisis agregados de Fisher y Mantel-Haenszel no modelan directamente el pareo: los mismos pedidos pasan por los dos brazos.",
        "El tamaño efectivo cerca del umbral y parte del análisis de potencia siguen pendientes.",
        "El calibrador isotónico puede generar empates; un resultado que exige transformaciones estrictamente crecientes no se extiende a él sin matices.",
        "El piloto tiene 8 casos evaluables de 25 registrados: ilustra, no valida ni generaliza.",
        "b, c, k, r y los umbrales pertenecen a esta parametrización; no son constantes universales."
      ],
      pendNote:"Gauss (matemática y estadística) y Turing (bibliografía y edición) hicieron revisiones internas. No son revisión por pares.",
      firmaRole:"Investigador independiente · Buenos Aires, Argentina",
      orcidAria:"Perfil ORCID de Gustavo Mora, "+ORCID+" (se abre en otra pestaña)",
      pubPending:"Preprint en preparación, no revisado por pares. El enlace se activará cuando se deposite.",
      pubRead:"Leer el preprint",pubDoi:"DOI",
      zones:["abstenerse","preguntar","actuar"],
      legend:"A, B y C son tres pedidos de ejemplo. Debajo de pₐ la regla se abstiene; entre pₐ y p*, pregunta; arriba de p*, actúa.",
      mTitle:"Qué supone este modelo de utilidad",
      m1:"Estas rectas usan p como si fuera la probabilidad de que el resultado salga bien. Eso vale bajo una idealización: entender bien implica ejecutar bien (e₁ = 1) y entender mal implica fallar (e₀ = 0).",
      m2:"En general, la probabilidad de éxito al actuar es p·e₁ + (1 − p)·e₀, donde e₁ y e₀ son las probabilidades de que la ejecución salga bien habiendo entendido bien o mal. Calibrar p, la comprensión, no garantiza el éxito de la ejecución.",
      m3:"Con e₁ − e₀ < 1, una pregunta rinde menos y el umbral p* baja. Ese análisis general no cambia los umbrales de esta página, que usan la idealización.",
      m4:"La ventaja de preguntar que se ve entre las rectas se mide contra actuar con la interpretación inicial. No es el valor de la información frente a la mejor política: debajo de p₀, donde abstenerse le gana a actuar, la ventaja real de preguntar es menor.",
      mPend:"Revisión matemática del caso general: pendiente de Gauss.",
      bTitle:"Qué muestran las señales",
      bTxt:"Cada señal es un pedido de ejemplo: entra, pasa por el calibrador y el centro de mando, y sale hacia abstenerse, preguntar o actuar. Las tres salidas se turnan: no representan frecuencias ni resultados.",
      bHint:"Elegir una región o un nodo acerca la vista y abre su ficha."
    },
    en:{
      kicker:"How it decides · illustration",replay:"Play again",
      steps:["A request arrives","Confidence p is estimated","The rule compares it with the thresholds","It decides"],
      reqLbl:"Request",
      req:{A:"Pay the usual supplier’s already approved invoice.",B:"Transfer the advance payment to the supplier.",C:"Sign the lease renewal on the tenant’s behalf."},
      reqEnd:"Three requests, three paths.",
      out:{act:["Act","Executes without interrupting."],ask:["Ask","Checks before executing."],abs:["Abstain","Does not execute: the decision goes back to the person."]},
      why:{A:"A · p = 0.97, above p*. Even at high risk, an error is unlikely.",B:"B · p = 0.80. There are two possible accounts: a short question settles it.",C:"C · p = 0.40, below pₐ. At high risk asking clarifies little (r = 0.646): executing does not pay off."},
      axis0:"0",axis1:"1",
      cap:"Illustration with three invented high-risk requests (c = 4, r = 0.646, frozen parameters): pₐ = 0.548 and p* = 0.938, as in Three risk classes. p is the calibrated probability of having understood the request, not of the execution going well.",
      sr:"Illustration. Three invented high-risk requests go through the same rule. A has p = 0.97, above p* = 0.938: the agent acts. B has p = 0.80, between pₐ = 0.548 and p*: the agent asks. C has p = 0.40, below pₐ: the agent abstains and the decision goes back to the person.",
      evTitle:"State of the evidence",
      evLead:"What is derived, what is simulated and what is missing. Each row is a different kind of evidence, not a completed stage.",
      ev:[
        ["k-der","Mathematical model","Mathematically derived","The thresholds come from a derivation. They hold only under their stated assumptions."],
        ["k-sim","Simulations","Simulated","Generated with hypothetical data. They illustrate the rule; they are not evidence about a real agent."],
        ["k-pil","Pilot","Observed (pilot)","8 evaluable cases out of 25 recorded. Exploratory: it neither confirms nor generalizes."],
        ["k-dis","Experimental design","Locally preregistered","Protocol frozen before the data, not yet publicly deposited."],
        ["k-pen","Empirical validation","Pending","The confirmatory experiment has not been run."],
        ["k-exp","Extensions H4–H7","Exploratory","Ideas in development, outside the H1–H3 core."]
      ],
      protoTitle:"Two protocols, two questions",
      protoHead:["Identifier","Object","Main question","Scale"],
      proto:[
        ["DG-E1","General design of the paper","H1b: does calibration reduce regret with cost-derived thresholds?","650–700 proposed cases"],
        ["PO430","Derived operational protocol","H1: does an autonomy incentive shift or inflate declared confidence?","430 requests"]
      ],
      protoNote:"The identifiers are reading labels: they do not change the frozen hypotheses. Running PO430 does not by itself validate H1b, and neither has produced confirmatory results yet.",
      scopeTitle:"What p is, and what it is not",
      scopeDef:"the probability of correctly interpreting the request’s critical attributes, with the information available when deciding. The final outcome of the deliverable is a different variable, Y.",
      scopeAlc:"Model scope:",
      scopeAlcTxt:"the thresholds shown are derived under idealized assumptions that link interpreting correctly with executing correctly. In a real agent these are different events: understanding the request does not guarantee a correct deliverable. Actual decisions and utilities may change if execution fails.",
      scopePar:"The values of b, c, k, r and the thresholds belong to this parametrization. They are not universal constants or guarantees for any agent or context.",
      pendTitle:"Known statistical open issues",
      pend:[
        "There is a documented discrepancy about ECE bins (equal width or equal frequency). It has not been decided yet.",
        "The aggregate Fisher and Mantel-Haenszel analyses do not directly model the pairing: the same requests go through both arms.",
        "The effective sample size near the threshold and part of the power analysis are still pending.",
        "The isotonic calibrator can produce ties; a result that requires strictly increasing transformations does not carry over to it without nuance.",
        "The pilot has 8 evaluable cases out of 25 recorded: it illustrates, it does not validate or generalize.",
        "b, c, k, r and the thresholds belong to this parametrization; they are not universal constants."
      ],
      pendNote:"Gauss (mathematics and statistics) and Turing (bibliography and editing) carried out internal reviews. They are not peer review.",
      firmaRole:"Independent researcher · Buenos Aires, Argentina",
      orcidAria:"Gustavo Mora’s ORCID profile, "+ORCID+" (opens in a new tab)",
      pubPending:"Preprint in preparation, not peer reviewed. The link will be enabled once it is deposited.",
      pubRead:"Read the preprint",pubDoi:"DOI",
      zones:["abstain","ask","act"],
      legend:"A, B and C are three example requests. Below pₐ the rule abstains; between pₐ and p*, it asks; above p*, it acts.",
      mTitle:"What this utility model assumes",
      m1:"These lines use p as if it were the probability of a good outcome. That holds under an idealization: understanding correctly means executing correctly (e₁ = 1) and misunderstanding means failing (e₀ = 0).",
      m2:"In general, the probability of success when acting is p·e₁ + (1 − p)·e₀, where e₁ and e₀ are the probabilities that execution goes well after understanding correctly or incorrectly. Calibrating p, comprehension, does not guarantee successful execution.",
      m3:"With e₁ − e₀ < 1, a question is worth less and the threshold p* goes down. That general analysis does not change the thresholds on this page, which use the idealization.",
      m4:"The advantage of asking shown between the lines is measured against acting on the initial interpretation. It is not the value of information against the best policy: below p₀, where abstaining beats acting, the real advantage of asking is smaller.",
      mPend:"Mathematical review of the general case: pending (Gauss).",
      bTitle:"What the signals show",
      bTxt:"Each signal is an example request: it enters, passes through the calibrator and the command center, and leaves toward abstain, ask or act. The three exits take turns: they do not represent frequencies or results.",
      bHint:"Choosing a region or a node zooms in and opens its card."
    }
  };
  function fmt(x){var s=x.toFixed(2);return L()==="es"?s.replace(".",","):s;}
  function seal(){return '<span class="seal" data-seal="HIPOTETICO">'+(L()==="es"?"HIPOTÉTICO":"HYPOTHETICAL")+'</span>';}

  /* ---------- Hero ---------- */
  var heroTimer=[], heroState="idle"; /* idle | playing | done */
  function heroHTML(t){
    var s=t.steps.map(function(x,i){return '<li data-k="'+i+'"><b>'+(i+1)+'</b>'+esc(x)+'</li>';}).join("");
    var mk=REQ.map(function(r){return '<span class="ca-mk m-'+r.out+'" data-r="'+r.id+'" style="left:'+(r.p*100)+'%">'+r.id+'</span>';}).join("");
    var cards=["abs","ask","act"].map(function(o){var c=t.out[o];return '<div class="ca-card c-'+o+'" data-o="'+o+'"><h3><i></i>'+esc(c[0])+'</h3><p>'+esc(c[1])+'</p><p class="ca-why"></p></div>';}).join("");
    return '<div class="ca-hero-top"><p class="ca-kicker">'+esc(t.kicker)+'</p><button type="button" class="ghost ca-replay">'+esc(t.replay)+'</button></div>'+
      '<ol class="ca-steps" aria-hidden="true">'+s+'</ol>'+
      '<div class="ca-req" aria-hidden="true"><span class="ca-req-lbl">'+esc(t.reqLbl)+'</span><q class="ca-req-txt"></q><span class="ca-req-p"></span></div>'+
      '<div class="ca-band-wrap" aria-hidden="true"><div class="ca-band"><span class="z-abs" style="width:'+(PA*100)+'%"></span><span class="z-ask" style="width:'+((PS-PA)*100)+'%"></span><span class="z-act" style="width:'+((1-PS)*100)+'%"></span></div>'+
        '<span class="ca-tick t-a" style="left:'+(PA*100)+'%"><em>pₐ = '+(L()==="es"?"0,548":"0.548")+'</em></span><span class="ca-tick t-star" style="left:'+(PS*100)+'%"><em>p* = '+(L()==="es"?"0,938":"0.938")+'</em></span>'+mk+
        '<div class="ca-axis"><span>'+t.axis0+'</span><span>'+t.axis1+'</span></div></div>'+
        '<div class="ca-zones" aria-hidden="true"><span class="zn-abs" style="left:'+(PA*50)+'%">'+esc(t.zones[0])+'</span><span class="zn-ask" style="left:'+((PA+PS)*50)+'%">'+esc(t.zones[1])+'</span><span class="zn-act">'+esc(t.zones[2])+'</span></div>'+
        '<p class="ca-legend">'+esc(t.legend)+'</p>'+
      '<div class="ca-out" aria-hidden="true">'+cards+'</div>'+
      '<figcaption id="caHeroCap" class="small muted"><span>'+esc(t.cap)+'</span>'+seal()+'</figcaption>'+
      '<p class="sr">'+esc(t.sr)+'</p>';
  }
  function clearT(){heroTimer.forEach(clearTimeout);heroTimer=[];}
  function q(el,s){return el.querySelector(s);}
  function heroFinal(el){
    clearT(); var t=T[L()];
    el.querySelectorAll(".ca-steps li").forEach(function(li){li.classList.remove("on");});
    q(el,".ca-req-txt").textContent=""; q(el,".ca-req-lbl").textContent=t.reqEnd; q(el,".ca-req-p").classList.remove("on");
    el.querySelectorAll(".ca-mk").forEach(function(m){m.classList.add("on");});
    REQ.forEach(function(r){var c=q(el,'.ca-card[data-o="'+r.out+'"]');c.classList.remove("on");c.classList.add("done");q(c,".ca-why").textContent=t.why[r.id];});
  }
  function heroPlay(el){
    var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduce){heroFinal(el);heroState="done";return;}
    clearT(); var t=T[L()];
    el.querySelectorAll(".ca-mk").forEach(function(m){m.classList.remove("on");});
    el.querySelectorAll(".ca-card").forEach(function(c){c.classList.remove("on","done");q(c,".ca-why").textContent="";});
    q(el,".ca-req-lbl").textContent=t.reqLbl;
    var steps=el.querySelectorAll(".ca-steps li");
    function step(i){steps.forEach(function(li,j){li.classList.toggle("on",j===i);});}
    var T0=0, D=1900;
    REQ.forEach(function(r,k){
      var b=T0+k*D;
      heroTimer.push(setTimeout(function(){step(0);q(el,".ca-req-txt").textContent=T[L()].req[r.id];q(el,".ca-req-p").classList.remove("on");el.querySelectorAll(".ca-card").forEach(function(c){c.classList.remove("on");});},b));
      heroTimer.push(setTimeout(function(){step(1);var pe=q(el,".ca-req-p");pe.textContent="p = "+fmt(r.p);pe.classList.add("on");},b+450));
      heroTimer.push(setTimeout(function(){step(2);q(el,'.ca-mk[data-r="'+r.id+'"]').classList.add("on");},b+900));
      heroTimer.push(setTimeout(function(){step(3);var c=q(el,'.ca-card[data-o="'+r.out+'"]');c.classList.add("on");q(c,".ca-why").textContent=T[L()].why[r.id];},b+1350));
    });
    heroState="playing";
    heroTimer.push(setTimeout(function(){heroFinal(el);heroState="done";},T0+REQ.length*D+300));
  }
  function buildHero(){
    var s0=document.getElementById("s0"); if(!s0)return;
    var old=document.getElementById("caHero"); if(old)old.remove();
    var anchor=s0.querySelector(".lede")||document.getElementById("s0t"); if(!anchor)return;
    var fig=document.createElement("figure"); fig.id="caHero"; fig.className="ca-hero"; fig.setAttribute("aria-labelledby","caHeroCap");
    fig.innerHTML=heroHTML(T[L()]); anchor.insertAdjacentElement("afterend",fig);
    q(fig,".ca-replay").addEventListener("click",function(){heroPlay(fig);});
    if(heroState==="done"){heroFinal(fig);return;}
    if(heroState==="playing"){heroPlay(fig);return;} /* la página re-renderizó el bloque: reinicia sobre el nodo nuevo */
    if("IntersectionObserver" in window){
      var io=new IntersectionObserver(function(es){if(es.some(function(e){return e.isIntersecting;})){io.disconnect();heroPlay(fig);}},{threshold:.35});
      io.observe(fig); heroFinal(fig); /* estado estable visible hasta que empieza */
    } else heroFinal(fig);
  }

  /* ---------- Estado de la evidencia + protocolos ---------- */
  function buildEvidence(){
    var s0=document.getElementById("s0"); if(!s0)return;
    var old=document.getElementById("caEv"); if(old)old.remove();
    var t=T[L()];
    var rows=t.ev.map(function(r){return '<li class="ca-ev-row r-'+r[0].slice(2)+'"><span class="ca-mark '+r[0]+'" aria-hidden="true"></span><span class="ca-lbl">'+esc(r[1])+'</span><span class="ca-st">'+esc(r[2])+'</span><span class="ca-mean">'+esc(r[3])+'</span></li>';}).join("");
    var th=t.protoHead.map(function(h){return '<th scope="col">'+esc(h)+'</th>';}).join("");
    var tr=t.proto.map(function(r){return '<tr><td>'+esc(r[0])+'</td><td>'+esc(r[1])+'</td><td>'+esc(r[2])+'</td><td>'+esc(r[3])+'</td></tr>';}).join("");
    var sec=document.createElement("section"); sec.id="caEv"; sec.className="evidencia ca-ev"; sec.setAttribute("aria-labelledby","caEvTitle");
    sec.innerHTML='<h2 id="caEvTitle">'+esc(t.evTitle)+'</h2><p class="ca-ev-lead">'+esc(t.evLead)+'</p><ul class="ca-ev-list">'+rows+'</ul>'+
      '<div class="ca-proto"><h3 id="caProtoT">'+esc(t.protoTitle)+'</h3><div class="ca-proto-scroll" role="region" tabindex="0" aria-labelledby="caProtoT"><table><thead><tr>'+th+'</tr></thead><tbody>'+tr+'</tbody></table></div><p>'+esc(t.protoNote)+'</p></div>';
    var orig=s0.querySelector(".evidencia:not(.ca-ev)"), hero=document.getElementById("caHero");
    if(orig) orig.insertAdjacentElement("beforebegin",sec);
    else if(hero) hero.insertAdjacentElement("afterend",sec);
  }

  /* ---------- Qué es p (alcance) ---------- */
  function buildScope(){
    var old=document.getElementById("caScope"); if(old)old.remove();
    var ley=document.getElementById("leyenda-sellos"); var t=T[L()];
    var d=document.createElement("aside"); d.id="caScope"; d.className="ca-scope"; d.setAttribute("aria-labelledby","caScopeT");
    d.innerHTML='<h3 id="caScopeT">'+esc(t.scopeTitle)+'</h3><p><span class="ca-formula">p = P(Y₁ = 1 | x)</span>: '+esc(t.scopeDef)+'</p><p><b>'+esc(t.scopeAlc)+'</b> '+esc(t.scopeAlcTxt)+'</p><p>'+esc(t.scopePar)+'</p>';
    if(ley) ley.insertAdjacentElement("afterend",d);
    else { var ev=document.getElementById("caEv"); if(ev) ev.insertAdjacentElement("afterend",d); }
  }

  /* ---------- S14: pendientes ---------- */
  function buildPend(){
    var old=document.getElementById("caPend"); if(old)old.remove();
    var lim=document.querySelector("#s14 ul.lim"); if(!lim)return; var t=T[L()];
    var w=document.createElement("div"); w.id="caPend";
    w.innerHTML='<h3>'+esc(t.pendTitle)+'</h3><ul class="lim ca-pend">'+t.pend.map(function(x){return '<li>'+esc(x)+'</li>';}).join("")+'</ul><p class="ca-pend-note">'+esc(t.pendNote)+'</p>';
    lim.insertAdjacentElement("afterend",w);
  }

  /* ---------- Firma + preprint ---------- */
  function pubHTML(t){
    var P=window.CA_PUBLICATION||{};
    if(P.status==="published"&&typeof P.url==="string"&&/^https:\/\//.test(P.url)){
      var meta=[P.version,P.publishedAt].filter(Boolean).join(" · ");
      var doi=P.doi?' · '+t.pubDoi+' <a href="https://doi.org/'+esc(P.doi)+'" rel="noopener" target="_blank">'+esc(P.doi)+'</a>':'';
      return '<a href="'+esc(P.url)+'" rel="noopener" target="_blank">'+esc(t.pubRead)+(meta?' ('+esc(meta)+')':'')+'</a>'+doi;
    }
    return esc(t.pubPending);
  }
  function buildFirma(){
    var old=document.getElementById("caFirma"); if(old)old.remove();
    var coda=document.querySelector("footer.coda"); if(!coda)return; var t=T[L()];
    var d=document.createElement("div"); d.id="caFirma"; d.className="ca-firma";
    d.innerHTML='<p class="nm">Gustavo Mora</p><p>'+esc(t.firmaRole)+'</p><p><a href="https://orcid.org/'+ORCID+'" rel="me noopener" target="_blank" aria-label="'+esc(t.orcidAria)+'">ORCID '+ORCID+'</a></p><p class="ca-pub" data-status="'+esc((window.CA_PUBLICATION||{}).status||"unpublished")+'">'+pubHTML(t)+'</p>';
    var aut=coda.querySelector(".autoria"); if(aut) aut.insertAdjacentElement("beforebegin",d); else coda.appendChild(d);
  }

  /* ---------- S5: supuestos del modelo de utilidad (M1/M2) ---------- */
  function buildModel(){
    var old=document.getElementById("caModel"); if(old)old.remove();
    var s5=document.getElementById("s5"); if(!s5)return; var t=T[L()];
    var host=s5.querySelector(".v3in")||s5;
    var d=document.createElement("aside"); d.id="caModel"; d.className="ca-scope ca-model"; d.setAttribute("aria-labelledby","caModelT");
    d.innerHTML='<h3 id="caModelT">'+esc(t.mTitle)+'</h3><p>'+esc(t.m1)+'</p><p><span class="ca-formula">P(Y = 1 | x, actuar) = p·e₁ + (1 − p)·e₀</span></p><p>'+esc(t.m2)+'</p><p>'+esc(t.m3)+'</p><p>'+esc(t.m4)+'</p><p class="ca-pendrow"><span>'+esc(t.mPend)+'</span> <span class="seal" data-seal="PENDIENTE">'+(L()==="es"?"PENDIENTE":"PENDING")+'</span></p>';
    if(L()==="en"){d.querySelector(".ca-formula").textContent="P(Y = 1 | x, act) = p·e₁ + (1 − p)·e₀";}
    host.appendChild(d);
  }
  /* ---------- S3: leyenda de las señales del cerebro ---------- */
  function buildBrainLegend(){
    var old=document.getElementById("caBrainLegend"); if(old)old.remove();
    var w=document.querySelector("#s3 .constel-w"); if(!w)return; var t=T[L()];
    var d=document.createElement("div"); d.id="caBrainLegend"; d.className="ca-blegend";
    d.innerHTML='<p class="ca-bl-t">'+esc(t.bTitle)+'</p><ul class="ca-bl-k" aria-hidden="true"><li><i class="k-in"></i>'+(L()==="es"?"pedido":"request")+'</li><li><i class="k-cal"></i>'+(L()==="es"?"calibrado":"calibrated")+'</li><li><i class="k-abs"></i>'+esc(t.zones[0])+'</li><li><i class="k-ask"></i>'+esc(t.zones[1])+'</li><li><i class="k-act"></i>'+esc(t.zones[2])+'</li></ul><p>'+esc(t.bTxt)+' '+seal()+'</p><p class="ca-bl-h">'+esc(t.bHint)+'</p>';
    w.insertAdjacentElement("afterend",d);
  }
  function buildAll(){buildHero();buildEvidence();buildScope();buildPend();buildFirma();buildModel();buildBrainLegend();}
  function ensure(){
    if(!document.getElementById("caHero"))buildHero();
    if(!document.getElementById("caEv"))buildEvidence();
    if(!document.getElementById("caScope"))buildScope();
    if(!document.getElementById("caPend"))buildPend();
    if(!document.getElementById("caFirma"))buildFirma();
    if(!document.getElementById("caModel"))buildModel();
    if(!document.getElementById("caBrainLegend"))buildBrainLegend();
  }
  buildAll();
  var lastLang=L();
  new MutationObserver(function(){ if(L()!==lastLang){lastLang=L(); setTimeout(buildAll,0);} }).observe(html,{attributes:true,attributeFilter:["lang"]});
  var pend=false;
  function watch(el){ if(!el)return; new MutationObserver(function(){ if(pend)return; pend=true; requestAnimationFrame(function(){pend=false;ensure();}); }).observe(el,{childList:true,subtree:true}); }
  watch(document.getElementById("s0")); watch(document.getElementById("s14")); watch(document.querySelector("footer.coda")); watch(document.getElementById("s5")); watch(document.getElementById("s3"));
})();
</script>
