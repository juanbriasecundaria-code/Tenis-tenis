/* Courtside detail, original procedural meshes. Units: metres. Three.js r128. */
function stDetailKit(parent) {
  const mat=(color,roughness=.72,metalness=0)=>new THREE.MeshStandardMaterial({color:stLin(color),roughness,metalness});
  const mesh=(g,m,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
  const box=(w,h,d,m,x,y,z)=>mesh(new THREE.BoxGeometry(w,h,d),m,x,y,z);
  const rod=(a,b,r,m)=>{const A=new THREE.Vector3(...a),B=new THREE.Vector3(...b),v=B.clone().sub(A);const o=mesh(new THREE.CylinderGeometry(r,r,v.length(),8),m);o.position.copy(A.add(B).multiplyScalar(.5));o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return o;};
  const round=(w,h,d,r,m,x,y,z)=>{
    const s=new THREE.Shape(),a=-w/2,b=-h/2;
    s.moveTo(a+r,b);s.lineTo(a+w-r,b);s.quadraticCurveTo(a+w,b,a+w,b+r);s.lineTo(a+w,b+h-r);s.quadraticCurveTo(a+w,b+h,a+w-r,b+h);s.lineTo(a+r,b+h);s.quadraticCurveTo(a,b+h,a,b+h-r);s.lineTo(a,b+r);s.quadraticCurveTo(a,b,a+r,b);
    const g=new THREE.ExtrudeGeometry(s,{depth:d,bevelEnabled:true,bevelSize:.008,bevelThickness:.006,bevelSegments:2,steps:1,curveSegments:4});g.translate(0,0,-d/2);return mesh(g,m,x,y,z);
  };
  return {mat,mesh,box,rod,round};
}

let ST_FABRIC=null;
function stFabricTexture(){
  if(ST_FABRIC)return ST_FABRIC;
  ST_FABRIC=stCanvasTex(128,128,(g,w,h)=>{g.fillStyle='#bbb';g.fillRect(0,0,w,h);const R=stRng(87);for(let y=0;y<h;y+=2)for(let x=0;x<w;x+=2){const v=140+R()*65+((x+y)%4?18:0);g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(x,y,1,2);}},true,true);
  ST_FABRIC.repeat.set(7,7);ST_FABRIC.stKeep=true;return ST_FABRIC;
}

let ST_ATHLETE_FACE=null;
function stAthleteFace(){
  if(ST_ATHLETE_FACE)return ST_ATHLETE_FACE;
  ST_ATHLETE_FACE=stHumanFace().clone();ST_ATHLETE_FACE.stKeep=true;
  const im=new Image();im.onload=()=>{ST_ATHLETE_FACE.image=im;ST_ATHLETE_FACE.needsUpdate=true;if(ST3D&&!ST3D.contextLost)ST3D.render();};im.src='assets/athlete-skin.png';return ST_ATHLETE_FACE;
}
function stAthleteHead(){
  const g=stHumanHead(64),p=g.attributes.position,uv=g.attributes.uv;
  const mapping=[[-.132,1],[-.114,.93],[-.086,.79],[-.062,.684],[-.037,.63],[-.02,.57],[.015,.405],[.037,.335],[.069,.25],[.111,.11],[.144,0]];
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    let ty=0;for(let j=1;j<mapping.length;j++)if(y<=mapping[j][0]){const a=mapping[j-1],b=mapping[j];ty=a[1]+(b[1]-a[1])*(y-a[0])/(b[0]-a[0]);break;}
    uv.setY(i,1-ty);
    if(x>.03){const bridge=.018*Math.exp(-Math.pow(z/.015,2)-Math.pow((y-.006)/.052,2)),tip=.016*Math.exp(-Math.pow(z/.016,2)-Math.pow((y+.018)/.016,2));p.setX(i,x+bridge+tip);}
  }
  g.computeVertexNormals();return g;
}

function stDetailedNet(grp,V){
  const group=new THREE.Group();group.name='Competition net';grp.add(group);
  const {mat,mesh,rod,box}=stDetailKit(group),paint=mat(V.post,.42,.22),metal=mat(0xB9BDB7,.3,.7),rope=mat(0x292F29,.95),white=mat(0xF5F2E8,.92);
  white.bumpMap=stFabricTexture();white.bumpScale=.0012;
  const top=z=>.914+.156*Math.pow(Math.min(1,Math.abs(z)/5.029),1.8);
  const geo=new THREE.PlaneGeometry(12.798,1,96,8),p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const z=p.getX(i),v=p.getY(i)+.5;p.setY(i,.014+v*(top(z)-.014));p.setZ(i,.012*Math.sin(z*2.5)*Math.sin(v*Math.PI));}geo.computeVertexNormals();
  // Derivative-filtered 45 mm weave: keeps the net open without shimmering at broadcast distance.
  const netMat=new THREE.MeshStandardMaterial({color:stLin(0x252A24),roughness:.96,transparent:true,depthWrite:false,side:THREE.DoubleSide});netMat.extensions={derivatives:true};
  netMat.onBeforeCompile=s=>{
    s.vertexShader='varying vec2 vNetUV;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvNetUV=uv;');
    s.fragmentShader='varying vec2 vNetUV;\n'+s.fragmentShader.replace('#include <alphatest_fragment>',`vec2 grid=vNetUV*vec2(284.4,22.0); vec2 fw=max(fwidth(grid),vec2(.001)); vec2 dist=abs(fract(grid-.5)-.5); vec2 line=1.0-smoothstep(vec2(.038)-fw*.5,vec2(.038)+fw*.5,dist); float weave=max(line.x,line.y); float fade=clamp(max(fw.x,fw.y)-.6,0.0,1.0); diffuseColor.a*=mix(weave,.145,fade)*.94;`);
  };
  const net=mesh(geo,netMat);net.rotation.y=Math.PI/2;net.castShadow=false;net.renderOrder=2;
  // Cinta con grosor, costuras, cable inferior y costados atados.
  for(let j=0;j<64;j++){
    const z0=-6.399+j*12.798/64,z1=z0+12.798/64,ym=(top(z0)+top(z1))*.5;
    const tape=box(.018,.055,z1-z0+.002,white,0,ym,(z0+z1)/2);tape.rotation.x=-Math.atan2(top(z1)-top(z0),z1-z0);
    rod([.010,top(z0)-.020,z0],[.010,top(z1)-.020,z1],.0011,rope);
  }
  rod([0,.018,-6.399],[0,.018,6.399],.004,rope);
  box(.022,.923,.05,white,0,.4615,0);box(.15,.008,.09,metal,0,.008,0);
  for(const sign of [-1,1]){
    const z=sign*6.399;
    mesh(new THREE.CylinderGeometry(.043,.046,1.12,16),paint,0,.56,z);
    mesh(new THREE.SphereGeometry(.047,12,6),paint,0,1.12,z).scale.y=.35;
    mesh(new THREE.CylinderGeometry(.073,.073,.015,16),metal,0,.012,z);
    rod([0,.02,z-sign*.05],[0,1.068,z-sign*.05],.006,rope);
    for(let i=0;i<8;i++)rod([-.015,.07+i*.13,z],[.015,.1+i*.13,z-sign*.045],.0025,rope);
    const crank=mesh(new THREE.TorusGeometry(.045,.007,6,16),metal,.06,.71,z);crank.rotation.y=Math.PI/2;
    rod([.05,.71,z],[.11,.65,z],.008,metal);rod([.11,.65,z],[.16,.65,z],.014,rope);
    rod([0,0,sign*5.029],[0,1.07,sign*5.029],.014,metal);
    box(.043,.02,.042,white,0,1.068,sign*5.029);
  }
  group.add(stContactShadow(.32,12.9,.36));stMergeParts(group);
}

function stBrandTexture(text,bg,fg='#F4F2EA',subtitle=''){
  return stCanvasTex(1024,256,(g,w,h)=>{
    if(bg){g.fillStyle=bg;g.fillRect(0,0,w,h);const a=g.createLinearGradient(0,0,0,h);a.addColorStop(0,'rgba(255,255,255,.05)');a.addColorStop(1,'rgba(0,0,0,.13)');g.fillStyle=a;g.fillRect(0,0,w,h);}
    g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';let size=text.length>17?59:text.length>11?73:94;
    g.font=`${text==='Emirates'?'600':'700'} ${size}px ${['ROLEX','J.P. Morgan','Emirates'].includes(text)?'Georgia':'Arial'},serif`;
    g.fillText(text,w/2,subtitle?107:134,950);
    if(subtitle){g.font='500 28px Arial';g.fillText(subtitle,w/2,189,920);}
  });
}
// Layout derived from supplied model views; coordinates are visual estimates, not a survey.
function stVenueBoards(grp,V,tiers){
  const g=new THREE.Group();g.name='Tournament courtside signage';grp.add(g);
  const {mat,box,mesh}=stDetailKit(g),ashe=V.roof==='ashe',rg=V.roof==='chatrier';
  const bg=ashe?'#2485B2':'#17452E', wall=mat(ashe?0x2485B2:0x17452E,.92);
  const panel=(text,x,y,z,w,h,rotation,color=bg)=>{
    const p=mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshStandardMaterial({map:stBrandTexture(text,color),roughness:.9}),x,y,z);p.rotation.y=rotation;p.castShadow=false;return p;
  };
  if(ashe){
    // Tall end walls, low sideline strips. Names legible at 7.6s and 84s in the supplied video.
    for(const end of [-1,1]){
      box(.22,3.25,ST_HZ*2,wall,end*(ST_HX+.05),1.625,0);
      const rot=end<0?Math.PI/2:-Math.PI/2,x=end*(ST_HX-.075);
      [[-6.5,'CHASE',3.2],[-2.2,'US OPEN',3.2],[2.4,'J.P. Morgan',3.7],[6.7,'Emirates Airline',4.4]].forEach(([z,t,w])=>panel(t,x,2.30,z,w,.74,rot));
      for(const z of [-6,-2,2,6]){box(.025,.31,1.50,mat(0x111820),x,.38,z);}
      panel('ROLEX',x,.92,7.1,1.1,.65,rot,'#17452E');
    }
    const sideNames=[[-14.6,'CHUBB',4.2],[-8.6,'IHG',3.6],[-2.2,'US OPEN',3.4],[4.4,'Spectrum',4.0],[10.0,'Deloitte.',3.9],[15.0,'MERCEDES-BENZ',4.5]];
    for(const side of [-1,1])sideNames.forEach(([x,t,w])=>panel(t,x,.52,side*(ST_HZ-.055),w,.58,side<0?0:Math.PI));
    const T=tiers[1],z=ST_HZ+T.o0-.10;
    for(const side of [-1,1]){
      panel('US OPEN',0,T.top+.70,side*z,29,.72,side<0?0:Math.PI,'#168DC1');
      [[-15,'CHASE'],[-7.5,'AMERICAN EXPRESS'],[0,'ARTHUR ASHE STADIUM'],[8,'Emirates Airline'],[16,'POLO RALPH LAUREN']].forEach(([x,t])=>panel(t,x,T.base-1.35,side*z,6.5,.62,side<0?0:Math.PI,'#102E50'));
    }
  }else if(rg){
    // Model has tall green ends, concrete sides and low discrete advertising panels.
    for(const end of [-1,1]){
      box(.22,3.15,ST_HZ*2,wall,end*(ST_HX+.04),1.575,0);
      panel('ROLAND-GARROS',end*(ST_HX-.08),1.85,0,4.2,1.10,end<0?Math.PI/2:-Math.PI/2);
    }
    const concrete=mat(0xB5B3A9,.98);
    for(const side of [-1,1]){
      box(2*ST_HX,1.30,.18,concrete,0,1.50,side*(ST_HZ+.08));
      for(const x of [-15,-10,-5,5,10,15]){
        const board=box(4.75,.64,.18,wall,x,.38,side*(ST_HZ-.16));board.rotation.x=side*.10;
      }
      // No fictitious sponsors: text in the source is the model vendor's placeholder.
    }
  }
}

function stVenueLandmarks(grp,V,tiers){
  if(V.roof!=='wimb')return;
  const g=new THREE.Group();g.name='Centre Court end pavilion';grp.add(g);
  const {mat,box,rod}=stDetailKit(g),green=mat(0x284D34),stone=mat(0xADA995),wood=mat(0x735134),glass=mat(0x142C21);
  // Raised central enclosure visible behind the far baseline in the supplied Wimbledon views.
  const x=ST_HX+1.4;
  box(3.5,4.4,10.4,green,x,2.2,0);box(3.9,.22,10.8,stone,x,4.5,0);
  for(const z of [-3.6,-1.8,0,1.8,3.6]){
    box(.04,.62,1.12,glass,x-1.77,2.82,z);
    for(const dz of [-.35,0,.35])rod([x-1.80,2.53,z+dz],[x-1.80,3.12,z+dz],.015,wood);
  }
  box(.20,1.0,10.6,green,x-1.75,5.05,0);
  for(const z of [-5.2,5.2])box(3.7,1.15,.16,wood,x,5.12,z);
  for(let row=0;row<4;row++)for(let col=0;col<12;col++){
    box(.51,.12,.48,mat(0x57876E),x-.8+row*.65,4.75+row*.25,(col-5.5)*.72);
    box(.10,.48,.48,green,x-.51+row*.65,4.98+row*.25,(col-5.5)*.72);
  }
}

function stVenueScreens(V,tiers,scr){
  const last=tiers[tiers.length-1];
  if(V.roof==='ashe'){
    // Screens centered beneath roof trusses, not on the four bowl corners.
    for(const end of [-1,1])scr(end*(ST_HX+last.o0+2),last.top+1.1,0,7.2,5.0,false);
  }else if(V.roof==='wimb'){
    scr(ST_HX+.82,3.0,-7.55,3.8,2.4,false);
  }
  // No video screens can be located confidently in the supplied Chatrier orbit.
}

function stCourtsideFurniture(grp,V){
  const group=new THREE.Group();group.name='Player benches and umpire tower';grp.add(group);
  const {mat,mesh,box,round,rod}=stDetailKit(group);
  const green=mat(V.post,.55,.13),metal=mat(0xA9B1AC,.34,.72),rubber=mat(0x202622,.96),white=mat(0xEEEDE5,.83),seat=mat(V.roof==='wimb'?0xF1EEE5:0xDBE1DA,.68);
  const towel=mat(V.roof==='wimb'?0xE8E3CD:0xF1F0E6,.99);towel.bumpMap=stFabricTexture();towel.bumpScale=.003;
  const uz=-7.85;
  // Splayed tower feet, cross braces, stair stringers, treads and arm rails.
  for(const x of [-.43,.43])for(const z of [-.44,.44]){
    rod([x*1.42,.06,uz+z*1.4],[x,2.04,uz+z],.033,green);
    box(.14,.055,.14,rubber,x*1.42,.028,uz+z*1.4);
  }
  for(const x of [-.43,.43]){
    rod([x*1.35,.24,uz-.56],[x,1.9,uz+.39],.02,metal);
    rod([x*1.35,.24,uz+.56],[x,1.9,uz-.39],.02,metal);
    rod([x,1.96,uz+.32],[x,2.53,uz+.32],.025,green);
    rod([x,2.53,uz+.32],[x,2.53,uz-.39],.028,green);
    rod([x*1.12,.09,uz-1.19],[x,2.06,uz-.42],.027,metal);
    rod([x*1.12,.64,uz-1.20],[x,2.65,uz-.40],.024,green);
  }
  for(let i=0;i<7;i++){const y=.22+i*.27,z=uz-1.14+i*.106;box(.86,.045,.18,metal,0,y,z);for(let j=0;j<3;j++)box(.77,.004,.008,rubber,0,y+.025,z-.05+j*.05);}
  round(.91,.11,.82,.045,seat,0,2.035,uz);
  round(.89,.66,.07,.095,seat,0,2.40,uz-.40).rotation.x=-.06;
  box(.98,.055,.36,green,0,1.50,uz+.58);
  const desk=box(.77,.045,.28,green,0,2.44,uz+.49);desk.rotation.x=-.16;
  const screen=box(.29,.025,.20,rubber,.13,2.48,uz+.49);screen.rotation.x=-.16;
  box(.245,.004,.155,mat(0x68878B,.33),.13,2.499,uz+.49).rotation.x=-.16;
  rod([-.25,2.46,uz+.46],[-.25,2.65,uz+.48],.007,rubber);rod([-.25,2.65,uz+.48],[-.12,2.72,uz+.52],.007,rubber);
  mesh(new THREE.SphereGeometry(.017,8,6),rubber,-.12,2.72,uz+.52);
  const banner=mesh(new THREE.PlaneGeometry(.77,1.02),new THREE.MeshStandardMaterial({map:stBrandTexture(V.roof==='wimb'?'':V.roof==='chatrier'?'':'US OPEN',V.roof==='ashe'?'#173E75':'#153F2F'),roughness:.86}),0,.88,uz+.54);
  // Slatted two-seat benches, independent armrests and contoured backs.
  for(const sign of [-1,1]){
    const x=sign*3.5,z=-7.78;
    for(const dx of [-.85,.85])for(const dz of [-.22,.23]){rod([x+dx,.05,z+dz],[x+dx,.52,z+dz],.023,metal);box(.09,.05,.09,rubber,x+dx,.025,z+dz);}
    if(V.roof==='wimb'){
      for(const dx of [-.58,.58]){
        round(.51,.055,.49,.025,seat,x+dx,.48,z);
        round(.51,.32,.045,.035,seat,x+dx,.83,z-.25);
        for(const side of [-1,1]){
          rod([x+dx+side*.23,.05,z-.28],[x+dx+side*.23,.91,z-.24],.016,metal);
          rod([x+dx+side*.23,.05,z+.26],[x+dx+side*.23,.54,z-.18],.016,metal);
        }
      }
    }else{
    for(let j=0;j<5;j++)round(2.12,.06,.078,.018,seat,x,.48,z-.22+j*.11);
    for(let j=0;j<4;j++)round(2.12,.10,.058,.026,seat,x,.66+j*.105,z-.27-j*.02);
    for(const dx of [-1.02,0,1.02]){rod([x+dx,.48,z+.18],[x+dx,.76,z+.18],.023,green);rod([x+dx,.76,z+.18],[x+dx,.78,z-.25],.028,green);}
    }
    // Soft towel draped over the back and cushion, with a contrasting woven border.
    const tg=new THREE.PlaneGeometry(.39,.87,8,18),p=tg.attributes.position;
    for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i)+.435;p.setXYZ(i,u,.58+Math.min(v,.39),v<.39?.04-v*.74:-.25-(v-.39)*.18);p.setY(i,p.getY(i)+.014*Math.sin(u*45+v*7));}tg.computeVertexNormals();
    const tm=towel.clone();tm.side=THREE.DoubleSide;const t=mesh(tg,tm,x-sign*.49,0,z);
    box(.38,.012,.027,green,x-sign*.49,.60,z+.012);
    // Racket bag with piping, zipper and carry handles.
    const bx=x+sign*1.39,bz=z+.05,bagMat=mat(sign<0?0x203B50:0xC2BAA0,.89);
    const bag=round(.39,.31,.77,.12,bagMat,bx,.20,bz);bag.rotation.y=.12*sign;
    for(const a of [-1,1])rod([bx+a*.15,.34,bz-.29],[bx+a*.15,.34,bz+.29],.008,white);
    rod([bx-.11,.35,bz],[bx-.08,.47,bz],.011,rubber);rod([bx+.11,.35,bz],[bx+.08,.47,bz],.011,rubber);rod([bx-.08,.47,bz],[bx+.08,.47,bz],.011,rubber);
    // Side table and cooler, translucent-looking bottle bodies without expensive transmission.
    const tx=x-sign*1.50;
    round(.53,.49,.48,.05,green,tx,.26,z);round(.55,.055,.50,.025,white,tx,.525,z);
    for(const dx of [-.12,.12]){
      const water=mat(0xABC9C5,.25,.12);mesh(new THREE.CylinderGeometry(.033,.043,.21,12),water,tx+dx,.66,z);
      mesh(new THREE.CylinderGeometry(.026,.033,.035,12),water,tx+dx,.782,z);
      mesh(new THREE.CylinderGeometry(.029,.029,.023,12),green,tx+dx,.81,z);
      mesh(new THREE.CylinderGeometry(.044,.044,.064,12),white,tx+dx,.665,z);
    }
    const shadow=stContactShadow(4,.95,.5);shadow.position.set(x,.008,z);group.add(shadow);
  }
  // Two low equipment boxes and folded spare towels, placed outside the doubles sidelines.
  for(const z of [-7.3,7.3]){round(.50,.31,.48,.035,green,1.7,.17,z);round(.42,.075,.35,.025,towel,1.7,.355,z);}
  stMergeParts(group);return {uz};
}

function stPlayerDetails(R,o){
  if(!o.racket)return;
  const k=stDetailKit(R.spine),stitch=k.mat(0xDEDCD1,.95),dark=k.mat(0x35474A,.8);
  // Jersey seams sit on the curved surface, not floating outside the torso.
  for(const s of [-1,1]){
    k.rod([.085,.07,s*.088],[.107,.25,s*.101],.0023,R.M.trim);
    k.rod([.107,.25,s*.101],[.092,.37,s*.13],.0023,R.M.trim);
  }
  // Small embroidered performance mark, placket and understated sleeve edge.
  k.rod([.110,.326,-.104],[.115,.340,-.081],.0028,R.M.trim);k.rod([.115,.340,-.081],[.111,.337,-.060],.0028,R.M.trim);
  k.rod([.062,.424,0],[.086,.383,0],.003,R.M.trim);
  for(const arm of R.arms){
    const a=stDetailKit(arm.a);a.mesh(new THREE.TorusGeometry(.055,.0035,4,24),R.M.trim,0,-.15,0).rotation.x=Math.PI/2;
    const h=stDetailKit(arm.elbow);h.mesh(new THREE.CylinderGeometry(.030,.031,.054,24),R.M.white,0,-.218,0);
    for(let i=0;i<4;i++)h.mesh(new THREE.TorusGeometry(.031,.0009,3,20),stitch,0,-.24+i*.014,0).rotation.x=Math.PI/2;
  }
  for(const leg of R.legs){
    const shoe=stDetailKit(leg.shoe);
    for(const s of [-1,1]){
      shoe.rod([-.07,.052,s*.05],[.05,.043,s*.054],.004,R.M.trim);
      for(let i=0;i<5;i++)shoe.box(.011,.009,.006,R.M.dark,-.085+i*.047,.023,s*.05);
    }
  }
}
