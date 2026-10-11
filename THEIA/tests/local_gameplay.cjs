/* Reuse existing tests read-only; redirect every output into THEIA. */
const {spawnSync}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),synodic=path.resolve(root,'../SYNODIC');
const report={testedAt:new Date().toISOString(),scope:'Actual local installer exports; Desktop Chrome, controlled SVG artwork and storage. Existing tests unchanged.',jobs:[]};
for(const key of ['pc','pc-c2'])for(const [test,outputEnv] of [['test_b69_story_actions_live.cjs','STORY_OUTPUT'],['test_b69_story_followup_live.cjs','FOLLOWUP_OUTPUT']]){
 const dir=path.join(root,'prototypes/generated/local/gameplay',key,test.replace('.cjs',''));
 fs.mkdirSync(dir,{recursive:true});const start=Date.now();
 const run=spawnSync(process.execPath,[path.join(synodic,'tests',test)],{cwd:synodic,env:{...process.env,STG_TEST_HTML:path.join(root,'prototypes/generated/local',key+'-installed.html'),[outputEnv]:dir},encoding:'utf8',timeout:120000,maxBuffer:8*1024*1024});
 fs.writeFileSync(path.join(dir,'run.log'),(run.stdout||'')+(run.stderr||''));
 const job={input:key,test,pass:run.status===0,status:run.status,error:run.error?.message,elapsedMs:Date.now()-start,reportDirectory:path.relative(root,dir)};
 report.jobs.push(job);fs.writeFileSync(path.join(root,'research/evidence/local-gameplay-regressions.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(job));
}
report.pass=report.jobs.every(j=>j.pass);fs.writeFileSync(path.join(root,'research/evidence/local-gameplay-regressions.json'),JSON.stringify(report,null,2));if(!report.pass)process.exitCode=1;
