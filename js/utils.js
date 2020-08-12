function getQueryString() {
	if(window.location.href.indexOf('?') == -1) return {};
	
	var qs = {},
		url = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');  
		
	for (var i = 0; i < url.length; i++) {  
		var urlparam = url[i].split('=');  
		qs[urlparam[0]] = urlparam[1];
	}

	return qs;
}