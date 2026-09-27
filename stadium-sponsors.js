/* Original logo files downloaded from official tournament partner pages.
   Source files are preserved in assets/logos; runtime masks provide the white signage variants. */
const ST_LOGO_FILES={lacoste:'lacoste.png',dobel:'dobel.png',bnp:'bnp.png',emirates:'emirates.jpg',renault:'renault.jpg',rolex:'rolex.jpg',accor:'accor.png',haier:'haier.png',infosys:'infosys.png',perrier:'perrier.png',rg:'rg.png',barclays:'barclays.jpg',ibm:'ibm.jpg','range-rover':'range-rover.jpg',wimbledon:'wimbledon.svg',amex:'amex.png',jpmorgan:'jpmorgan.png',cadillac:'cadillac.png',chubb:'chubb.png',deloitte:'deloitte.jpg',fage:'fage.png',harvey:'harvey.png',polo:'polo.png',wilson:'wilson.png',usopen:'usopen.svg'};
const ST_LOGO_CACHE=new Map(),ST_LOGO_STATUS={};
function stLogoTexture(key,variant='white'){
  const id=key+':'+variant;if(ST_LOGO_CACHE.has(id))return ST_LOGO_CACHE.get(id);
  const c=document.createElement('canvas');c.width=c.height=4;
  const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;t.stKeep=true;t.anisotropy=4;
  ST_LOGO_CACHE.set(id,t);ST_LOGO_STATUS[id]='loading';
  const image=new Image();image.onload=()=>{
    try{
      const src=document.createElement('canvas'),g=src.getContext('2d',{willReadFrequently:true});
      let w=image.naturalWidth,h=image.naturalHeight;const max=1024,scale=Math.min(1,max/Math.max(w,h));w=Math.ceil(w*scale);h=Math.ceil(h*scale);src.width=w;src.height=h;g.drawImage(image,0,0,w,h);
      // Crop the actual icon/wordmark components; never substitute a font.
      let crop=[0,0,w,h];
      if(key==='cadillac')crop=[0,0,w,h*.60];
      if(key==='polo')crop=[0,0,w,h*.65];
      if(key==='bnp'&&variant==='icon')crop=[w*.34,h*.06,w*.33,h*.59];
      if(key==='bnp'&&variant==='word')crop=[0,h*.64,w,h*.36];
      if(key==='amex')crop=[0,h*.23,w,h*.56];
      const data=g.getImageData(0,0,w,h),p=data.data;
      let x0=w,y0=h,x1=0,y1=0;
      const preserve=variant==='color'||(key==='bnp'&&variant==='icon');
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){
        const i=(y*w+x)*4;let a=p[i+3];const r=p[i],gg=p[i+1],b=p[i+2];
        if(x<crop[0]||y<crop[1]||x>=crop[0]+crop[2]||y>=crop[1]+crop[3])a=0;
        else if(['emirates','amex','rg','wimbledon','fage'].includes(key)&&!preserve)a*=Math.max(0,Math.min(1,(Math.min(r,gg,b)-150)/75));
        else if(!preserve)a*=Math.max(0,Math.min(1,(245-Math.min(r,gg,b))/70));
        if(!preserve){p[i]=p[i+1]=p[i+2]=255;}
        p[i+3]=a;
        if(a>25){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}
      }
      g.putImageData(data,0,0);if(x1<x0||y1<y0)throw new Error('Empty logo mask '+key);
      // Horizontal BNP lockup is assembled from its authentic downloaded icon and wordmark elsewhere.
      c.width=x1-x0+5;c.height=y1-y0+5;c.getContext('2d').drawImage(src,x0,y0,x1-x0+1,y1-y0+1,2,2,x1-x0+1,y1-y0+1);
      if(key==='barclays'){
        const old=document.createElement('canvas');old.width=c.width;old.height=c.height;old.getContext('2d').drawImage(c,0,0);
        c.width=320;c.height=240;const cg=c.getContext('2d');
        cg.drawImage(old,0,0,old.width*.185,old.height,103,12,114,104);
        cg.drawImage(old,old.width*.205,0,old.width*.795,old.height,12,150,296,62);
      }
      t.needsUpdate=true;ST_LOGO_STATUS[id]='ready';if(typeof ST3D!=='undefined'&&ST3D)ST3D.render();
    }catch(e){ST_LOGO_STATUS[id]='error';console.error(e);}
  };
  image.onerror=()=>{ST_LOGO_STATUS[id]='error';console.error('Logo unavailable: '+key);};
  image.src='assets/logos/'+ST_LOGO_FILES[key];return t;
}
function stLogo(parent,key,x,y,z,w,h,rotation=0,variant='white'){
  const map=stLogoTexture(key,variant),material=new THREE.MeshStandardMaterial({map,transparent:true,alphaTest:.08,side:THREE.DoubleSide,roughness:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
  const o=new THREE.Mesh(new THREE.PlaneGeometry(w,h),material);o.name='Logo '+key;o.position.set(x,y,z);o.rotation.y=rotation;o.renderOrder=2;parent.add(o);return o;
}
function stReferenceSignage(grp,V){
  const g=new THREE.Group();g.name='Reference sponsor layout';grp.add(g);
  const k=stDetailKit(g),rg=V.roof==='chatrier',us=V.roof==='ashe',wim=V.roof==='wimb';
  const green=k.mat(wim?0x234639:0x214C3B),blue=k.mat(0x17466F),wall=us?blue:green;
  // Far-end coordinate convention: x=+ST_HX, z negative is TV left. Hidden opposite end is mirrored.
  for(const end of [-1,1]){
    const x=end*(ST_HX-.13),rot=end<0?Math.PI/2:-Math.PI/2;
    const mark=(id,z,y,w,h,v='white')=>stLogo(g,id,x,y,z,w,h,rot,v);
    k.box(.23,wim?2.75:3.35,2*ST_HZ,wall,end*(ST_HX+.04),(wim?2.75:3.35)/2,0);
    if(rg){
      k.box(.08,.83,12.4,k.mat(0xEDEEE6),x,2.40,0);
      // Central large BNP panel plus the two smaller repetitions on its flanks.
      for(const [z,size] of [[-4.75,.70],[0,1.35],[4.75,.70]]){
        stLogo(g,'bnp',x-end*.07,2.4,z-size*1.46,size*.64,size*.64,rot,'icon');
        const word=stLogo(g,'bnp',x-end*.07,2.4,z+size*.25,size*2.60,size*.28,rot,'word');word.material.color.set(0x253C2D);
      }
      for(const z of [-7.7,-5.25,5.25,7.7])mark('emirates',z,3.12,1.9,.43);
      for(const z of [-3.1,3.1])mark('bnp',z,1.07,2.05,.26,'word');
      for(const z of [-5.1,0,5.1])mark('bnp',z,1.14,.52,.52,'icon');
      for(const z of [-8.35,8.35])mark('rg',z,1.70,.55,.55);
      mark('infosys',-8.15,.55,1.0,.31);
    }else if(us){
      mark('usopen',0,1.85,2.75,.66);
      for(const z of [-3.75,3.75])mark('jpmorgan',z,2.07,3.15,.62);
      for(const z of [-6.4,6.4])mark('emirates',z,2.58,1.8,.45);
      for(const z of [-8.3,8.3])mark('amex',z,2.55,1.45,.63);
      for(const z of [-4.9,4.9])mark('usopen',z,2.74,1.18,.25);
      for(const z of [-3.2,3.2])k.box(.04,.48,1.4,k.mat(0x101A21),x,.29,z);
    }else{
      for(const z of [-5.15,5.15])mark('wimbledon',z,2.15,.57,.57);
      mark('emirates',-7.2,.39,1.25,.25);
      for(const z of [-8.2,8.2])mark('rolex',z,4.8,.76,.48);
      mark('ibm',7.7,.78,.72,.28);mark('range-rover',8.75,.78,.9,.14);
    }
    if(rg||us||wim){
      const clock=new THREE.Group();clock.position.set(x-end*.1,wim?4.7:.70,wim?6.4:7.15);clock.rotation.y=rot;g.add(clock);
      const ck=stDetailKit(clock);ck.box(1.35,1.0,.1,green,0,0,0);
      const face=stCanvasTex(256,256,(c)=>{c.fillStyle='#efeedd';c.beginPath();c.arc(128,128,119,0,7);c.fill();c.strokeStyle='#284633';for(let i=0;i<12;i++){let a=i*Math.PI/6;c.lineWidth=4;c.beginPath();c.moveTo(128+Math.sin(a)*95,128+Math.cos(a)*95);c.lineTo(128+Math.sin(a)*107,128+Math.cos(a)*107);c.stroke();}c.lineWidth=6;c.beginPath();c.moveTo(82,96);c.lineTo(128,128);c.lineTo(147,42);c.stroke();});
      ck.mesh(new THREE.CircleGeometry(.32,40),new THREE.MeshStandardMaterial({map:face}),-.32,.05,.06);
      stLogo(clock,'rolex',.35,.16,.07,.51,.30,0).material.color.set(0xE7CE76);
      const time=ck.mesh(new THREE.PlaneGeometry(.52,.26),new THREE.MeshBasicMaterial({map:stBrandTexture('0:07',null,'#D9ED74')}),.35,-.20,.07);
    }
    if(us){
      const speed=new THREE.Group();speed.position.set(x-end*.10,.6,-5.2);speed.rotation.y=rot;g.add(speed);
      const sk=stDetailKit(speed);sk.box(1.25,1.05,.12,sk.mat(0x102532),0,0,0);stLogo(speed,'ibm',0,.28,.07,.73,.28);
      sk.mesh(new THREE.PlaneGeometry(1,.32),new THREE.MeshBasicMaterial({map:stBrandTexture('140 MPH',null)}),0,-.12,.07);
    }
  }
  if(rg){
    // Opposite sideline: repeated Renault; umpire side: Perrier. ALL Accor nearest the camera.
    for(const x of [-14,-9,-4,4,9,14])stLogo(g,'renault',x,.56,ST_HZ-.08,.43,.60,Math.PI);
    for(const x of [-16,-11,-6,6,11,16])stLogo(g,'perrier',x,.54,-ST_HZ+.08,1.45,.54);
    for(const x of [10,14])stLogo(g,'lacoste',x,.53,-ST_HZ+.09,1.30,.37);
    stLogo(g,'accor',-15.8,.58,ST_HZ-.09,1.8,.63,Math.PI);
  }else if(us){
    for(const [id,x] of [['wilson',-15],['harvey',-10],['fage',-5]])stLogo(g,id,x,.49,-ST_HZ+.07,2.1,.53);
    for(const [id,x] of [['chubb',-13],['deloitte',-6],['dobel',4]])stLogo(g,id,x,.49,ST_HZ-.07,2.2,.48,Math.PI);
  }
  // Net emblems are outside the singles area, on both faces of the mesh.
  if(!wim)for(const side of [-1,1])for(const face of [-1,1])stLogo(g,rg?'renault':'cadillac',face*.045,.53,side*5.70,rg?.48:1.00,rg?.73:.40,Math.PI/2);
  const uz=wim?7.85:-7.85,front=wim?-1:1;
  stLogo(g,wim?'barclays':rg?'perrier':'polo',0,.94,uz+front*.555,.77,wim?.60:rg?.75:.38,wim?Math.PI:0);
  if(us)stLogo(g,'chubb',0,2.3,uz+.56,.62,.10);
  if(rg){
    const eq=k.box(1.05,.55,.6,green,0,.29,7.5);stLogo(g,'haier',0,.32,7.17,.85,.29,Math.PI);
    for(const x of [-3.5,3.5])stLogo(g,'perrier',x,.31,-7.38,1.35,.48);
  }
}
