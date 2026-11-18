/* Plan engine unit tests (BB-7): run with `npm run test:engine` (Node's own test runner, no browser).
   The five athlete profiles come from the 2026-11-09 athlete audit (backlog "Athlete test profiles").
   Text is not translated here: BBEngine without setLocale returns keys, so warnings start with their key. */
import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const E = createRequire(import.meta.url)('../../engine.js');

const types = (on) => E.TYPE_DEFS.map(([id, kind, dflt, locked, ph]) => ({
  id, name: id, kind, on: on ? on.includes(id) || locked || id === 'long' : dflt, phases: (ph || E.PHASES).slice(), tpl: '',
}));
const base = { goal: 'race', startDate: '2026-11-23', raceDate: '2027-03-14', customKm: 15, race: null, recDist: '0', recTime: '' };

const PROFILES = {
  'A · beginner half, 3 runs, 15 km/wk': { inp: { dist: 'hm', runs: 3, days: [1, 3, 6], longDay: 6, curVol: 15, curLong: 6, weeks: 12 },
    on: ['tempo', 'intervals', 'hills', 'recovery', 'strides', 'racepace'] },
  'B · weekend 10K, Fri-Sat-Sun': { inp: { dist: '10k', runs: 3, days: [4, 5, 6], longDay: 6, curVol: 25, curLong: 10, weeks: 10 } },
  'C · weekday half, Mon-Fri, long run Friday': { inp: { dist: 'hm', runs: 5, days: [0, 1, 2, 3, 4], longDay: 4, curVol: 35, curLong: 12, weeks: 12 } },
  'D · slow marathon, 4 runs, half in 2:30': { inp: { dist: 'm', runs: 4, days: [1, 2, 4, 6], longDay: 6, curVol: 30, curLong: 14, weeks: 16, recDist: '21.0975', recTime: '2:30:00' } },
  'E · experienced marathon, 6 runs, 80 km/wk': { inp: { dist: 'm', runs: 6, days: [0, 1, 2, 4, 5, 6], longDay: 6, curVol: 80, curLong: 28, weeks: 16, recDist: '21.0975', recTime: '1:25:00' } },
};
const TAPER = { '5k': 1, '10k': 1, hm: 2, m: 3 };
const km = (w) => w.sessions.reduce((a, s) => a + s.km, 0);

for (const [name, { inp: p, on }] of Object.entries(PROFILES)) {
  describe(`profile ${name}`, () => {
    const inp = { ...base, ...p };
    const ty = types(on);
    const plan = E.generate(inp, ty);
    const W = plan.weeks;
    const raceWeek = W[W.length - 1];
    const race = raceWeek.sessions.find((s) => s.kind === 'race');

    test('has the weeks asked for, ending on race day', () => {
      assert.equal(W.length, p.weeks);
      assert.ok(race, 'race day in the last week');
      assert.equal(race.km, +E.distKm(inp).toFixed(1));
    });

    test('tapers 1 / 1 / 2 / 3 weeks for 5K / 10K / half / marathon', () => {
      const n = Math.min(TAPER[E.cat(E.distKm(inp))], Math.max(1, Math.floor(p.weeks / 4)));
      assert.equal(W.filter((w) => w.phase === 'taper').length, n);
    });

    test('cuts back every 4th week before the taper', () => {
      const nb = W.filter((w) => w.phase !== 'taper').length;
      W.forEach((w, i) => assert.equal(w.cutback, i < nb - 1 && nb >= 5 && (i + 1) % 4 === 0, `week ${w.n}`));
    });

    test('grows at most 10% a week (cutbacks and taper skipped)', () => {
      W.forEach((w, i) => {
        if (i === 0 || w.cutback || w.phase === 'taper') return;
        const ref = W[i - 1].cutback ? km(W[i - 2]) : km(W[i - 1]);
        assert.ok(km(w) <= ref * 1.1 + 0.05, `week ${w.n}: ${km(w)} km after ${ref} km`);
      });
      assert.ok(!E.warnings(inp, ty, plan, false).some((x) => x.startsWith('wa_steep')));
    });

    test('keeps 1 hard run a week at 4 runs or fewer, 2 above', () => {
      const max = p.runs <= 4 ? 1 : 2;
      for (const w of W) assert.ok(w.sessions.filter((s) => s.kind === 'hard').length <= max, `week ${w.n}`);
    });

    test('spaces hard runs from each other and from the long run (no week check fires)', () => {
      W.forEach((w, i) => assert.deepEqual(E.weekChecks(w, inp, W[i - 1]).map((c) => c.k), [], `week ${w.n}`));
    });

    test('puts nothing hard within 2 days of the race, and strides the day before when it is a run day', () => {
      for (const s of raceWeek.sessions) if (s.kind === 'hard') assert.ok(race.day - s.day >= 3, `${s.typeId} on day ${s.day}`);
      const before = raceWeek.sessions.find((s) => s.day === race.day - 1);
      if (before) assert.equal(before.typeId, 'strides');
    });

    test('BB-45: the long run is at most ~40% of the week (45% at 3 runs, 50% at 2)', () => {
      const share = E.LONG_SHARE(p.runs);
      for (const w of W.slice(0, -1)) {
        const long = w.sessions.find((s) => s.kind === 'long');
        if (long) assert.ok(long.km <= share * km(w) + 0.01, `week ${w.n}: ${long.km} of ${km(w)} km`);
      }
    });

    test('BB-45: the long run stays under 2:30 (half) / 3:00 (marathon) at easy pace', () => {
      const P = E.paces(inp), max = E.LONG_MAX_MIN[E.cat(E.distKm(inp))];
      if (!max) return;
      for (const w of W) for (const s of w.sessions) if (s.kind === 'long') assert.ok(E.durSec(s.km, P.sec.easy) <= max * 60 + 1, `week ${w.n}: ${s.km} km`);
    });

    test('BB-45: the long run grows by at most +2 km or +15 min on the last full week', () => {
      const P = E.paces(inp), step = Math.max(2, E.kmIn(15 * 60, P.sec.easy));
      let last = p.curLong;
      for (const w of W) {
        const long = w.sessions.find((s) => s.kind === 'long');
        if (!long || w.phase === 'taper') continue;
        assert.ok(long.km <= last + step + 0.01, `week ${w.n}: ${long.km} km after ${last} km`);
        if (!w.cutback) last = long.km;
      }
    });

    test('gives every run a watch workout', () => {
      for (const w of W) for (const s of w.sessions) assert.ok(s.watch && s.watch.blocks.length, `week ${w.n} ${s.typeId}`);
    });
  });
}

/* Known gaps, kept visible until their backlog items land. */
test.todo('BB-41: week 1 stays within the stated weekly volume (profile A starts at 16 km for 15 km/wk)');

describe('pace and time', () => {
  test('durSec and kmIn convert both ways', () => {
    assert.equal(E.durSec(10, 300), 3000);
    assert.equal(E.kmIn(3000, 300), 10);
  });
});

describe('BB-45 · profile D (slow marathoner)', () => {
  test('long run no longer takes ~46-49% of the week, and peaks under 3 hours', () => {
    const inp = { ...base, ...PROFILES['D · slow marathon, 4 runs, half in 2:30'].inp };
    const W = E.generate(inp, types()).weeks.slice(0, -1);
    const longs = W.map((w) => w.sessions.find((s) => s.kind === 'long').km);
    assert.ok(Math.max(...W.map((w, i) => longs[i] / km(w))) <= 0.4 + 0.01);
    assert.ok(E.durSec(Math.max(...longs), E.paces(inp).sec.easy) <= 180 * 60);
  });
});

describe('paces', () => {
  test('a recent race gives VDOT paces, fastest to slowest in the right order', () => {
    const P = E.paces({ ...base, dist: '10k', recDist: '10', recTime: '46:00' });
    assert.ok(P.vdot > 43 && P.vdot < 47, `vdot ${P.vdot}`);
    assert.ok(P.sec.rep < P.sec.interval && P.sec.interval < P.sec.tempo && P.sec.tempo < P.sec.easy);
    assert.match(P.txt.easy, /^\d:\d\d\/km$/);
  });
  test('without a race time, effort words and default seconds', () => {
    const P = E.paces({ ...base, dist: 'hm' });
    assert.equal(P.vdot, null);
    assert.equal(P.txt.easy, 'pe_easy');
    assert.equal(P.sec.easy, 400);
  });
  test('race times read mm:ss first, then h:mm, and a lone number as minutes', () => {
    assert.equal(E.raceTimeSec('46:00', 10), 2760);
    assert.equal(E.raceTimeSec('1:45', 21.0975), 6300);
    assert.equal(E.raceTimeSec('52', 10), 3120);
    assert.equal(E.raceTimeSec('9:99', 10), null);
  });
});

describe('watch workouts', () => {
  test('a quality session gets warm-up and cool-down halves of its wucd', () => {
    const P = E.paces({ ...base, dist: '10k' });
    const w = E.workFor({ id: 'intervals' }, { p: 0.5, D: 10, c: '10k', taper: false, P });
    const wp = E.watchPlan('hard', 9, w);
    assert.deepEqual(wp.wu, ['d', 2]);
    assert.deepEqual(wp.cd, ['d', 2]);
    assert.equal(wp.blocks[0].steps[0].pace, 'interval');
  });
  test('an easy run is one block, a race one race-pace step', () => {
    assert.deepEqual(E.watchPlan('easy', 8), { blocks: [{ n: 1, steps: [{ p: 'work', g: ['d', 8], pace: 'easy' }] }] });
    assert.equal(E.watchPlan('race', 21.1).blocks[0].steps[0].pace, 'race');
  });
});
