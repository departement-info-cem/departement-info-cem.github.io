function getCours(code) {
	var c = null;
	
	$.each(cours, function(idx, co) {
		if(co.code == code) {
			c = co;
			return false;
		}
	});
	return c;
}

var cours = [
		{
			code: "1B3",
			nom: "Bureautique",
			ponderation: {
				t: 1,
				p: 2,
				e: 2
			},
			type: "Tronc commun",
			presence: false,
			icones: ["fa fa-file-word", "fa fa-file-excel"]
		},
		{
			code: "1D5",
			nom: "Introduction aux bases de données",
			ponderation: {
				t: 2,
				p: 3,
				e: 2
			},
			type: "Tronc commun",
			presence: false,
			icones: ["fas fa-database"]
		},
		{
			code: "1N6",
			nom: "Programmation 1",
			ponderation: {
				t: 2,
				p: 4,
				e: 3
			},
			type: "Tronc commun",
			presence: true,
			icones: ["fas fa-code", "fas fa-hashtag"]
		},
		{
			code: "1S6",
			nom: "Systèmes d'exploitation",
			ponderation: {
				t: 2,
				p: 4,
				e: 2
			},
			type: "Tronc commun",
			presence: true,
			icones: ["fab fa-linux", "fab fa-windows"]
		},
		
		
		
		{
			code: "3U4",
			nom: "Introduction à la cybersécurité",
			ponderation: {
				t: 1,
				p: 3,
				e: 2
			},
			type: "Tronc commun",
			presence: false,
			icones: ["fas fa-shield-alt"]
		},
		{
			code: "3A5",
			nom: "Automatisation de tâches",
			ponderation: {
				t: 2,
				p: 3,
				e: 2
			},
			type: "Réseautique",
			presence: false,
			icones: ["fas fa-robot", "fas fa-cogs"]
		},
		{
			code: "3R5",
			nom: "Commutation et routage",
			ponderation: {
				t: 2,
				p: 3,
				e: 2
			},
			type: "Réseautique",
			presence: false,
			icones: ["fas fa-network-wired", "fas fa-exchange-alt"]
		},
		{
			code: "3S6",
			nom: "Serveurs 2 : Services Internet",
			ponderation: {
				t: 2,
				p: 4,
				e: 3
			},
			type: "Réseautique",
			presence: false,
			icones: ["fas fa-at", "fas fa-database"]
		},
		{
			code: "3N5",
			nom: "Programmation 3",
			ponderation: {
				t: 2,
				p: 3,
				e: 3
			},
			type: "Programmation",
			presence: false,
			icones: ["fab fa-java", "fab fa-android"]
		},
		{
			code: "3W6",
			nom: "Programmation Web transactionnelle",
			ponderation: {
				t: 2,
				p: 4,
				e: 3
			},
			type: "Programmation",
			presence: false,
			icones: ["fas fa-file-code", "fas fa-database"]
		},
		
		
		
		{
			code: "503",
			nom: "Échanges inter-applications",
			ponderation: {
				t: 1,
				p: 2,
				e: 3
			},
			type: "Programmation",
			presence: false,
			icones: ["fas fa-file-code", "fab fa-angular"]
		},
		{
			code: "545",
			nom: "Programmation Web serveur 2",
			ponderation: {
				t: 2,
				p: 3,
				e: 3
			},
			type: "Programmation",
			presence: false,
			icones: ["fas fa-file-code", "fas fa-database"]
		},
		{
			code: "5A5",
			nom: "Technologies mobiles",
			ponderation: {
				t: 2,
				p: 3,
				e: 3
			},
			type: "Programmation",
			presence: false,
			icones: ["fab fa-android", "fas fa-globe-americas"]
		},
		{
			code: "5B5",
			nom: "Réseautique",
			ponderation: {
				t: 2,
				p: 3,
				e: 2
			},
			type: "Programmation",
			presence: false,
			icones: ["fas fa-network-wired", "fas fa-at"]
		},
		{
			code: "5C5",
			nom: "Surveillance et sécurité 2",
			ponderation: {
				t: 2,
				p: 3,
				e: 2
			},
			type: "Réseautique",
			presence: false,
			icones: ["fas fa-shield-alt", "far fa-eye"]
		},
		{
			code: "5D5",
			nom: "Réseaux 4: implantation et approf.",
			ponderation: {
				t: 2,
				p: 3,
				e: 2
			},
			type: "Réseautique",
			presence: false,
			icones: ["fas fa-wifi", "fas fa-globe-americas"]
		},
		{
			code: "5E5",
			nom: "Nouvelle technologies en réseautique",
			ponderation: {
				t: 2,
				p: 3,
				e: 2
			},
			type: "Réseautique",
			presence: false,
			icones: ["fab fa-searchengin", "far fa-lightbulb"]
		},
		{
			code: "5F5",
			nom: "Serveurs 3: Services de messageries",
			ponderation: {
				t: 1,
				p: 4,
				e: 2
			},
			type: "Réseautique",
			presence: false,
			icones: ["fas fa-mail-bulk", "fas fa-phone"]
		},
		{
			code: "5G5",
			nom: "Système d'exploitation 2",
			ponderation: {
				t: 2,
				p: 3,
				e: 2
			},
			type: "Réseautique",
			presence: false,
			icones: ["fab fa-linux"]
		},
		
		
		{
			code: "Z03",
			nom: "Introduction à la programmation WEB",
			ponderation: {
				t: 1,
				p: 2,
				e: 3
			},
			type: "Complémentaire",
			presence: false,
			icones: ["fas fa-file-code", "fab fa-js"]
		},
		
		
		{
			code: "905",
			nom: "Introduction à la programmation",
			ponderation: {
				t: 1,
				p: 4,
				e: 2
			},
			type: "Service",
			presence: false,
			icones: ["fas fa-file-code", "fab fa-js"]
		},
		{
			code: "943",
			nom: "Assurance Qualité",
			ponderation: {
				t: 1,
				p: 2,
				e: 2
			},
			type: "Service",
			presence: false,
			icones: ["fas fa-user-check", "fas fa-clipboard-check"]
		},
		{
			code: "973",
			nom: "Tableur en gestion administrative",
			ponderation: {
				t: 1,
				p: 2,
				e: 2
			},
			type: "Service",
			presence: false,
			icones: ["fas fa-table", "fas fa-tasks"]
		}
	];
