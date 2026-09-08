# Story Point Shodown

Een Nederlandse planning-pokerarena met originele fantasykaarten. Maak een kamer, deel de unieke URL en schat meerdere stories in met je collega's.

## Gebruiken

1. Vul je naam en eventueel een kamernaam in.
2. Maak de kamer en deel de link met je team.
3. Voeg stories toe, eventueel met ticketreferentie en beschrijving.
4. Iedereen kiest een kaart: 0, 1, 2, 3, 5, 8, 13, 20, ? of ☕.
5. De sessieleider onthult de kaarten. Bespreek verschillen en leg een gezamenlijke inschatting vast.
6. Ga door naar de volgende story. Download het resultatenoverzicht als CSV voordat je de kamer sluit.

## Zonder database

De website bestaat uit statische bestanden en kan rechtstreeks op Vercel worden gehost. Er zijn geen API-sleutels, database of serverfuncties nodig.

PeerJS gebruikt zijn openbare verbindingsdienst om browsers met elkaar in contact te brengen. Daarna loopt de kamercommunicatie via WebRTC-datakanalen. Dit is geen volledig dienstloze oplossing: de PeerJS-verbindingsdienst en STUN-diensten moeten bereikbaar zijn. Zie [PeerJS](https://peerjs.com/client/getting-started) en [PeerServer Cloud](https://peerjs.com/server/cloud).

De sessieleider is de bron van de kamerstatus. Alleen de sessieleider kan stories toevoegen, wisselen, verwijderen, rondes onthullen/herstarten en inschattingen vastleggen. Deelnemers ontvangen uitsluitend hun eigen stem en de stemstatus van anderen tot de onthulling. De sessieleider is technisch vertrouwd en heeft de volledige status in de eigen browser.

De browser van de sessieleider bewaart een herstelkopie in sessionStorage. Herladen in hetzelfde tabblad kan de kamer herstellen; na herladen moeten deelnemers zo nodig opnieuw verbinden. Dit is geen duurzame opslag: reken niet op herstel na het sluiten van het tabblad. Dezelfde tab twee keer dupliceren wordt niet ondersteund als twee verschillende personen. Iedereen met de onvoorspelbare kamerlink kan deelnemen. Er is geen accountcontrole of wachtwoord.

De sessieleider moet verbonden blijven. Er is geen automatische overname door een andere deelnemer. Bedrijfsfirewalls, strikte NAT en sommige VPN's kunnen WebRTC blokkeren; er is geen beheerde TURN-relay geconfigureerd. De interface meldt verbindingsproblemen en biedt opnieuw verbinden aan. Voor gegarandeerde werking op zulke netwerken is later een beheerde realtime-dienst of TURN-relay nodig.

Maximaal 30 unieke deelnemers en 100 stories per kamer. Deelnemers blijven bij verbroken verbinding zichtbaar als offline, zodat eerdere stemmen in het resultatenoverzicht blijven staan. Resultaten worden niet automatisch gewist bij het wisselen van story. Herstarten van een ronde wist de stemmen en definitieve inschatting van die story.

## Ontwikkelen

Node.js 22 of nieuwer en npm:

```sh
npm ci
npm run dev
npm test
npm run build
```

Vercel-configuratie staat in `vercel.json`. Vercel detecteert Vite en publiceert de map `dist`. Publiceren in je eigen account:

```sh
vercel login
vercel --prod
```

De publicatie bevat alleen de applicatie en de kaartillustraties. De aangeleverde persoonlijke schets is niet in dit project opgenomen.

## Validatie

Geautomatiseerde tests controleren autorisatie, verborgen stemmen in de netwerkweergave, geheimhouding van herverbindingsgegevens, ongeldige en vertraagde stemmen, onafhankelijke stories, resetten, gemiddelden, CSV-export en verwijderen. De productiebuild controleert TypeScript en bundelt de applicatie. Een echte sessie tussen meerdere apparaten en bedrijfsnetwerken is nog niet getest.

Browsers met de experimentele `document.modelContext`-API krijgen `read_planning_session` en `start_story_creation`. Deze gebruiken dezelfde zichtbare status en storydialoog. De optionele WebMCP-integratie is niet in een ondersteunde browsercontext geverifieerd.

## Illustratie

De drie originele wezens zijn met ingebouwde ImageGen gemaakt; zie `ARTWORK.md` voor het exacte prompt en `public/art/creatures.png` voor de afbeelding. Lettertypen: DM Sans en Barlow Condensed via Google Fonts. Bij onbeschikbaarheid worden lokale sans-seriflettertypen gebruikt.
