import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tree } from 'lucide-react';

const ChristmasLottery = () => {
	const [participants, setParticipants] = useState([]);
	const [isDrawing, setIsDrawing] = useState(false);
	const [winner, setWinner] = useState(null);

	useEffect(() => {
		fetchParticipants();
	}, []);

	const fetchParticipants = async () => {
		const response = await fetch('http://localhost:3001/participants');
		const data = await response.json();
		setParticipants(data);
	};

	const handleDraw = async () => {
		setIsDrawing(true);
		const response = await fetch('http://localhost:3001/draw', {
			method: 'POST'
		});
		const data = await response.json();
		setParticipants(data.participants);

		if (data.drawResult.isRoundComplete) {
			setWinner(data.participants.find(p => p.points === 0));
		}
		setIsDrawing(false);
	};

	const resetRound = async () => {
		const response = await fetch('http://localhost:3001/reset-round', {
			method: 'POST'
		});
		const data = await response.json();
		setParticipants(data);
		setWinner(null);
	};

	const getTreeSize = (points) => {
		const baseSize = 24;
		return baseSize + (points * 2);
	};

	return (
		<div
			className="min-h-screen w-full bg-cover bg-center p-8"
			style={{
				backgroundImage: 'url(/api/placeholder/1920/1080)',
				backgroundColor: 'rgba(0, 0, 0, 0.5)'
			}}
		>
			<div className="max-w-7xl mx-auto">
				<div className="flex flex-wrap justify-center gap-8 mb-8">
					{participants.map((participant) => (
						<Card
							key={participant.id}
							className="p-4 text-center bg-white/90 backdrop-blur"
						>
							<Tree
								size={getTreeSize(participant.points)}
								className={`mx-auto ${participant.points === 0
										? 'text-red-500 animate-bounce'
										: 'text-green-600'
									}`}
							/>
							<div className="mt-2 font-bold">{participant.name}</div>
							<div className="text-sm">Poeng: {participant.points}</div>
						</Card>
					))}
				</div>

				<div className="flex justify-center gap-4">
					<Button
						onClick={handleDraw}
						disabled={isDrawing || !participants.length}
						className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 text-xl"
					>
						{isDrawing ? 'Trekker...' : 'Utfør Trekning'}
					</Button>

					{winner && (
						<Button
							onClick={resetRound}
							className="bg-green-600 hover:bg-green-700 text-white"
						>
							Start Ny Runde
						</Button>
					)}
				</div>

				{winner && (
					<div className="mt-8 text-center text-2xl text-white bg-black/50 p-4 rounded">
						Gratulerer {winner.name}! Du vant denne runden! 🎉
					</div>
				)}
			</div>
		</div>
	);
};

export default ChristmasLottery;
