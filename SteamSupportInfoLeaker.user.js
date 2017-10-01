// ==UserScript==
// @name         Steam Support Info Leaker
// @namespace    https://github.com/gekkedev/SteamSupportInfoLeaker
// @version      0.1.1
// @description  Adds Steam game support info to store pages.
// @author       gekkedev
// @match        *://store.steampowered.com/app/*
// @grant        none
// @updateURL    https://raw.githubusercontent.com/gekkedev/SteamSupportInfoLeaker/master/SteamSupportInfoLeaker.user.js
// @downloadURL  https://raw.githubusercontent.com/gekkedev/SteamSupportInfoLeaker/master/SteamSupportInfoLeaker.user.js
// ==/UserScript==

(function() {
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
            mail = mail.length == 0 ? 'none' : '<a href="mailto:' + mail + '">' + mail + '</a>';
            var website = data[id].data.support_info.url;
            website = website.length == 0 ? 'none' : '<a href="' + website + '" target="_blank">' + website + '</a>';
            var support_html = '<div class="subtitle column"><br>Support website:</div> ' + website + '<br><div class="subtitle column">Support E-Mail:</div> ' + mail;
            document.getElementsByClassName("glance_ctn_responsive_left")[0].innerHTML += support_html;
            console.log("Game support info successfully inserted into site!");
        },
        function(xhr) { console.error(xhr); }
    );
})();
