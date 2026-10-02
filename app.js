(() => {
"use strict";
const V = window.VOYAGE;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const NS = "http://www.w3.org/2000/svg";
let credits = {};

/* ---------- petits outils ---------- */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
// typographie française : espaces insécables avant : ; ! ? et autour des guillemets
const fr = (s) => esc(s).replace(/ ([:;!?»])/g, " $1").replace(/« /g, "« ");
const DOW = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];
const DOWL = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
const MOIS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];
const dt = (iso) => new Date(iso + "T12:00:00");
const jourLong = (iso) => { const d = dt(iso); return `${DOWL[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`; };
const img = (k, w = "") => `img/${k}.jpg`;
const photo = (k, alt = "", cls = "") => `<img class="${cls}" src="img/${k}.jpg" alt="${esc(alt)}" loading="lazy" decoding="async">`;
const col = (p) => V.pays[p]?.couleur || "#666";
const ICON = { vol: "✈️", train: "🚆", taxi: "🚕", bateau: "🚤", repas: "🍜", visite: "📍", spectacle: "🎭", nuit: "🌙", info: "ℹ️" };

/* ---------- hero : diaporama + guirlande de lanternes ---------- */
function buildHero() {
  const picks = ["halong", "hoian-lanterns", "supertrees", "phang-nga", "marina-bay", "koh-yao-yai"];
  $("#slides").innerHTML = picks.map((k, i) => `<div class="slide" style="background-image:url('img/${k}.jpg');animation-delay:${i * 6}s"></div>`).join("");
  $("#who").textContent = V.voyageurs;
  const t0 = dt(V.debut), t1 = dt(V.fin), now = new Date(), today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  const n = Math.round((t0 - today) / 864e5);
  const c = $("#count");
  if (n > 0) c.textContent = n === 1 ? "Départ demain !" : `J-${n}`;
  else if (today <= t1) { const j = V.jours.find((x) => x.d === today.toISOString().slice(0, 10)); c.textContent = `Jour ${Math.round((today - t0) / 864e5) + 1}${j ? " · " + j.etape : ""}`; }
  else c.textContent = "Merci pour ce beau voyage";
  c.hidden = false;
  drawGarland();
}
function el(name, attrs, parent) { const e = document.createElementNS(NS, name); for (const k in attrs) e.setAttribute(k, attrs[k]); parent?.append(e); return e; }
function drawGarland() {
  const host = $("#garland"); host.innerHTML = "";
  const W = host.clientWidth || innerWidth, H = 200;
  const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: W, height: H }, host);
  const defs = el("defs", {}, svg);
  [["lr", "#ff6a4a", "#b82d17"], ["lg", "#ffd66b", "#e09a12"]].forEach(([id, a, b]) => {
    const g = el("radialGradient", { id, cx: ".35", cy: ".3", r: ".8" }, defs);
    el("stop", { offset: 0, "stop-color": a }, g); el("stop", { offset: 1, "stop-color": b }, g);
  });
  [{ y0: 6, sag: 54, y1: 20 }, { y0: 34, sag: 60, y1: 8 }].forEach((s, si) => {
    const q = (t) => ({ x: -20 * (1 - t) ** 2 + 2 * (1 - t) * t * (W / 2) + (W + 20) * t * t, y: (1 - t) ** 2 * s.y0 + 2 * (1 - t) * t * (s.y0 + s.sag * 1.7) + t * t * s.y1 });
    let d = ""; for (let t = 0; t <= 1.001; t += 0.02) { const p = q(t); d += (d ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1); }
    el("path", { d, fill: "none", stroke: "rgba(255,255,255,.5)", "stroke-width": 1.2 }, svg);
    const n = Math.max(5, Math.floor(W / (si ? 92 : 110)));
    for (let i = 1; i < n; i++) {
      const p = q(i / n), big = (i + si) % 3 === 0;
      const g = el("g", { transform: `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})` }, svg);
      const L = el("g", { class: "lantern", style: `animation-delay:${(-((i * 53 + si * 17) % 40) / 10).toFixed(1)}s` }, g);
      const r = big ? 15 : 11, h = big ? 21 : 16;
      el("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: "#5a2a14", "stroke-width": 1.5 }, L);
      el("rect", { x: -r * 0.45, y: 6, width: r * 0.9, height: 3, rx: 1, fill: "#5a2a14" }, L);
      el("ellipse", { cx: 0, cy: 9 + h, rx: r, ry: h, fill: `url(#${(i + si) % 2 ? "lr" : "lg"})` }, L);
      el("path", { d: `M${-r * 0.5} ${9 + h * 0.35} Q0 ${9 + h * 2} ${-r * 0.5} ${9 + h * 1.75}M${r * 0.5} ${9 + h * 0.35} Q0 ${9 + h * 2} ${r * 0.5} ${9 + h * 1.75}`, fill: "none", stroke: "rgba(90,30,10,.35)", "stroke-width": 1 }, L);
      el("rect", { x: -r * 0.45, y: 9 + h * 2 - 1, width: r * 0.9, height: 3, rx: 1, fill: "#5a2a14" }, L);
      el("path", { d: `M0 ${9 + h * 2 + 2}v${big ? 12 : 8}`, stroke: "#f2b43b", "stroke-width": 2, "stroke-linecap": "round" }, L);
    }
  });
}

/* ---------- carte ---------- */
function curve(a, b, bend = 0.18) {
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, dx = b[1] - a[1], dy = b[0] - a[0];
  const c = [mx - dx * bend, my + dy * bend];
  const pts = []; for (let t = 0; t <= 1.001; t += 0.04) pts.push([(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]]);
  return pts;
}
function buildMap() {
  const list = $("#stops");
  list.innerHTML = V.etapes.map((e, i) => `<li><button type="button" data-id="${e.id}" style="--c:${col(e.pays)}"><b>${i + 1}</b><span><strong>${fr(e.nom)}</strong><em>${fr(e.dates)} · ${e.nuits} nuit${e.nuits > 1 ? "s" : ""}</em></span></button></li>`).join("");
  if (!window.L) { $("#map").innerHTML = `<p class="nomap">La carte n’est pas disponible hors ligne.</p>`; return; }
  const map = L.map("map", { scrollWheelZoom: false, zoomControl: true, attributionControl: true, worldCopyJump: false });
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 12, attribution: "© les contributeurs d’<a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a>" }).addTo(map);
  const by = Object.fromEntries(V.etapes.map((e) => [e.id, e]));
  const markers = {};
  const STYLE = { avion: { dashArray: "2 9", weight: 3 }, route: { weight: 3 }, bateau: { dashArray: "1 7", weight: 4 } };
  V.trajet.forEach((l) => {
    const a = by[l.de], b = by[l.vers];
    const pts = curve([a.lat, a.lon], [b.lat, b.lon], l.mode === "avion" ? 0.16 : 0.04);
    L.polyline(pts, { color: "#d9432b", opacity: 0.9, lineCap: "round", ...STYLE[l.mode] }).addTo(map);
  });
  // retour : Phuket → Singapour
  L.polyline(curve([by.pa.lat, by.pa.lon], [by.sg.lat, by.sg.lon], -0.14), { color: "#d9432b", opacity: 0.45, dashArray: "2 9", weight: 3, lineCap: "round" }).addTo(map);
  V.etapes.forEach((e, i) => {
    const icon = L.divIcon({ className: "pinwrap", html: `<span class="pin" style="--c:${col(e.pays)}">${i + 1}</span>`, iconSize: [34, 34], iconAnchor: [17, 17] });
    const m = L.marker([e.lat, e.lon], { icon, keyboard: true, title: e.nom }).addTo(map);
    m.bindPopup(`<div class="pop"><img src="img/${e.img}.jpg" alt=""><strong>${fr(e.nom)}</strong><span>${fr(e.dates)}</span><p>${fr(e.texte)}</p></div>`, { minWidth: 220, maxWidth: 260 });
    markers[e.id] = m;
  });
  const bounds = L.latLngBounds(V.etapes.map((e) => [e.lat, e.lon])).pad(0.12);
  const fit = () => { map.invalidateSize(); map.fitBounds(bounds, { maxZoom: 6 }); };
  fit(); addEventListener("load", fit); setTimeout(fit, 400);
  list.addEventListener("click", (ev) => {
    const b = ev.target.closest("button"); if (!b) return;
    const e = by[b.dataset.id];
    map.flyTo([e.lat, e.lon], 8, { duration: reduce ? 0 : 1.1 });
    setTimeout(() => markers[e.id].openPopup(), reduce ? 0 : 900);
    $("#map").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "nearest" });
  });
  let rz; addEventListener("resize", () => { clearTimeout(rz); rz = setTimeout(fit, 150); });
}

function buildPostcards() {
  $("#postcards").innerHTML = V.etapes.map((e, i) => `
    <a class="card-pc" href="#jours" data-etape="${e.id}" style="--c:${col(e.pays)}">
      <span class="pc-photo">${photo(e.img, "")}<span class="stamp">${V.pays[e.pays].drapeau}</span></span>
      <span class="pc-body"><b class="pc-n">${i + 1}</b><strong>${fr(e.nom)}</strong><span class="pc-d">${fr(e.dates)} · ${e.nuits} nuit${e.nuits > 1 ? "s" : ""}</span><span class="pc-t">${fr(e.texte)}</span></span>
      <span class="postmark" aria-hidden="true">${esc(e.dates.replace(" déc.", ""))}<br>DÉC</span>
    </a>`).join("");
}

/* ---------- jour par jour ---------- */
function buildDays() {
  const today = new Date().toISOString().slice(0, 10);
  $("#days").innerHTML = V.jours.map((j) => {
    const d = dt(j.d), c = col(j.pays);
    const head = j.img
      ? `<div class="j-img">${photo(j.img, "")}</div>`
      : `<div class="j-img plain" style="--c:${c}"><span>${j.pays === "fr" && j.d > "2026-12-20" && j.d !== "2026-12-26" ? "🚆" : "✈️"}</span></div>`;
    return `<li class="jour" data-pays="${j.pays}" id="j-${j.d}" style="--c:${c}">
      <div class="j-date"><span class="j-dow">${DOW[d.getDay()]}</span><span class="j-num">${d.getDate()}</span><span class="j-mois">${MOIS[d.getMonth()]}</span></div>
      <article class="j-card">
        ${head}
        <div class="j-body">
          <p class="j-where"><span class="dot"></span>${V.pays[j.pays].drapeau} ${fr(j.etape)}</p>
          <h3>${fr(j.titre)}</h3>
          <p class="j-cle">${fr(j.cle)}</p>
          <p class="j-resume">${fr(j.resume)}</p>
          ${j.note ? `<p class="j-note">${fr(j.note)}</p>` : ""}
          <details${j.d === today ? " open" : ""}><summary>Le programme heure par heure</summary>
            <ol class="tl">${j.items.map((it) => `<li class="k-${it.k}"><span class="tl-h">${it.h ? fr(it.h) : ""}</span><span class="tl-i" aria-hidden="true">${ICON[it.k] || "•"}</span><div><strong>${fr(it.t)}</strong>${it.p ? `<p>${fr(it.p)}</p>` : ""}</div></li>`).join("")}</ol>
          </details>
        </div>
      </article>
    </li>`;
  }).join("");

  const filtres = [["tous", "Tous"], ["fr", "France"], ["sg", "Singapour"], ["vn", "Vietnam"], ["th", "Thaïlande"]];
  $("#filtre-jours").innerHTML = filtres.map(([k, l], i) => `<button type="button" class="chip${i ? "" : " on"}" data-f="${k}" aria-pressed="${!i}">${k !== "tous" ? V.pays[k].drapeau + " " : ""}${l}</button>`).join("");
  $("#filtre-jours").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#filtre-jours .chip").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    $$("#days .jour").forEach((li) => (li.hidden = b.dataset.f !== "tous" && li.dataset.pays !== b.dataset.f));
  });
  let open = false;
  $("#toggle-all").addEventListener("click", (e) => {
    open = !open; $$("#days details").forEach((d) => (d.open = open)); e.target.textContent = open ? "Tout replier" : "Tout déplier";
  });
  // cartes postales → premier jour de l'étape
  $("#postcards").addEventListener("click", (e) => {
    const a = e.target.closest("a[data-etape]"); if (!a) return;
    const et = V.etapes.find((x) => x.id === a.dataset.etape);
    const first = V.jours.find((j) => j.img && j.etape.includes(et.nom.split(" ")[0])) || V.jours.find((j) => j.etape.includes(et.nom.split(" ")[0]));
    if (!first) return;
    e.preventDefault();
    $$("#filtre-jours .chip")[0].click();
    const t = $("#j-" + first.d); t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    $("details", t).open = true;
  });
}

/* ---------- à voir ---------- */
function buildVoir() {
  const et = Object.fromEntries(V.etapes.map((e) => [e.id, e]));
  $("#mosaic").innerHTML = V.voir.map((v) => {
    const p = et[v.e].pays;
    return `<li class="tile${v.big ? " big" : ""}" data-pays="${p}" style="--c:${col(p)}">
      <figure>${photo(v.img, v.n)}<figcaption><span class="tag">${V.pays[p].drapeau} ${fr(et[v.e].nom)}</span></figcaption></figure>
      <div class="tile-b"><h3>${fr(v.n)}</h3><p class="meta">${fr(v.duree)} · ${fr(v.jour)}</p><p>${fr(v.t)}</p></div>
    </li>`;
  }).join("");
  const f = [["tous", "Tout"], ["sg", "Singapour"], ["vn", "Vietnam"], ["th", "Thaïlande"]];
  $("#filtre-voir").innerHTML = f.map(([k, l], i) => `<button type="button" class="chip${i ? "" : " on"}" data-f="${k}" aria-pressed="${!i}">${k !== "tous" ? V.pays[k].drapeau + " " : ""}${l}</button>`).join("");
  $("#filtre-voir").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#filtre-voir .chip").forEach((x) => { x.classList.toggle("on", x === b); x.setAttribute("aria-pressed", x === b); });
    $$("#mosaic .tile").forEach((li) => (li.hidden = b.dataset.f !== "tous" && li.dataset.pays !== b.dataset.f));
  });
}

/* ---------- à table ---------- */
function buildTable() {
  $("#plats").innerHTML = ["sg", "vn", "th"].map((p) => `
    <div class="menu-pays" style="--c:${col(p)}">
      <h3><span>${V.pays[p].drapeau}</span> ${V.pays[p].nom}</h3>
      <ul class="plates">${V.table.filter((x) => x.p === p).map((x, i) => `
        <li class="plate${i % 2 ? " alt" : ""}">
          <span class="disc">${photo(x.img, x.n)}</span>
          <h4>${fr(x.n)}</h4><p class="loc">${esc(x.loc)}</p>
          <p>${fr(x.t)}</p><p class="when">${fr(x.quand)}</p>
        </li>`).join("")}</ul>
    </div>`).join("");
  $("#conseils").innerHTML = V.conseilsTable.map((c) => `<li>${fr(c)}</li>`).join("");
}

/* ---------- pratique ---------- */
function buildPratique() {
  const dm = (iso) => { const d = dt(iso); return `${DOW[d.getDay()]} ${d.getDate()} ${MOIS[d.getMonth()]}`; };
  $("#vols").innerHTML = V.vols.map((v) => `
    <article class="pass">
      <div class="pass-main">
        <p class="pass-d">${fr(dm(v.j))}</p>
        <div class="route"><div><b>${v.de}</b><span>${fr(v.dl)}</span></div><i aria-hidden="true">✈</i><div><b>${v.a}</b><span>${fr(v.al)}</span></div></div>
        <p class="pass-t"><span>Départ <b>${fr(v.dep)}</b></span><span>Arrivée <b>${fr(v.arr)}</b></span></p>
      </div>
      <div class="pass-stub"><span>Passagers</span><b>${fr(v.qui)}</b></div>
    </article>`).join("");
  $("#trains").innerHTML = V.trains.map((t) => `<li><span class="t-d">${fr(dm(t.j))}</span><span class="t-w">${fr(t.qui)}</span><span class="t-r">${fr(t.t)}</span><span class="t-h">${fr(t.h)}</span></li>`).join("");
  $("#formalites").innerHTML = V.formalites.map((f) => `<li><strong>${fr(f.t)}</strong><span>${fr(f.p)}</span></li>`).join("");
  $("#alerte").innerHTML = "⚠️ " + fr(V.alerte);
  $("#meteo").innerHTML = V.meteo.map((m) => {
    const x0 = ((m.lo - 10) / 28) * 100, x1 = ((m.hi - 10) / 28) * 100;
    return `<article class="wx"><span class="wx-i">${m.i}</span><h4>${fr(m.l)}</h4><p class="wx-t">${fr(m.t)}</p><span class="wx-bar" role="img" aria-label="${m.lo} à ${m.hi} degrés"><i style="left:${x0}%;width:${Math.max(6, x1 - x0)}%"></i></span><p>${fr(m.p)}</p></article>`;
  }).join("");
  const KEY = "asie2026:valise";
  let done = []; try { const r = JSON.parse(localStorage.getItem(KEY) || "[]"); done = Array.isArray(r) ? r.filter((x) => typeof x === "string") : []; } catch {}
  const total = V.valise.reduce((n, g) => n + g.l.length, 0);
  $("#valise").innerHTML = V.valise.map((g) => `<section class="packcat"><h4><span>${g.i}</span>${fr(g.c)}</h4><ul>` +
    g.l.map((it) => `<li><label><input type="checkbox" data-k="${esc(it.k)}" ${done.includes(it.k) ? "checked" : ""}><span>${fr(it.t)}</span></label></li>`).join("") +
    `</ul></section>`).join("");
  const count = () => { const n = $$("#valise input:checked").length; $("#valise-count").textContent = n ? `${n} / ${total} coché${n > 1 ? "s" : ""}` : `${total} choses à préparer`; };
  $("#valise").addEventListener("change", () => {
    const on = $$("#valise input:checked").map((i) => i.dataset.k);
    try { localStorage.setItem(KEY, JSON.stringify(on)); } catch {}
    count();
  });
  count();
  $("#mots").innerHTML = V.mots.map((m) => `<li style="--c:${col(m.p)}"><span class="fl">${V.pays[m.p].drapeau}</span><span class="fr">${fr(m.f)}</span><b>${esc(m.l)}</b><em>${esc(m.r)}</em></li>`).join("");
  $("#infos").innerHTML = V.infos.map((i) => `<article><span>${i.i}</span><h4>${fr(i.t)}</h4><p>${fr(i.p)}</p></article>`).join("");
}

function buildCredits() {
  $("#credits").innerHTML = Object.values(credits).map((c) => `<li>${esc(c.title.replace(/\.\w+$/, ""))} — ${esc(c.author)}, <a href="${c.licenseUrl || c.source}" target="_blank" rel="noopener">${esc(c.license)}</a> · <a href="${c.source}" target="_blank" rel="noopener">source</a></li>`).join("");
}

/* ---------- barre du haut + repères ---------- */
function chrome() {
  const bar = $("#top");
  const onScroll = () => bar.classList.toggle("solid", scrollY > innerHeight * 0.55);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  if ("IntersectionObserver" in window) {
    const links = new Map($$(".menu a").map((a) => [a.getAttribute("href").slice(1), a]));
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { links.forEach((l) => l.classList.remove("on")); links.get(e.target.id)?.classList.add("on"); } }), { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section.sec").forEach((s) => io.observe(s));
  }
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(drawGarland, 200); });
}

buildHero(); buildMap(); buildPostcards(); buildDays(); buildVoir(); buildTable(); buildPratique(); chrome();
fetch("credits.json").then((r) => r.json()).then((c) => { credits = c; buildCredits(); }).catch(() => {});
if ("serviceWorker" in navigator && !/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) navigator.serviceWorker.register("sw.js").catch(() => {});
})();
