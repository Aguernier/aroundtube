# AroundTube

Un client d'API écrit en Html/Javascript permettant de rechercher les vidéos YouTube autour d'un point géographique et d'afficher les résultats sur une carte.

> Le projet se veux simple car il est destiné à des étudiants et futurs développeurs.
Merci donc de n'utiliser ce projet qu'a des fins d'apprentissage ou de test. Il n'est en aucun voué à être déployé sur un serveur de production.

Autrement amusez vous !

## Techno utilisées
- HTML5;
- Javascript;
- [jQuery](https://jquery.com/);
- [Bootstrap](https://getbootstrap.com/);
- [Leaflet](https://leafletjs.com/);

## Api et web service utilisés
- https://api.gouv.fr/api/base-adresse-nationale pour rechercher des adresses;
- https://developer.mozilla.org/fr/docs/Web/API/Geolocation_API pour la géolocalisation;
- OpenStreetMap avec Leaflet;
- https://developers.google.com/youtube/v3 l'api de YouTube

## Installation 

### Credentials
If faudra suivre les étapes décrites dans ce lien pour créer une clé d'API et un client ID Oauth 2.0 : https://developers.google.com/youtube/v3/getting-started#before-you-start

- clé d'API -> dans l'édition de celle ci, renseignez une __Restrictions relatives aux applications__ de type __Référents HTTP (sites Web)__ et ajoutez un élément __URL de provenance__ avec l'url de votre application (ex: http://localhost:5500)
- Id client OAuth -> dans l'édition de celle ci, renseignez une __Origines JavaScript autorisées__ et une __URI de redirection autorisés__ avec l'url de votre application (ex: http://localhost:5500)
- Attention, dans les url, renseignez bien une url et pas un IP comme 127.0.0.1. Cela ne fonctionnera pas et vous allez chercher pourquoi pendant 3 heures.

Renseignez ensuite votre clé d'API et votre client ID Oauth 2.0 dans le fichier ```./config/config.json``` (il faut le créer).

### Lancement de l'app
Il vous faudra un serveur local aussi afin de lancer l'application(wamp, xampp, le serveur de php, live server pour VsCode, etc...).

Un petit git clone dans votre environnement de dev, lancez votre serveur et accèdez à l'application avec l'url que vous avez configurée pour les clés d'API et client ID (ex: http://localhost:5500) et non avec un IP type 127.0.0.1. 

# bon.confinement()
!["y'a quelqu'un ?"](https://media.giphy.com/media/yfo9ccvoRPu8w/giphy.gif)

