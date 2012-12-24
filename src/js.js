var init = function() {
	// Check for the various File API support.
	if (window.File && window.FileReader && window.FileList && window.Blob) {
		// Great success! All the File APIs are supported.
	} else {
		alert('The File APIs are not fully supported in this browser.');
	}

};

var handleFileSelect = function(evt) {

	evt.stopPropagation();
	evt.preventDefault();

	var files = evt.dataTransfer.files; // FileList object.

	// files is a FileList of File objects. List some properties.
	var output = [];
	var reader = new FileReader();

	for ( var i = 0, file; file = files[i]; i++) {
		output.push('<li><strong>', escape(file.name), '</strong> (', file.type
				|| 'n/a', ') - ', file.size, ' bytes, last modified: ',
				file.lastModifiedDate ? file.lastModifiedDate
						.toLocaleDateString() : 'n/a', '</li>');

		// Read file into memory as UTF-16      
		reader.readAsText(file, "Windows-1255");

		// Handle progress, success, and errors
		reader.onprogress = updateProgress;
		reader.onload = loaded;
		reader.onerror = errorHandler;
	}
	document.getElementById('list').innerHTML = '<ul>' + output.join('')
			+ '</ul>';

};

var updateProgress = function(evt) {
	if (evt.lengthComputable) {
		// evt.loaded and evt.total are ProgressEvent properties
		var loaded = (evt.loaded / evt.total);
		if (loaded < 1) {
			// Increase the prog bar length
			// style.width = (loaded * 200) + "px";
		}
	}
};

var loaded = function(evt) {
	// Obtain the read file data    
	var fileString = evt.target.result;
	// Handle UTF-16 file dump
	//	if (utils.regexp.isChinese(fileString)) {
	//		//Chinese Characters + Name validation
	//	} else {
	//		// run other charset test
	//	}

	//document.getElementById('temp').innerHTML = fileString;
	var array = CSVToArray(fileString, "\t");

	for ( var i = 0; i < array.length; i++) {
		var item = "<li>"+array[i][0] + " , " + array[i][1] + "," + array[i][2] + "</li>";
		$('#temp').append(item);
	}
};

var errorHandler = function(evt) {
	if (evt.target.error.name == "NotReadableError") {
		// The file could not be read
	}
};

var handleDragOver = function(evt) {
	evt.stopPropagation();
	evt.preventDefault();
	evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
};

window.onload = function() {
	init();
	// Setup the dnd listeners.
	var dropZone = document.getElementById('drop_zone');
	dropZone.addEventListener('dragover', handleDragOver, false);
	dropZone.addEventListener('drop', handleFileSelect, false);
};
//This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
var CSVToArray = function ( strData, strDelimiter ){
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");

	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
		(
			// Delimiters.
			"(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

			// Quoted fields.
			"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

			// Standard fields.
			"([^\"\\" + strDelimiter + "\\r\\n]*))"
		),
		"gi"
		);


	// Create an array to hold our data. Give the array
	// a default empty first row.
	var arrData = [[]];

	// Create an array to hold our individual pattern
	// matching groups.
	var arrMatches = null;


	// Keep looping over the regular expression matches
	// until we can no longer find a match.
	while (arrMatches = objPattern.exec( strData )){

		// Get the delimiter that was found.
		var strMatchedDelimiter = arrMatches[ 1 ];

		// Check to see if the given delimiter has a length
		// (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know
		// that this delimiter is a row delimiter.
		if (
			strMatchedDelimiter.length &&
			(strMatchedDelimiter != strDelimiter)
			){

			// Since we have reached a new row of data,
			// add an empty row to our data array.
			arrData.push( [] );

		}


		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[ 2 ]){

			// We found a quoted value. When we capture
			// this value, unescape any double quotes.
			var strMatchedValue = arrMatches[ 2 ].replace(
				new RegExp( "\"\"", "g" ),
				"\""
				);

		} else {

			// We found a non-quoted value.
			var strMatchedValue = arrMatches[ 3 ];

		}


		// Now that we have our value string, let's add
		// it to the data array.
		arrData[ arrData.length - 1 ].push( strMatchedValue );
	}

	// Return the parsed data.
	return( arrData );
}
