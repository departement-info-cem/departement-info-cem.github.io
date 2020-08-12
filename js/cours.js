var cours = getCours(code),
	cs = $('.icone-cours.ic1').width(),
	fontSize = parseInt(cs*65/100);
	
$('.icone-cours.ic1 i').addClass(cours.icones[0]).css('fontSize', fontSize + 'px');

if(cours.icones.length > 1) {
	$('.icone-cours.ic2 i').addClass(cours.icones[1]).css('fontSize', fontSize + 'px');
}
else {
	$('.icone-cours.ic1').addClass('seule');
	$('.icone-cours.ic2').addClass('d-none');
}

$('.code-cours').html('420-'+cours.code);
$('.nom-cours').html(cours.nom);
if(cours.type != 'Complémentaire' && cours.type != 'Service') {
	$('.type-cours').html('('+cours.type+')');
}
else {
	$('.type-cours').addClass('d-none');
}
$('.type-cours').html(cours.type);
$('.pond-theorie').html('Théorie: ' + cours.ponderation.t +' heure' + (cours.ponderation.t > 1 ? 's' : '') + ' par semaine');
$('.pond-pratique').html('Laboratoire: ' + cours.ponderation.p +' heure' + (cours.ponderation.p > 1 ? 's' : '') + ' par semaine');
$('.pond-maison').html('Travail à la maison: ' + cours.ponderation.e +' heure' + (cours.ponderation.e > 1 ? 's' : '') + ' par semaine');
if(cours.presence)
	$('.presentiel').removeClass('d-none');

$.each(profs, function(idx, prof) {
	if(prof.cours.indexOf(code) > -1)
		$('.cours-profs').append(
			$("<div/>", {"class": "col mb-4" + (prof.actif ? '' : ' inactif'), "data-id": prof.id}).append(
				$("<div/>", {"class": "card h-100"}).append(
					$("<div/>", {"class": "card-body"}).append(
						$("<h4/>", {"class": "card-title text-center", text: prof.nom}),
						$("<div/>", {"class": "profile-picture text-center mb-2 rounded-circle w-50 pt-50 mx-25"}).css('backgroundImage', 'url(./images/' + prof.image + ')'),
						$("<p/>", {"class": "card-text font-weight-bold text-center", text: prof.titre})
					)
				)
			).on('click', function(){
				if(!$(this).hasClass('inactif'))
					window.location.href = "enseignant.html?id=" + $(this).attr('data-id');
			})
		);
});
/*
$('.courriel-prof').html(prof.courriel);
$('.courriel-prof').attr('href', 'mailto:' + prof.courriel);
$('.telephone-prof').html('(450)679-2631 ext.: ' + prof.extension);
if(prof.lienVideo.length > 0) {
	$('.video-prof').attr('href', prof.lienVideo);
	$('.video-prof-container').removeClass('d-none');
}

$.each(prof.cours, function(idx, no) {
	var cours = getCours(no);
	$('.cours-prof').append(
		$("<div/>", {"class": "col mb-4"}).append(
			$("<div/>", {"class": "card h-100"}).append(
				$("<div/>", {"class": "card-body"}).append(
					$("<h5/>", {"class": "card-title text-center", text: "420-" + no}),
					$("<div/>", {"class": "cours-icones text-center mb-2"}).append(
						$("<span/>").append(
							$( "<i/>", {"class": cours.icones[0]}),
							cours.icones.length > 1 ? $( "<i/>", {"class": 'ml-4 ' + cours.icones[1]}) : null
						)
					),
					$("<p/>", {"class": "card-text font-weight-bold text-center", text: cours.nom})
				)
			)
		)
	);
});
*/