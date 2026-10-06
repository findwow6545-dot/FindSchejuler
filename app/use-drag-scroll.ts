'use client';
import {useEffect, type RefObject} from 'react';

/** Mouse dragging complements native touch, trackpad and keyboard scrolling. */
export function useDragScroll(ref:RefObject<HTMLDivElement|null>){
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    let pointer:number|null=null, startX=0,startY=0,startScroll=0,lastX=0,lastTime=0;
    let dragging=false,velocity=0,frame=0,suppressClickUntil=0;
    const stopMotion=()=>{cancelAnimationFrame(frame);frame=0;};
    const down=(e:PointerEvent)=>{
      if(e.pointerType!=='mouse'||e.button!==0||!e.isPrimary)return;
      if((e.target as Element).closest('button,input,textarea,select,a,[contenteditable=true],[data-card-drag]'))return;
      stopMotion();suppressClickUntil=0;pointer=e.pointerId;startX=lastX=e.clientX;
      startY=e.clientY;startScroll=el.scrollLeft;lastTime=performance.now();velocity=0;dragging=false;
    };
    const move=(e:PointerEvent)=>{
      if(pointer!==e.pointerId)return;
      const dx=e.clientX-startX,dy=e.clientY-startY;
      if(!dragging){
        if(Math.abs(dx)<6)return;
        if(Math.abs(dy)>Math.abs(dx)){pointer=null;return;}
        dragging=true;el.classList.add('is-dragging');el.setPointerCapture(e.pointerId);
      }
      e.preventDefault();const now=performance.now();
      velocity=(lastX-e.clientX)/Math.max(8,now-lastTime);
      el.scrollLeft+=lastX-e.clientX;lastX=e.clientX;lastTime=now;
    };
    const finish=(e:PointerEvent)=>{
      if(pointer!==e.pointerId)return;
      pointer=null;el.classList.remove('is-dragging');
      if(el.hasPointerCapture(e.pointerId))el.releasePointerCapture(e.pointerId);
      if(!dragging)return;dragging=false;suppressClickUntil=performance.now()+450;
      if(e.type==='pointercancel'||performance.now()-lastTime>80||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
      velocity=Math.max(-2.5,Math.min(2.5,velocity));let previous=performance.now();
      const glide=(now:number)=>{const dt=Math.min(32,now-previous);previous=now;
        const before=el.scrollLeft;el.scrollLeft+=velocity*dt;velocity*=Math.pow(.90,dt/16);
        if(Math.abs(velocity)>.03&&Math.abs(el.scrollLeft-before)>.1)frame=requestAnimationFrame(glide);
      };frame=requestAnimationFrame(glide);
    };
    const click=(e:MouseEvent)=>{if(e.detail!==0&&performance.now()<suppressClickUntil){e.preventDefault();e.stopPropagation();}};
    const nativeDrag=(e:DragEvent)=>{if(!(e.target as Element).closest('[data-card-drag]'))e.preventDefault()};
    const cancel=()=>{pointer=null;dragging=false;el.classList.remove('is-dragging');stopMotion();};
    el.addEventListener('pointerdown',down);window.addEventListener('pointermove',move,{passive:false});
    window.addEventListener('pointerup',finish);window.addEventListener('pointercancel',finish);
    window.addEventListener('blur',cancel);el.addEventListener('click',click,true);
    el.addEventListener('dragstart',nativeDrag);el.addEventListener('wheel',stopMotion,{passive:true});el.addEventListener('keydown',stopMotion);
    return()=>{cancel();el.removeEventListener('pointerdown',down);window.removeEventListener('pointermove',move);
      window.removeEventListener('pointerup',finish);window.removeEventListener('pointercancel',finish);window.removeEventListener('blur',cancel);
      el.removeEventListener('click',click,true);el.removeEventListener('dragstart',nativeDrag);el.removeEventListener('wheel',stopMotion);el.removeEventListener('keydown',stopMotion);};
  },[ref]);
}
