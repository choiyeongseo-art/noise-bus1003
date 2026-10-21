'use client';
import {useEffect,useRef,useState} from 'react';
import {RotateCcw,Move,ZoomIn,ZoomOut} from 'lucide-react';
export default function Character(){
 const host=useRef<HTMLDivElement>(null);const controlsRef=useRef<any>(null);const [error,setError]=useState('');const [loaded,setLoaded]=useState(false);
 useEffect(()=>{let disposed=false,frame=0;let cleanup=()=>{};
  (async()=>{try{
   const T=await import('three');const {GLTFLoader}=await import('three/examples/jsm/loaders/GLTFLoader.js');const {OrbitControls}=await import('three/examples/jsm/controls/OrbitControls.js');if(disposed||!host.current)return;
   const el=host.current;const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});renderer.setPixelRatio(Math.min(window.devicePixelRatio,1.75));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;el.appendChild(renderer.domElement);
   const scene=new T.Scene();const camera=new T.PerspectiveCamera(32,1,.01,100);camera.position.set(0,.75,2.2);
   const controls=new OrbitControls(camera,renderer.domElement);controlsRef.current=controls;controls.target.set(0,.52,0);controls.enableDamping=true;controls.enablePan=false;controls.minDistance=1;controls.maxDistance=4;controls.minPolarAngle=.35;controls.maxPolarAngle=1.8;
   scene.add(new T.HemisphereLight(0xd9e6ff,0x4b496b,3));const key=new T.DirectionalLight(0xffffff,4);key.position.set(2,3,4);scene.add(key);const rim=new T.DirectionalLight(0x839eff,3);rim.position.set(-2,1,-2);scene.add(rim);
   const ring=new T.Mesh(new T.RingGeometry(.38,.385,100),new T.MeshBasicMaterial({color:0x839eff,transparent:true,opacity:.4,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=-.01;scene.add(ring);
   let model:any;const loader=new GLTFLoader();loader.load('./assets/nox.glb',gltf=>{if(disposed){gltf.scene.traverse((o:any)=>o.geometry?.dispose());return;}model=gltf.scene;const bounds=new T.Box3().setFromObject(model);const size=bounds.getSize(new T.Vector3());const scale=1.1/size.y;model.scale.multiplyScalar(scale);bounds.setFromObject(model);const center=bounds.getCenter(new T.Vector3());model.position.x-=center.x;model.position.z-=center.z;model.position.y-=bounds.min.y;scene.add(model);setLoaded(true);},undefined,()=>setError('3D 모델을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.'));
   const resize=()=>{if(!el.clientWidth||!el.clientHeight)return;renderer.setSize(el.clientWidth,el.clientHeight);camera.aspect=el.clientWidth/el.clientHeight;camera.updateProjectionMatrix();};const observer=new ResizeObserver(resize);observer.observe(el);resize();const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   const loop=()=>{if(disposed)return;frame=requestAnimationFrame(loop);if(model&&!reduced)model.rotation.y=Math.sin(performance.now()*.0003)*.025;controls.update();renderer.render(scene,camera);};loop();
   cleanup=()=>{cancelAnimationFrame(frame);observer.disconnect();controls.dispose();scene.traverse((o:any)=>{o.geometry?.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m){for(const v of Object.values(m))if(v instanceof T.Texture)v.dispose();m.dispose();}});renderer.dispose();renderer.domElement.remove();};
  }catch{setError('이 브라우저에서는 3D 그래픽을 사용할 수 없습니다. 프로필 사진으로 표시합니다.');}})();return()=>{disposed=true;cleanup();};
 },[]);
 const zoom=(factor:number)=>{const c=controlsRef.current;if(c){const distance=c.object.position.distanceTo(c.target);if(distance*factor>=c.minDistance&&distance*factor<=c.maxDistance)c.object.position.sub(c.target).multiplyScalar(factor).add(c.target);c.update();}};
 return <div className="character-wrap"><div className="character-canvas" ref={host} role="img" aria-label="제공된 FBX에서 변환한 녹스 3D 캐릭터. 드래그하여 회전할 수 있습니다."/>{!loaded&&!error&&<div className="model-loading"><span className="spinner"/>녹스가 연습실로 오는 중…</div>}{error&&<div className="model-fallback"><img src="./assets/nox.webp" alt="녹스"/><p>{error}</p></div>}<div className="model-tools"><span><Move size={13}/> 드래그로 회전</span><button aria-label="캐릭터 확대" onClick={()=>zoom(.85)}><ZoomIn size={16}/></button><button aria-label="캐릭터 축소" onClick={()=>zoom(1.15)}><ZoomOut size={16}/></button><button aria-label="카메라 초기화" onClick={()=>controlsRef.current?.reset()}><RotateCcw size={15}/></button></div></div>;
}

