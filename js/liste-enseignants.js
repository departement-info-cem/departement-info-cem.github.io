function getProf(id) {
	var p = null;
	
	$.each(profs, function(idx, prof) {
		if(prof.id == id) {
			p = prof;
			return false;
		}
	});
	return p;
}

var profs = [
	{
		id: 1,
		nom: "Azze-Eddine Akkouche",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-211",
		courriel: "​azze-eddine.akkouche@cegepmontpetit.ca",
		extension: "2639",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["1S6", "973"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 2,
		nom: "Belhachemi Ouldali",
		titre: "Enseignant / Coordonnateur du programme",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-210",
		courriel: "belhachemi.ouldali@cegepmontpetit.ca",
		extension: "6411",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["3R5"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 3,
		nom: "Bernard Tremblay",
		titre: "Enseignant",
		actif: false,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "D-162",
		courriel: "bernard.tremblay@cegepmontpetit.ca",
		extension: "3749",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: [] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 4,
		nom: "Chantal Vallières",
		titre: "Enseignant",
		actif: true,
		image: "chantal_vallieres.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-209",
		courriel: "chantal.vallieres@cegepmontpetit.ca",
		extension: "6402",
		lienVideo: "https://www.youtube.com/watch?v=UEi_9RpgtmU",	// laisser vide si pas de vidéo
		cours: ["1N6"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 5,
		nom: "Christian Farley",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "",
		courriel: "",
		extension: "",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["1B3", "1S6"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 6,
		nom: "Dominic Proulx",
		titre: "Coordonnateur du département",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-210",
		courriel: "dominic.proulx@cegepmontpetit.ca",
		extension: "2061",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: [] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 7,
		nom: "Éric Gendron",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-209",
		courriel: "ericb.gendron@cegepmontpetit.ca​",
		extension: "5317",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["3S6", "5E5", "5G5"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 8,
		nom: "Hector Bustillo",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-214",
		courriel: "hector.bustillo@cegepmontpetit.ca",
		extension: "6478",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["3U4", "5C5", "5D5"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 9,
		nom: "Jamil Gammoudi",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-212",
		courriel: "​​jamil.gammoudi@cegepmontpetit.ca",
		extension: "2804",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["1N6", "943"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 10,
		nom: "​Jean-Michel Nadeau",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-211",
		courriel: "jean-michel.nadeau@cegepmontpetit.ca",
		extension: "6415",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["1B3", "503", "545"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 11,
		nom: "Joris Deguet",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "D-1612",
		courriel: "joris.deguet@cegepmontpetit.ca",
		extension: "6379",
		lienVideo: "https://youtu.be/R-YbYMqB_LI",	// laisser vide si pas de vidéo
		cours: ["3N5", "5A5"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 12,
		nom: "Kevin Leduc",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-213",
		courriel: "kevin.leduc@cegepmontpetit.ca​",
		extension: "2913",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["1B3", "905"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 13,
		nom: "Maude Sabourin",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-213",
		courriel: "maude.sabourin@cegepmontpetit.ca",
		extension: "2914",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["3N5", "905"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 14,
		nom: "Mounira Zoubeïdi",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-212",
		courriel: "mounira.zoubeidi@cegepmontpetit.ca",
		extension: "7271",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["1N6"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 15,
		nom: "Peter Mylchreest",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-214",
		courriel: "peter.mylchreest@cegepmontpetit.ca",
		extension: "6453",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["1D5", "3U4"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 16,
		nom: "Réjean Bilodeau ",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "D-1612",
		courriel: "rejean.bilodeau@cegepmontpetit.ca",
		extension: "6418",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["1B3", "5B5", "5F5"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 17,
		nom: "Saïd Cherkaoui",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-214",
		courriel: "said.cherkaoui@cegepmontpetit.ca",
		extension: "6492",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["1D5", "3U4", "973"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 18,
		nom: "Stéphane DesMeules",
		titre: "Enseignant",
		actif: true,
		image: "stephane_desmeules.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-212",
		courriel: "stephane.desmeules@cegepmontpetit.ca",
		extension: "5108",
		lienVideo: "https://youtu.be/CwFxbtJWoAc",	// laisser vide si pas de vidéo
		cours: ["1N6"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 19,
		nom: "Thierry Giroux Veilleux",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-211",
		courriel: "t.girouxveilleux@cegepmontpetit.ca",
		extension: "2969",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["3U4", "3W6", "545"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 20,
		nom: "Valérie Turgeon",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "D-1612",
		courriel: "valerie.turgeon@cegepmontpetit.ca",
		extension: "6409",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["3W6", "905"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 21,
		nom: "Vincent Carrier",
		titre: "Enseignant",
		actif: true,
		image: "vincent_carrier.png", // mettre la photo dans le sous-répertoire images
		bureau: "E-209",
		courriel: "vincent.carrier@cegepmontpetit.ca",
		extension: "2915",
		lienVideo: "https://youtu.be/agrYqQdKSNU",	// laisser vide si pas de vidéo
		cours: ["1S6", "3A5", "5E5"] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 22,
		nom: "Vincent Drolet",
		titre: "Enseignant",
		actif: false,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "",
		courriel: "vincent.drolet@cegepmontpetit.ca​",
		extension: "2762",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: [] // numéro des cours entre guillemets séparés par des virgules
	},
	{
		id: 23,
		nom: "Vincent Duval",
		titre: "Enseignant",
		actif: true,
		image: "personne.png", // mettre la photo dans le sous-répertoire images
		bureau: "D-1612",
		courriel: "vincent.duval@cegepmontpetit.ca",
		extension: "6451",
		lienVideo: "",	// laisser vide si pas de vidéo
		cours: ["1S6"] // numéro des cours entre guillemets séparés par des virgules
	}
];
