from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
import json
root=Path('/mnt/data/rc37_work')
font_path='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'
font=ImageFont.truetype(font_path,56)
small=ImageFont.truetype(font_path,42)
boards=['kamatz-patach','segol-tzere','hirik','holam','shuruk-kubutz','masa-hanikud']
band_colors={
 'kamatz-patach':(28,76,42), 'segol-tzere':(29,99,133), 'hirik':(113,67,116),
 'holam':(159,86,32), 'shuruk-kubutz':(25,108,111), 'masa-hanikud':(72,20,18)}
for b in boards:
    p=root/f'public/assets/boards/approved/{b}.png'
    im=Image.open(p).convert('RGB')
    draw=ImageDraw.Draw(im,'RGBA')
    pack=json.load(open(root/f'src/data/boardPacks/{b}.json',encoding='utf-8'))
    is_final=b=='masa-hanikud'
    if not is_final:
        # Clean scenic path bands that fully hide the original generated glyphs.
        for y in [.31,.49,.68,.86]:
            cy=int(y*im.height)
            draw.rounded_rectangle((75,cy-60,1525,cy+60),radius=24,fill=band_colors[b]+(225,),outline=(255,220,145,230),width=3)
        tile_w,tile_h,radius=142,92,16
    else:
        draw.rounded_rectangle((45,125,1555,935),radius=18,fill=band_colors[b]+(245,),outline=(255,127,70,255),width=4)
        tile_w,tile_h,radius=140,102,7
    for point in pack['path']:
        cx=int(point['center']['x']*im.width); cy=int(point['center']['y']*im.height)
        x0=cx-tile_w//2; y0=cy-tile_h//2; x1=cx+tile_w//2; y1=cy+tile_h//2
        fill=(255,239,205) if point['type'] not in ('start','finish') else ((205,241,199) if point['type']=='start' else (255,214,190))
        draw.rounded_rectangle((x0+3,y0+5,x1+3,y1+5),radius=radius,fill=(72,42,18,255))
        draw.rounded_rectangle((x0,y0,x1,y1),radius=radius,fill=fill+(255,),outline=(112,70,28,255),width=3)
        label=point.get('label','')
        f=small if len(label)>=3 else font
        draw.text((cx,cy-2),label,font=f,fill=(20,18,14,255),anchor='mm',stroke_width=1,stroke_fill=(255,255,255,255))
    im.convert('RGB').save(p,optimize=True)
print('rendered corrected symbols')
