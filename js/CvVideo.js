// config sample
var CvVideo_config = {
    container: document.getElementById('xxx'),
    autoPlay: true, // auto play for all
    loop: true,
    videos: [{
        default: true, //assign the first play one
        autoPlay: true,
        url: '/video/test_video.mp4',
        subtitles: [{
            default: true,//assign the first one subtitle
            label: "English",
            url: "/video/test_video_EN.vtt",
        }, {
            default: false,
            label: "简体中文",
            url: "/video/test_video_CN.vtt",
        }],
        callbacks: {
            //....
        }
    }],
    callbacks: {
        endCallback: function () { },
        playCallback: function () { },
        muteyCallback: function () { },
        startCallback: function () { },
        pauseCallback: function () { },
        offSubCallback: function () { },
        rewindCallback: function () { },
        muteOnCallback: function () { },
        muteOffCallback: function () { },
        forwardCallback: function () { },
        restartCallback: function () { },
        changeSubCallback: function () { },
        fullScreenCallback: function () { },
        restoreScreenCallback: function () { },
    }
};
/* video属性说明
preload="auto"                    //规定页面加载完成后载入视频
playsinline="true"                //IOS微信浏览器支持小窗播放
x5-playsinline ="true"            //h5小窗播放
webkit-playsinline="true"         //阻止ios 10中全屏播放
x-webkit-airplay="allow"          //开启Airplay设备支持，如音箱、Apple TV等
style="object-fit:fill"           //Android/web的视频在微信里的视频全屏，在手机上会让视频的封面同视频一样大小
x5-video-player-type="h5"         //启用H5播放器,是wechat安卓版特性
x5-video-orientation="h5"         //landscape横屏，portraint竖屏，默认值为竖屏
x5-video-player-fullscreen="true" //全屏设置，设置为true是防止横屏
*/

"use strict";
window.CvVideo = {
    /* common functions */
    videoList:     [],
    trim:          function(s, c) {
        if (!s) return '';
        c = c || ' ';
        var l = c.length;
        if (s.substr(0, l) == c) {
            s = s.substr(l);
        }
        if (s.substr(s.length - l, l) == c) {
            s = s.substr(0, s.length - l);
        }
        return s;
    },
    copy:          function(obj) {
        var newobj = {};
        for (var attr in obj) {
            newobj[attr] = obj[attr];
        }
        return newobj;
    },
    getRect:       function(e) {
        var r = e.getBoundingClientRect(),
            t = document.documentElement.clientTop,
            l = document.documentElement.clientLeft;
        return {
            top: (('' + r.top).indexOf('.') != -1 ? (parseInt(r.top, 10) + 1) : r.top) - t,
            bottom: (('' + r.bottom).indexOf('.') != -1 ? (parseInt(r.bottom, 10) + 1) : r.bottom) - t,
            left: (('' + r.left).indexOf('.') != -1 ? (parseInt(r.left, 10) + 1) : r.left) - l,
            right: (('' + r.right).indexOf('.') != -1 ? (parseInt(r.right, 10) + 1) : r.right) - l,
            width: r.right - r.left,
            height: r.bottom - r.top,
        }
    },
    initBody:      function(c) {
        var videoFrame = 
              '<div id="cv-video-frame-' + c.idx + '" class="cv-video-frame">'
            + '    <label id="cv-video-msg-' + c.idx + '" class="cv-video-msg"></label>'
            + '    <video id="cv-video-' + c.idx + '" class="cv-video" ' + c.poster + ' src="' + c.url + '" ' + (c.autoPlay ? 'autoplay' : '') + ' ' + (c.osv.isPc ? '' : 'muted') + ' z-index="-1" webkit-playsinline="true" x5-playsinline="true" playsinline="true"></video>'
            + '    <div id="cv-video-features-' + c.idx + '" class="cv-video-features hide">'
            + '        <div id="cv-video-captions-' + c.idx + '" class="cv-video-captions"><div id="cv-video-captions-text-' + c.idx + '" class="cv-video-captions-text"></div></div>'
            + '        <progress id="cv-video-progress-' + c.idx + '" class="cv-video-progress" max="100" value="0"></progress>'
            + '        <div id="cv-video-controls-' + c.idx + '" class="cv-video-controls">'
            + '            <div class="cv-video-time">'
            + '                <span id="cv-video-duration-' + c.idx + '" class="cv-video-duration">00:00</span>'
            + '            </div>'
            + '            <div class="cv-video-plays">'
            + '                <button id="cv-video-restart-' + c.idx + '" class="cv-video-restart"></button>'
            + '                <button id="cv-video-rewind-' + c.idx + '" class="cv-video-rewind"></button>'
            + '                <button id="cv-video-play-' + c.idx + '" class="cv-video-play  ' + (c.autoPlay ? 'hide' : '') + '"></button>'
            + '                <button id="cv-video-pause-' + c.idx + '" class="cv-video-pause  ' + (c.autoPlay ? '' : 'hide') + '"></button>'
            + '                <button id="cv-video-forward-' + c.idx + '" class="cv-video-forward"></button>'
            + '            </div>'
            + '            <div class="cv-video-right-controls">'
            + '                <div id="cv-video-fullscreen-' + c.idx + '" class="cv-video-fullscreen small-screen"></div>'
            + '                <div id="cv-video-captions-btns-' + c.idx + '" class="cv-video-captions-btns">'
            + '                    <label id="cv-video-Captions-btn-' + c.idx + '" class="cv-video-btnCaptions"></label>'
            + '                    <ul id="cv-video-captions-menu-' + c.idx + '" class="cv-video-captions-menu">' + c.currVideo.subtitleItems + '</ul>'
            + '                </div>'
            + '                <div id="cv-video-mute-' + c.idx + '" class="cv-video-mute">'
            + '                    <div id="cv-video-mute-btn-' + c.idx + '" class="cv-video-mute-btn cv-video-mute-on"></div>'
            + '                    <div id="cv-video-mute-content-' + c.idx + '" class="cv-video-mute-content">'
            + '                        <input id="cv-video-volume-' + c.idx + '"  class="cv-video-volume" type="range" min="0" step="1" max="100" value="50" />'
            + '                    </div>'
            + '                </div>'
            + '            </div>'
            + '        </div>'
            + '    </div>'
            + '</div>';
        if (!c.container) {
            var cover = document.getElementById('cv-video-cover-' + c.idx);
            if (!cover) {
                cover = document.createElement('div');
                cover.className = 'cv-video-cover';
                cover.id = 'cv-video-cover-' + c.idx;
                document.body.appendChild(cover);
            } else {
                cover.className = 'cv-video-cover';
            }
            cover.innerHTML = '<div id="cv-video-pop-' + c.idx + '" class="cv-video-pop"><div class="cv-video-pop-header"><span id="cv-video-close-' + c.idx + '" class="cv-video-close">X<span></div>' + videoFrame + '<div class="cv-video-pop-footer"></div></div>';
            c.container = document.getElementById('cv-video-pop-' + c.idx);
        } else {
            c.container.innerHTML = videoFrame;
        }

        // Get the elements for the controls
        c.domVideo          = document.getElementById('cv-video-'               + c.idx);
        c.domMsg            = document.getElementById('cv-video-msg-'           + c.idx)
        c.domPop            = document.getElementById('cv-video-cover-'         + c.idx)
        c.domPlay           = document.getElementById('cv-video-play-'          + c.idx);
        c.domClose          = document.getElementById('cv-video-close-'         + c.idx);
        c.domPause          = document.getElementById('cv-video-pause-'         + c.idx);
        c.domFrame          = document.getElementById('cv-video-frame-'         + c.idx);
        c.domVolume         = document.getElementById('cv-video-volume-'        + c.idx);
        c.domRewind         = document.getElementById('cv-video-rewind-'        + c.idx);
        c.domForward        = document.getElementById('cv-video-forward-'       + c.idx);
        c.domRestart        = document.getElementById('cv-video-restart-'       + c.idx);
        c.domMuteBtn        = document.getElementById('cv-video-mute-btn-'      + c.idx);
        c.domCaptions       = document.getElementById('cv-video-captions-'      + c.idx);
        c.domProgress       = document.getElementById('cv-video-progress-'      + c.idx);
        c.domControls       = document.getElementById('cv-video-controls-'      + c.idx);
        c.domDuration       = document.getElementById('cv-video-duration-'      + c.idx);
        c.domFeatures       = document.getElementById('cv-video-features-'      + c.idx);
        c.domFullScreen     = document.getElementById('cv-video-fullscreen-'    + c.idx);
        c.domMuteContent    = document.getElementById('cv-video-mute-content-'  + c.idx);
        c.domCaptionsBtn    = document.getElementById('cv-video-Captions-btn-'  + c.idx);
        c.domCaptionsText   = document.getElementById('cv-video-captions-text-' + c.idx);
        c.domCaptionsMenu   = document.getElementById('cv-video-captions-menu-' + c.idx);
        c.domCaptionsBtns   = document.getElementById('cv-video-captions-btns-' + c.idx);
    },
    initParam:     function(c) {
        c.id              = 0;
        c.osv             = this.getOSVersion();
        c.timer           = null;
        c.pageX           = 0;
        c.pageY           = 0;
        c.isEnd           = false;
        c.timeout         = null;
        c.clickCnt        = 0;
        c.isScreen        = false;
        c.isMouseDown     = false;
        c.seekInterval    = c.seekInterval || 10; // Number of seconds for rewind and forward buttons
        c.currSubCount    = 0;
        c.showSubtitle    = true;
        c.isFullScreen    = false;
        c.showControls    = true;
        c.controlsBottom  = -50;
        this.initSubtitles(c);
        this.initBody(c);
        this.initFullScreen(c);

    },
    getSubText:    function(s) {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            xhr = new ActiveXObject("Microsoft.XMLHTTP");
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                s.src = xhr.responseText;
                var tmp = s.src.split('\r\n\r\n');
                tmp.shift();// Remove first element ("VTT")
                for (var i = 0; i < tmp.length; i++) {
                    var lines = tmp[i].split('\r\n');
                    if (lines[0].indexOf('-->') == -1) {
                        lines.shift();//remove index line
                    }
                    if (lines.length > 1) {
                        var timestamp = lines[0].split('-->');
                        lines.shift(); // remove time line
                        var txt = '';
                        for (var j = 0; j < lines.length; j++) {
                            txt += CvVideo.trim(lines[j]) + '<br />';
                        }
                        s.items.push({
                            end: CvVideo.getMSeconds(timestamp[1]),
                            start: CvVideo.getMSeconds(timestamp[0]),
                            text: '<div>' + CvVideo.trim(txt, '<br />') + '</div>'
                        });
                    }
                }
            }
        }
        xhr.open("get", s.url, true);
        xhr.send();
    },
    bindEvents:    function(c) {
        c.newVideo.addEventListener('ended', c.ended, false);
        c.newVideo.addEventListener('pause', c.paused, false);
        c.newVideo.addEventListener("timeupdate", c.timeGo, false);
        c.newVideo.addEventListener('loadedmetadata', c.loadMeta, false);
        c.domFrame.addEventListener('mouseup', c.mouseUp, false);
        c.domFrame.addEventListener('mousemove', c.mouseMove, false);
        c.domFrame.addEventListener('mousedown', c.mouseDown, false);
        c.domFrame.addEventListener('mouseenter', c.enterVideo, false);
        c.domFrame.addEventListener('mouseleave', c.leaveVideo, false);
        c.domControls.addEventListener('mouseenter', c.enterControls, false);
        c.canvas.addEventListener('touchend', c.touchEnd, false);
        c.canvas.addEventListener('touchstart', c.touchStart, false);
        c.canvas.addEventListener('touchmove', c.touchMove, false);
        c.domPlay.addEventListener('click', c.play, false);
        c.domPause.addEventListener('click', c.pause, false);
        c.domVolume.addEventListener('change', c.setVolume, false);
        c.domRewind.addEventListener('click', c.rewind, false);
        c.domRestart.addEventListener('click', c.restart, false);
        c.domForward.addEventListener('click', c.forward, false);
        c.domMuteBtn.addEventListener('click', c.setMute, false);
        c.domProgress.addEventListener('click', c.setTime, false);
        c.domFullScreen.addEventListener('click', c.changeScreen, false);
        c.domCaptionsBtn.addEventListener('click', c.setCaption, false);
        window.addEventListener("onorientationchange" in window ? "orientationchange" : "resize", c.orientation, false);
        c.domClose && c.domClose.addEventListener('click', c.closeVideo, false);
        this.captionEvents(c);
    },
    getMSeconds:   function(t) {
        if (!t) {
            return 0;
        } else {
            var t1 = t.split('.');
            var t2 = t1[0].split(':');
            return parseInt(t2[0], 10) * 3600000 + parseInt(t2[1], 10) * 60000 + parseInt(t2[2], 10) * 1000 + parseInt(t1[1], 10);
        }
    },
    setSubtitle:   function(v) {
        v = v || this;
        v.poster = v.poster ? ('poster=' + v.poster) : '';
        v.autoPlay = v.autoPlay || false;
        v.subtitleItems = '';
        // init subtitles text
        if (v.subtitles && Array.isArray(v.subtitles)) {
            v.currSub = v.subtitles[0];// first is default
            for (var j = 0; j < v.subtitles.length; j++) {
                var p = v.subtitles[j];
                p.items = [];
                if (p.default) {// if assign default subtitle
                    v.currSub = p;
                }
                v.subtitleItems += '<li id="cv-video-captions-item-' + v.idx + '-' + (j + 1) + '" class="cv-video-captions-item">' + p.label + '</li>';
                // get subtitle text
                this.getSubText(p);
            }
            v.subtitleItems = (v.subtitleItems ? '<li id="cv-video-captions-item-' + v.idx + '-0" class="cv-video-captions-item">Off</li>' : '') + v.subtitleItems;
        } else {
            v.subtitles = [];
        }
    },
    getOSVersion:  function() {
        var osv = {};
        var userAgentInfo = navigator.userAgent;
        osv.isPc = userAgentInfo.indexOf('iPad') == -1
                && userAgentInfo.indexOf('iPod') == -1
                && userAgentInfo.indexOf('iPhone') == -1
                && userAgentInfo.indexOf('Android') == -1
                && userAgentInfo.indexOf('SymbianOS') == -1
                && userAgentInfo.indexOf('Windows Phone') == -1;
        osv.isIos = userAgentInfo.indexOf('iPad') != -1
                 || userAgentInfo.indexOf('iPod') != -1
                 || userAgentInfo.indexOf('iPhone') != -1;
        return osv;
    },
    initFunction:  function(o) {
        o.play                  = function () {
            o.isEnd = false;
            o.domPlay.className = "cv-video-play hide";
            o.domPause.className = "cv-video-pause";
            o.newVideo.play();
            o.drawCanvas();
            if (o.showControls) {
                o.domFeatures.className = 'cv-video-features';
            }
            o.callbacks.startCallback && o.callbacks.startCallback();
        };
        o.pause                 = function () {
            clearTimeout(o.timer);
            o.newVideo.pause();
            o.domPlay.className = "cv-video-play";
            o.domPause.className = "cv-video-pause hide";
            o.callbacks.pauseCallback && o.callbacks.pauseCallback();
        };
        o.ended                 = function () {
            o.isEnd = true;
            o.currSubCount = 0;
            clearTimeout(o.timer);
            o.domCaptionsText.innerHTML = "";
            o.domCaptionsText.style.display = 'none';
            if (o.loop && o.videos.length > 1) {
                var cnt = o.id + 1;
                cnt = cnt >= o.videos.length ? 0 : cnt;
                o.changeVideo(o.videos[cnt]);
            }
            o.callbacks.endCallback && o.callbacks.endCallback();
        };
        o.timeGo                = function () {
            var v = o.newVideo;
            var c = o.currVideo;
            var secs = parseInt(v.currentTime % 60);
            var mins = parseInt((v.currentTime / 60) % 60);
            secs = ("0" + secs).slice(-2);
            mins = ("0" + mins).slice(-2);
            o.domDuration.innerHTML = mins + ':' + secs;

            var percent = (100 / (v.duration || 0)) * v.currentTime;
            if (percent > 0) {
                o.domProgress.value = percent;
            }

            if (c.currSub && c.currSub.items.length > 0) {
                var currTime = v.currentTime.toFixed(3) * 1000;
                var item = c.currSub.items[o.currSubCount];
                if (item && currTime > item.start && currTime < item.end) {
                    o.currSubCount++;
                    o.domCaptionsText.innerHTML = item.text;
                    o.domCaptionsText.style.display = 'inline-block';
                }
            }
        };
        o.paused                = function () {
            o.domPlay.className = "cv-video-play";
            o.domPause.className = "cv-video-pause hide";
        };
        o.rewind                = function () {
            var targetTime = o.newVideo.currentTime - o.seekInterval;
            if (targetTime < 0) {
                o.newVideo.currentTime = 0;
            } else {
                o.newVideo.currentTime = targetTime;
            }
            o.adjustManualCaptions();
            o.callbacks.rewindCallback && o.callbacks.rewindCallback();
        };
        o.mouseUp               = function () {
            o.isMouseDown = false;
            o.domMuteContent.className = 'cv-video-mute-content';
            o.pageX = 0;
            o.pageY = 0;
        };
        o.setMute               = function () {
            if (o.newVideo.muted === true) {
                o.newVideo.muted = false;
                o.domMuteBtn.className = 'cv-video-mute-btn cv-video-mute-on';
                o.callbacks.muteOffCallback && o.callbacks.muteOffCallback();
            } else {
                o.newVideo.muted = true;
                o.domMuteBtn.className = 'cv-video-mute-btn cv-video-mute-off';
                o.callbacks.muteOnCallback && o.callbacks.muteOnCallback();
            }
        };
        o.setTime               = function (e) {
            var rect = CvVideo.getRect(o.canvas);
            o.newVideo.currentTime = (((e.pageX - rect.left) * (o.newVideo.duration || 0)) / rect.width).toFixed(0);
            o.adjustManualCaptions();
        };
        o.restart               = function () {
            o.newVideo.currentTime = 0;
            o.domCaptionsText.innerHTML = '';
            o.domCaptionsText.style.display = 'none';
            o.currSubCount = 0;
            o.play();
            o.callbacks.restartCallback && o.callbacks.restartCallback();
        };
        o.forward               = function () {
            var targetTime = o.newVideo.currentTime + o.seekInterval;
            if (targetTime > o.newVideo.duration) {
                o.newVideo.currentTime = o.newVideo.duration;
            } else {
                o.newVideo.currentTime = targetTime;
            }
            o.adjustManualCaptions();
            o.callbacks.forwardCallback && o.callbacks.forwardCallback();
        };
        o.loadMeta              = function () {
            o.videoWidth        = this.videoWidth;
            o.videoHeight       = this.videoHeight;
            o.ract              = CvVideo.getRect(o.domFrame);
            o.width             = o.ract.width > o.videoWidth ? o.videoWidth : o.ract.width;
            o.height            = (o.videoHeight * o.width / o.videoWidth).toFixed(0);
            o.canvas.width      = o.width;
            o.canvas.height     = o.height;
            o.newVideo.width    = o.width;
            o.newVideo.height   = o.height;
        },
        o.moveMute              = function (n){
            o.domMuteContent.className = 'cv-video-mute-content cv-video-volume-show';
            var v = parseFloat(o.domVolume.value) + (n < 0 ? 1 : -1)
            v = v < 0 ? 0 : v > 100 ? 100 : v;
            o.domVolume.value = v;
            o.setVolume();
        };
        o.moveTime              = function (n){
            if (!o.isEnd) {
                o.newVideo.currentTime += (n > 0 ? 1 : -1);
                o.adjustManualCaptions();
            }
        };
        o.touchEnd              = function () {
            o.mouseUp();
        };
        o.touchMove             = function (e) {
            var t = e.targetTouches[0];
            e.preventDefault();
            o.mouseMove(t);
        };
        o.setVolume             = function () {
            if (o.domVolume.value > 0) {
                var m = o.newVideo.muted;
                o.newVideo.muted = false;
                o.newVideo.volume = parseFloat(o.domVolume.value / 100);
                o.domMuteBtn.className = 'cv-video-mute-btn cv-video-mute-on';
                m && o.callbacks.muteOnCallback && o.callbacks.muteOnCallback()
            } else {
                o.newVideo.muted = true;
                o.domMuteBtn.className = 'cv-video-mute-btn cv-video-mute-off';
                o.callbacks.muteOffCallback && o.callbacks.muteOffCallback();
            }
        };
        o.mouseDown             = function (e) {
            o.isMouseDown = !o.isMouseDown;
            o.pageX = e.pageX;
            o.pageY = e.pageY;
        };
        o.mouseMove             = function (e) {
            if (o.isMouseDown) {
                var x = e.pageX - o.pageX;
                var y = e.pageY - o.pageY;
                if (Math.abs(x) > 3 || Math.abs(y) > 3) {
                    if (Math.abs(x) >= Math.abs(y)) {
                        if (o.isScreen){
                            o.moveTime(x);
                        } else {
                            if (o.isFullScreen) {
                                o.moveMute(-x);
                            } else {
                                o.moveTime(x);
                            }
                        }
                    } else {
                        if (o.isScreen) {
                            o.moveMute(y);
                        } else {
                            if (o.isFullScreen) {
                                o.moveTime(y);
                            } else {
                                o.moveMute(y);
                            }
                        }
                    }
                }
            }
            o.pageX = e.pageX;
            o.pageY = e.pageY;
        };
        o.playPause             = function () {
            if (o.newVideo.paused) {
                o.play();
            } else {
                o.pause();
            }
        };
        o.drawCanvas            = function () {
            o.ctx.drawImage(o.newVideo, 0, 0, o.canvas.width, o.canvas.height);
            o.timer = setTimeout(o.drawCanvas, 20);
        };
        o.closeVideo            = function (e) {
            o.pause();
            o.domCaptionsText.innerHTML = "";
            o.domCaptionsText.style.display = 'none';
            o.domPop.className = 'cv-video-cover hide';
        };
        o.enterVideo            = function (e) {
            o.domControls.style.height = '32px';
            o.domControls.style.opacity = '1';
        };
        o.leaveVideo            = function (e) {
            o.domControls.style.height = '0px';
            o.domControls.style.opacity = '0';
            o.domMuteContent.className = 'cv-video-mute-content';
            o.isMouseDown = false;
            o.pageX = 0;
            o.pageY = 0;
        };
        o.setCaption            = function () {
            if (!o.showSubtitle) {
                o.openCaption();
            } else {
                o.closeCaption();
            }
        };
        o.mouseClick            = function (e) {
            if (o.clickCnt == 0) {
                o.newVideo.muted = false;
                o.clickCnt = 1;
            }
            o.clickCnt++;
            setTimeout(function () {
                if (o.clickCnt == 3) {
                    o.changeScreen();
                }
                o.clickCnt = 1;
            }, 300);
        };
        o.touchStart            = function (e) {
            var t = e.targetTouches[0];
            o.mouseDown(t);
        };
        o.fullScreen            = function () {
            o.isFullScreen      = true;
            o.domFullScreen.className = 'cv-video-fullscreen full-screen';
            o.orientation();
            o.requestFullScreen.call(o.domFrame);
            setTimeout(function () {
                document.addEventListener("fullscreenchange", o.restoreScreen, false);
                document.addEventListener("ofullscreenchange", o.restoreScreen, false);
                document.addEventListener("msfullscreenchange", o.restoreScreen, false);
                document.addEventListener("mozfullscreenchange", o.restoreScreen, false);
                document.addEventListener("webkitfullscreenchange", o.restoreScreen, false);
            }, 500);
            o.callbacks.fullScreenCallback && o.callbacks.fullScreenCallback();
        };
        o.changeVideo           = function (c) {
            o.pause();
            o.closeCaption();
            o.currVideo = c;
            o.currSubCount = 0;
            CvVideo.setSubtitle(c);
            o.newVideo.src = c.url;
            o.showCaptionBtn();
            o.openCaption();
            o.play();
            o.domPop.className = 'cv-video-cover';
        };
        o.orientation           = function (e) {
            if (o.isFullScreen) {
                o.isScreen = false;
                switch (window.orientation) {
                    case 0: {
                        if (!o.osv.isIos) {
                            o.domFrame.className = 'cv-video-frame rotate-90-android';
                        } else {
                            o.domFrame.className = 'cv-video-frame rotate-90-ios';
                        }
                    } break;
                    case 180:
                    case -180: {
                        if (!o.osv.isIos) {
                            o.domFrame.className = 'cv-video-frame rotate-270-android';
                        } else {
                            o.domFrame.className = 'cv-video-frame rotate-270-ios';
                        }
                    } break;
                    case 90:
                    case -90:
                    case 270:
                    case -270: {
                        o.isScreen = true;
                        o.domFrame.className = 'cv-video-frame';
                        o.domFrame.className = 'cv-video-frame';
                    } break;
                    default: break;
                }
                var fullViewHeight   = (viewWidth * o.videoHeight / o.videoWidth).toFixed(0);
                var fullScreenHeight = (window.screen.width * o.videoHeight / o.videoWidth).toFixed(0);
                if (!o.osv.isPc) {
                    if (o.isScreen) {
                        if (!o.osv.isIos) {
                            o.canvas.width          = window.screen.width;
                            o.canvas.height         = fullScreenHeight;
                            o.newVideo.width        = window.screen.width;
                            o.newVideo.height       = fullScreenHeight;
                            o.domFrame.style.width  = window.screen.width + 'px';
                            o.domFrame.style.height = window.screen.height + 'px';
                        } else {
                            var viewWidth           = window.innerWidth  || document.documentElement.clientWidth;
                            var viewHeight          = window.innerHeight || document.documentElement.clientHeight;
                            var fullScreenHeight    = (viewWidth * o.videoHeight / o.videoWidth).toFixed(0);
                            o.canvas.width          = viewWidth;
                            o.canvas.height         = fullScreenHeight;
                            o.newVideo.width        = viewWidth;
                            o.newVideo.height       = fullScreenHeight;
                            o.domFrame.style.width  = viewWidth + 'px';
                            o.domFrame.style.height = viewHeight + 'px';
                        }
                    } else {
                        if (!o.osv.isIos) {
                            var fullScreenHeight    = (window.screen.height * o.videoHeight / o.videoWidth).toFixed(0);
                            o.canvas.width          = window.screen.height;
                            o.canvas.height         = fullScreenHeight;
                            o.newVideo.width        = window.screen.height;
                            o.newVideo.height       = fullScreenHeight;
                            o.domFrame.style.width  = window.screen.height + 'px';
                            o.domFrame.style.height = window.screen.width + 'px';
                        } else {
                            var viewWidth           = window.innerWidth  || document.documentElement.clientWidth;
                            var viewHeight          = window.innerHeight || document.documentElement.clientHeight;
                            var fullScreenWidth     = (viewHeight * o.videoHeight / o.videoWidth).toFixed(0);
                            o.canvas.width          = viewHeight;
                            o.canvas.height         = fullScreenWidth;
                            o.newVideo.width        = viewHeight;
                            o.newVideo.height       = fullScreenWidth;
                            o.domFrame.style.width  = viewHeight + 'px';
                            o.domFrame.style.height = viewWidth + 'px';
                        }
                    }
                } else {
                    o.canvas.width          = window.screen.width;
                    o.canvas.height         = fullScreenHeight;
                    o.newVideo.width        = window.screen.width;
                    o.newVideo.height       = fullScreenHeight;
                    o.domFrame.style.width  = window.screen.width  + 'px';
                    o.domFrame.style.height = window.screen.height + 'px';
                }
            }
        };
        o.openCaption           = function () {
            o.showSubtitle = true;
            o.domCaptionsBtns.className = 'cv-video-captions-btns';
            o.domCaptionsMenu.style.display = '';
            o.domCaptions.style.display = '';
        };
        o.closeCaption          = function () {
            o.showSubtitle = false;
            o.domCaptionsBtns.className = 'cv-video-captions-btns cv-video-captions-hide';
            o.domCaptionsMenu.style.display = 'none';
            o.domCaptions.style.display = 'none';
        };
        o.changeScreen          = function (c) {
            o.isFullScreen ? o.restoreScreen() : o.fullScreen();
        };
        o.restoreScreen         = function () {
            o.exitFullScreen.call(document);
            setTimeout(function () {
                o.isFullScreen = false;
                o.domFullScreen.className = 'cv-video-fullscreen small-screen';
                o.domFrame.className      = 'cv-video-frame';
                o.domFrame.style.width    = '100%';
                o.domFrame.style.height   = '100%';
                o.newVideo.width          = o.width;
                o.newVideo.height         = o.height;
                o.canvas.width            = o.width  || o.frameWidth;
                o.canvas.height           = o.height || o.frameHeight;

                document.removeEventListener("fullscreenchange", o.restoreScreen, false);
                document.removeEventListener("ofullscreenchange", o.restoreScreen, false);
                document.removeEventListener("msfullscreenchange", o.restoreScreen, false);
                document.removeEventListener("mozfullscreenchange", o.restoreScreen, false);
                document.removeEventListener("webkitfullscreenchange", o.restoreScreen, false);
            }, 100);
            o.callbacks.restoreScreenCallback && o.callbacks.restoreScreenCallback();
        };
        o.enterControls         = function (e) {
            o.domFrame.removeEventListener('mouseenter', null);
            o.domControls.style.height = '32px';
        };
        o.changeLanguage        = function (t) {
            var txt = t.innerHTML;
            o.domCaptionsText.innerHTML = "";
            o.domCaptionsText.style.display = 'none';
            if (txt == 'Off') {
                o.domCaptions.style.display = 'none';
                o.callbacks.offSubCallback && o.callbacks.offSubCallback();
            } else {
                o.domCaptions.style.display = '';
                for (var j = 0; j < o.currVideo.subtitles.length; j++) {
                    var sub = o.currVideo.subtitles[j];
                    if (sub.label == txt) {
                        o.currVideo.currSub = sub
                        var item = sub.items[o.currSubCount];
                        o.domCaptionsText.innerHTML = item.text;
                        o.domCaptionsText.style.display = 'inline-block';
                        o.callbacks.changeSubCallback && o.callbacks.changeSubCallback();
                    }
                }
            }
        };
        o.showCaptionBtn        = function () {
            if (o.currVideo && o.currVideo.currSub) {
                o.domCaptionsBtns.className = "cv-video-captions-btns show";
            } else {
                o.domCaptionsBtns.className = "cv-video-captions-btn-container hide";
            }
        };
        o.hideCaptionItem       = function () {
            o.domCaptionsText.style.display = 'none';
        };
        o.adjustManualCaptions  = function () {
            var cv = o.currVideo;
            o.domCaptionsText.innerHTML = "";
            o.domCaptionsText.style.display = 'none';
            if (cv && cv.currSub && cv.currSub.items.length > 0) {
                var csv = 0, sub = cv.currSub, time = o.newVideo.currentTime.toFixed(3) * 1000;
                while (sub.items[csv].start < time) {
                    csv += 1;
                    if (csv > (sub.items.length - 1)) {
                        csv = sub.items.length - 1;
                        break;
                    }
                }
                o.domCaptionsText.innerHTML = sub.items[csv].text;
                o.domCaptionsText.style.display = 'inline-block';
                o.currSubCount = csv;
            }
        };
    },
    initSubtitles: function(c) {
        if (c.videos && Array.isArray(c.videos) && c.videos.length > 0) {
            c.currVideo = c.videos[0];
            for (var i = 0; i < c.videos.length; i++) {
                c.videos[i].idx = c.idx;
                this.setSubtitle(c.videos[i]);
            }
        } else {
            c.currVideo = c
            this.setSubtitle(c);
        }
    },
    captionEvents: function(c) {
        var captionsItemList = c.domCaptionsMenu.getElementsByClassName('cv-video-captions-item');
        for (var i = 0; i < captionsItemList.length; i++) {
            captionsItemList[i].addEventListener('click', function () { c.changeLanguage(this); }, false);
        }
    },
    videoToCanvas: function(c) {
        var r           = CvVideo.getRect(c.container);
        c.frameWidth    = r.width;
        c.frameHeight   = r.height;
        var v           = document.createElement('canvas');
        c.canvas        = v
        v.onclick       = c.mouseClick;
        v.className     = 'cv-video-canvas';
        var rect        = CvVideo.getRect(c.domFrame);
        v.width         = c.frameWidth;
        v.height        = c.frameHeight;
        c.ctx           = v.getContext('2d');
        var n           = c.domVideo.cloneNode(false);
        n.muted         = true;
        c.newVideo      = n;
        /* canvas to video */
        c.domVideo.parentNode.replaceChild(v, c.domVideo);
    },
    initFullScreen:function(c) {
        c.requestFullScreen
             = c.domFrame.requestFullscreen
            || c.domFrame.msRequestFullscreen
            || c.domFrame.mozRequestFullScreen
            || c.domFrame.webkitRequestFullscreen
            || c.domFrame.oRequestFullscreen
            || c.domFrame.enterFullscreen
            || c.domFrame.webkitEnterFullscreen
            || function () {
                c.domFrame.style.position = 'fixed';
            };
        c.exitFullScreen
             = document.exitFullscreen
            || document.msExitFullscreen
            || document.mozCancelFullScreen
            || document.webkitExitFullscreen
            || document.oCancelFullScreen
            || document.leaveFullscreen
            || document.webkitLeaveFullscreen
            || function () {
                c.domFrame.style.position = 'relative';
            };        
    },
    /* canvas video function */
    open: function (CvVideoConfig) {
        var obj = CvVideo.copy(CvVideoConfig);
        obj.callbacks = obj.callbacks || {};
        obj.idx = this.videoList.length;
        this.videoList.push(obj);
        CvVideo.initFunction(obj);
        CvVideo.initParam(obj);
        CvVideo.videoToCanvas(obj);
        CvVideo.bindEvents(obj);
        // auto play
        if (obj.currVideo.autoPlay) {
            obj.play();
        }
        //if (!obj.osv.isPc && obj.domPop) {
        //    obj.fullScreen();
        //}
        return obj;
    }
};