import { useEffect, useRef, useState } from "react";

const THEMES = [
  { id: "inferno",   label: "🔥 Inferno"  },
  { id: "midnight",  label: "🌙 Midnight" },
  { id: "goldrush",  label: "👑 Gold Rush" },
  { id: "softroast", label: "🌸 Soft"     },
  { id: "tabloid",   label: "📰 Tabloid"  },
  { id: "cyber",     label: "🤖 Cyber"    },
];

// ─── helpers ────────────────────────────────────────────────────────────────
function wrapText(ctx, text, maxW, lineH) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    if (ctx.measureText(test).width > maxW && current) { lines.push(current); current = word; }
    else current = test;
  }
  if (current) lines.push(current);
  return lines;
}

function drawCirclePhoto(ctx, img, cx, cy, radius, mirror = false, isAiPortrait = false) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.clip();
  const aspect = img.width / img.height;
  let srcW = img.width, srcH = img.height;
  if (aspect > 1) srcW = img.height; else srcH = img.width;
  const srcX = (img.width - srcW) / 2;
  const srcY = (img.height - srcH) / 2;
  const photoX = cx - radius, photoY = cy - radius, photoSize = radius * 2;
  if (mirror) {
    ctx.translate(photoX + photoSize, photoY);
    ctx.scale(-1, 1);
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, photoSize, photoSize);
  } else {
    ctx.drawImage(img, srcX, srcY, srcW, srcH, photoX, photoY, photoSize, photoSize);
  }
  ctx.restore();
  if (isAiPortrait) {
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.6)";
    ctx.beginPath();
    const bx = cx + radius * 0.55, by = cy + radius * 0.55;
    ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.fill();
    ctx.font = "22px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("🤖", bx, by); ctx.textBaseline = "alphabetic";
    ctx.restore();
  }
}

function drawEmojiAvatar(ctx, cx, cy, radius) {
  ctx.save();
  ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  const g = ctx.createRadialGradient(cx, cy - 20, 10, cx, cy, radius);
  g.addColorStop(0, "#2a2a2a"); g.addColorStop(1, "#111"); ctx.fillStyle = g; ctx.fill();
  ctx.restore();
  ctx.font = `${radius * 0.9}px serif`;
  ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText("😉", cx, cy); ctx.textBaseline = "alphabetic";
}

// ─── THEME DRAWERS ───────────────────────────────────────────────────────────

function drawInferno(ctx, W, H, roast, savage, img, isRandom, isAiPortrait) {
  // Fiery dark red gradient bg
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#110000"); bg.addColorStop(0.5, "#2a0000"); bg.addColorStop(1, "#1a0500");
  ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

  // Ember glow spots
  [[W*0.1,H*0.2,80],[W*0.85,H*0.15,60],[W*0.5,H*0.85,100]].forEach(([x,y,r])=>{
    const g = ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,"rgba(255,80,0,0.18)"); g.addColorStop(1,"transparent");
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  });

  // Top flame bar
  const bar = ctx.createLinearGradient(0,0,W,0);
  bar.addColorStop(0,"#ff2200"); bar.addColorStop(0.5,"#ff6600"); bar.addColorStop(1,"#ff2200");
  ctx.fillStyle=bar; ctx.fillRect(0,0,W,8);

  // Title
  ctx.fillStyle="#ff4422"; ctx.font="bold 26px 'Segoe UI',sans-serif";
  ctx.textAlign="center"; ctx.fillText("🔥 ROAST BY AI 🔥", W/2, 48);

  // Photo circle
  const cx=W/2, cy=170, radius=110;
  ctx.save(); ctx.shadowColor="#ff4400"; ctx.shadowBlur=40;
  ctx.beginPath(); ctx.arc(cx,cy,radius+5,0,Math.PI*2);
  ctx.strokeStyle="#ff3300"; ctx.lineWidth=4; ctx.stroke(); ctx.restore();
  // Dashed outer ring
  ctx.save(); ctx.setLineDash([8,6]); ctx.beginPath(); ctx.arc(cx,cy,radius+14,0,Math.PI*2);
  ctx.strokeStyle="rgba(255,80,0,0.4)"; ctx.lineWidth=2; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();

  if (img) drawCirclePhoto(ctx,img,cx,cy,radius,!isAiPortrait,isAiPortrait);
  else drawEmojiAvatar(ctx,cx,cy,radius);

  // Divider
  const divY=cy+radius+28;
  const dg=ctx.createLinearGradient(40,0,W-40,0);
  dg.addColorStop(0,"transparent"); dg.addColorStop(0.5,"#ff440088"); dg.addColorStop(1,"transparent");
  ctx.strokeStyle=dg; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(40,divY); ctx.lineTo(W-40,divY); ctx.stroke();

  // Mode label
  ctx.fillStyle="#ff6633bb"; ctx.font="bold 12px 'Segoe UI',sans-serif"; ctx.textAlign="center";
  ctx.fillText(savage?"💀 SAVAGE ROAST":"😇 FRIENDLY ROAST", W/2, divY+26);

  // Roast text
  ctx.fillStyle="#fff8f5"; ctx.font="bold 21px Georgia,serif"; ctx.textAlign="center";
  const lines=wrapText(ctx,roast,W-90,32);
  const tH=lines.length*32;
  const tY=divY+50+(H-divY-50-80-tH)/2;
  ctx.save(); ctx.shadowColor="#ff220044"; ctx.shadowBlur=8;
  lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*32)); ctx.restore();

  // Quote marks
  ctx.fillStyle="rgba(255,68,0,0.18)"; ctx.font="bold 90px Georgia,serif";
  ctx.textAlign="left"; ctx.fillText("\u201C",12,tY+10);
  ctx.textAlign="right"; ctx.fillText("\u201D",W-12,tY+lines.length*32+10);

  // Footer
  ctx.fillStyle="rgba(255,255,255,0.25)"; ctx.font="11px 'Segoe UI',sans-serif";
  ctx.textAlign="center"; ctx.fillText("roastbyai.app  •  Built by k.Harshith", W/2, H-16);
  ctx.fillStyle=bar; ctx.fillRect(0,H-7,W,7);
}

function drawMidnight(ctx, W, H, roast, savage, img, isRandom, isAiPortrait) {
  // Deep space bg
  ctx.fillStyle="#020818"; ctx.fillRect(0,0,W,H);

  // Stars
  ctx.fillStyle="rgba(200,220,255,0.7)";
  for(let i=0;i<120;i++){
    const x=Math.sin(i*137.5)*W, y=Math.cos(i*97.3)*H;
    const sx=((x%W)+W)%W, sy=((y%H)+H)%H;
    const r=i%7===0?1.5:i%3===0?1:0.5;
    ctx.beginPath(); ctx.arc(sx,sy,r,0,Math.PI*2); ctx.fill();
  }

  // Soft nebula glow
  [[W*0.2,H*0.3,120,"rgba(0,80,180,0.12)"],[W*0.8,H*0.6,140,"rgba(80,0,160,0.1)"]].forEach(([x,y,r,c])=>{
    const g=ctx.createRadialGradient(x,y,0,x,y,r);
    g.addColorStop(0,c); g.addColorStop(1,"transparent");
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  });

  // Top bar
  const bar=ctx.createLinearGradient(0,0,W,0);
  bar.addColorStop(0,"#0044cc"); bar.addColorStop(0.5,"#00e5ff"); bar.addColorStop(1,"#0044cc");
  ctx.fillStyle=bar; ctx.fillRect(0,0,W,6);

  // Title with moon
  ctx.fillStyle="#00e5ff"; ctx.font="bold 24px 'Segoe UI',sans-serif";
  ctx.textAlign="center"; ctx.fillText("🌙 ROAST BY AI 🌙", W/2, 46);

  // Photo — hexagonal clip effect via stroked ring
  const cx=W/2, cy=172, radius=110;
  ctx.save(); ctx.shadowColor="#00e5ff"; ctx.shadowBlur=36;
  ctx.beginPath(); ctx.arc(cx,cy,radius+5,0,Math.PI*2);
  ctx.strokeStyle="#00e5ff"; ctx.lineWidth=3; ctx.stroke(); ctx.restore();
  // Constellation dots around ring
  for(let a=0;a<12;a++){
    const ang=(a/12)*Math.PI*2;
    const dx=cx+Math.cos(ang)*(radius+18), dy=cy+Math.sin(ang)*(radius+18);
    ctx.beginPath(); ctx.arc(dx,dy,2.5,0,Math.PI*2);
    ctx.fillStyle=a%3===0?"#00e5ff":"rgba(0,229,255,0.35)"; ctx.fill();
    if(a%3===0){
      const ang2=((a+4)/12)*Math.PI*2;
      const dx2=cx+Math.cos(ang2)*(radius+18), dy2=cy+Math.sin(ang2)*(radius+18);
      ctx.beginPath(); ctx.moveTo(dx,dy); ctx.lineTo(dx2,dy2);
      ctx.strokeStyle="rgba(0,229,255,0.15)"; ctx.lineWidth=1; ctx.stroke();
    }
  }

  if(img) drawCirclePhoto(ctx,img,cx,cy,radius,!isAiPortrait,isAiPortrait);
  else drawEmojiAvatar(ctx,cx,cy,radius);

  // Divider line with diamond
  const divY=cy+radius+28;
  ctx.strokeStyle="rgba(0,229,255,0.3)"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(40,divY); ctx.lineTo(W/2-16,divY); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(W/2+16,divY); ctx.lineTo(W-40,divY); ctx.stroke();
  ctx.save(); ctx.translate(W/2,divY); ctx.rotate(Math.PI/4);
  ctx.strokeStyle="#00e5ff88"; ctx.lineWidth=1.5;
  ctx.strokeRect(-6,-6,12,12); ctx.restore();

  // Mode label
  ctx.fillStyle="#00e5ffaa"; ctx.font="bold 11px 'Segoe UI',sans-serif";
  ctx.textAlign="center"; ctx.fillText(savage?"💀 SAVAGE ROAST":"😇 FRIENDLY ROAST", W/2, divY+26);

  // Roast text
  ctx.fillStyle="#e0f7ff"; ctx.font="italic bold 20px Georgia,serif"; ctx.textAlign="center";
  const lines=wrapText(ctx,roast,W-90,32);
  const tH=lines.length*32;
  const tY=divY+50+(H-divY-50-80-tH)/2;
  ctx.save(); ctx.shadowColor="#00e5ff22"; ctx.shadowBlur=10;
  lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*32)); ctx.restore();

  ctx.fillStyle="rgba(0,229,255,0.12)"; ctx.font="bold 90px Georgia,serif";
  ctx.textAlign="left"; ctx.fillText("\u201C",12,tY+10);
  ctx.textAlign="right"; ctx.fillText("\u201D",W-12,tY+lines.length*32+10);

  ctx.fillStyle="rgba(180,220,255,0.3)"; ctx.font="11px 'Segoe UI',sans-serif";
  ctx.textAlign="center"; ctx.fillText("roastbyai.app  •  Built by k.Harshith", W/2, H-16);
  ctx.fillStyle=bar; ctx.fillRect(0,H-6,W,6);
}

function drawGoldRush(ctx, W, H, roast, savage, img, isRandom, isAiPortrait) {
  // Rich black bg
  ctx.fillStyle="#080600"; ctx.fillRect(0,0,W,H);

  // Subtle gold shimmer vignette
  const vig=ctx.createRadialGradient(W/2,H/2,100,W/2,H/2,H*0.8);
  vig.addColorStop(0,"rgba(255,200,0,0.05)"); vig.addColorStop(1,"rgba(0,0,0,0.4)");
  ctx.fillStyle=vig; ctx.fillRect(0,0,W,H);

  // Ornate top border — double line
  const gold="linear-gradient(90deg,#7a5c00,#ffd700,#fff8a0,#ffd700,#7a5c00)";
  ctx.fillStyle="#ffd700"; ctx.fillRect(0,0,W,4);
  ctx.fillStyle="rgba(255,215,0,0.3)"; ctx.fillRect(0,6,W,1);

  // Corner ornaments
  const orn=(x,y,flip)=>{
    ctx.save(); ctx.translate(x,y);
    if(flip) ctx.scale(-1,1);
    ctx.fillStyle="#ffd700"; ctx.font="22px serif";
    ctx.textAlign="left"; ctx.textBaseline="top"; ctx.fillText("❧",0,0);
    ctx.textBaseline="alphabetic"; ctx.restore();
  };
  orn(12,10,false); orn(W-12,10,true);

  // Title
  ctx.fillStyle="#ffd700"; ctx.font="bold 24px 'Segoe UI',sans-serif";
  ctx.textAlign="center";
  ctx.save(); ctx.shadowColor="#ffd700"; ctx.shadowBlur=18;
  ctx.fillText("✦ ROAST BY AI ✦", W/2, 52); ctx.restore();

  // Photo — square with rounded corners inside ornate frame
  const cx=W/2, cy=180, radius=110;
  // Outer decorative square ring
  ctx.save(); ctx.shadowColor="#ffd700"; ctx.shadowBlur=24;
  ctx.strokeStyle="#ffd700"; ctx.lineWidth=3;
  const sq=radius+10;
  ctx.beginPath();
  ctx.roundRect(cx-sq,cy-sq,sq*2,sq*2,12);
  ctx.stroke(); ctx.restore();
  // Inner glow ring
  ctx.save(); ctx.strokeStyle="rgba(255,215,0,0.25)"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.roundRect(cx-sq-8,cy-sq-8,(sq+8)*2,(sq+8)*2,16); ctx.stroke(); ctx.restore();
  // Clip photo to circle
  if(img) drawCirclePhoto(ctx,img,cx,cy,radius,!isAiPortrait,isAiPortrait);
  else drawEmojiAvatar(ctx,cx,cy,radius);

  // Crown on top
  ctx.font="30px serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText("👑", cx, cy-radius-22); ctx.textBaseline="alphabetic";

  // Ornate divider
  const divY=cy+radius+28;
  ctx.fillStyle="#ffd70066"; ctx.font="18px serif"; ctx.textAlign="center";
  ctx.fillText("— ✦ —", W/2, divY+8);

  ctx.fillStyle="#ffd700bb"; ctx.font="bold 12px 'Segoe UI',sans-serif";
  ctx.textAlign="center"; ctx.fillText(savage?"💀 SAVAGE ROAST":"😇 FRIENDLY ROAST",W/2,divY+34);

  // Roast text
  ctx.fillStyle="#fff8dc"; ctx.font="bold 21px Georgia,serif"; ctx.textAlign="center";
  const lines=wrapText(ctx,roast,W-90,32);
  const tH=lines.length*32;
  const tY=divY+58+(H-divY-58-80-tH)/2;
  ctx.save(); ctx.shadowColor="#ffd70033"; ctx.shadowBlur=6;
  lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*32)); ctx.restore();

  ctx.fillStyle="rgba(255,215,0,0.14)"; ctx.font="bold 90px Georgia,serif";
  ctx.textAlign="left"; ctx.fillText("\u201C",12,tY+10);
  ctx.textAlign="right"; ctx.fillText("\u201D",W-12,tY+lines.length*32+10);

  // Bottom ornament
  ctx.fillStyle="rgba(255,215,0,0.5)"; ctx.font="11px 'Segoe UI',sans-serif";
  ctx.textAlign="center"; ctx.fillText("roastbyai.app  •  Built by k.Harshith",W/2,H-16);
  ctx.fillStyle="#ffd700"; ctx.fillRect(0,H-4,W,4);
  ctx.fillStyle="rgba(255,215,0,0.3)"; ctx.fillRect(0,H-7,W,1);
  orn(12,H-36,false); orn(W-12,H-36,true);
}

function drawSoftRoast(ctx, W, H, roast, savage, img, isRandom, isAiPortrait) {
  // Soft purple-pink gradient
  const bg=ctx.createLinearGradient(0,0,W,H);
  bg.addColorStop(0,"#1a0a20"); bg.addColorStop(0.5,"#2a0d35"); bg.addColorStop(1,"#1a0515");
  ctx.fillStyle=bg; ctx.fillRect(0,0,W,H);

  // Bubble decorations
  [[80,60,40,"rgba(255,120,200,0.08)"],[W-60,90,55,"rgba(180,80,255,0.07)"],
   [W-90,H-80,45,"rgba(255,150,200,0.09)"],[70,H-100,50,"rgba(150,80,255,0.07)"]].forEach(([x,y,r,c])=>{
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
    ctx.fillStyle=c; ctx.fill();
    ctx.strokeStyle=c.replace(/[\d.]+\)$/,"0.3)"); ctx.lineWidth=1.5; ctx.stroke();
  });

  // Top bar — pastel gradient
  const bar=ctx.createLinearGradient(0,0,W,0);
  bar.addColorStop(0,"#ff79c6"); bar.addColorStop(0.5,"#bd93f9"); bar.addColorStop(1,"#ff79c6");
  ctx.fillStyle=bar; ctx.fillRect(0,0,W,6);

  // Title
  ctx.fillStyle="#ff79c6"; ctx.font="bold 24px 'Segoe UI',sans-serif";
  ctx.textAlign="center"; ctx.fillText("🌸 ROAST BY AI 🌸", W/2, 46);

  // Floating hearts around photo
  const cx=W/2, cy=172, radius=110;
  ["💕","✨","🌸","💫","🎀","💖"].forEach((e,i)=>{
    const ang=(i/6)*Math.PI*2-(Math.PI/2);
    const ex=cx+Math.cos(ang)*(radius+28), ey=cy+Math.sin(ang)*(radius+28);
    ctx.font="16px serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText(e,ex,ey); ctx.textBaseline="alphabetic";
  });

  // Photo ring — double dashed soft ring
  ctx.save(); ctx.setLineDash([6,4]);
  ctx.beginPath(); ctx.arc(cx,cy,radius+8,0,Math.PI*2);
  ctx.strokeStyle="rgba(255,121,198,0.5)"; ctx.lineWidth=2; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();
  ctx.save(); ctx.shadowColor="#ff79c6"; ctx.shadowBlur=20;
  ctx.beginPath(); ctx.arc(cx,cy,radius+2,0,Math.PI*2);
  ctx.strokeStyle="#ff79c6"; ctx.lineWidth=3; ctx.stroke(); ctx.restore();

  if(img) drawCirclePhoto(ctx,img,cx,cy,radius,!isAiPortrait,isAiPortrait);
  else drawEmojiAvatar(ctx,cx,cy,radius);

  // Wavy divider
  const divY=cy+radius+32;
  ctx.strokeStyle="rgba(255,121,198,0.4)"; ctx.lineWidth=1.5;
  ctx.beginPath();
  for(let x=40;x<W-40;x+=2){
    const y=divY+Math.sin((x-40)*0.08)*4;
    x===40?ctx.moveTo(x,y):ctx.lineTo(x,y);
  }
  ctx.stroke();

  ctx.fillStyle="#bd93f9bb"; ctx.font="bold 11px 'Segoe UI',sans-serif";
  ctx.textAlign="center"; ctx.fillText(savage?"💀 SAVAGE ROAST":"😇 FRIENDLY ROAST",W/2,divY+24);

  // Roast text — italic
  ctx.fillStyle="#ffe6f7"; ctx.font="italic bold 20px Georgia,serif"; ctx.textAlign="center";
  const lines=wrapText(ctx,roast,W-90,32);
  const tH=lines.length*32;
  const tY=divY+46+(H-divY-46-80-tH)/2;
  lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*32));

  ctx.fillStyle="rgba(255,121,198,0.12)"; ctx.font="bold 90px Georgia,serif";
  ctx.textAlign="left"; ctx.fillText("\u201C",12,tY+10);
  ctx.textAlign="right"; ctx.fillText("\u201D",W-12,tY+lines.length*32+10);

  ctx.fillStyle="rgba(255,200,240,0.3)"; ctx.font="11px 'Segoe UI',sans-serif";
  ctx.textAlign="center"; ctx.fillText("roastbyai.app  •  Built by k.Harshith",W/2,H-16);
  ctx.fillStyle=bar; ctx.fillRect(0,H-6,W,6);
}

function drawTabloid(ctx, W, H, roast, savage, img, isRandom, isAiPortrait) {
  // Newspaper off-white
  ctx.fillStyle="#f0ede6"; ctx.fillRect(0,0,W,H);

  // Subtle halftone dots (top-left cluster)
  ctx.fillStyle="rgba(0,0,0,0.04)";
  for(let x=0;x<W;x+=12) for(let y=0;y<H;y+=12){
    ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2); ctx.fill();
  }

  // Thick headline bar
  ctx.fillStyle="#111"; ctx.fillRect(0,0,W,72);
  ctx.fillStyle="#e8e8e8"; ctx.font="bold 28px 'Courier New',monospace";
  ctx.textAlign="center"; ctx.fillText("⬛ ROAST DAILY ⬛", W/2, 44);
  ctx.fillStyle="#ccc"; ctx.font="10px 'Courier New',monospace";
  ctx.fillText("VOL. 1  •  AI EDITION  •  YOUR FACE, OUR BUSINESS", W/2, 62);

  // Horizontal rule
  ctx.fillStyle="#333"; ctx.fillRect(20,74,W-40,3);
  ctx.fillStyle="#999"; ctx.fillRect(20,80,W-40,1);

  // Photo — square newspaper crop style
  const px=W/2-100, py=90, pw=200, ph=200;
  ctx.save();
  ctx.fillStyle="#ddd"; ctx.fillRect(px-3,py-3,pw+6,ph+6);
  ctx.fillStyle="#bbb"; ctx.fillRect(px-1,py-1,pw+2,ph+2);
  if(img){
    ctx.save();
    ctx.beginPath(); ctx.rect(px,py,pw,ph); ctx.clip();
    const aspect=img.width/img.height;
    let srcW=img.width,srcH=img.height;
    if(aspect>1) srcW=img.height; else srcH=img.width;
    const srcX=(img.width-srcW)/2, srcY=(img.height-srcH)/2;
    if(!isAiPortrait){
      ctx.translate(px+pw,py); ctx.scale(-1,1);
      ctx.drawImage(img,srcX,srcY,srcW,srcH,0,0,pw,ph);
    } else {
      ctx.drawImage(img,srcX,srcY,srcW,srcH,px,py,pw,ph);
    }
    ctx.restore();
    // B&W overlay
    ctx.save(); ctx.globalCompositeOperation="saturation";
    ctx.fillStyle="rgba(128,128,128,1)"; ctx.fillRect(px,py,pw,ph); ctx.restore();
    ctx.save(); ctx.globalCompositeOperation="multiply";
    ctx.fillStyle="rgba(240,237,230,0.3)"; ctx.fillRect(px,py,pw,ph); ctx.restore();
  } else {
    ctx.fillStyle="#ccc"; ctx.fillRect(px,py,pw,ph);
    ctx.fillStyle="#888"; ctx.font="60px serif"; ctx.textAlign="center"; ctx.textBaseline="middle";
    ctx.fillText("😉",px+pw/2,py+ph/2); ctx.textBaseline="alphabetic";
  }
  ctx.restore();

  // "PHOTO" caption below image
  ctx.fillStyle="#555"; ctx.font="9px 'Courier New',monospace";
  ctx.textAlign="center"; ctx.fillText("EXCLUSIVE PHOTO — SUBJECT UNAWARE OF IMPENDING ROAST", W/2, py+ph+14);

  // Headline
  ctx.fillStyle="#111"; ctx.font="bold 26px 'Courier New',monospace";
  ctx.textAlign="center";
  const hl=savage?"LOCAL FACE DEMOLISHED":"MILD ROAST DETECTED";
  ctx.fillText(hl, W/2, py+ph+40);

  // Divider rule
  ctx.fillStyle="#555"; ctx.fillRect(40,py+ph+48,W-80,1);

  // Roast text in serif newspaper body
  ctx.fillStyle="#111"; ctx.font="17px 'Courier New',monospace"; ctx.textAlign="center";
  const lines=wrapText(ctx,roast,W-80,26);
  const tY=py+ph+66;
  lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*26));

  // Stamp
  const sX=W-85, sY=H-90;
  ctx.save(); ctx.translate(sX,sY); ctx.rotate(-0.35);
  ctx.strokeStyle=savage?"rgba(180,0,0,0.7)":"rgba(0,100,0,0.6)";
  ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,38,0,Math.PI*2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0,0,33,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle=savage?"rgba(180,0,0,0.75)":"rgba(0,100,0,0.65)";
  ctx.font="bold 11px 'Courier New',monospace"; ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(savage?"ROASTED":"MILD",0,-4); ctx.fillText(savage?"💀":"😇",0,10);
  ctx.textBaseline="alphabetic"; ctx.restore();

  // Footer
  ctx.fillStyle="#111"; ctx.fillRect(0,H-28,W,28);
  ctx.fillStyle="#aaa"; ctx.font="10px 'Courier New',monospace";
  ctx.textAlign="center"; ctx.fillText("roastbyai.app  •  Built by k.Harshith  •  NOT RESPONSIBLE FOR HURT FEELINGS",W/2,H-10);
}

function drawCyber(ctx, W, H, roast, savage, img, isRandom, isAiPortrait) {
  // Pure black
  ctx.fillStyle="#000"; ctx.fillRect(0,0,W,H);

  // Grid lines
  ctx.strokeStyle="rgba(0,255,20,0.06)"; ctx.lineWidth=1;
  for(let x=0;x<W;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();}
  for(let y=0;y<H;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();}

  // Scanlines
  ctx.fillStyle="rgba(0,0,0,0.25)";
  for(let y=0;y<H;y+=3){ctx.fillRect(0,y,W,1);}

  // Matrix rain effect (top area)
  ctx.fillStyle="rgba(0,255,20,0.06)"; ctx.font="10px 'Courier New',monospace";
  "ROASTAI_SYSTEM_INIT...SCANNING_FACE...PROCESSING_FLAWS...GENERATING_INSULTS...".split("").forEach((c,i)=>{
    const col=Math.floor(i/(H/10))*10;
    ctx.fillText(c, (col%(W-20)), 10+(i%6)*10);
  });

  // Top bar
  const bar=ctx.createLinearGradient(0,0,W,0);
  bar.addColorStop(0,"#003300"); bar.addColorStop(0.4,"#39ff14"); bar.addColorStop(0.6,"#39ff14"); bar.addColorStop(1,"#003300");
  ctx.fillStyle=bar; ctx.fillRect(0,0,W,5);

  // Title — terminal style
  ctx.fillStyle="#39ff14"; ctx.font="bold 20px 'Courier New',monospace";
  ctx.textAlign="center";
  ctx.save(); ctx.shadowColor="#39ff14"; ctx.shadowBlur=12;
  ctx.fillText("> ROAST_AI.exe [RUNNING]", W/2, 40); ctx.restore();
  ctx.fillStyle="rgba(57,255,20,0.4)"; ctx.font="11px 'Courier New',monospace";
  ctx.fillText("// ANALYZING TARGET... PLEASE STAND BY", W/2, 58);

  // Photo — hexagon-style clip with circuit lines
  const cx=W/2, cy=178, radius=108;
  // Circuit board lines from photo
  [[cx-radius-10,cy-30],[cx+radius+10,cy+20],[cx-20,cy-radius-10],[cx+30,cy+radius+10]].forEach(([ex,ey])=>{
    ctx.save(); ctx.strokeStyle="rgba(57,255,20,0.2)"; ctx.lineWidth=1; ctx.setLineDash([4,3]);
    ctx.beginPath(); ctx.moveTo(cx,cy); ctx.lineTo(ex,ey); ctx.stroke();
    ctx.beginPath(); ctx.arc(ex,ey,3,0,Math.PI*2); ctx.fillStyle="rgba(57,255,20,0.4)"; ctx.fill();
    ctx.setLineDash([]); ctx.restore();
  });

  ctx.save(); ctx.shadowColor="#39ff14"; ctx.shadowBlur=28;
  ctx.beginPath(); ctx.arc(cx,cy,radius+5,0,Math.PI*2);
  ctx.strokeStyle="#39ff14"; ctx.lineWidth=2; ctx.stroke(); ctx.restore();
  // Dashed outer
  ctx.save(); ctx.setLineDash([3,5]);
  ctx.beginPath(); ctx.arc(cx,cy,radius+15,0,Math.PI*2);
  ctx.strokeStyle="rgba(57,255,20,0.25)"; ctx.lineWidth=1; ctx.stroke();
  ctx.setLineDash([]); ctx.restore();

  if(img){
    // Draw photo then add green tint
    drawCirclePhoto(ctx,img,cx,cy,radius,!isAiPortrait,isAiPortrait);
    ctx.save(); ctx.globalCompositeOperation="color";
    ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2);
    ctx.fillStyle="rgba(0,100,0,0.5)"; ctx.fill(); ctx.restore();
  } else {
    drawEmojiAvatar(ctx,cx,cy,radius);
  }

  // Scanning line across photo
  ctx.save(); ctx.globalCompositeOperation="screen";
  const scanG=ctx.createLinearGradient(0,cy-radius,0,cy-radius+radius*0.3);
  scanG.addColorStop(0,"transparent"); scanG.addColorStop(0.5,"rgba(57,255,20,0.15)"); scanG.addColorStop(1,"transparent");
  ctx.beginPath(); ctx.arc(cx,cy,radius,0,Math.PI*2); ctx.clip();
  ctx.fillStyle=scanG; ctx.fillRect(cx-radius,cy-radius,radius*2,radius*0.3);
  ctx.restore();

  // Divider — terminal prompt style
  const divY=cy+radius+24;
  ctx.fillStyle="#39ff14"; ctx.font="12px 'Courier New',monospace"; ctx.textAlign="left";
  ctx.fillText(`> MODE: ${savage?"SAVAGE [MAX_DMG]":"FRIENDLY [LOW_DMG]"}`, 40, divY+6);
  ctx.strokeStyle="rgba(57,255,20,0.3)"; ctx.lineWidth=1;
  ctx.beginPath(); ctx.moveTo(40,divY+14); ctx.lineTo(W-40,divY+14); ctx.stroke();

  // Roast text — monospace
  ctx.fillStyle="#ccffcc"; ctx.font="bold 17px 'Courier New',monospace"; ctx.textAlign="center";
  const lines=wrapText(ctx,roast,W-80,28);
  const tH=lines.length*28;
  const tY=divY+34+(H-divY-34-70-tH)/2;
  ctx.save(); ctx.shadowColor="#39ff14"; ctx.shadowBlur=6;
  lines.forEach((l,i)=>ctx.fillText(l,W/2,tY+i*28)); ctx.restore();

  // Cursor blink effect (static)
  ctx.fillStyle="#39ff14"; ctx.fillRect(W/2+ctx.measureText(lines[lines.length-1]||"").width/2+4, tY+(lines.length-1)*28-14, 8, 16);

  ctx.fillStyle="rgba(57,255,20,0.25)"; ctx.font="11px 'Courier New',monospace";
  ctx.textAlign="center"; ctx.fillText("// roastbyai.app  •  Built by k.Harshith", W/2, H-16);
  ctx.fillStyle=bar; ctx.fillRect(0,H-5,W,5);
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export default function RoastCard({ imageDataUrl, roast, savage, isRandom = false, isAiPortrait = false }) {
  const canvasRef = useRef(null);
  const [ready, setReady] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(savage ? "inferno" : "goldrush");

  useEffect(() => { setSelectedTheme(savage ? "inferno" : "goldrush"); }, [savage]);

  const drawCard = (themeId) => {
    if (!roast) return;
    setReady(false);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const W = 600, H = 760;
    canvas.width = W; canvas.height = H;

    const doRender = (img) => {
      switch (themeId) {
        case "inferno":   drawInferno(ctx, W, H, roast, savage, img, isRandom, isAiPortrait); break;
        case "midnight":  drawMidnight(ctx, W, H, roast, savage, img, isRandom, isAiPortrait); break;
        case "goldrush":  drawGoldRush(ctx, W, H, roast, savage, img, isRandom, isAiPortrait); break;
        case "softroast": drawSoftRoast(ctx, W, H, roast, savage, img, isRandom, isAiPortrait); break;
        case "tabloid":   drawTabloid(ctx, W, H, roast, savage, img, isRandom, isAiPortrait); break;
        case "cyber":     drawCyber(ctx, W, H, roast, savage, img, isRandom, isAiPortrait); break;
        default:          drawInferno(ctx, W, H, roast, savage, img, isRandom, isAiPortrait);
      }
      setReady(true);
    };

    if (imageDataUrl && !isRandom) {
      const img = new Image();
      img.onload = () => doRender(img);
      img.src = imageDataUrl;
    } else {
      doRender(null);
    }
  };

  useEffect(() => { drawCard(selectedTheme); }, [imageDataUrl, roast, savage, isRandom, isAiPortrait, selectedTheme]);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.download = `roast-card-${selectedTheme}.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
  };

  const themeGlow = {
    inferno: "rgba(255,68,68,0.45)",
    midnight: "rgba(0,229,255,0.4)",
    goldrush: "rgba(255,215,0,0.4)",
    softroast: "rgba(255,121,198,0.4)",
    tabloid: "rgba(80,80,80,0.4)",
    cyber: "rgba(57,255,20,0.4)",
  };

  if (!roast) return null;

  return (
    <div className="rc-wrapper">
      <style>{`
        .rc-wrapper { display:flex; flex-direction:column; align-items:center; gap:14px; width:100%; margin-top:8px; }
        .rc-theme-label { font-size:11px; font-weight:700; letter-spacing:1.5px; text-transform:uppercase; color:var(--text-dim); text-align:center; }
        .rc-theme-picker { display:flex; flex-wrap:wrap; justify-content:center; gap:8px; width:100%; }
        .rc-theme-btn {
          font-size:12px; font-weight:700; padding:7px 13px; border-radius:100px;
          border:1.5px solid var(--border); background:var(--surface); color:var(--text-muted);
          cursor:pointer; transition:all 0.18s ease; white-space:nowrap;
        }
        .rc-theme-btn:hover { border-color:var(--text-muted); color:var(--text); transform:translateY(-1px); }
        .rc-theme-btn.active { border-color:transparent; transform:translateY(-1px); box-shadow:0 4px 14px rgba(0,0,0,0.4); }
        .rc-canvas-wrap { width:100%; max-width:360px; position:relative; min-height:80px; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .rc-canvas { width:100%; border-radius:16px; transition:opacity 0.4s ease, box-shadow 0.4s ease; }
        .rc-spinner { position:absolute; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:8px; }
        .rc-spinner span { font-size:32px; animation:spin 1s linear infinite; }
        .rc-spinner p { color:var(--text-muted); font-size:13px; margin:0; }
        .rc-download-btn { border:none; border-radius:14px; padding:14px 36px; font-size:14px; font-weight:800; cursor:pointer; letter-spacing:0.5px; font-family:var(--font-body); box-shadow:0 4px 16px rgba(0,0,0,0.3); transition:transform 0.15s, box-shadow 0.15s; }
        .rc-download-btn:hover { transform:translateY(-2px); box-shadow:0 8px 28px rgba(0,0,0,0.4); }
        .rc-download-btn:active { transform:translateY(0); }
      `}</style>

      <p className="rc-theme-label">🎨 Choose Card Theme</p>
      <div className="rc-theme-picker">
        {THEMES.map((t) => {
          const colors = {
            inferno:   { bg:"#ff4444", color:"#fff" },
            midnight:  { bg:"#00e5ff", color:"#000" },
            goldrush:  { bg:"#ffd700", color:"#111" },
            softroast: { bg:"#ff79c6", color:"#111" },
            tabloid:   { bg:"#e0e0e0", color:"#111" },
            cyber:     { bg:"#39ff14", color:"#000" },
          };
          return (
            <button
              key={t.id}
              className={`rc-theme-btn ${selectedTheme === t.id ? "active" : ""}`}
              style={selectedTheme === t.id ? { background: colors[t.id].bg, color: colors[t.id].color } : {}}
              onClick={() => setSelectedTheme(t.id)}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="rc-canvas-wrap">
        <canvas
          ref={canvasRef}
          className="rc-canvas"
          style={{
            boxShadow: `0 0 36px ${themeGlow[selectedTheme] || "rgba(255,68,68,0.3)"}, 0 8px 24px rgba(0,0,0,0.5)`,
            opacity: ready ? 1 : 0,
          }}
        />
        {!ready && (
          <div className="rc-spinner">
            <span>🔥</span>
            <p>Composing roast card…</p>
          </div>
        )}
      </div>

      {ready && (
        <button
          onClick={handleDownload}
          className="rc-download-btn"
          style={{
            background: {
              inferno:   "linear-gradient(135deg,#ff4444,#cc0000)",
              midnight:  "linear-gradient(135deg,#00e5ff,#0066cc)",
              goldrush:  "linear-gradient(135deg,#ffd700,#cc8800)",
              softroast: "linear-gradient(135deg,#ff79c6,#bd93f9)",
              tabloid:   "linear-gradient(135deg,#555,#222)",
              cyber:     "linear-gradient(135deg,#39ff14,#006600)",
            }[selectedTheme],
            color: ["inferno","cyber"].includes(selectedTheme) ? "#fff" : selectedTheme === "tabloid" ? "#fff" : "#111",
          }}
        >
          ⬇️ Download Roast Card
        </button>
      )}
    </div>
  );
}
