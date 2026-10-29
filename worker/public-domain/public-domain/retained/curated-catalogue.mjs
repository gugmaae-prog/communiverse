// Small public catalogue additions live with the Worker while D1 writes are quota-blocked.
// Existing database records always win; all original filters, tombstones and pagination remain in SQL.
import RECORDS_JSON from './gemma-catalogue.txt';
const records=JSON.parse(RECORDS_JSON);
const literal=JSON.stringify(records).replaceAll("'","''");
const cte=`WITH cv_catalog AS (
 SELECT id,kind,artist,region,data,tags,checked_at FROM main.cv_catalog
 UNION ALL
 SELECT json_extract(entry.value,'$.id'),json_extract(entry.value,'$.kind'),
 coalesce(json_extract(entry.value,'$.artist'),''),coalesce(json_extract(entry.value,'$.region'),''),
 entry.value,coalesce(json_extract(entry.value,'$.tags'),'[]'),'2026-10-27T13:00:00.000Z'
 FROM json_each('${literal}') AS entry
 WHERE NOT EXISTS (SELECT 1 FROM main.cv_catalog existing WHERE existing.id=json_extract(entry.value,'$.id'))
) `;
export function catalogueQuery(sql){return /^\s*SELECT\b/i.test(sql)&&/\bcv_catalog\b/i.test(sql)?cte+sql:sql}
export function catalogueDatabase(db){if(!db)return db;return new Proxy(db,{get(target,key){if(key==='prepare')return sql=>target.prepare(catalogueQuery(sql));const value=Reflect.get(target,key,target);return typeof value==='function'?value.bind(target):value}})}
export {records};
