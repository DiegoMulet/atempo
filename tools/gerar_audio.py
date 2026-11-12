"""Gera os MP3 (vozes neurais pt-BR via edge-tts) e o manifesto js/audio-manifest.js.
Uso:  node tools/roteiros.js > tools/roteiros.json
      python tools/gerar_audio.py
"""
import asyncio
import json
import os
import sys
import tempfile

import edge_tts
from mutagen.mp3 import MP3

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ROTEIROS = os.path.join(RAIZ, 'tools', 'roteiros.json')
SAIDA = os.path.join(RAIZ, 'audio')
MANIFESTO = os.path.join(RAIZ, 'js', 'audio-manifest.js')
SEM = asyncio.Semaphore(6)


async def sintetizar(texto, voz, destino):
    for tentativa in range(5):
        try:
            async with SEM:
                await edge_tts.Communicate(texto, voz, rate='+4%').save(destino)
            if os.path.getsize(destino) > 0:
                return
        except Exception as erro:  # rede instável: tenta de novo
            print(f'  retry {tentativa + 1}: {erro}', file=sys.stderr)
        await asyncio.sleep(2 * (tentativa + 1))
    raise RuntimeError(f'falha ao sintetizar: {texto[:60]}')


async def faixa(segmentos, arquivo, tmp):
    partes = []
    for i, s in enumerate(segmentos):
        p = os.path.join(tmp, f'{os.path.basename(os.path.dirname(arquivo))}-{os.path.basename(arquivo)}-{i}.mp3')
        partes.append(p)
    await asyncio.gather(*(sintetizar(s['text'], s['v'], p) for s, p in zip(segmentos, partes)))
    inicio, tempos = 0.0, []
    os.makedirs(os.path.dirname(arquivo), exist_ok=True)
    with open(arquivo, 'wb') as f:
        for p in partes:
            dur = MP3(p).info.length
            tempos.append(round(inicio, 2))
            inicio += dur
            with open(p, 'rb') as pf:
                f.write(pf.read())
    return tempos, round(inicio, 2)


async def topico(chave, roteiro, tmp):
    d, t = chave.split('/')
    base = os.path.join(SAIDA, d, t)
    rel = f'audio/{d}/{t}'
    item = {}

    tempos, dur = await faixa(roteiro['podcast'], os.path.join(base, 'podcast.mp3'), tmp)
    caps, visto = [], set()
    for s, ini in zip(roteiro['podcast'], tempos):
        if s['ch'] not in visto:
            visto.add(s['ch'])
            caps.append({'h': s['ch'], 't': ini})
    item['podcast'] = {'src': f'{rel}/podcast.mp3', 'dur': dur, 'ch': caps}

    tempos, dur = await faixa(roteiro['video'], os.path.join(base, 'video.mp3'), tmp)
    item['video'] = {'src': f'{rel}/video.mp3', 'dur': dur,
                     'slides': [{'t': ini, 'h': s['h'], 'pts': s['pts']} for s, ini in zip(roteiro['video'], tempos)]}

    _, dur = await faixa(roteiro['resumo'], os.path.join(base, 'resumo.mp3'), tmp)
    item['resumo'] = {'src': f'{rel}/resumo.mp3', 'dur': dur}
    print(f'ok {chave}  podcast {item["podcast"]["dur"]:.0f}s  video {item["video"]["dur"]:.0f}s', flush=True)
    return chave, item


async def main():
    with open(ROTEIROS, encoding='utf-8') as f:
        roteiros = json.load(f)
    so = sys.argv[1:]  # opcional: gerar só algumas chaves
    with tempfile.TemporaryDirectory() as tmp:
        res = await asyncio.gather(*(topico(k, r, tmp) for k, r in roteiros.items() if not so or k in so))
    manifesto = {}
    if so and os.path.exists(MANIFESTO):
        with open(MANIFESTO, encoding='utf-8') as f:
            manifesto = json.loads(f.read().split('=', 1)[1].rstrip().rstrip(';'))
    manifesto.update(dict(res))
    with open(MANIFESTO, 'w', encoding='utf-8') as f:
        f.write('/* gerado por tools/gerar_audio.py */\nwindow.ATEMPO_AUDIO = ' + json.dumps(manifesto, ensure_ascii=False) + ';\n')


asyncio.run(main())
