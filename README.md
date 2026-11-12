# ATEMPO — Direito. Aprenda no seu tempo.

Protótipo navegável (HTML/CSS/JS puro, sem build) de uma plataforma de estudos jurídicos.
Todas as interações são simuladas — não há back-end.

## Telas
- **Página inicial** (`#/`) — hero, formatos, disciplinas, planos, sobre
- **Login** — botão "Entrar" (dados já preenchidos, é só tocar em Entrar)
- **Painel da estudante** (`#/app`) — progresso, busca, disciplinas, continue estudando, materiais recentes
- **Disciplina e assunto** (`#/disciplina/empresarial`)
- **Escolha do formato** (`#/disciplina/empresarial/teoria-da-empresa`)
- **Área de estudo** — PDF (paginação, zoom, deslizar no celular), Podcast (player), Mapa mental (interativo) e Videoaula
- Abas Resumo / Referências / Questões (quiz), Marcar como estudado, Favoritar
- Minhas Matérias, Favoritos, Histórico, Simulados (com resultado), Configurações e Perfil

O estado (favoritos, estudados, nome, simulados) fica salvo no navegador. Para zerar:
Configurações → "Restaurar dados da demonstração".

## Rodar localmente
```bash
python -m http.server 8080
```
Abra http://localhost:8080

## Publicar no GitHub Pages
1. Crie um repositório público no GitHub (ex.: `atempo`).
2. Envie estes arquivos para a branch `main`:
   ```bash
   git remote add origin https://github.com/SEU-USUARIO/atempo.git
   git push -u origin main
   ```
3. No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**.
4. Em ~1 minuto o site fica em `https://SEU-USUARIO.github.io/atempo/`.

Dica para a apresentação: no celular, abra o link e use **"Adicionar à tela inicial"** — o app abre em tela cheia, como um aplicativo.
