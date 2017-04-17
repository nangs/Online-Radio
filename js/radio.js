$(document).ready(function() {

    var liveRadioListUrl = "https://gist.githubusercontent.com/valarpirai/473305f09f8433f1d338634ed42c437d/raw/live-radio.json";

    window.AudioContext = window.AudioContext || window.webkitAudioContext;
    var audioContext = new AudioContext(); // Audio context
    var audioSource;

    var stationList = {};
    var selectedStationList = [];
    var selectedCity = "";
    var previousBg = 1;

    var trigger = $('.hamburger'),
        overlay = $('.overlay'),
        isClosed = false;

    trigger.click(function() {
        hamburger_cross();
    });

    function hamburger_cross() {

        if (isClosed == true) {
            overlay.hide();
            trigger.removeClass('is-open');
            trigger.addClass('is-closed');
            isClosed = false;
        } else {
            overlay.show();
            trigger.removeClass('is-closed');
            trigger.addClass('is-open');
            isClosed = true;
        }
    }

    $('[data-toggle="offcanvas"]').click(function() {
        $('#wrapper').toggleClass('toggled');
    });

    $(document).on('click', '[data-city]', function() {
        renderStationList($(this).attr('data-city'));
    });

    $(document).on('click', '[data-id]', function() {
        playSelectedStation($(this).attr('data-id'));
    });

    $(document).on('click', '.volume-ctrl', function() {
        var muted = $("#audio-src").prop('muted');
        $("#audio-src").prop('muted', !muted);

        if(!muted) {
            $(this).text("Muted");
        } else {
            $(this).text("Playing..");
        }
    });

    // Download Station List data
    $.ajax({
        url : liveRadioListUrl
    }).done(function(res) {
        res = JSON.parse(res);
        
        for(var i in res) {
            stationList[res[i].name] = res[i];
        }

        console.log(stationList);
        renderCityList();
        renderStationList();
    });

    $('.dummy-bg').css("opacity", "1");
    setTimeout(function () {
        changeBg();
        $('.dummy-bg').css("opacity", "");
    }, 1000);

    function changeBg() {
        var rand = getRandomInt(1, 8);
        if(rand == previousBg) {
            rand++;
        }
        if(rand > 8) {
            rand = 1;
        }
        $('.bg-img').removeClass('bg-' + previousBg).addClass("bg-" + rand);
        previousBg = rand;
    }

    function getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function renderCityList() {
        
        var city = $(".city");
        var list = Object.keys(stationList) || [];
        
        city.html("");

        for (var i = 0; i < list.length; i++) {
            var obj = list[i];
            city.append('<li><a data-city="' + obj + '">' + obj + '</a></li>');
        }
    }

    function renderStationList(area) {
        if(!area) {
            // read from cookie
            area = getCookie('area');
            if(!area)
                area = Object.keys(stationList)[0];
        }

        createCookie("area", area);

        var stations = $(".stations");
        var list = (stationList[area] && stationList[area].channels) || [];
        selectedCity = area;
        selectedStationList = list;

        stations.html("");

        for (var i = 0; i < list.length; i++) {
            var obj = list[i];
            stations.append('<li><a data-id="' + obj.id + '"><h3>' + obj.name + '</h3></a></li>');
        }

        playSelectedStation();
    }

    function playSelectedStation(stationId) {
        if(!stationId) {
            // read from cookie
            stationId = getCookie('stationId');
            if(!stationId) {
                stationId = selectedStationList[0].id;
            }
        }

        createCookie("stationId", stationId);

        var x;
        for (var i = 0; i < selectedStationList.length; i++) {
            if(stationId == selectedStationList[i].id){
                x = selectedStationList[i];
                break;
            }
        }

        if(!x)
            return;
        
        console.log(x)

        var stream = x.src;

        $('.station-name').text(x.name);
        $('.station-site').attr("href", x.website);
        var video = document.getElementById('audio-src');
        video.innerHTML = '';
        video.pause();

        var source = document.createElement('source');
        source.setAttribute('src', stream);
        video.appendChild(source);
        video.load();
        video.play();

        document.title = "Online Radio - " + x.name;
        window.history.pushState('Online Radio', document.title, "#/" + selectedCity + "/" + x.id);

        changeBg();

        // <video controls="" autoplay="" name="media"><source src="http://192.240.97.69:9201/stream" type="audio/mpeg"></video>
    }

    // Read cookie
    function getCookie (name) {
        var cookies = {};
        var c = document.cookie.split('; ');
        for (i = c.length - 1; i >= 0; i--) {
            var C = c[i].split('=');
            cookies[C[0]] = C[1];
        }
        return cookies[name] || null;
    };

    // create cookie
    function createCookie (name, value, minutes) {
        if(!minutes)
            minutes = 60 * 24;

        var date = new Date();
        date.setTime(date.getTime() + (minutes * 60 * 1000));
        var expires = "; expires=" + date.toGMTString();
        document.cookie = name + "=" + value + expires + "; path=/";
    }
});
