// ==UserScript==
// @name         Steam Support Info Leaker
// @namespace    https://github.com/gekkedev/SteamSupportInfoLeaker
// @version      0.5.2
// @description  Adds Steam game support info to store pages.
// @author       gekkedev
// @match        *://store.steampowered.com/*
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM.registerMenuCommand
// @updateURL    https://raw.githubusercontent.com/gekkedev/SteamSupportInfoLeaker/master/SteamSupportInfoLeaker.user.js
// @downloadURL  https://raw.githubusercontent.com/gekkedev/SteamSupportInfoLeaker/master/SteamSupportInfoLeaker.user.js
// @require https://greasemonkey.github.io/gm4-polyfill/gm4-polyfill.js
// ==/UserScript==

(async () => {
    searchurl = "store.steampowered.com/search/";
    singleviewurl = "store.steampowered.com/app/";

    var savestate = await GM.getValue ("savestate",  false);
    savedstates = await GM.getValue ("savedstates",  []);
    saveState = function(id){
        //id = parseInt(id);
        if (savestate) {
            if (savedstates.indexOf(id) == -1) {
                savedstates.push(id);
                GM.setValue('savedstates', savedstates);
            }
        }
    };
    var getReportInfo = function(appid) {
        var reportinfo = document.createElement("span");
        if (savestate) {
            if (savedstates.indexOf(parseInt(appid)) == -1) {
                reportinfo.setAttribute("style", "color:green; font-size:10px;");
                reportinfo.innerHTML = "(Bug not reported yet - " + savedstates.length + " totally)";
            } else {
                reportinfo.setAttribute("style", "color:red");
                reportinfo.innerHTML = "(Bug already reported - " + savedstates.length + " totally)";
            }
        }
        return reportinfo.outerHTML;
    };
    if (savestate) {
        GM.registerMenuCommand ("Do not save shipping state", triggerStatesave);
    } else {
        GM.registerMenuCommand ("Save shipping state", triggerStatesave);
    }
    function triggerStatesave() {
        if (savestate) {
            if (prompt("Type in \"yes\" in order to confirm that you want to wipe the shipping state memory: ", "no") == "yes") {
                GM.setValue('savedstates', []);
                GM.setValue("savestate", false);
                alert("Shipping state saving has been disabled");
                location.reload();
            }
        } else {
            GM.setValue("savestate", alert("Shipping state saving has been enabled"), true);
            GM.setValue("savestate", true);
            location.reload();
        }
    }

    var subject = await GM.getValue ("subject",  "Support request for the game: ");
    GM.registerMenuCommand ("Change mail subject", changeSubject);
    function changeSubject() {
        var result = prompt("Enter a new subject which will appear in front of the game title: ", subject);
        if (result  !== null) {
            GM.setValue("subject", result);
            location.reload();
        }
    }
    var body = await GM.getValue ("body",  "Hello! I've got a problem with the game and need support. [DESCRIBE YOUR PROBLEM HERE]");
    GM.registerMenuCommand ("Change mail body", changeBody);
    function changeBody() {
        var result = prompt("Enter a default mail body: ", body);
        if (result  !== null) {
            GM.setValue("body", result);
            location.reload();
        }
    }
    GM.registerMenuCommand("Go to new releases", function(){
        window.location.href = "http://" + searchurl + "?sort_by=Released_DESC";
    });
    setSupportMail = function(appid, mailbutton) {
        loadJSON("https://store.steampowered.com/api/appdetails/?appids=" + appid,
            function(data) {
                var mail = data[appid].data.support_info.email;
                var gamename = data[appid].data.name;
                if (mail.length == 0) {
                    mailbutton.innerHTML = "No mail address found!";
                } else {
                    mailbutton.innerHTML = "Send mail to " + mail;
                    mailbutton.setAttribute("target", "_blank");
                    mailbutton.setAttribute("href", 'https://mail.google.com/mail/?view=cm&fs=1&su=' + subject + gamename + '&body=' + body + '&to=' + mail);
                }
            },
            function(xhr) { console.error(xhr); }
        );
    };
    var insertAfter = function(newNode, referenceNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    };
    var loadJSON = function(path, success, error) {
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
    if (document.URL.indexOf(singleviewurl) != -1) {
        var url = window.location.pathname;
        var firstpos = url.indexOf('/app/') + 5;//5 is the length of the searchstring "/app/"
        var length = url.substring(firstpos).indexOf('/');
        console.log("ID length: " + length);
        var id = url.substring(firstpos, firstpos + length);
        console.log("Getting game support info: " + id);
        loadJSON('https://store.steampowered.com/api/appdetails/?appids=' + id,
            function(data) {
                //console.log(data[id].data.support_info);
                document.getElementsByClassName("glance_ctn_responsive_left")[0].innerHTML += getReportInfo(id);
                var mail = data[id].data.support_info.email;
                var gamename = data[id].data.name;
                mail = mail.length == 0 ? 'none' : '<a onclick="saveState('+id+');" target="_blank" href="https://mail.google.com/mail/?view=cm&fs=1&su=' + subject + gamename + '&body=' + body + '&to=' + mail + '">' + mail + '</a>';
                var website = data[id].data.support_info.url;
                website = website.length == 0 ? 'none' : '<a href="' + website + '" target="_blank">' + website + '</a>';
                var support_html = '<div class="subtitle column"><br>Support website:</div> ' + website + '<br><div class="subtitle column">Support E-Mail:</div> ' + mail;
                document.getElementsByClassName("glance_ctn_responsive_left")[0].innerHTML += support_html;
                console.log("Game support info successfully inserted into site!");
            },
            function(xhr) { console.error(xhr); }
        );
    } else if (document.URL.indexOf(searchurl) != -1) {
        var games = document.getElementsByClassName('search_result_row');
        console.log("Inserting " + games.length + " buttons");
        for (var i = 0, len = games.length; i < len; i++) {
            var game = games[i];
            var appid = game.getAttribute("data-ds-appid");
            //var gamename = games[i].getElementsByClassName("title")[0];
            var gameplatform = games[i].getElementsByClassName("platform_img")[0];
            var button = document.createElement("a");
            button.setAttribute("class", "btnv6_blue_hoverfade btn_small");
            button.setAttribute("onclick", "saveState(" + appid + ");");
            button.setAttribute("id", "mailbtn" + appid);
            button.innerHTML = "getting support mail address...";
            insertAfter(button, gameplatform);
            game.getElementsByClassName("title")[0].innerHTML += getReportInfo(appid);
            (function (appid, button) {
                setTimeout(function(){setSupportMail(appid, button);}, i*650);
            })(appid, button);
        }
    }
})();
