import sys,glob,re
from PIL import Image,ImageDraw
prefix,out=sys.argv[1],sys.argv[2]; cols=int(sys.argv[3]) if len(sys.argv)>3 else 4
crop=tuple(map(int,sys.argv[4].split(','))) if len(sys.argv)>4 else None  # in 620x407 units
files=sorted(glob.glob(prefix+'-*.png'))
ims=[]
for f in files:
    im=Image.open(f).convert('RGB')
    k=im.width/620
    if crop: im=im.crop(tuple(int(v*k) for v in crop))
    ims.append((im,re.search(r'-(\d+ms)\.png',f).group(1)))
w=min(420,ims[0][0].width); h=int(ims[0][0].height*w/ims[0][0].width)
rows=(len(ims)+cols-1)//cols
sheet=Image.new('RGB',(cols*w,rows*(h+16)),'white'); d=ImageDraw.Draw(sheet)
for i,(im,lab) in enumerate(ims):
    x,y=(i%cols)*w,(i//cols)*(h+16)
    sheet.paste(im.resize((w,h)),(x,y+16)); d.text((x+4,y+2),lab,fill='red')
    d.rectangle([x,y+16,x+w-1,y+16+h-1],outline='#ccc')
sheet.save(out); print(out,len(ims))
