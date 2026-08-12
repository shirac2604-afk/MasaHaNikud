from PIL import Image
from pathlib import Path
import json, itertools

root=Path('/mnt/data/rc37_work')
source=Path('/mnt/data/a_colorful_infographic_board_game_poster_in_hebrew.png')
img=Image.open(source).convert('RGB')
# crops: left, top, right, bottom
crops={
 'kamatz-patach':(245,165,644,550),
 'segol-tzere':(653,165,1055,550),
 'hirik':(1063,165,1518,550),
 'holam':(245,559,644,946),
 'shuruk-kubutz':(653,559,1055,946),
 'masa-hanikud':(1063,559,1518,946),
}
outdir=root/'public/assets/boards/approved'
outdir.mkdir(parents=True,exist_ok=True)
for k,box in crops.items():
    crop=img.crop(box)
    # normalize all to 1600x1000, preserving content exactly
    crop=crop.resize((1600,1000),Image.Resampling.LANCZOS)
    crop.save(outdir/f'{k}.png',optimize=True)

letters=list('אבגדהוזחטיכלמנסעפצקרשת')
# 30 symbols per study board (repeat letters with alternate niqqud)
def symbols_for(board):
    vals=[]
    for i in range(30):
        l=letters[i%len(letters)]
        if board=='kamatz-patach':
            vals.append(l+('ָ' if i%2==0 else 'ַ'))
        elif board=='segol-tzere':
            vals.append(l+('ֶ' if i%2==0 else 'ֵ'))
        elif board=='hirik':
            vals.append(l+'ִ')
        elif board=='holam':
            vals.append(l+'ֹ' if i%2==0 else l+'וֹ')
        elif board=='shuruk-kubutz':
            vals.append(l+'ֻ' if i%2==0 else l+'וּ')
    return vals

mixed=[]
all_types=[
 ('קמץ',lambda l:l+'ָ'),('פתח',lambda l:l+'ַ'),('סגול',lambda l:l+'ֶ'),('צירה',lambda l:l+'ֵ'),
 ('חיריק',lambda l:l+'ִ'),('חולם חסר',lambda l:l+'ֹ'),('חולם מלא',lambda l:l+'וֹ'),
 ('קובוץ',lambda l:l+'ֻ'),('שורוק',lambda l:l+'וּ')]
for i in range(60):
    name,fn=all_types[i%len(all_types)]
    mixed.append((fn(letters[i%len(letters)]),name))

metadata={
 'kamatz-patach':('קמץ–פתח','מסלול לימודי לזיהוי קמץ ופתח','kamatz-patach',1,'מתחילים',['זיהוי קמץ','זיהוי פתח','הבחנה בין קמץ לפתח'], '#2f7f50','#ffd76a'),
 'segol-tzere':('סגול–צירה','מסלול לימודי לזיהוי סגול וצירה','segol-tzere',2,'מתחילים–בינוני',['זיהוי סגול','זיהוי צירה','הבחנה בין סגול לצירה'], '#1678b8','#83d7ff'),
 'hirik':('חיריק','מסלול לימודי לתרגול חיריק','hirik',2,'בינוני',['זיהוי חיריק','קריאת הברות בחיריק'], '#6c3a9c','#d28cff'),
 'holam':('חולם חסר–חולם מלא','מסלול לימודי להבחנה בין חולם חסר לחולם מלא','holam',3,'בינוני',['זיהוי חולם חסר','זיהוי חולם מלא','הבחנה בין שני סוגי החולם'], '#c86d1b','#ffd45d'),
 'shuruk-kubutz':('שורוק–קובוץ','מסלול לימודי להבחנה בין שורוק לקובוץ','shuruk-kubutz',3,'בינוני–מתקדם',['זיהוי שורוק','זיהוי קובוץ','הבחנה בין שורוק לקובוץ'], '#118a9c','#63e0ea'),
 'masa-hanikud':('מסע הניקוד','משחק סולמות ונחשים המשלב את כל סימני הניקוד','masa-hanikud',4,'מסכם',['חזרה על כל סימני הניקוד','יישום משולב'], '#9d241f','#ffb34f')
}

def study_points(symbols):
    pts=[]
    rows=[8,8,7,7]
    ys=[.31,.49,.68,.86]
    idx=1
    for r,(count,y) in enumerate(zip(rows,ys)):
        xs=[.14+i*(.72/(count-1)) for i in range(count)]
        if r%2==1: xs=xs[::-1]
        for x in xs:
            s=symbols[idx-1]
            pts.append({'id':idx,'center':{'x':round(x,4),'y':y},'anchor':{'x':round(x,4),'y':round(y+.035,4)},
                        'type':'start' if idx==1 else ('finish' if idx==30 else 'question'),
                        'questionGroup':f'GROUP:{idx}','label':s})
            idx+=1
    return pts

def mixed_points():
    pts=[]; idx=1
    ys=[.18,.32,.46,.60,.74,.88]
    for r,y in enumerate(ys):
        xs=[.08+i*(.84/9) for i in range(10)]
        if r%2==1: xs=xs[::-1]
        for x in xs:
            s,_=mixed[idx-1]
            pts.append({'id':idx,'center':{'x':round(x,4),'y':y},'anchor':{'x':round(x,4),'y':round(y+.025,4)},
                        'type':'start' if idx==1 else ('finish' if idx==60 else 'question'),
                        'questionGroup':f'GROUP:{idx}','label':s})
            idx+=1
    return pts

boarddir=root/'src/data/boardPacks'
qdir=root/'src/data/questionBanks'

def niqqud_name(board,i):
    if board=='kamatz-patach': return 'קמץ' if i%2==0 else 'פתח'
    if board=='segol-tzere': return 'סגול' if i%2==0 else 'צירה'
    if board=='hirik': return 'חיריק'
    if board=='holam': return 'חולם חסר' if i%2==0 else 'חולם מלא'
    if board=='shuruk-kubutz': return 'קובוץ' if i%2==0 else 'שורוק'
    return mixed[i][1]

idbase=200000
for b,(name,desc,qset,diff,dlabel,goals,primary,accent) in metadata.items():
    syms=[x[0] for x in mixed] if b=='masa-hanikud' else symbols_for(b)
    path=mixed_points() if b=='masa-hanikud' else study_points(syms)
    for p in path:
        p['questionGroup']=f'{b}:symbol-{p["id"]}'
    transitions=[]
    if b=='masa-hanikud':
        transitions=[
          {'from':3,'to':18,'kind':'ladder'}, {'from':14,'to':29,'kind':'ladder'},
          {'from':32,'to':47,'kind':'ladder'}, {'from':45,'to':56,'kind':'ladder'},
          {'from':17,'to':5,'kind':'snake'}, {'from':30,'to':11,'kind':'snake'},
          {'from':44,'to':25,'kind':'snake'}, {'from':58,'to':39,'kind':'snake'}]
    pack={
      'schemaVersion':2,'id':b,'version':'2.0.0','name':name,'description':desc,
      'assetKey':f'board-approved-{b}','image':f'/assets/boards/approved/{b}.png','category':'ניקוד',
      'questionSet':qset,'difficulty':diff,'difficultyLabel':dlabel,'recommendedAge':'6–8',
      'estimatedDuration':'15–20 דקות' if b!='masa-hanikud' else '20–30 דקות','learningGoals':goals,
      'theme':{'primary':primary,'accent':accent,'tileFill':'#fff1cf','tileStroke':'#624018','pathStroke':accent},
      'layout':{'referenceWidth':1600,'referenceHeight':1000,'tileRadius':40,'renderTiles':False,'renderPath':False,'renderTransitions':False},
      'path':path,'transitions':transitions}
    json.dump(pack,open(boarddir/f'{b}.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)

    groups={}
    for i,symbol in enumerate(syms):
        gid=f'{b}:symbol-{i+1}'
        nname=niqqud_name(b,i)
        # distractors from same board, preserving current as correct
        options=[]
        for off in [0,3,7,11]:
            cand=syms[(i+off)%len(syms)]
            if cand not in options: options.append(cand)
        while len(options)<4:
            cand=syms[(i+len(options)+1)%len(syms)]
            if cand not in options: options.append(cand)
        correct_pos=options.index(symbol)+1
        names=['קמץ','פתח','סגול','צירה','חיריק','חולם חסר','חולם מלא','קובוץ','שורוק']
        name_opts=[nname]+[x for x in names if x!=nname][:3]
        # rotate to vary correct position
        rot=i%4; name_opts=name_opts[rot:]+name_opts[:rot]
        correct_name=name_opts.index(nname)+1
        qid=idbase+i*3
        groups[gid]=[
          {'id':qid+1,'boardId':b,'groupId':gid,'learningGoal':f'זיהוי ההברה {symbol}','kind':'identify',
           'text':f'איזו הברה מופיעה במשבצת?  {symbol}','answers':[{'id':j+1,'text':v} for j,v in enumerate(options)],'correctAnswer':correct_pos,'difficulty':1 if i<10 else (2 if i<22 else 3)},
          {'id':qid+2,'boardId':b,'groupId':gid,'learningGoal':f'זיהוי הניקוד בהברה {symbol}','kind':'find-nikud',
           'text':f'איזה ניקוד מופיע בהברה {symbol}?','answers':[{'id':j+1,'text':v} for j,v in enumerate(name_opts)],'correctAnswer':correct_name,'difficulty':1 if i<10 else (2 if i<22 else 3)},
          {'id':qid+3,'boardId':b,'groupId':gid,'learningGoal':f'התאמת ההברה {symbol}','kind':'choose-example',
           'text':f'בחרו את ההברה הזהה לזו שעל המשבצת: {symbol}','answers':[{'id':j+1,'text':v} for j,v in enumerate(options[::-1])],'correctAnswer':len(options)-options.index(symbol),'difficulty':1 if i<10 else (2 if i<22 else 3)}
        ]
    bank={'schemaVersion':1,'boardId':b,'version':'2.0.0','groups':groups}
    json.dump(bank,open(qdir/f'{b}.json','w',encoding='utf-8'),ensure_ascii=False,indent=2)
    idbase += 10000

print('integrated approved boards')
