var SAAgent = null;
var SASocket = null;
var CHANNELID = 179;
var ProviderAppName = "GoodNaviProvider";

function createHTML(log_string)
{
	var log = document.getElementById('resultBoard');
	log.innerHTML = log.innerHTML + "<p style='color:white;'> : " + log_string + "</p>";
}

// 패킷을 분석해 어떤 타입의 데이터인지 판단하고 이를 바탕으로 해당하는 작업을 수행한다.
function processPacket(packet)
{	
	var workType = packet.charAt(0);
	var packetLength = packet.length;
	var packetContent = packet.substr(1, packetLength-1);
	
	console.log("processPacket: " + packetContent);
	// 가장 처음 설정되는 거리 데이터. 거리는 항상 미터단위로 한다. 
	if (workType == 'A') {
		var distanceInfo = JSON.parse(packetContent);
		var initDistance = parseInt(distanceInfo.initDistance);
		var normalDistance = parseInt(distanceInfo.normalDistance);
		
		setDistance(normalDistance);
		setInitDistance(normalDistance);

		displayTextDistance();
		displayBarDistance();
	} 
	// 북마크 추가
	else if (workType == 'C') {
		addBookmark(packetContent);
	} 
	// host app 종료시 wearable app 종료
	else if (workType == 'D') {
		if (packetContent == 'END') {
			tizen.application.getCurrentApplication().exit();
		}
	}
}

function onerror(err) {
	console.log("err [" + err.name + "] msg[" + err.message + "]");
}

var agentCallback = {
	onconnect : function(socket) {
		SASocket = socket;
		// alert("HelloAccessory Connection established with RemotePeer");
		SASocket.setDataReceiveListener(onreceive);
		SASocket.setSocketStatusListener(function(reason) {
			console.log("Service connection lost, Reason : [" + reason + "]");
			disconnect();
		});
	},
	onerror : onerror
}

var peerAgentFindCallback = {
	onpeeragentfound : function(peerAgent) {
		try {
			if (peerAgent.appName == ProviderAppName) {
				SAAgent.setServiceConnectionListener(agentCallback);
				SAAgent.requestServiceConnection(peerAgent);
			} else {
				alert("Not expected app!! : " + peerAgent.appName);
			}
		} catch(err) {
			console.log("exception [" + err.name + "] msg[" + err.message + "]");
		}
	},
	onerror : onerror
}

function onsuccess(agents) {
	try {
		if (agents.length > 0) {
			SAAgent = agents[0];
			
			SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
			SAAgent.findPeerAgents(); // re-establish an Samsung Accessory Protocol(SAP) connection
		} else {
			alert("Not found SAAgent!!");
		}
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function connect() {
	if (SASocket) {
		alert('Already connected!');
        return false;
    }
	try {
		webapis.sa.requestSAAgent(onsuccess, onerror);
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function disconnect() {
	try {
		if (SASocket != null) {
			SASocket.close();
			SASocket = null;
		}
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function onreceive(channelId, data) {
	processPacket(data);
}

function fetch(data) {
	try {
		SASocket.sendData(CHANNELID, data);
	} catch(err) {
		console.log("exception [" + err.name + "] msg[" + err.message + "]");
	}
}

function extend() {
	document.getElementById("dist").style.width = "45%";
}