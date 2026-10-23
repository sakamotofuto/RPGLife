export const quests = [
 {id:'step',category:'運動',icon:'↗',title:'外の世界へ、一歩',description:'外に出て10分歩こう。自分のペースで大丈夫。',condition:'10分間の散歩をする',xp:30,minutes:10},
 {id:'read',category:'学習',icon:'▤',title:'まだ知らない世界をひらく',description:'本を5ページ読む。小さな発見を持ち帰ろう。',condition:'本を5ページ読む',xp:25,minutes:10},
 {id:'focus',category:'仕事',icon:'✧',title:'ひとつのことに向き合う',description:'通知を閉じて、目標につながる作業に集中。',condition:'目標に向けた作業を15分する',xp:40,minutes:15},
 {id:'tidy',category:'生活',icon:'⌂',title:'冒険の拠点を整える',description:'机の上や部屋の一角を片づけよう。',condition:'身の回りを5分片づける',xp:20,minutes:5},
 {id:'rest',category:'休息',icon:'☾',title:'ひと息も、前進',description:'画面から離れて深呼吸。休むことも冒険の一部。',condition:'画面から離れて5分休む',xp:15,minutes:5}
];
export const MAX_HP=200;
export const dayKey=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const initialState=()=>({version:1,profile:null,records:[]});
export function reward(record){const q=quests.find(q=>q.id===record.questId);return Math.round(q.xp*(record.partial?.5:1));}
export function stats(state){const xp=state.records.reduce((n,r)=>n+reward(r),0);return {xp,level:1+Math.floor(xp/100),progress:xp%100,hp:Math.max(0,MAX_HP-xp),defeated:xp>=MAX_HP};}
export function complete(state,questId,{note='',difficulty='ちょうどいい',partial=false,date=dayKey()}={}){
 if(!state.profile)throw Error('先に冒険者を登録してください。');
 if(!quests.some(q=>q.id===questId))throw Error('クエストが見つかりません。');
 if(state.records.some(r=>r.questId===questId&&r.date===date))throw Error('このクエストは今日は記録済みです。');
 return {...state,records:[{id:crypto.randomUUID(),questId,date,note:note.trim().slice(0,300),difficulty,partial},...state.records]};
}
export function undo(state,id){return {...state,records:state.records.filter(r=>r.id!==id)};}
export function load(raw){
 if(!raw)return initialState();
 const s=JSON.parse(raw);
 if(s.version!==1||!Array.isArray(s.records)||!(s.profile===null||(typeof s.profile?.name==='string'&&typeof s.profile?.goal==='string')))throw Error('保存データの形式が対応していません。');
 const seen=new Set();
 for(const r of s.records){if(!quests.some(q=>q.id===r.questId)||typeof r.id!=='string'||typeof r.note!=='string'||typeof r.difficulty!=='string'||typeof r.partial!=='boolean'||!/^\d{4}-\d{2}-\d{2}$/.test(r.date)||seen.has(`${r.date}/${r.questId}`))throw Error('保存データの記録を読み込めません。');seen.add(`${r.date}/${r.questId}`);}
 return s;
}
