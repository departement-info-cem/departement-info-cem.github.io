function melanger(tab)
{
    var tempo, idx1, idx2;
 
    for(var i = 0; i < tab.length * 4; i++)
    {
        idx1 = Math.floor(tab.length * Math.random());
        idx2 = Math.floor(tab.length * Math.random());
        
        tempo = tab[idx1];
        tab[idx1] = tab[idx2];
        tab[idx2] = tempo;
    }
}

var vids = [];

$.each(profs, function(idx, prof) {
	if(prof.lienVideo.length > 0)
		vids.push(prof);
});

melanger(vids);


$.each(vids, function(idx, vid) {
	if(idx > 4)
		return false;
	
	$('.videos-cont').append(
		$("<div/>", {"class": "col-12 col-lg px-2"}).append(
			$("<div/>", {"class": "embed-responsive embed-responsive-16by9"}).append(
				$("<iframe/>", {"class": "embed-responsive-item", "src": "https://www.youtube.com/embed/" + vid.lienVideo + "?rel=0", "allowfullscreen": ""})
			)
		)		
	);		
	
	$('.noms-cont').append(
		$("<div/>", {"class": "col-12 col-lg h5 mt-2 mb-0 text-center text-success"}).html(vid.nom)
	);						
});


