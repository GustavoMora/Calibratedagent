#!/usr/bin/env python3
"""
apply_ca_layer.py · Calibrated Agent · © 2026 Gustavo Mora

Aplica sobre un index.html compilado (el build de Bostock) dos cosas, de forma
idempotente y verificable:

  1. Parches anclados al módulo del cerebro 3D (función hp y su entorno).
     Cada parche busca un texto exacto; si no aparece exactamente una vez,
     el script se detiene SIN escribir nada (señal de que el build cambió).
     Cada parche deja un marcador /*ca:...*/ y no se reaplica.
  2. La capa editorial ca-final (layer/ca-final.css y layer/ca-final.js),
     que reemplaza los bloques <style id="ca-final-css"> y
     <script id="ca-final-js"> si existen, o los inserta antes de </head> y </body>.

No toca datos, semillas, parámetros, fórmulas ni textos científicos del build.

Uso:
  python3 tools/apply_ca_layer.py index.html            # aplica en el lugar
  python3 tools/apply_ca_layer.py index.html --check    # solo verifica
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
LAYER = ROOT / "layer"

HELPERS = (
    "/*ca:helpers*/let caPx=0,caPy=0,caSx=0,caSy=0;"
    "const caBz=(a,c,b,t)=>{let u=1-t;return[u*u*a[0]+2*u*t*c[0]+t*t*b[0],u*u*a[1]+2*u*t*c[1]+t*t*b[1],u*u*a[2]+2*u*t*c[2]+t*t*b[2]]},"
    "caCtl=(a,b)=>{let d=[b[0]-a[0],b[1]-a[1],b[2]-a[2]],L=Math.hypot(d[0],d[1],d[2])||1,m=[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2],nx=d[1],ny=-d[0],nl=Math.hypot(nx,ny)||1;nx/=nl;ny/=nl;if(nx*m[0]+ny*m[1]<0){nx=-nx;ny=-ny}let k=.2*L;return[m[0]+nx*k,m[1]+ny*k,m[2]+.12*L]},"
    "caSeg=(D,V,a,b,id,K)=>{let c=caCtl(a,b),p=a;for(let i=1;i<=K;i++){let q=caBz(a,c,b,i/K);D.push(p[0],p[1],p[2],q[0],q[1],q[2]);V.push(id);p=q}},"
    "caScat=z=>{let u=1-2*((z*.618034)%1),th=z*2.399963,rr=Math.sqrt(Math.max(0,1-u*u)),rad=7+3*((z*.381966)%1);return[Math.cos(th)*rr*rad,u*rad*.75,Math.sin(th)*rr*rad]},"
    # Silueta cerebral abstracta (vista lateral desde +z): hemisferios separados en z, eje largo en x,
    # pliegues (giros) por modulación del radio, base aplanada, lóbulo temporal, cerebelo y tronco.
    "caBrain=R=>{let q=R(),k=.34+R()*.12,am=.035+R()*.04,P;"
    "if(q<.68){let sd=R()<.5?-1:1,u=R()*2-1,th=R()*6.283185,rr=Math.sqrt(1-u*u),x=rr*Math.cos(th),y=u,zz=Math.abs(rr*Math.sin(th)),"
    "f=1+.055*Math.sin(9*th+4*u)*Math.cos(7*u-2*th)+.03*Math.sin(17*th+11*u),inn=R()<.1?.8+R()*.15:1,"
    "X=x*2.7*f*inn,Y=y*1.68*f*inn,Z=zz*1.0*f*inn;Y<-.5&&(Y=-.5+(Y+.5)*.42);P=[X,Y+.32,sd*(Z+.07)]}"
    "else if(q<.8){let sd=R()<.5?-1:1,u=R()*2-1,th=R()*6.283185,rr=Math.sqrt(1-u*u),f=1+.05*Math.sin(11*th+5*u);"
    "P=[.55+rr*Math.cos(th)*1.55*f,-.62+u*.62*f,sd*(.5+Math.abs(rr*Math.sin(th))*.5*f)]}"
    "else if(q<.93){let u=R()*2-1,th=R()*6.283185,rr=Math.sqrt(1-u*u),f=1+.07*Math.sin(30*u);"
    "P=[-2.05+rr*Math.cos(th)*.95*f,-1.22+u*.56*f,rr*Math.sin(th)*1.2*f];k*=.92}"
    "else{let t=R(),a=R()*6.283185,rad=.3-.06*t;P=[-1.0+.3*t+Math.cos(a)*rad,-1.0-1.55*t,Math.sin(a)*rad];k*=.85}"
    "return{p:P,k:k,a:am}};"
    "!t.coarse&&n.addEventListener(\"pointermove\",ev=>{let r=n.getBoundingClientRect();caPx=(ev.clientX-r.left)/r.width-.5;caPy=(ev.clientY-r.top)/r.height-.5},{passive:!0}),"
    "n.addEventListener(\"pointerleave\",()=>{caPx=caPy=0});"
)

FLOW = (
    # Corteza: capa propia de partículas con el MISMO shader del cerebro (comparte uTime, uDpr y uAsm).
    "/*ca:flow*/let caCN=o?2800:9000,caCP=new Float32Array(caCN*3),caCC=new Float32Array(caCN*3),caCH=new Float32Array(caCN*3),caCA=new Float32Array(caCN),caCS=new Float32Array(caCN*3),caRr=dn(29);"
    "for(let i=0;i<caCN;i++){let Sh=caBrain(caRr),c=s.ink.clone().multiplyScalar(Sh.k*CA_CORTEX_K);i%7===0&&c.lerp(s.src,.35);caCP.set(Sh.p,i*3),caCC.set([c.r,c.g,c.b],i*3),caCH.set([caRr()*6.283,caRr()*6.283,caRr()*6.283],i*3),caCA[i]=Sh.a*.6,caCS.set(caScat(i+7),i*3)}"
    "let caCG=new At;caCG.setAttribute(\"position\",new yt(caCP,3)),caCG.setAttribute(\"aCol\",new yt(caCC,3)),caCG.setAttribute(\"aPh\",new yt(caCH,3)),caCG.setAttribute(\"aAmp\",new yt(caCA,1)),caCG.setAttribute(\"aSc\",new yt(caCS,3));"
    "let caCx=new fi(caCG,new Ct({uniforms:{uTime:M.uniforms.uTime,uDpr:M.uniforms.uDpr,uSize:{value:o?CA_CORTEX_SM:CA_CORTEX_SD},uAsm:M.uniforms.uAsm},transparent:!0,depthWrite:!1,blending:Gn,vertexShader:M.vertexShader,fragmentShader:M.fragmentShader}));caCx.frustumCulled=!1,u.add(caCx);"
    "let caPorts=[{id:\"abs\",p:[-1.35,-.62,1.75],col:new ve(\"#a4a4ae\")},{id:\"ask\",p:[0,-.86,1.95],col:s.acc},{id:\"act\",p:[1.35,-.62,1.75],col:s.act}],"
    "caMN=g.N.filter(x=>x.reg===\"mando\"),caCal=(g.N.find(x=>x.reg===\"mando\"&&/calib/i.test(x.id))||caMN[1]||caMN[0]||{p:[-.31,.54,0]}).p,"
    "caIn=[-3.9,1.35,1.6],caNF=o?5:9,caTr=6,caFP=new Float32Array(caNF*caTr*3),caFC=new Float32Array(caNF*caTr*3),caFG=new At;"
    "caFG.setAttribute(\"position\",new yt(caFP,3)),caFG.setAttribute(\"color\",new yt(caFC,3));"
    "let caVS=\"attribute vec3 color;varying vec3 vC;uniform float uDpr,uS;void main(){vC=color;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_PointSize=uS*uDpr*(10.0/-mv.z);gl_Position=projectionMatrix*mv;}\","
    "caFS=\"varying vec3 vC;void main(){vec2 d=gl_PointCoord-0.5;float r=length(d);if(r>0.5)discard;float g=smoothstep(0.5,0.0,r);gl_FragColor=vec4(vC*g*g,1.0);}\","
    "caFM=new Ct({uniforms:{uDpr:M.uniforms.uDpr,uS:{value:o?9:11}},transparent:!0,depthWrite:!1,blending:Gn,vertexShader:caVS,fragmentShader:caFS}),caFl=new fi(caFG,caFM);"
    "caFl.frustumCulled=!1,u.add(caFl);"
    "let caPP=new Float32Array(9),caPC=new Float32Array(9),caPG=new At;caPorts.forEach((q,i)=>caPP.set(q.p,i*3));"
    "caPG.setAttribute(\"position\",new yt(caPP,3)),caPG.setAttribute(\"color\",new yt(caPC,3));"
    "let caPt=new fi(caPG,new Ct({uniforms:{uDpr:M.uniforms.uDpr,uS:{value:o?24:28}},transparent:!0,depthWrite:!1,blending:Gn,vertexShader:caVS,fragmentShader:caFS}));"
    "caPt.frustumCulled=!1,u.add(caPt);"
    "let caC1=caCtl(caIn,caCal),caC2=caCtl(caCal,[0,0,0]),caC3=caPorts.map(q=>caCtl([0,0,0],q.p)),caAsm=0,caGl=[0,0,0],caLG=null,caEma=0,caNn=0,caLow=!1;"
    "function caFrame(R,G,z){wu&&(caAsm=Math.max(caAsm,R.luz||0));let ae=caAsm*caAsm*(3-2*caAsm);M.uniforms.uAsm.value=ae;"
    "if(caLG!==null&&G>caLG){let dt=G-caLG;caEma=caEma?caEma*.95+dt*.05:dt;++caNn>150&&!caLow&&caEma>.05&&(caLow=!0,ke(De,Ve,1))}caLG=G;"
    "let vis=(.25+.75*z(\"mando\"))*Math.max(0,(ae-.55)/.45),gl=[0,0,0];"
    "for(let i=0;i<caNF;i++){let pt=i%3,ph=((G*.27+i/caNF)%1+1)%1;"
    "for(let k=0;k<caTr;k++){let t=((ph-k*.0045)%1+1)%1,P,cl;"
    "if(t<.42)P=caBz(caIn,caC1,caCal,t/.42),cl=s.ink;"
    "else if(t<.62)P=caBz(caCal,caC2,[0,0,0],(t-.42)/.2),cl=s.acc;"
    "else{let w=(t-.62)/.38;P=caBz([0,0,0],caC3[pt],caPorts[pt].p,w),cl=caPorts[pt].col;k===0&&w>.85&&(gl[pt]=Math.max(gl[pt],(w-.85)/.15))}"
    "let f=(t<.05?t/.05:1)*(1-k*.15)*vis,j=(i*caTr+k)*3;caFP[j]=P[0],caFP[j+1]=P[1],caFP[j+2]=P[2],caFC[j]=cl.r*f,caFC[j+1]=cl.g*f,caFC[j+2]=cl.b*f}}"
    "caFG.attributes.position.needsUpdate=!0,caFG.attributes.color.needsUpdate=!0;"
    "caPorts.forEach((q,i)=>{caGl[i]=Math.max(gl[i],caGl[i]*.94);let b=(.45+.9*caGl[i])*Math.max(.15,vis);caPC[i*3]=q.col.r*b,caPC[i*3+1]=q.col.g*b,caPC[i*3+2]=q.col.b*b});"
    "caPG.attributes.color.needsUpdate=!0}"
)

PORT_LABELS = (
    "/*ca:portlabels*/function caPL(e){if(e||!cn||!cn.ports)return\"\";let L=Cu===\"en\"?{act:\"Act\",ask:\"Ask\",abs:\"Abstain\"}:{act:\"Actuar\",ask:\"Preguntar\",abs:\"Abstenerse\"},o=\"\";"
    "for(let q of cn.ports){let[x,y,k]=cn.screen(q.p);k&&(o+=`<span class=\"b3r b3p b3p-${q.id}\" style=\"left:${x.toFixed(0)}px;top:${(y+12).toFixed(0)}px\">${yu(L[q.id])}</span>`)}return o}"
)

def shell_old(src):
    a = src.find('else{let J=R()<.5?-1:1,Qe=R()*2-1,$e=R()*6.283')
    b = src.find('Pe=.05+R()*.05}', a)
    if a < 0 or b < 0:
        return None
    return src[a:b + len('Pe=.05+R()*.05}')]

CORTEX = {"CA_CORTEX_K": ".78", "CA_CORTEX_SM": "2.5", "CA_CORTEX_SD": "2.6"}
for _k,_v in CORTEX.items():
    FLOW = FLOW.replace(_k, _v)

PATCHES = [
    ("helpers", "function hp(n,e,t={}){", "function hp(n,e,t={}){" + HELPERS),
    ("count", "a=o?680:2e3,l=o?12:28", "a=o?1500:5200/*ca:count*/,l=o?22:48"),
    ("q1", "if(q<.62){let J=g.R[", "if(q<.4/*ca:q1*/){let J=g.R["),
    ("q2", "else if(q<.86){let J=G[", "else if(q<.58/*ca:q2*/){let J=G["),
    ("fib", "Q=[J[0][0]+(J[1][0]-J[0][0])*Qe+an(R)*.03,J[0][1]+(J[1][1]-J[0][1])*Qe+an(R)*.03,J[0][2]+(J[1][2]-J[0][2])*Qe+an(R)*.03]",
            "Q=(Bp=>[Bp[0]+an(R)*.03,Bp[1]+an(R)*.03,Bp[2]+an(R)*.03])(caBz(J[0],caCtl(J[0],J[1]),J[1],Qe))/*ca:fib*/"),
    ("shell", shell_old, "else{let Sh=caBrain(R);Q=Sh.p,ae=s.ink.clone().multiplyScalar(Sh.k),ye=-1,Pe=Sh.a}/*ca:shell*/"),
    ("scarr", "w=new Int16Array(a);{let R=dn(11)", "w=new Int16Array(a),caSc=new Float32Array(a*3)/*ca:scarr*/;{let R=dn(11)"),
    ("scset", "y.set(Q,z*3),A.set(", "y.set(Q,z*3),caSc.set(caScat(z),z*3)/*ca:scset*/,A.set("),
    ("scattr", "k.setAttribute(\"aAmp\",new yt(b,1));", "k.setAttribute(\"aAmp\",new yt(b,1)),k.setAttribute(\"aSc\",new yt(caSc,3))/*ca:scattr*/;"),
    ("uni", "uSize:{value:o?2.15:2.55}}", "uSize:{value:o?1.95:2.15},uAsm:{value:0}/*ca:uni*/}"),
    ("vs1", "attribute float aAmp;uniform float uTime,uDpr,uSize;", "attribute float aAmp;attribute vec3 aSc;uniform float uTime,uDpr,uSize,uAsm;/*ca:vs1*/"),
    ("vs2", "vec4(position+w,1.0)", "vec4(mix(aSc,position,uAsm)+w*(0.35+0.65*uAsm),1.0)/*ca:vs2*/"),
    ("lines", "for(let R of g.R)R.id!==\"mando\"&&(D.push(...R.c,0,0,0),V.push(R.id));for(let R of g.N){let G=f[R.reg];D.push(...G.c,...R.p),V.push(R.reg)}",
              "for(let R of g.R)R.id!==\"mando\"&&caSeg(D,V,R.c,[0,0,0],R.id,12);for(let R of g.N){let G=f[R.reg];caSeg(D,V,G.c,R.p,R.reg,5)}/*ca:lines*/"),
    ("pulseO", "O.push({a:R.c,b:[0,0,0],col:r[R.id]||s.acc,reg:R.id});for(let R of g.N)O.push({a:f[R.reg].c,b:R.p,col:r[R.reg]||s.acc,reg:R.reg});",
               "O.push({a:R.c,b:[0,0,0],cp:caCtl(R.c,[0,0,0]),col:r[R.id]||s.acc,reg:R.id});for(let R of g.N)O.push({a:f[R.reg].c,b:R.p,cp:caCtl(f[R.reg].c,R.p),col:r[R.reg]||s.acc,reg:R.reg});/*ca:pulseO*/"),
    ("pulseP", "j[q*3]=ne.a[0]+(ne.b[0]-ne.a[0])*Q,j[q*3+1]=ne.a[1]+(ne.b[1]-ne.a[1])*Q,j[q*3+2]=ne.a[2]+(ne.b[2]-ne.a[2])*Q;",
               "let caP=caBz(ne.a,ne.cp,ne.b,Q);j[q*3]=caP[0],j[q*3+1]=caP[1],j[q*3+2]=caP[2];/*ca:pulseP*/"),
    ("ke", "function ke(R,G,z=1){De=R,", "function ke(R,G,z=1){typeof caLow!=\"undefined\"&&caLow&&(z=Math.min(z,1))/*ca:ke*/;De=R,"),
    ("me", "function Me(R,G){let z=R.az+.09*Math.sin(G*.22),q=R.el+.035*Math.sin(G*.17),ne=v(R.target);h.position.set(ne.x+Math.sin(z)*Math.cos(q)*R.dist,ne.y+Math.sin(q)*R.dist,ne.z+Math.cos(z)*Math.cos(q)*R.dist),h.lookAt(ne)}",
           "function Me(R,G){let caD=R.dist*(h.aspect<1.35?(1.35/h.aspect):1);caSx+=(caPx-caSx)*.05,caSy+=(caPy-caSy)*.05;let z=R.az+.09*Math.sin(G*.22)+caSx*.16,q=R.el+.035*Math.sin(G*.17)-caSy*.08,ne=v(R.target);h.position.set(ne.x+Math.sin(z)*Math.cos(q)*caD,ne.y+Math.sin(q)*caD,ne.z+Math.cos(z)*Math.cos(q)*caD),h.lookAt(ne)}/*ca:me*/"),
    ("frame", "m.strength=(o?.5:.68)+.22*(R.luz||0)", "caFrame(R,G,z)/*ca:frame*/,m.strength=(o?.5:.68)+.22*(R.luz||0)"),
    ("flow", "return{L3:g,render:St,", FLOW + ";return{ports:caPorts,L3:g,render:St,"),
    ("portlabels", "function Pb(){let n=\"\",e=pi&&pi!==\"todas\";", PORT_LABELS + "function Pb(){let n=\"\",e=pi&&pi!==\"todas\";"),
    ("ib", "function Ib(n,e){let t=Fn.clientWidth/2,i=Fn.clientHeight/2,s=n-t,r=e-i,o=Math.hypot(s,r)||1;return[n+s/o*36,e+r/o*18]}",
           "function Ib(n,e){let t=Fn.clientWidth/2,i=Fn.clientHeight/2,s=n-t,r=e-i,o=Math.hypot(s,r)||1,caW=Fn.clientWidth,caO=caW<520?12:36;return[Math.min(caW-48,Math.max(48,n+s/o*caO)),e+r/o*18]}/*ca:ib*/"),
    ("pbuse", "${yu(Lb(s.id))}</span>`)}ma.innerHTML=n}", "${yu(Lb(s.id))}</span>`)}n+=caPL(e)/*ca:pbuse*/,ma.innerHTML=n}"),
]

def apply_brain(src, check=False):
    applied, skipped = [], []
    for pid, old, new in PATCHES:
        if f"/*ca:{pid}*/" in src:
            skipped.append(pid); continue
        o = old(src) if callable(old) else old
        n = src.count(o) if o else 0
        if n != 1:
            raise SystemExit(f"[ca] ancla '{pid}' encontrada {n} veces (se esperaba 1). El build cambió: revisar antes de aplicar. No se escribió nada.")
        if not check:
            src = src.replace(o, new, 1)
        applied.append(pid)
    return src, applied, skipped

def apply_layer(src):
    css = (LAYER / "ca-final.css").read_text(encoding="utf8").strip()
    js = (LAYER / "ca-final.js").read_text(encoding="utf8").strip()
    for tag, block, anchor in (("style", css, "</head>"), ("script", js, "</body>")):
        ident = "ca-final-css" if tag == "style" else "ca-final-js"
        pat = re.compile(r'<%s id="%s">[\s\S]*?</%s>' % (tag, ident, tag))
        if pat.search(src):
            src = pat.sub(lambda m: block, src, count=1)
        else:
            i = src.rfind(anchor) if tag == "script" else src.find(anchor)
            if i < 0: raise SystemExit(f"[ca] no se encontró {anchor}")
            src = src[:i] + block + "\n" + src[i:]
    return src

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    path = pathlib.Path(sys.argv[1]); check = "--check" in sys.argv
    src = path.read_text(encoding="utf8")
    out, applied, skipped = apply_brain(src, check)
    print(f"[ca] cerebro: aplicables={applied or '—'} ya presentes={skipped or '—'}")
    if check:
        print("[ca] --check: no se escribió nada."); return
    out = apply_layer(out)
    missing = [pid for pid, *_ in PATCHES if f"/*ca:{pid}*/" not in out]
    if missing: raise SystemExit(f"[ca] faltan marcadores: {missing}")
    path.write_text(out, encoding="utf8")
    print(f"[ca] OK · {path} · marcadores {len(PATCHES)}/{len(PATCHES)} · capa ca-final actualizada")

if __name__ == "__main__":
    main()
