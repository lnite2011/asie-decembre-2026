# Cap sur l'Asie — décembre 2026

Site statique en français pour Maman, Quentin et Fanny (Singapour · Vietnam · Thaïlande).
Pas de serveur : HTML + CSS + JS, carte Leaflet / OpenStreetMap, photos Wikimedia Commons (crédits dans `credits.json`).

- **Tout le contenu** est dans `content.js` (jours, lieux, plats, vols, météo, valise). Modifier, pousser, publier.
- **Règles de la famille** : jamais de nom d'hôtel ou de croisière (c'est une surprise), jamais de prix.
- **Aperçu local** : `python3 -m http.server 8765 --directory trips` depuis le dépôt de planification, puis `/singapore-vietnam-thailand-2026-12/website/app/`.
- **Publication** : `./publish.sh` (git subtree push vers le dépôt public `asie-decembre-2026`).
- `<meta name="robots" content="noindex">` : le site n'est pas référencé par les moteurs de recherche.
