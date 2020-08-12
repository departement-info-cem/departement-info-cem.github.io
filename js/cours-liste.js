$.each(cours, function(idx, co) {
	$('.cours').append(
		$("<div/>", {"class": "col mb-4", "data-code": co.code}).append(
			$("<div/>", {"class": "card h-100"}).append(
				$("<div/>", {"class": "card-body"}).append(
					$("<h4/>", {"class": "card-title text-center", text: '420-'+co.code}),
					$("<div/>", {"class": "cours-icones text-center mb-2"}).append(
						$("<span/>").append(
							$("<i/>", {"class": co.icones[0]}),
							co.icones.length > 1 ? $("<i/>", {"class": 'ml-4 ' + co.icones[1]}) : null
						)
					),
					$("<p/>", {"class": "card-text font-weight-bold text-center", text: co.nom})
				)
			)
		).on('click', function(){
			window.location.href = "cours.html?code=" + $(this).attr('data-code');
		})
	);
});