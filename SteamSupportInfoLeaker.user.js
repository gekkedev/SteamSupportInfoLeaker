// ==UserScript==
// @name         Steam Support Info Leaker
// @namespace    https://github.com/gekkedev/SteamSupportInfoLeaker
// @version      0.2
// @description  Adds Steam game support info to store pages.
// @author       gekkedev
// @match        *://store.steampowered.com/app/*
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @updateURL    https://raw.githubusercontent.com/gekkedev/SteamSupportInfoLeaker/master/SteamSupportInfoLeaker.user.js
// @downloadURL  https://raw.githubusercontent.com/gekkedev/SteamSupportInfoLeaker/master/SteamSupportInfoLeaker.user.js
// ==/UserScript==

(function() {
    var subject  = GM_getValue ("subject",  "Support request for the game: ");
    GM_registerMenuCommand ("Change mail subject", changeSubject);
    function changeSubject() {
        GM_setValue("subject", prompt("Enter a new subject which will appear in front of the game title: ", subject));
        location.reload();
    }
    var body  = GM_getValue ("body",  "Hello! I've got a problem with the game and need support. [DESCRIBE YOUR PROBLEM HERE]");
    GM_registerMenuCommand ("Change mail body", changeBody);
    function changeBody() {
        GM_setValue("body", prompt("Enter a default mail body: ", body));
        location.reload();
    }
    var loadJSON = function(path, success, error)
    {
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function()
        {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    if (success)
                        success(JSON.parse(xhr.responseText));
                } else {
                    if (error)
                        error(xhr);
                }
            }
        };
        xhr.open("GET", path, true);
        xhr.send();
    };
    var url = window.location.pathname;
    var firstpos = url.indexOf('/app/') + 5;//5 is the length of the searchstring
    var length = url.substring(firstpos).indexOf('/');
    console.log("ID length: " + length);
    var id = url.substring(firstpos, firstpos + length);
    console.log("Getting game support info: " + id);
    loadJSON('http://store.steampowered.com/api/appdetails/?appids=' + id,
        function(data) {
            //console.log(data[id].data.support_info);
            var mail = data[id].data.support_info.email;
            var gamename = data[id].data.name;
            mail = mail.length == 0 ? 'none' : '<a href="https://mail.google.com/mail/?view=cm&fs=1&su=' + subject + gamename + '&body=' + body + '&to=' + mail + '">' + mail + '</a>';
            var website = data[id].data.support_info.url;
            website = website.length == 0 ? 'none' : '<a href="' + website + '" target="_blank">' + website + '</a>';
            var support_html = '<div class="subtitle column"><br>Support website:</div> ' + website + '<br><div class="subtitle column">Support E-Mail:</div> ' + mail;
            document.getElementsByClassName("glance_ctn_responsive_left")[0].innerHTML += support_html;
            console.log("Game support info successfully inserted into site!");
        },
        function(xhr) { console.error(xhr); }
    );
})();
