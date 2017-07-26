function bytesToSize(bytes, precision)
{
    var kilobyte = 1024;
    var megabyte = kilobyte * 1024;
    var gigabyte = megabyte * 1024;
    var terabyte = gigabyte * 1024;

    if ((bytes >= 0) && (bytes < kilobyte)) {
        return bytes + ' B';

    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
        return (bytes / kilobyte).toFixed(precision) + ' KB';

    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
        return (bytes / megabyte).toFixed(precision) + ' MB';

    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
        return (bytes / gigabyte).toFixed(precision) + ' GB';

    } else if (bytes >= terabyte) {
        return (bytes / terabyte).toFixed(precision) + ' TB';

    } else {
        return bytes + ' B';
    }
}

Number.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
	if (isNaN(sec_num) || sec_num === null) {
		time = '-';
		return time;
	} else {
	    var hours   = Math.floor(sec_num / 3600);
	    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
	    var seconds = sec_num - (hours * 3600) - (minutes * 60);

	    if (hours   < 10) {hours   = "0"+hours;}
	    if (minutes < 10) {minutes = "0"+minutes;}
	    if (seconds < 10) {seconds = "0"+seconds;}
	    time = hours+'h'+minutes+'m'+seconds+'s';
		time = time.replace(/00[\w]{1}/g, '');
		if (isNaN(hours) && isNaN(minutes) && isNaN(seconds)){
			time = '∞';
		}
    return time;
	}
}

function capitaliseFirstLetter(string)
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}

Object.defineProperty(Array.prototype, "prepend", {
	enumerable: false,
	configurable: false,
	writable: false,
	value: function(e) {
		if (e != '') {
			this.unshift(e);
		}
		return this;
	}
});


function updateConfig(obj) {
	var endAddr;
	if (obj.rpcuser) {
		endAddr = obj.rpcpath.replace(/(\:\/\/)/g, '$1' + obj.rpcuser + ':' + obj.rpctoken + '@');
		window.rpct = '';
	} else {
		endAddr = obj.rpcpath;
		if (obj.rpctoken) {
			window.rpct = 'token:' + obj.rpctoken;
		} else {
			window.rpct = '';
		}
	}
	$.jsonRPC.setup({
	  endPoint: endAddr,
	  namespace: 'aria2'
	});
}

function aria2CMD(c,i) {
	chrome.storage.local.get(null, function(obj){
		updateConfig(obj);

		$.jsonRPC.request(c, {
			params: [i].prepend(rpct)
		})
	});
}

// add new task manually
function addurisubmit() {
	var toadduri = (e_taskaddbox.value == '' ? e_taskaddbatch.value.split('\n') : e_taskaddbox.value.split('\n'));
	for (var i=0, urilen = toadduri.length; i<urilen; i++) {
		var uri_i = toadduri[i];
		aria2CMD('addUri', [uri_i]);
	}
	e_addtaskctn.style.display= 'none';
	e_addbtn.value = 'Add';
}

function addmoretoggle() {
	if (e_addmore.value == '>>') {
		e_taskaddbox.style.display = 'none';
		e_taskaddbatch.style.display = 'inline-block';
		e_addmore.value = '<<';
	} else {
		e_taskaddbox.style.display = 'inline-block';
		e_taskaddbatch.style.display = 'none';
		e_addmore.value = '>>';
	}
}

function addtasktoggle() {
	e_addtaskctn.style.display = (e_addtaskctn.style.display != 'none' ? 'none' : '' );
	e_addbtn.value = (e_addbtn.value == 'Add' ? 'Cancel' : 'Add' );
	e_taskaddbox.style.display = 'inline-block';
	e_taskaddbatch.style.display = 'none';
	e_addmore.value = '>>';
}

//event binding
var e_purgebtn = document.getElementById('purgebtn'),e_downloadbtn = document.getElementById('webui') , e_addbtn = document.getElementById('addbtn'), e_addtask = document.getElementById("addtask"),
	e_addmore = document.getElementById('addmore'),
	e_addtaskctn = document.getElementById("addtaskcontainer"), e_taskaddbox = document.getElementById("taskaddbox"), e_taskaddbatch = document.getElementById("taskaddbatch"),
	e_tasklist = document.getElementById('tasklist'), 
	buttonsTpl = document.getElementById('buttonsTpl').innerHTML;
	buttons = document.getElementById('buttons');
	headInfotpl = document.getElementById('headInfo').innerHTML, taskInfotpl = document.getElementById('taskInfo').innerHTML, 
	e_globalstat = document.getElementById('globalstat');
//e_downloadbtn.addEventListener("click", function(){window.open("/webui-aria2/index.html");}, false);
e_purgebtn.addEventListener("click", function(){aria2CMD('purgeDownloadResult','')}, false);
e_addbtn.addEventListener("click", function(){addtasktoggle();}, false);
e_addmore.addEventListener("click", function(){addmoretoggle();}, false);
e_addtask.addEventListener("submit", function(e){
	addurisubmit();
	e.preventDefault();
}, false);

$(e_tasklist).on("click", "button.removebtn", function(){
	var taskStatus = $(this).attr('class').split(' ')[0], taskId = $(this).attr('id').split('_').pop(), meth;
	switch(taskStatus)
	{
		case 'active':
		case 'waiting':
		case 'paused':
			meth = 'forceRemove';
			break;
		case 'error':
		case 'complete':
		case 'removed':
			meth = 'removeDownloadResult';
			break;
	}
	aria2CMD(meth, taskId);
});

$(e_tasklist).on("click", "div.progbar", function(){
	var taskStatus = $(this).attr('class').split(' ')[0], taskId = $(this).attr('id').split('_').pop(), meth;
	switch(taskStatus)
	{
		case 'active':
		case 'waiting':
			meth = 'pause';
			break;
		case 'error':
		case 'complete':
		case 'removed':
			meth = 'removeDownloadResult';
			break;
		case 'paused':
			meth = 'unpause';
			break;
	}
	aria2CMD(meth, taskId);
});


Mustache.parse(buttonsTpl);
Mustache.parse(headInfotpl);
Mustache.parse(taskInfotpl);

function getPathInfo(path) {
    //  create a link in the DOM and set its href
    var link = document.createElement('a');
    link.setAttribute('href', path);

    //  return an easy-to-use object that breaks apart the path
    return {
        host:     link.hostname,  //  'example.com'
        port:     link.port,      //  12345
        path:     link.pathname,  //  '/blog/foo/bar'
        protocol: link.protocol   //  'http:'
    }
}


function writeUI() {
	chrome.storage.local.get(null, function(obj){
		updateConfig(obj);
		$.jsonRPC.request('getGlobalStat', {
			params: [rpct],
			error: function(data) {
					e_tasklist.innerHTML = 'Error: ' + data.error;
		    		var uirefrsh = setTimeout(writeUI, 1000);
	    	},
			success: function(result) {
				// headline part
				var res = result.result, tplpart = new Object();
				if (res.downloadSpeed == 0) {
					tplpart.globspeed = '';
				} else {
					tplpart.globspeed = 'D: ' + bytesToSize(res.downloadSpeed, 2) + '/s';
				}
				if (res.uploadSpeed > 0) {
				    tplpart.globspeed += ' U: ' + bytesToSize(res.uploadSpeed, 2) + '/s';
				}
				
				var headInfohtml = Mustache.render(headInfotpl, res, tplpart);
				e_globalstat.innerHTML = headInfohtml;

				var uri = getPathInfo(obj.rpcpath);
				var buttonsPart = {
					webui_uri: uri.protocol + '//' + uri.host + '/webui-aria2/index.html'
				};
				buttons.innerHTML = Mustache.render(buttonsTpl, buttonsPart)
				
				var rquestParams = ["status","gid","completedLength","totalLength","files","connections","dir","downloadSpeed","bittorrent","uploadSpeed","numSeeders"];
				$.jsonRPC.batchRequest([
					{
				      method: 'tellActive',
				      params: [rquestParams].prepend(rpct)
				    },
				    {
				      method: 'tellWaiting',
				      params: [0,parseInt(res.numWaiting),rquestParams].prepend(rpct)
				    },
				    {
				      method: 'tellStopped',
				      params: [0,parseInt(res.numStopped),rquestParams].prepend(rpct)
				    }
				], {
				    success: function(result) {
						var activeRes = result[0].result, waitRes = result[1].result, stopRes = result[2].result;
			            if (activeRes.length + waitRes.length + stopRes.length === 0 && !$(document).find('.tasktitle').length) {
			            	e_tasklist.innerHTML = 'Empty task list';
			            	//clearInterval(uirefrsh);
			            } else {
							printTask(result);
			        	}
			        	var uirefrsh = setTimeout(writeUI, 1000);
			    	},
			    	error: function(data) {
			    		e_tasklist.innerHTML = 'Error: ' + data.error;
			    		var uirefrsh = setTimeout(writeUI, 1000);
			    	}
		  		});
			}
		})
	})
}

function printTask(res) {
	var taskInfohtml = '', reslen = res.length;
	for (var i = 0; i < reslen; i++) {
		var r = res[i].result, rlen = r.length, files, taskid, tplpart = new Object(), etasec;
		for (var j = 0; j < rlen; j++) {
			files = r[j].files; 
			taskid = r[j].gid;
			if (r[j].bittorrent && r[j].bittorrent.info && r[j].bittorrent.info.name) {
				tplpart.displayName = r[j].bittorrent.info.name;  /*display name */
			} else {
				tplpart.displayName = files[0].path.split("/").pop()
			}
			if (r[j].bittorrent) {
				tplpart.upspeedPrec = ' (up:' + bytesToSize(r[j].uploadSpeed, 2) + '/s)';
				tplpart.numSeedersf = '/' + r[j].numSeeders.toString() + ' seeds';
			} else {
				tplpart.upspeedPrec = '';
				tplpart.numSeedersf = '';
			}
			tplpart.dlspeedPrec = bytesToSize(r[j].downloadSpeed, 2);
			tplpart.tlengthPrec = bytesToSize(r[j].totalLength, 2);
			tplpart.clengthPrec = bytesToSize(r[j].completedLength, 2);
			tplpart.completeRatio = parseFloat(r[j].completedLength/r[j].totalLength*100,2).toFixed(2).toString();
			etasec = (r[j].totalLength - r[j].completedLength)/r[j].downloadSpeed;
			tplpart.eta = etasec.toHHMMSS();
			tplpart.statusUpper = capitaliseFirstLetter(r[j].status);
			if (isNaN(r[j].completedLength) || r[j].completedLength == 0) {
				tplpart.p = '0%';
			} else {
				tplpart.p = parseFloat(r[j].completedLength/r[j].totalLength*100,2).toFixed(2).toString() + '%';
			}
			taskInfohtml += Mustache.render(taskInfotpl, r[j], tplpart);
		}
	}
	e_tasklist.innerHTML = taskInfohtml;// write to html
}

e_tasklist.innerHTML = 'Loading...';
writeUI();
