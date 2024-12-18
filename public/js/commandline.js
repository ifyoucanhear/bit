let commands = {
    title: "",

    list: [
        {
            id: "togglePunctuation",
            display: "alternar pontuação",

            exec: () => {
                togglePunctuation();
                restartTest();
            }
        }, {
            id: "toggleSmoothCaret",
            display: "alternar cursor suave",

            exec: () => {
                toggleSmoothCaret();
            }
        }, {
            id: "toggleQuickTab",
            display: "alternar modo de guia rápida",

            exec: () => {
                toggleQuickTabMode();
            }
        }, {
            id: "toggleShowLiveWpm",
            display: "alternar exibição de wpm ao vivo",

            exec: () => {
                config.showLiveWpm = !config.showLiveWpm;
                saveConfigToCookie();
            }
        }, {
            id: "toggleKeyTips",
            display: "alternar dicas de atalho de teclado",

            exec: () => {
                toggleKeyTips();
            }
        }, {
            id: "changeMode",
            display: "alterar modo...",

            subgroup: true,
            exec: () => {
                currentCommands = commandsMode;
                showCommandLine();
            }
        }, {
            id: "changeTimeConfig",
            display: "alterar configuração de tempo...",

            subgroup: true,
            exec: () => {
                currentCommands = commandsTimeConfig;
                showCommandLine();
            }
        }, {
            id: "changeWordCount",
            display: "alterar contagem de palavras...",

            subgroup: true,
            exec: () => {
                currentCommands = commandsWordCount;
                showCommandLine();
            }
        }
    ]
};

let commandsWordCount = {
    title: "alterar contagem de palavras...",

    list: [
        {
            id: "changeWordCount10",
            display: "10",

            exec: () => {
                changeWordCount("10");
                restartTest();
            }
        }, {
            id: "changeWordCount25",
            display: "25",

            exec: () => {
                changeWordCount("25");
                restartTest();
            }
        }, {
            id: "changeWordCount50",
            display: "50",

            exec: () => {
                changeWordCount("50");
                restartTest();
            }
        }, {
            id: "changeWordCount100",
            display: "100",

            exec: () => {
                changeWordCount("100");
                restartTest();
            }
        }, {
            id: "changeWordCount200",
            display: "200",

            exec: () => {
                changeWordCount("200");
                restartTest();
            }
        }
    ]
};

let commandsMode = {
    title: "alterar modo...",

    list: [
        {
            id: "changeModeTime",
            display: "time",

            exec: () => {
                changeMode("time");
                restartTest();
            }
        }, {
            id: "changeModeWords",
            display: "words",

            exec: () => {
                changeMode("words");
                restartTest();
            }
        }, {
            id: "changeModeCustom",
            display: "custom",

            exec: () => {
                changeMode("custom");
                restartTest();
            }
        }
    ]
};

let commandsTimeConfig = {
    title: "alterar configuração de tempo...",

    list: [
        {
            id: "changeTimeConfig15",
            display: "15",

            exec: () => {
                changeTimeConfig("15");
                restartTest();
            }
        }, {
            id: "changeTimeConfig30",
            display: "30",

            exec: () => {
                changeTimeConfig("30");
                restartTest();
            }
        }, {
            id: "changeTimeConfig60",
            display: "60",

            exec: () => {
                changeTimeConfig("60");
                restartTest();
            }
        }, {
            id: "changeTimeConfig120",
            display: "120",

            exec: () => {
                changeTimeConfig("120");
                restartTest();
            }
        }
    ]
};

$("#commandLine input").keyup((e) => {
    if (e.keyCode == 38 || e.keyCode == 40)
        return;

    updateSuggestedCommands();
});

$("#commandLine input").keydown((e) => {
    if (e.keyCode == 13) {
        // enter

        e.preventDefault();

        let command = $(".suggestions .entry.active").attr("command");
        let subgroup = false;

        $.each(currentCommands.list, (i, obj) => {
            if (obj.id == command) {
                obj.exec();

                subgroup = obj.subgroup;
            }
        });

        if (!subgroup)
            hideCommandLine();

        return;
    }

    if (e.keyCode == 38 || e.keyCode == 40) {
        // cima
        let entries = $(".suggestions .entry");
        let activenum = -1;

        $.each(entries, (index, obj) => {
            if ($(obj).hasClass("active")) activenum = index;
        });

        if (e.keyCode == 38) {
            entries.removeClass("active");

            if (activenum == 0) {
                $(entries[entries.length - 1]).addClass("active");
            } else {
                $(entries[--activenum]).addClass("active");
            }
        }

        if (e.keyCode == 40) {
            entries.removeClass("active");

            if (activenum + 1 == entries.length) {
                $(entries[0]).addClass("active");
            } else {
                $(entries[++activenum]).addClass("active");
            }
        }

        return false;
    }
});

function hideCommandLine() {
    $("#commandLineWrapper")
        .stop(true, true)
        .css("opacity", 1)
        .animate(
            {
                opacity: 0
            }, 100, () => {
                $("#commandLineWrapper").addClass("hidden");
            }
        );

    focusWords();
}

function showCommandLine() {
    if ($("#commandLineWrapper").hasClass("hidden")) {
        $("#commandLineWrapper")
            .stop(true, true)
            .css("opacity", 0)
            .removeClass("hidden")
            .animate(
                {
                    opacity: 1
                }, 100
            );
    }

    $("#commandLine input").val("");

    updateSuggestedCommands();

    $("#commandLine input").focus();
}

function updateSuggestedCommands() {
    let inputVal = $("#commandLine input").val().toLowerCase().split(" ");

    if (inputVal[0] == "") {
        $.each(currentCommands.list, (index, obj) => {
            obj.found = true;
        });
    } else {
        $.each(currentCommands.list, (index, obj) => {
            let foundcount = 0;
            
            $.each(inputVal, (index2, obj2) => {
                if (obj2 == "")
                    return;

                let re = new RegExp(obj2, "g");
                let res = obj.display.toLowerCase().match(re);

                if (res != null && res.length > 0) {
                    foundcount++;
                } else {
                    foundcount--;
                }
            });

            if (foundcount > 0) {
                obj.found = true;
            } else {
                obj.found = false;
            }
        });
    }

    displayFoundCommands();
}

function displayFoundCommands() {
    $("#commandLine .suggestions").empty();
    
    $.each(currentCommands.list, (index, obj) => {
        if (obj.found) {
            $("#commandLine .suggestions").append(
                '<div class="entry" command="' + obj.id + '">' + obj.display + "</div>"
            );
        }
    });

    if ($("#commandLine .suggestions .entry").length == 0) {
        $("#commandLine .separator").css({ height: 0, margin: 0 });
    } else {
        $("#commandLine .separator").css({
            height: "1px",
            "margin-bottom": ".5rem"
        });
    }

    let entries = $("#commandLine .suggestions .entry");
    
    if (entries.length > 0) {
        $(entries[0]).addClass("active");
    }

    $("#commandLine .listTitle").remove();
    
    // if(currentCommands.title != ''){
    //     $("#commandLine .suggestions").before("<div class='listTitle'>"+currentCommands.title+"</div>");
    // }
}