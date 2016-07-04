// return DOM element given the parameters
var create = function (tagName, attributes, text) {
	var element = document.createElement(tagName),
		key;
	for(key in attributes) {
		element.setAttribute(key, attributes[key]);
	}
	if(text) element.innerHTML = text;
	return element;
}
// append children given an array
Element.prototype.appendChildren = function(a) { a.forEach(e => {this.appendChild(e)}) };
// get video id
var getVideoId = function(url) {
	var id = "";

	if(url.match(/youtu.be/)) {
		id = url.replace(/.*youtu.be\//, "")
			.replace(/\?.*/, "")
			.replace(/^-*/, "")
			.replace(/\//g, "");
	} else if(url.match(/youtube.com/)) {
		url = url.replace(/.*\?/, "")
			.replace(/\//g, "")
			.split(/&/);
		url.forEach(e => { if(e.match(/^v=/)) id = e.replace(/^v=-*/, "")});
	}

	return id;
}
// send xmlhttp request
var sendRequest = function (url, callback) {
	var xhttp = new XMLHttpRequest();
	// handles state change
	xhttp.onreadystatechange = function() {
		if(xhttp.readyState == 4) callback(shorten(xhttp.response));
	};
	xhttp.responseType = "json";
	// timeout in case of bad connection
	xhttp.timeout = 4000;
	xhttp.open('GET', url, true);
	xhttp.send();
}
// shorten response, return subreddits
var shorten = function(response) {
	switch(typeof response) {
		case "object":
			return response.data.children.map(e => ({
				created_utc: e.data.created_utc,
				permalink: e.data.permalink,
				subreddit: e.data.subreddit,
				upvotes: e.data.score
			})).filter((e,i,a) => duplicate(e,i,a,"subreddit"))
			.filter((e,i) => noUpvotes(e,i));
		default:
			return null;
	}
	function duplicate(element, index, array, key) {
		var i;
		// ignore first element
		if(index) {
			for(i = 0; i < array.length; i++) {
				if(array[i][key] === element[key] && i < index) {
					return false;
				}
			}
		}
		return true;
	}
	function noUpvotes(element, index) {
		if(index && element.upvotes < 300 && element.created_utc + 7200 < Date.now() / 1000) {
			return false;
		}
		return true;
	}
}