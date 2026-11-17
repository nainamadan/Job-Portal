import sys,json,re,collections
from pathlib import Path
sys.path.insert(0,'.pdf-editor')
import fitz
root=Path(__file__).parent
source=fitz.open('121_updated.pdf')
doc=fitz.open('121_updated.pdf')
groups=json.load(open('rewrite-groups.json',encoding='utf8'))
revisions={int(line.split('|',1)[0]):line.rstrip().split('|',1)[1] for line in open('revisions.txt',encoding='utf8') if '|' in line}
assert set(revisions)==set(range(len(groups)))
fontpath='C:/Windows/Fonts/times.ttf'
font=fitz.Font(fontfile=fontpath)
size=11.04

def wrap(text,width,fontsize):
 result=[]; current=''
 for word in text.split():
  proposed=(current+' '+word).strip()
  if current and font.text_length(proposed,fontsize=fontsize)>width:
   result.append(current); current=word
  else: current=proposed
 if current:result.append(current)
 return result

prepared=[]
for g in groups:
 rect=fitz.Rect(g['bbox'])
 text=revisions[g['id']]
 right=max(rect.x1,527.4)
 wrapped=wrap(text,right-rect.x0,size)
 if len(wrapped)>g['lines']:
  raise ValueError(('Rewrite exceeds original space',g['id'],g['lines'],len(wrapped),text))
 prepared.append((g,wrapped))
by_page=collections.defaultdict(list)
for g,wrapped in prepared:by_page[g['page']].append((g,wrapped))
for pi,items in by_page.items():
 page=doc[pi]
 for g,wrapped in items:
  page.add_redact_annot(fitz.Rect(g['bbox'])+(-.1,-.1,.1,.1),fill=(1,1,1))
 page.apply_redactions(images=0,graphics=0)
 page.insert_font(fontname='HumanisedTimes',fontfile=fontpath)
 for g,wrapped in items:
  r=fitz.Rect(g['bbox'])
  baseline=r.y0+font.ascender*size
  for n,line in enumerate(wrapped):
   page.insert_text((r.x0,baseline+n*18.96),line,fontname='HumanisedTimes',fontsize=size,color=(0,0,0))

# Build a concise two-level contents list from the original section headings.
entries=[];all_entries=[]
for pi in list(range(1,6))+list(range(11,len(source))):
 for b in source[pi].get_text('dict')['blocks']:
  for l in b.get('lines',[]):
   text=' '.join(''.join(s['text'] for s in l['spans']).split())
   if not text or not 55<l['bbox'][1]<780:continue
   if pi<6:
    if not text.isupper():continue
    level=1
   elif re.match(r'^(CHAPTER\s+\d|APPENDIX\s+\d|REFERENCES$)',text):level=1
   elif re.match(r'^\d+\.\d+(?:\.\d+)?\s',text):level=len(text.split()[0].split('.'))
   else:continue
   e=dict(title=text,level=level,page=pi,y=l['bbox'][1])
   all_entries.append(e)
   if level<=2:entries.append(e)

# Two pages use the original 11.04 pt body font with a compact, readable 16 pt rhythm.
toc_pages=2
body_start=6+toc_pages
doc.delete_pages(6,10)
for i in range(toc_pages):doc.new_page(pno=6+i,width=595.2,height=841.92)
def target(e):return e['page'] if e['page']<6 else e['page']-11+body_start
def roman(n):
 result=''
 for v,t in [(10,'x'),(9,'ix'),(5,'v'),(4,'iv'),(1,'i')]:
  while n>=v:result+=t;n-=v
 return result
def label(i):return '' if i==0 else roman(i) if i<body_start else str(i-body_start+1)

# Replace running furniture on every applicable page.
for pi,page in enumerate(doc):
 for b in page.get_text('dict')['blocks']:
  for l in b.get('lines',[]):
   text=''.join(s['text'] for s in l['spans']).strip()
   if text and (l['bbox'][1]<55 or l['bbox'][1]>780):
    page.add_redact_annot(fitz.Rect(l['bbox'])+(-.2,-.2,.2,.2),fill=(1,1,1))
 if pi:page.apply_redactions(images=0,graphics=0)
 page.insert_font(fontname='FinalTimes',fontfile=fontpath)
 if pi:
  for text,y in [('Hire Path AI',40),(label(pi),804)]:
   page.insert_text(((page.rect.width-font.text_length(text,fontsize=11))/2,y),text,fontname='FinalTimes',fontsize=11,color=(0,0,0))

per_page=(len(entries)+1)//2
assert per_page<=41,(len(entries),per_page)
for ti in range(2):
 p=doc[6+ti];p.insert_font(fontname='ContentsTitle',fontfile='C:/Windows/Fonts/calibrib.ttf')
 p.insert_textbox(fitz.Rect(99.4,72,527.4,98),'TABLE OF CONTENTS'+(' (CONTINUED)' if ti else ''),fontname='ContentsTitle',fontsize=13.92,align=1)
 y=116
 for e in entries[ti*per_page:(ti+1)*per_page]:
  x=99.4+(e['level']-1)*12
  text=e['title']
  # Title case keeps long chapter names readable on one line without reducing font size.
  if e['level']==1 and e['page']>=11:text=text.title().replace('Dfd','DFD')
  width=font.text_length(text,fontsize=size)
  number=label(target(e));nx=527.4-font.text_length(number,fontsize=size)
  assert x+width+10<nx,(text,width)
  p.insert_text((x,y),text,fontname='FinalTimes',fontsize=size)
  dx=x+width+5
  dots='.'*int((nx-5-dx)/font.text_length('.',fontsize=size))
  p.insert_text((dx,y),dots,fontname='FinalTimes',fontsize=size)
  p.insert_text((nx,y),number,fontname='FinalTimes',fontsize=size)
  p.insert_link({'kind':fitz.LINK_GOTO,'from':fitz.Rect(x,y-12,527.4,y+3),'page':target(e),'to':fitz.Point(0,max(0,e['y']-15))})
  y+=16
bookmarks=[];last=0
for e in all_entries:
 level=min(e['level'],last+1);bookmarks.append([level,e['title'],target(e)+1]);last=level
doc.set_toc(bookmarks)
doc.set_page_labels([{'startpage':0,'prefix':'Cover','style':'','firstpagenum':1},{'startpage':1,'prefix':'','style':'r','firstpagenum':1},{'startpage':body_start,'prefix':'','style':'D','firstpagenum':1}])
doc.save('121_revised.pdf',garbage=4,deflate=True)
result=fitz.open('121_revised.pdf')
for i,p in enumerate(result):
 footer=[s for b in p.get_text('dict')['blocks'] for l in b.get('lines',[]) for s in l['spans'] if s['text'].strip() and s['bbox'][1]>780]
 assert (not footer) if i==0 else (len(footer)==1 and footer[0]['text']==label(i)),('footer',i)
 if i:assert footer[0]['size']==11 and footer[0]['color']==0 and 'Times' in footer[0]['font']
assert sum(len(result[i].get_links()) for i in [6,7])==len(entries)
for name,pi in [('contents',6),('contents-2',7),('abstract',5),('introduction',8),('dense-page',35),('matching',51)]:result[pi].get_pixmap().save('review-'+name+'.png')
print(json.dumps({'pages':len(result),'revised_passages':len(groups),'contents_pages':2,'contents_entries':len(entries),'bookmarks':len(all_entries)}))
