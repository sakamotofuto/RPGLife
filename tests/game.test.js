import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,complete,stats,undo,load,quests} from '../src/game.js';
const player=()=>({...initialState(),profile:{name:'勇者',goal:'毎日歩く',traits:'朝に集中しやすい'}});
test('一周の体験：達成、レベルアップ、討伐、保存と復元、取り消し',()=>{
 let s=player();
 for(const date of ['2026-10-23','2026-10-24'])for(const q of quests)s=complete(s,q.id,{date});
 assert.equal(s.records.length,10);assert.equal(stats(s).xp,260);assert.equal(stats(s).level,3);assert.equal(stats(s).hp,0);assert.equal(stats(s).defeated,true);
 s=load(JSON.stringify(s));assert.equal(s.profile.goal,'毎日歩く');assert.equal(s.profile.traits,'朝に集中しやすい');assert.equal(stats(s).xp,260);
 for(const r of [...s.records].slice(0,3))s=undo(s,r.id);
 assert.equal(stats(s).defeated,false);assert.ok(stats(s).hp>0);
});
test('同じ日の二重報酬を拒否、翌日は再挑戦できる',()=>{let s=complete(player(),'step',{date:'2026-10-23'});assert.throws(()=>complete(s,'step',{date:'2026-10-23'}));s=complete(s,'step',{date:'2026-10-24'});assert.equal(stats(s).xp,60);});
test('部分達成は半分のXP、取り消しで再記録できる',()=>{let s=complete(player(),'read',{partial:true});assert.equal(stats(s).xp,13);s=undo(s,s.records[0].id);assert.equal(stats(s).xp,0);assert.equal(stats(complete(s,'read')).xp,25);});
test('未登録・未知クエスト・不正データを拒否する',()=>{assert.throws(()=>complete(initialState(),'read'));assert.throws(()=>complete(player(),'unknown'));assert.throws(()=>load('{'));assert.throws(()=>load('{"version":1,"records":[{}],"profile":null}'));assert.deepEqual(load(null),initialState());});
test('休んでもXPは減らない',()=>{let s=complete(player(),'rest',{date:'2020-01-01'});assert.equal(stats(s).xp,15);assert.equal(stats(load(JSON.stringify(s))).xp,15);});
test('特性欄のない旧プロフィールも読み込める',()=>{const s=load(JSON.stringify({...initialState(),profile:{name:'勇者',goal:'毎日歩く'}}));assert.equal(s.profile.traits,undefined);});
