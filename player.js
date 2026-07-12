// כתובת השידור

const STREAM_URL =
"https://contact.gostreaming.tv/Con-9/tracks-v3a1/mono.ts.m3u8";


// קובץ השקט

const SILENCE="silence.mp3";


// זמן בין בדיקות

const RETRY_TIME=10000;


// -----------------------------

const player=document.getElementById("player");

let hls=null;

let playingSilence=false;

let reconnectTimer=null;


// -----------------------------

function stopHls(){

    if(hls){

        hls.destroy();

        hls=null;

    }

}


// -----------------------------

function playSilence(){

    if(playingSilence)
        return;

    stopHls();

    playingSilence=true;

    player.pause();

    player.src=SILENCE;

    player.loop=true;

    player.play().catch(()=>{});

}


// -----------------------------

function tryReconnect(){

    clearTimeout(reconnectTimer);

    reconnectTimer=setTimeout(function(){

        connectLive();

    },RETRY_TIME);

}


// -----------------------------

function connectLive(){

    stopHls();

    player.pause();

    player.removeAttribute("src");

    player.load();

    if(Hls.isSupported()){

        hls=new Hls({

            lowLatencyMode:true,

            liveSyncDurationCount:3

        });

        hls.loadSource(STREAM_URL);

        hls.attachMedia(player);

        hls.on(Hls.Events.MANIFEST_PARSED,function(){

            playingSilence=false;

            player.loop=false;

            player.play().catch(()=>{});

        });

        hls.on(Hls.Events.ERROR,function(event,data){

            if(data.fatal){

                playSilence();

                tryReconnect();

            }

        });

    }

    else if(player.canPlayType("application/vnd.apple.mpegurl")){

        player.src=STREAM_URL;

        player.play().catch(function(){

            playSilence();

            tryReconnect();

        });

    }

    else{

        playSilence();

        tryReconnect();

    }

}


// -----------------------------

connectLive();
