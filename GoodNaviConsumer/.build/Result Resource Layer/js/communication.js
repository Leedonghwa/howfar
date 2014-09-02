var tizen, distanceModule, bookmarkModule;

var communicationModule = (function(tizen, distanceModule, bookmarkModule) {
    var my = {};

    var _SAAgent = null;
    var _SASocket = null;
    var CHANNELID = 179;
    var PROVIDERAPPNAME = "GoodNaviProvider";

    /**
     * Analyze a packet 
     */
    function processPacket(packet) {
        var workType = packet.charAt(0);
        var packetLength = packet.length;
        var packetContent = packet.substr(1, packetLength - 1);

        console.log("processPacket: " + packetContent);
        // 가장 처음 설정되는 거리 데이터. 거리는 항상 미터단위로 한다. 
        if (workType == 'A') {
            var distanceInfo = JSON.parse(packetContent);
            var initDistance = parseInt(distanceInfo.initDistance);
            var normalDistance = parseInt(distanceInfo.normalDistance);

            distanceModule.setInitDistance(initDistance);
            distanceModule.setNormalDistance(normalDistance);
            distanceModule.displayTextDistance();
            distanceModule.displayBarDistance();
        }
        // 북마크 추가
        else if (workType == 'C') {
        	console.log("communicationModule : " + packetContent);
        	bookmarkModule.addBookmark(packetContent);
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

    function onreceive(channelId, data) {
        processPacket(data);
    }

    var agentCallback = {
        onconnect: function(socket) {
            _SASocket = socket;
            _SASocket.setDataReceiveListener(onreceive);
            _SASocket.setSocketStatusListener(function(reason) {
                console.log("Service connection lost, Reason : [" + reason + "]");
                my.disconnect();
            });
        },
        onerror: onerror
    };

    var peerAgentFindCallback = {
        onpeeragentfound: function(peerAgent) {
            try {
                if (peerAgent.appName == PROVIDERAPPNAME) {
                    _SAAgent.setServiceConnectionListener(agentCallback);
                    _SAAgent.requestServiceConnection(peerAgent);
                } else {
                    alert("Not expected app!! : " + peerAgent.appName);
                }
            } catch (err) {
                console.log("exception [" + err.name + "] msg[" + err.message + "]");
            }
        },
        onerror: onerror
    };

    function onsuccess(agents) {
        try {
            if (agents.length > 0) {
                _SAAgent = agents[0];

                _SAAgent.setPeerAgentFindListener(peerAgentFindCallback);
                _SAAgent.findPeerAgents(); // re-establish an Samsung Accessory Protocol(SAP) connection
            } else {
                alert("Not found SAAgent!!");
            }
        } catch (err) {
            console.log("exception [" + err.name + "] msg[" + err.message + "]");
        }
    }

    my.connect = function() {
        if (_SASocket) {
            alert('Already connected!');
            return false;
        }
        try {
            webapis.sa.requestSAAgent(onsuccess, onerror);
        } catch (err) {
            console.log("exception [" + err.name + "] msg[" + err.message + "]");
        }
    }

    my.disconnect = function() {
        try {
            if (_SASocket != null) {
                _SASocket.close();
                _SASocket = null;
            }
        } catch (err) {
            console.log("exception [" + err.name + "] msg[" + err.message + "]");
        }
    }

    my.fetch = function(data) {
        try {
            _SASocket.sendData(CHANNELID, data);
        } catch (err) {
            console.log("exception [" + err.name + "] msg[" + err.message + "]");
        }
    }

    return my;
}(tizen, distanceModule, bookmarkModule));

function createHTML(log_string) {
    var log = document.getElementById('resultBoard');
    log.innerHTML = log.innerHTML + "<p style='color:white;'> : " + log_string + "</p>";
}

// ???????
function extend() {
    document.getElementById("dist").style.width = "45%";
}