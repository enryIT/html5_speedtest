var speed;
var rawModule;
var module;
var net = new Network({
		latency: {
		        // How many measures should be returned.
		        measures: 5,
		        // How much attempts to get a valid value should be done for each measure.
		        attempts: 3
    		}
});

if (Network.supportsResourceTiming)
    $( "#log" ).append("Click start tests button to begin!");
else 
    $( "#log" ).append("Your browser doesn't support all of the tests, expect some weird results!");

/*    $('.btn-group').tooltip({
        effect: "slideDown",
        delay: 300,    
        fade: true,
    });*/

    /*
     * UI
     */

    var UI = {
	$btnStart: $('[data-measure]'),
        $btnAbort: $('[data-abort]'),

        start: function() {
		//reset test sizes on retest
		net.download.settings({
			data: {
        			// The amount of data to initially use.
				size: 10 * 1024 * 1024,} // 10 MB
			});
		net.upload.settings({
			data: {
            			// The amount of data to initially use.
				size: 2 * 1024 * 1024, }// 2 MB
			});
		
		ntmt_progressBar(0, $('#progressBarDown'));
		ntmt_progressBar(0, $('#progressBarUp'));	
		$( "#log" ).empty();
		$.getJSON('getip.php', function(data){
			$( "#log" ).append("<b>Your IP is: " + data.ip + "<br></b>");
		});
		startLatency();
						
		UI.$btnStart.prop('disabled', true);
                UI.$btnAbort.prop('disabled', false);
       	},

        restart: function(size,loaded) {
		$( "#log" ).append("It took less than 8 seconds to " + rawModule + " " + loaded/1024/1024 + "MB of data... Restarting with " + size/1024/1024 + "MB!<br>");
	},

        stop: function() {
        	UI.$btnStart.prop('disabled', false);
        	UI.$btnAbort.prop('disabled', true);
	},

        abort: function() {
            net.upload.abort();
            net.download.abort();
        },
		
	value: function(value, unit) {
        	if (value <= 50) {
                	return '<span class="green">' + value.toFixed(3) + ' ' + unit + '</span>';
        	} else if (value <= 200) {
			return '<span class="orange">' + value.toFixed(3) + ' ' + unit + '</span>';
		} else if (value <= 10000 ) {
			return '<span class="red">' + value.toFixed(3) + ' ' + unit + '</span>';
		} else {
                	return '<span class="red">NaN</span>';
            	}
        },
    };

function startLatency(){
	//$( "#log" ).append("Starting latency...<br>");
	rawModule = "latency";
	module = rawModule.charAt(0).toUpperCase() + rawModule.slice(1);
	// The latency module doesn't have a start event, we must trigger it manually.
	net[rawModule].start();
	net[rawModule].trigger('start');	
}	
function startDownload(){
	//$( "#log" ).append("Starting download...<br>");
	rawModule = "download";
	module = rawModule.charAt(0).toUpperCase() + rawModule.slice(1);
	net[rawModule].start();
}
function startUpload(){
	//$( "#log" ).append("Starting upload...<br>");
	rawModule = "upload";
	module = rawModule.charAt(0).toUpperCase() + rawModule.slice(1);
	net[rawModule].start();
}
function start(size){
	if( rawModule != "latency" )
		$( "#log" ).append("Starting " + rawModule + " measures " + "with " + (size / 1024 / 1024) + "MB" + " of data" + "...<br>");
}
function progress(avg, instant, loaded, size) {
	size = (size/1024/1024/2).toFixed(2);
	loaded = (loaded/1024/1024).toFixed(2);
	if( rawModule == "download"){
		ntmt_progressBar(loaded*100/size, $('#progressBarDown'));
		ntmtTesterDialDown.drawDial(avg/1024*8);
	} else {
		ntmt_progressBar(loaded*100/size, $('#progressBarUp'));
		ntmtTesterDialUp.drawDial(avg/1024*8);
	}
}
function end(avg) {
	if( rawModule == "download" ){
		ntmt_progressBar(100, $('#progressBarDown'));
		var downloadResult = (avg / 1024 / 1024 * 8);
		$( "#log" ).append("<b>Finished download, average: " + downloadResult.toFixed(2) + "Mbps<br></b>");
		setTimeout("startUpload()", 2000);
	} else {
		ntmt_progressBar(100, $('#progressBarUp'));
		var uploadResult = (avg / 1024 / 1024 * 8);
		$( "#log" ).append("<b>Finished upload, average: " + uploadResult.toFixed(2) + "Mbps<br></b>");
		$( "#start" ).empty().append("  Restart test");
		UI.stop();
	}
}
    net.upload.on('start', start).on('progress', progress).on('restart', UI.restart).on('end', end);
    net.download.on('start', start).on('progress', progress).on('restart', UI.restart).on('end', end);
    net.latency
        .on('start', start)
        .on('end', function(avg, all) {
            all = all.map(function(latency) {
		return UI.value(latency, 'ms');
            });

            all = '[ ' + all.join(' , ') + ' ]';
	
	    ntmtTesterDialPing.drawDial(avg);					
	    $( "#log" ).append("Latency: " + all + "<br>");
            $( "#log" ).append("<b>Average latency: " + avg.toFixed(2) + "ms <br></b>");
	    setTimeout("startDownload()", 2000);
   });

    /*
     * Bindings
     */

    UI.$btnStart.on('click', UI.start);
    UI.$btnAbort.on('click', UI.abort);
	
	
	
