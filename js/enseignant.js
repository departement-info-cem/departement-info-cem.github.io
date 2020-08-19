var prof = getProf(id);

$('.profile-picture').css('backgroundImage', 'url(./images/' + prof.image + ')');
$('.nom-prof').html(prof.nom);
$('.titre-prof').html(prof.titre);
$('.bureau-prof').html(prof.bureau);
$('.courriel-prof').html(prof.courriel);
$('.courriel-prof').attr('href', 'mailto:' + prof.courriel);
$('.telephone-prof').html('(450)679-2631 ext.: ' + prof.extension);
if(prof.lienVideo.length > 0) {
	$('.video-prof').attr('href', 'https://youtu.be/' + prof.lienVideo);
	$('.video-prof-container').removeClass('d-none');
}

$.each(prof.cours, function(idx, no) {
	var cours = getCours(no);
	$('.cours-prof').append(
		$("<div/>", {"class": "col mb-4", "data-code": no}).append(
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
		).on('click', function(){
			window.location.href = "cours.html?code=" + $(this).attr('data-code');
		})
	);
});
