/* ============================================================
   puntos.js — ÚNICA cuenta de puntos de La Velada del Año.
   La usan velada.html (la tabla), tv.html (el Modo TV) y
   participante.html (los celulares). Si cambia una regla de puntaje,
   se cambia ACÁ y nada más.
   ============================================================ */
(function (root) {
  'use strict';

  function prep(ctx) {
    const st = Object.assign({ f1: {}, f2: {}, impostor: { rounds: [] } }, ctx.state || {});
    if (!st.f1) st.f1 = {};
    if (!st.f2) st.f2 = {};
    let rules = ctx.rules || null;
    if (rules) rules = Object.assign({ f1: [], f2: [] }, rules);
    return { st, rules };
  }

  function indiceEquipoDefault(fullNames, TEAMS) {
    return function (playerName) {
      const full = (fullNames && fullNames[playerName]) || playerName;
      return TEAMS.findIndex(t => String(t).includes(full));
    };
  }

  // ctx: { state, players, f1Fixture, f1Byes, rules }
  function jugadores(ctx) {
    const { st: state, rules: RULES_CONFIG } = prep(ctx);
    const PLAYERS = ctx.players || [];
    const F1_FIXTURE = ctx.f1Fixture || [];
    const F1_BYES = ctx.f1Byes || {};

  const numRoundsF1 = F1_FIXTURE.reduce((m, x) => Math.max(m, x[0]), 0);
  const pts = PLAYERS.map(() => ({ rounds: Array(numRoundsF1).fill(null), special: null, total: 0 }));

  // Marcar la ronda de descanso de cada jugador (puede haber más de uno)
  for (let r = 1; r <= numRoundsF1; r++) {
    const byeArrRaw = F1_BYES[r];
    const byeArr = Array.isArray(byeArrRaw) ? byeArrRaw : (typeof byeArrRaw === 'number' ? [byeArrRaw] : []);
    byeArr.forEach(idx => { if (pts[idx]) pts[idx].rounds[r-1] = 'bye'; });
  }

  F1_FIXTURE.forEach(([r, a, b, g]) => {
    const key = `${r}-${a}-${b}`;
    const res = state.f1[key];
    if (!res) return;
    const ri = r - 1;
    if (res.winner === 'empate') {
      const drawPts = (RULES_CONFIG && g !== undefined && RULES_CONFIG.f1[g]) ? RULES_CONFIG.f1[g].pts_draw : 1;
      if (pts[a]) { pts[a].rounds[ri] = drawPts; }
      if (pts[b]) { pts[b].rounds[ri] = drawPts; }
    } else {
      const w = res.winner;
      const l = w === a ? b : a;
      const gCfg = (RULES_CONFIG && g !== undefined && RULES_CONFIG.f1[g]) ? RULES_CONFIG.f1[g] : null;
      const winPts = gCfg ? gCfg.pts_win : 3;
      const bonusPts = gCfg ? gCfg.pts_bonus : 1;
      const losePts = gCfg ? gCfg.pts_lose : 0;
      let wp = winPts + (res.bonus ? bonusPts : 0);
      if (pts[w]) { pts[w].rounds[ri] = wp; }
      if (pts[l]) { pts[l].rounds[ri] = losePts; }
    }
  });

  // Impostor — acumula puntos de todas las rondas jugadas
  const impRounds = (state.impostor && state.impostor.rounds) || [];
  const impNoPts = (RULES_CONFIG && RULES_CONFIG.impostor) ? RULES_CONFIG.impostor.pts_noDescubierto : 4;
  const impDesPts = (RULES_CONFIG && RULES_CONFIG.impostor) ? RULES_CONFIG.impostor.pts_descubierto : 2;
  impRounds.forEach(rd => {
    if (rd.mode === 'doble') {
      // Modo doble impostor
      const impostorNames = rd.impostorNames || [];
      const caughtNames   = rd.caughtNames   || [];
      const escapedNames  = rd.escapedNames  || impostorNames.filter(n => !caughtNames.includes(n));
      const total         = impostorNames.length || 1;
      const crewPts       = Math.round(impDesPts * caughtNames.length / total);
      // Impostores que se salvaron ganan ndPts
      escapedNames.forEach(n => {
        const idx = PLAYERS.indexOf(n);
        if (idx !== -1) pts[idx].special = (pts[idx].special || 0) + impNoPts;
      });
      // Crew (no impostores) gana crewPts si al menos uno fue descubierto
      if (crewPts > 0) {
        (rd.players || []).forEach(name => {
          if (impostorNames.includes(name)) return;
          const idx = PLAYERS.indexOf(name);
          if (idx !== -1) pts[idx].special = (pts[idx].special || 0) + crewPts;
        });
      }
    } else if (rd.mode === 'noDescubierto') {
      // Impostor único — no descubierto: gana el impostor
      const idx = PLAYERS.indexOf(rd.impostorName);
      if (idx !== -1) pts[idx].special = (pts[idx].special || 0) + impNoPts;
    } else {
      // Impostor único — descubierto: gana la crew
      (rd.players || []).forEach(name => {
        if (name === rd.impostorName) return;
        const idx = PLAYERS.indexOf(name);
        if (idx !== -1) pts[idx].special = (pts[idx].special || 0) + impDesPts;
      });
    }
  });

  // Override manual de los puntos de la ronda especial (Impostor) — se puede
  // pisar a mano por jugador, igual que el resto de la clasificación de Fase 1.
  const specialOverrideF1 = state.specialOverride || {};
  PLAYERS.forEach((name, idx) => {
    if (Object.prototype.hasOwnProperty.call(specialOverrideF1, idx)) {
      pts[idx].special = specialOverrideF1[idx];
    }
  });

  // Bonus manual (Kahoot u otras actividades previas)
  const bonusManual = state.bonusManual || {};
  PLAYERS.forEach((name, idx) => {
    const bm = bonusManual[name];
    if (bm && typeof bm.pts === 'number' && bm.pts !== 0) {
      pts[idx].bonusManual = bm.pts;
    }
  });

  // vs JC — victoria = 3 pts, derrota = 0
  const vsJC = state.vsJC || {};
  PLAYERS.forEach((name, idx) => {
    const val = vsJC[name];
    pts[idx].vsJC = (typeof val === 'number') ? val : null;
  });

  // Comodines de la ruleta (solo los ya resueltos suman/restan)
  const comos = state.comodines || [];
  PLAYERS.forEach((name, idx) => {
    let d = 0;
    comos.forEach(c => { if (c.status === 'done' && c.player === name) d += (c.delta || 0); });
    if (d) pts[idx].comodin = d;
  });

  // Apuestas: +1 por cada acierto. Se puede apostar en TODOS los duelos,
  // incluido el propio — pero si errás el tuyo, perdés todo lo ganado apostando.
  const bets = state.bets || {};
  PLAYERS.forEach((name, idx) => {
    let won = 0, blown = false;
    Object.keys(bets).forEach(key => {
      const res = state.f1[key];
      if (!res || res.winner === 'empate') return;
      const b = bets[key] && bets[key][name];
      if (typeof b !== 'number') return;
      const parts = key.split('-').map(Number);
      const isOwn = (parts[1] === idx || parts[2] === idx);
      if (b === res.winner) won++;
      else if (isOwn) blown = true; // apostó a su propio duelo y lo perdió
    });
    const net = blown ? 0 : won;
    if (net) pts[idx].bets = net;
    if (blown) pts[idx].betsBlown = won; // cuánto se le anuló, para mostrarlo
  });

  // Override manual de apuestas (columna 🃏): pisa el valor calculado arriba
  const betsOverride = state.betsOverride || {};
  PLAYERS.forEach((name, idx) => {
    if (Object.prototype.hasOwnProperty.call(betsOverride, name)) {
      pts[idx].bets = Number(betsOverride[name]) || 0;
      pts[idx].betsBlown = 0;
    }
  });

  // Overrides de celda: pisan el valor calculado de esa ronda
  const ovF1 = (state.cellPts && state.cellPts.f1) || {};
  PLAYERS.forEach((name, idx) => {
    pts[idx].rounds.forEach((v, ri) => {
      const k = name + '||' + ri;
      if (Object.prototype.hasOwnProperty.call(ovF1, k)) pts[idx].rounds[ri] = Number(ovF1[k]) || 0;
    });
  });

  // Ajustes manuales cargados a mano durante la noche
  const adjF1 = (state.adjust && state.adjust.f1) || [];
  PLAYERS.forEach((name, idx) => {
    let d = 0;
    adjF1.forEach(a => { if (a.name === name) d += (Number(a.pts) || 0); });
    if (d) pts[idx].adjust = d;
  });

  pts.forEach(p => {
    p.total = p.rounds.reduce((s,v) => s + (typeof v === 'number' ? v : 0), 0) + (p.special || 0) + (p.bonusManual || 0) + (p.vsJC || 0) + (p.comodin || 0) + (p.bets || 0) + (p.adjust || 0);
  });

  // Victorias / derrotas (las usa el TV para los íconos 🔥 / 🤡)
  F1_FIXTURE.forEach(([r, a, b]) => {
    const res = state.f1[r + '-' + a + '-' + b];
    if (!res || res.winner === 'empate') return;
    const w = res.winner, l = (w === a ? b : a);
    if (pts[w]) pts[w].wins = (pts[w].wins || 0) + 1;
    if (pts[l]) pts[l].losses = (pts[l].losses || 0) + 1;
  });
  return pts;
  }

  // ctx: { state, players, teams, f2Fixture, f2Byes, rules, qldTeamPoints, fullNames, teamIndexForPlayer }
  function equipos(ctx) {
    const { st: state, rules: RULES_CONFIG } = prep(ctx);
    const PLAYERS = ctx.players || [];
    const TEAMS = ctx.teams || [];
    const F2_FIXTURE = ctx.f2Fixture || [];
    const F2_BYES = ctx.f2Byes || {};
    const QLD_POINTS = ctx.qldTeamPoints || state.qldTeamPoints || {};
    const teamIndexForPlayer = ctx.teamIndexForPlayer || indiceEquipoDefault(ctx.fullNames, TEAMS);

  const totalRounds = F2_FIXTURE.reduce((m, x) => Math.max(m, x[0]), 0);
  const pts = TEAMS.map(() => ({ rounds: Array(totalRounds).fill(null), total: 0, qld: 0 }));

  for (let r = 1; r <= totalRounds; r++) {
    const byeArr = F2_BYES[r];
    if (Array.isArray(byeArr)) {
      byeArr.forEach(idx => { if (pts[idx]) pts[idx].rounds[r-1] = 'bye'; });
    } else if (typeof byeArr === 'number' && pts[byeArr]) {
      pts[byeArr].rounds[r-1] = 'bye';
    }
  }

  F2_FIXTURE.forEach(([r, a, b, g]) => {
    const key = `${r}-${a}-${b}`;
    const res = state.f2[key];
    if (!res) return;
    const ri = r - 1;
    if (res.winner === 'empate') {
      const drawPts = (RULES_CONFIG && g !== undefined && RULES_CONFIG.f2[g]) ? RULES_CONFIG.f2[g].pts_draw : 1;
      pts[a].rounds[ri] = drawPts;
      pts[b].rounds[ri] = drawPts;
    } else {
      const w = res.winner;
      const l = w === a ? b : a;
      const gCfg = (RULES_CONFIG && g !== undefined && RULES_CONFIG.f2[g]) ? RULES_CONFIG.f2[g] : null;
      const winPts = gCfg ? gCfg.pts_win : 3;
      const bonusPts = gCfg ? gCfg.pts_bonus : 1;
      const losePts = gCfg ? gCfg.pts_lose : 0;
      let wp = winPts + (res.bonus ? bonusPts : 0);
      pts[w].rounds[ri] = wp;
      pts[l].rounds[ri] = losePts;
    }
  });

  // Puntos de "¿Quién lo dijo?" — ya vienen resueltos por equipo (1°=3, 2°=2, 3°=1) desde Firebase,
  // una vez que el conductor finaliza la ronda especial. Se puede pisar a mano por equipo
  // (state.qldOverride) — por ejemplo si el resultado no llegó bien sincronizado.
  const qldTeamPoints = QLD_POINTS;
  const qldOverride = state.qldOverride || {};
  pts.forEach((p, idx) => {
    p.qld = Object.prototype.hasOwnProperty.call(qldOverride, idx)
      ? (Number(qldOverride[idx]) || 0)
      : (qldTeamPoints[idx] || 0);
  });

  // Apuestas de Fase 2: cada jugador (invitado) apuesta a los duelos de equipos.
  // Cada acierto suma 1 punto al EQUIPO del apostador (en Fase 2 se puntúa por equipo).
  // Igual que en Fase 1: se puede apostar al propio equipo, pero si lo perdés se te
  // anulan todos los puntos que hayas ganado apostando.
  const betsF2 = state.betsF2 || {};
  PLAYERS.forEach(name => {
    const tIdx = teamIndexForPlayer(name);
    if (tIdx < 0 || !pts[tIdx]) return;
    let won = 0, blown = false;
    Object.keys(betsF2).forEach(key => {
      const res = state.f2[key];
      if (!res || res.winner === 'empate') return;
      const b = betsF2[key] && betsF2[key][name];
      if (typeof b !== 'number') return;
      const parts = key.split('-').map(Number);
      const isOwn = (parts[1] === tIdx || parts[2] === tIdx);
      if (b === res.winner) won++;
      else if (isOwn) blown = true;
    });
    const net = blown ? 0 : won;
    if (net) pts[tIdx].betsF2 = (pts[tIdx].betsF2 || 0) + net;
  });

  // Override manual de apuestas de Fase 2: pisa el valor calculado por equipo
  const betsOverrideF2 = state.betsOverrideF2 || {};
  TEAMS.forEach((name, idx) => {
    if (Object.prototype.hasOwnProperty.call(betsOverrideF2, name)) {
      pts[idx].betsF2 = Number(betsOverrideF2[name]) || 0;
    }
  });

  // Comodines de la ruleta (solo los ya resueltos suman/restan)
  const comosF2 = state.comodinesF2 || [];
  TEAMS.forEach((name, idx) => {
    let d = 0;
    comosF2.forEach(c => { if (c.status === 'done' && c.player === name) d += (c.delta || 0); });
    if (d) pts[idx].comodin = d;
  });

  // Overrides de celda: pisan el valor calculado de esa ronda
  const ovF2 = (state.cellPts && state.cellPts.f2) || {};
  TEAMS.forEach((name, idx) => {
    pts[idx].rounds.forEach((v, ri) => {
      const k = name + '||' + ri;
      if (Object.prototype.hasOwnProperty.call(ovF2, k)) pts[idx].rounds[ri] = Number(ovF2[k]) || 0;
    });
  });

  // Ajustes manuales cargados a mano durante la noche
  const adjF2 = (state.adjust && state.adjust.f2) || [];
  TEAMS.forEach((name, idx) => {
    let d = 0;
    adjF2.forEach(a => { if (a.name === name) d += (Number(a.pts) || 0); });
    if (d) pts[idx].adjust = d;
  });

  pts.forEach(p => {
    p.total = p.rounds.reduce((s,v) => s + (typeof v === 'number' ? v : 0), 0) + (p.qld || 0) + (p.betsF2 || 0) + (p.comodin || 0) + (p.adjust || 0);
  });

  // Victorias / derrotas (las usa el TV para los íconos 🔥 / 🤡)
  F2_FIXTURE.forEach(([r, a, b]) => {
    const res = state.f2[r + '-' + a + '-' + b];
    if (!res || res.winner === 'empate') return;
    const w = res.winner, l = (w === a ? b : a);
    if (pts[w]) pts[w].wins = (pts[w].wins || 0) + 1;
    if (pts[l]) pts[l].losses = (pts[l].losses || 0) + 1;
  });
  return pts;
  }

  root.Puntos = { jugadores: jugadores, equipos: equipos, version: 1 };
})(typeof window !== 'undefined' ? window : globalThis);
