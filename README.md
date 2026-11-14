# 🐝 Алтай. Пчёлы. Мёд.

A humorous single-page Flask site — a joke glossary of Altai. The three sacred words of the region — **алтай**, **пчёлы**, **мёд** — each with a set of alternative "honest" definitions, served with mountain-sized irony.

## What's inside

- Single-page UI listing all definitions with emoji
- JSON API: `GET /api/definition/<word>` returns the definitions of a word
- Definitions live right in `app.py` (`DEFINITIONS` dict) — add your own in seconds
- Pure Flask, no database, no frameworks

## Quick start

```bash
pip install -r requirements.txt
python app.py
```

Open the page in a browser and enjoy the mountains.

## Adding your own word

Add a new key to the `DEFINITIONS` dictionary in `app.py`:

```python
"слово": [
    {
        "title": "🏔️ Заголовок",
        "text": "Текст определения...",
        "emoji": "🏔️🌲"
    },
]
```
