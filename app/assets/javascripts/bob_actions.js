var application = angular.module('Mute', []);
var talkingAbout = "nothing";
application.controller('BobController', function($scope, $http) {
        $scope.suggestions = [];
        $scope.examples = [];
        $scope.selector = -1;
        
        $scope.subjects = [
            {subject: "artist_top_songs", looks_like: "play the top songs of"},
            {subject: "artist_top_songs", looks_like: "most popular songs of"},
            {subject: "artist_top_songs", looks_like: "songs of"},

            {subject: "nowdays_top_songs", looks_like: "top music"},
            {subject: "nowdays_top_songs", looks_like: "Top songs of today"},

            {subject: "mood", looks_like: "I'm feeling"},
            {subject: "mood", looks_like: "I am"},

            {subject: "based_on", looks_like: "play something of"},
            {subject: "based_on", looks_like: "match"},
            {subject: "based_on", looks_like: "something like"},

            {subject: "Similar", looks_like: "find artists like"},
            {subject: "Similar", looks_like: "artists like"}
        ];
        $scope.alerts = [];
        $scope.alerts["moreThanOneAlert"] = "You are only allowed to write 1 parameter";


        $scope.init = function(){
            for (var i = 0; i < $scope.subjects.length; i++) {
                Bayes.train($scope.subjects[i].looks_like, $scope.subjects[i].subject);
            };
        };


        $scope.bobSearch = function(e){
            for (var i = 0; i < $scope.subjects.length; i++) {
                var scores = Bayes.guess( $("#bob").val() );
                if($scope.subjects[i].subject ==  Bayes.extractWinner(scores).label ){
                    console.log(Bayes.extractWinner(scores).label);
                    $scope.actions($scope.subjects[i]);
                    window.talkingAbout = $scope.subjects[i].subject;
                    break;
                }
            }
            
            if(e.keyCode == 40 || e.keyCode || 38 && e.keyCode || 13){
                $scope.selectorCont(e);
            }else{
                $scope.selector = -1;
            }
        };

        $scope.actions = function(subject){
            $scope.suggestions = [];

            var sug = $("#bob").val().split(":")[0];

            if(subject.subject == "Similar"){
                if($("#bob").val().split(",").length <= 1){
                    $scope.suggestArtist();
                    for (var i = 0; i < $scope.examples.length; i++) {
                        $scope.suggestions.push(sug + " " + $scope.examples[i].name);
                    };
                }else{
                    $scope.examples = [];
                    $scope.suggestions.push($scope.alerts["moreThanOneAlert"]);
                }
            };
            if(subject.subject == "based_on"){
                $scope.suggestArtist();
                for (var i = 0; i < $scope.examples.length; i++) {
                    $scope.suggestions.push(sug + " " + $scope.examples[i].name);
                };
            };
            console.log($scope.suggestions);
        };


        $scope.selectorCont = function(e){
            if(e.keyCode == 40 && $scope.selector < $scope.suggestions.length){
                $scope.selector = $scope.selector + 1;
                $(".option").removeClass("active");
                $("#n" + $scope.selector).addClass("active");
            }
            if(e.keyCode == 38 && $scope.selector > -1){
                $scope.selector = $scope.selector - 1;
                $(".option").removeClass("active");
                $("#n" + $scope.selector).addClass("active");
            }
            if(e.keyCode == 13 && $scope.selector != -1){
                $scope.select($scope.selector);
            }
            if(e.keyCode == 38 && $scope.selector == -1){ $(".option").removeClass("active");  $scope.selector = -1; }
        };
        $scope.select = function(index){
            var sug = "";
            if($("#bob").val().split(",").length == 1){
                sug = $("#bob").val().split(":")[0] + ": ";
            }

            $("#bob").val(sug + $("#bob").val().replace($("#bob").val().split(",")[$("#bob").val().split(",").length-1], "") + $scope.examples[index].name);
            $scope.suggestions = [];
            $(".option").removeClass("active"); 
            $scope.selector = -1;
        };

        $scope.suggestArtist = function(){
            var ret = [];
            var query = $("#bob").val().split(",")[$("#bob").val().split(",").length-1];

            query = query.substr($("#bob").val().split(",")[$("#bob").val().split(",").length-1].indexOf(": ")+1, $("#bob").val().split(",")[$("#bob").val().split(",").length-1].length);
            $http({
                method: 'GET', url: 'http://developer.echonest.com/api/v4/artist/search?api_key=ZCSQWTH1IHKZYUWVX&format=json&results=5&bucket=id:spotify&bucket=id:deezer&name=' + query
                
            }).success(function(data) {
                if(typeof(data) == 'object'){
                    ret = data.response.artists;
                    $scope.examples = data.response.artists;
                    //console.log(data.response.artists);
                }else{
                    alert('Error al intentar recuperar los datos de spotify.');
                }
            }).
            error(function() {
                alert('Error al intentar recuperar los datos de spotify.');
            });
            return ret;
        };

    }).controller('contentController', function($scope, $http) {
        $scope.adv_songs = [];
        $scope.spotify_adv_songs_ids = [];
        $scope.deezer_adv_songs_ids = [];
        $scope.suggestions = [];

        $scope.decide = function(){
            if("Similar" == window.talkingAbout){
                $scope.similarArtist($("#bob").val());
            }
            if("based_on" == window.talkingAbout){
                $scope.smart_playisting($("#bob").val());
            }
        };
        
        $scope.similarArtist = function(query){
            var art = query;
            art = art.split(": ")[art.split(": ").length-1];
            seed = art.split(",")[0];
            console.log('http://developer.echonest.com/api/v4/artist/similar?api_key=ZCSQWTH1IHKZYUWVX&name=' + art +'&format=json&results=10&bucket=id:spotify&bucket=id:deezer');
            $http({
                method: 'GET', url: 'http://developer.echonest.com/api/v4/artist/similar?api_key=ZCSQWTH1IHKZYUWVX&name=' + art +'&format=json&results=10&bucket=id:spotify&bucket=id:deezer'
            }).success(function(data){
                $scope.suggestions = data.response.artists;
            });
        }


        $scope.smart_playisting = function(P_artist){
            var art = P_artist;
            var seed = [];
            var art_param = "";
            var tmp = "";
            adv_songs_ids = [];
            art = art.split(": ")[art.split(": ").length-1];
            seed = art.split(",");
            for (var i = 0; i < seed.length; i++) {
                art_param = art_param + "&artist=" + seed[i];
            };
            art_param = art_param.replace(/\s/g,"+");
            var limit = "10" //$('#results').val();
            var sort_by = "song_hotttnesss-desc" //$('form input[name=sort_by]:checked').val();
            var spotify_url = 'http://developer.echonest.com/api/v4/playlist/static?api_key=ZCSQWTH1IHKZYUWVX'+art_param+'&bucket=id:spotify&bucket=id:deezer&format=json&results='+limit+'&type=artist-radio&bucket=tracks&sort='+sort_by;
            console.log(spotify_url);
            $scope.spotify(spotify_url);
        }

        $scope.topTracks = function(ids){
            console.log(ids);
            var _sp = [];
            var _dz = [];
            var sp = [];
            var dz = [];
            for (var i = 0; i < ids.length; i++) {
                switch(ids[i].catalog){
                    case "deezer":
                        $.ajax({
                            dataType: "jsonp",
                            url :"http://api.deezer.com/artist/" + ids[i].foreign_id.split(':')[2] + "/top",
                            data : {},
                            jsonp : 'callback',
                            success : function(data) {
                                d = JSON.parse(data);
                                console.log(d);
                                /*_dz = d.data;
                                console.log(d);
                                for (var i = 0; i < _dz.length; i++) {
                                    dz.push(_dz[i].id);
                                };
                                console.log(dz);
                                $("#deezerPlaylist").attr("src","http://www.deezer.com/plugins/player?autoplay=false&playlist=true&width=80&height=80&cover=true&title=MUTEPLAYLIST&format=horizontal&app_id=139673&type=tracks&id=" + dz.toString());*/
                            }
                        });
                    break;

                    case "spotify":
                        console.log("s => https://api.spotify.com/v1/artists/" + ids[i].foreign_id.split(':')[2] + "/top-tracks?country=MX" );
                        $http({
                            method: 'GET', url: "https://api.spotify.com/v1/artists/" + ids[i].foreign_id.split(':')[2] + "/top-tracks?country=MX"
                        }).success(function(data){
                            _sp = data.tracks;
                            for (var i = 0; i < _sp.length; i++) {
                                sp.push(_sp[i].id);
                            };
                            $("#playlisting").attr("src","https://embed.spotify.com/?uri=spotify:trackset:MUTEPLAYLIST:" + sp.toString());
                        });
                    break;
                }
            };
            /*for (var i = 0; i < _sp.length; i++) {
                dz.push(_dz[i].id);
                sp.push(_sp[i].id);
            };
            console.log(_sp);
            console.log(_dz);
            $("#playlisting").attr("src","https://embed.spotify.com/?uri=spotify:trackset:MUTEPLAYLIST:" + sp.toString());
            $("#deezerPlaylist").attr("src","http://www.deezer.com/plugins/player?autoplay=false&playlist=true&width=80&height=80&cover=true&title=MUTEPLAYLIST&format=horizontal&app_id=139673&type=tracks&id=" + dz.toString());*/
        };

        $scope.spotify = function(url){
            $http({
                method: 'GET', url: url
            }).success(function(data){
                $scope.adv_songs = data.response.songs;
                for (var i = 0; i < $scope.adv_songs.length; i++) {
                    if($scope.adv_songs[i].tracks.length != 0){
                        var spo_found = false;
                        var dz_found = false;
                        for (var j = 0; j < $scope.adv_songs[i].tracks.length; j++) {
                            tmp = $scope.adv_songs[i].tracks[j].foreign_id;
                            
                            if ($scope.adv_songs[i].tracks[j].catalog == "spotify" && !spo_found){
                                $scope.spotify_adv_songs_ids.push(tmp.split(':')[2]);
                                //console.log("sp => "+tmp.split(':')[2]);
                                spo_found = true;
                            }
                            
                            if ($scope.adv_songs[i].tracks[j].catalog == "deezer" && !dz_found){
                                $scope.deezer_adv_songs_ids.push(tmp.split(':')[2]);
                                //console.log("dz => "+tmp.split(':')[2]);
                                dz_found = true;
                            }
                            if(spo_found && dz_found){break;}

                        };
                        
                    }
                };
                //build_playlist($scope.spotify_adv_songs_ids);
            }).error(function(){
                alert("spotify failed");
            });
        };


});
function build_playlist(){
    var spotify_uri = "";
    var deezer_uri = "";
    $(".songs_to_play").each(function(){
        spotify_uri = spotify_uri + $(this).data("spotify") + ",";
    });
    $(".songs_to_play").each(function(){
        deezer_uri = deezer_uri + $(this).data("deezer") + ",";
    });
    spotify_uri = spotify_uri.substr(0, spotify_uri.length-1);
    deezer_uri = deezer_uri.substr(0, deezer_uri.length-1);

    console.log("spo => "+spotify_uri);
    console.log("deezer => "+deezer_uri);
    $("#playlisting").attr("src","https://embed.spotify.com/?uri=spotify:trackset:MUTEPLAYLIST:"+spotify_uri);
    $("#deezerPlaylist").attr("src","http://www.deezer.com/plugins/player?autoplay=false&playlist=true&width=80&height=80&cover=true&title=MUTEPLAYLIST&format=horizontal&app_id=139673&type=tracks&id="+deezer_uri);
    
}

function callback(){

}

