// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// In-memory database (kan erstattes med en ekte database senere)
let participants = [];
let statistics = {};

// Deltaker-modell
class Participant {
	constructor(name) {
		this.id = Date.now().toString();
		this.name = name;
		this.points = 10;
	}
}

// Statistikk-modell
class Statistics {
	constructor(participantId) {
		this.wins = 0;
		this.secondPlaces = 0;
		this.untouchedRounds = 0;
	}
}

// API-endepunkter
app.post('/participants', (req, res) => {
	const { name } = req.body;
	const participant = new Participant(name);
	participants.push(participant);
	statistics[participant.id] = new Statistics();
	res.json(participant);
});

app.get('/participants', (req, res) => {
	res.json(participants);
});

app.get('/statistics', (req, res) => {
	res.json(statistics);
});

// Reset poeng for ny runde
app.post('/reset-round', (req, res) => {
	participants = participants.map(p => ({ ...p, points: 10 }));
	res.json(participants);
});

// Utfør ett trekk i runden
app.post('/draw', (req, res) => {
	const activePlayers = participants.filter(p => p.points > 0);
	if (activePlayers.length === 0) {
		res.status(400).json({ error: "Ingen aktive spillere" });
		return;
	}

	// Velg tilfeldig spiller og trekk 1-3 poeng
	const randomIndex = Math.floor(Math.random() * activePlayers.length);
	const pointsToRemove = Math.floor(Math.random() * 3) + 1;
	const selectedPlayer = activePlayers[randomIndex];

	participants = participants.map(p => {
		if (p.id === selectedPlayer.id) {
			return { ...p, points: Math.max(0, p.points - pointsToRemove) };
		}
		return p;
	});

	// Sjekk om runden er ferdig og oppdater statistikk
	const remainingPlayers = participants.filter(p => p.points > 0);
	if (remainingPlayers.length === 1) {
		const winner = participants.find(p => p.points === 0);
		const secondPlace = remainingPlayers[0];

		statistics[winner.id].wins++;
		statistics[secondPlace.id].secondPlaces++;

		participants.forEach(p => {
			if (p.points === 10) {
				statistics[p.id].untouchedRounds++;
			}
		});
	}

	res.json({
		participants,
		drawResult: {
			player: selectedPlayer,
			pointsRemoved: pointsToRemove,
			isRoundComplete: remainingPlayers.length === 1
		}
	});
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
	console.log(`Server kjører på port ${PORT}`);
});
