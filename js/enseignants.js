$.each(profs, function(idx, prof) {
	$('.profs').append(
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
