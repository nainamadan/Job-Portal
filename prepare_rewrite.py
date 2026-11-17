import sys,json,re
sys.path.insert(0,'.pdf-editor')
import fitz
doc=fitz.open('121_updated.pdf')
groups=[]
for pi in [4,5]+list(range(11,83)):
 p=doc[pi]
 tables=[fitz.Rect(t.bbox) for t in p.find_tables().tables]
 lines=[]
 for b in p.get_text('dict')['blocks']:
  for l in b.get('lines',[]):
   t=''.join(s['text'] for s in l['spans']).strip()
   if t and 55<l['bbox'][1]<780:
    l['text']=t;lines.append(l)
 lines.sort(key=lambda l:(round(l['bbox'][1],1),l['bbox'][0]))
 active=[]
 def flush():
  global active
  if active:
   text=' '.join(l['text'] for l in active)
   if len(text)>65 and len(text.split())>10:
    rect=fitz.Rect(active[0]['bbox'])
    for l in active[1:]:rect|=fitz.Rect(l['bbox'])
    groups.append({'id':len(groups),'page':pi,'bbox':list(rect),'lines':len(active),'text':text})
   active=[]
 for l in lines:
  t=l['text'];r=fitz.Rect(l['bbox'])
  normal=all('Times' in s['font'] and 'Bold' not in s['font'] for s in l['spans'] if s['text'].strip())
  regular_left=abs(r.x0-99.408)<2 or abs(r.x0-120.77)<2
  excluded=any(r.intersects(table) for table in tables) or re.match(r'^(\d+[.)]|[\uf0b7•]|Figure|Table|\[|Step |//|const |return |function |if |let |console\.|[{}])',t)
  if normal and regular_left and not excluded:
   if active and (r.y0-fitz.Rect(active[-1]['bbox']).y0>23 or abs(r.x0-fitz.Rect(active[-1]['bbox']).x0)>2):flush()
   active.append(l)
  else:flush()
 flush()
json.dump(groups,open('rewrite-groups.json','w',encoding='utf8'),ensure_ascii=False,indent=2)
print('GROUPS',len(groups),'WORDS',sum(len(g['text'].split()) for g in groups))
for g in groups:
 print(str(g['id'])+' [page '+str(g['page']-10 if g['page']>=11 else g['page'])+'] '+g['text'])
