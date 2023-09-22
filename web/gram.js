(function () {
    "use strict";
    const ARROW_UP = "▴";
    const ARROW_DOWN = "▾";
    const KEYBOARD = window.SimpleKeyboard.default;
    const SPECIAL_KEYS = {
        "{bksp}": "backspace",
        "{enter}": "enter"
    };
    window.addEventListener( "load", init );
    document.addEventListener( "keydown", keydown );
    document.addEventListener( "mousedown", mousedown );

    var g = {
        "count": 6,
        "time": 60,
        "used": {},
        "myWords": [],
        "loading": true,
        "showingInstructions": true,
        "gameOver": false,
        "letters": null,
        "dictionary": null,
        "allWords": null,
        "settings": { "lightmode": false, "words": null, "letters": "" },
        "isRandomGame": false,
        "isMobile": false,
        "keyboard": null
    };
 
    function init() {
        var light, temp;

        if (window.location.protocol === "http:" && window.location.href.indexOf( "localhost" ) === -1 ) {
            window.location.href = window.location.href.replace( "http:", "https:" );
        }

        if( window.location.href.indexOf( "?random" ) > -1 ) {
            g.isRandomGame = true;
        }
        setupMobileMode();

        // Load Settings
        temp = JSON.parse( localStorage.getItem( "settings" ) );
        if( temp !== null ) {
            g.settings = temp;
            toggleDarkmode( g.settings.lightmode );
        } else {
            localStorage.setItem( "settings", JSON.stringify( g.settings ) );
        }
        light = document.getElementById( "lightmode-toggle" );
        light.addEventListener( "click", function() { toggleDarkmode(); } );

        getData();

        setTimeout( function () {
            document.getElementById( "loading" ).style.transitionDuration = "1s";
            document.body.style.transitionDuration = "1s";
        }, 100 );
    }

    function toggleDarkmode( isLightmode ) {
        var bodyClass;

        // Toggle
        if( isLightmode === undefined ) {
            isLightmode = ! g.settings.lightmode;
        }

        bodyClass = document.body.className;
        if( isLightmode ) {
            g.settings.lightmode = true;
            bodyClass = bodyClass.replace( "darkmode", "" ).trim();
        } else {
            g.settings.lightmode = false;
            if( bodyClass.indexOf( "darkmode") === -1 ) {
                bodyClass = ( "darkmode " + bodyClass ).trim();
            }
        }
        document.body.className = bodyClass;
        localStorage.setItem( "settings", JSON.stringify( g.settings ) );
    }

    function setupMobileMode() {
        if ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test( navigator.userAgent ) ||
           ( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test( navigator.platform ) ) ) {
            var bodyClass = document.body.className;
            g.isMobile = true;
            if( bodyClass === "" ) {
                bodyClass = "mobile";
            } else {
                bodyClass += " mobile";
            }
            document.body.className = bodyClass;
        }
    }

    function getData() {
        var req, strRand;

        strRand = "";
        if( g.isRandomGame ) {
            strRand = "&rand_date=1";
        }
        req = new XMLHttpRequest();
        req.onload = function () {
            var word, data;
            data = JSON.parse( this.responseText );
            g.letters = data.letters;
            g.dictionary = data.results;
            g.datestr = data.datestr;
            g.allWords = [];
            for( word in g.dictionary ) {
                g.allWords.push( word );
            }

            checkStart();
        }
        req.open( "get", "gram.php?op=get-game" + strRand );
        req.send();
    }

    function checkStart() {
        var i, word;
        if( g.dictionary && g.letters ) {
            setupLetters();

            if( g.settings.words !== null && g.letters === g.settings.letters ) {
                for( i = 0; i < g.settings.words.length; i++ ) {
                    word = g.settings.words[ i ];
                    insertWord( word, true );
                }
                endGame();
                document.getElementById( "timer" ).innerText = "0:00";
                document.getElementById( "letters" ).style.display = "none";
                document.getElementById( "word" ).innerHTML = "<p>" + getScoreMessage() +
                    " You can play again tomorrow or play one of our <a href='?random'>past games</a>.</p>";

                setupShareButton();
                showAllWords();
                hideLoadingScreen( true );
            }
        }
    }

    function setupShareButton() {
        document.getElementById( "btn-share" ).onclick = function () {
            var msg =  "(" + g.datestr + ")\n" +
                "Found " + g.myWords.length + " words out of " + g.allWords.length +
                " on https://www.scramwords.com";
            if( g.isMobile ) {
                let shareData = {
                    text: msg
                };
                if( navigator.canShare && navigator.canShare( shareData ) ) {
                    navigator.share( shareData );
                } else {
                    myAlert( "Unable to share on your device.", true );
                }
            } else {
                navigator.clipboard.writeText( msg ).then( function() {
                    /* clipboard successfully set */
                    myAlert( "Copied your score to clipboard." );
                }, function() {
                    /* clipboard write failed */
                    myAlert( "Failed to copy score to clipboard.", true );
                } );;
            }
        };
    }

    function myAlert( msg, isError ) {
        var div;
        div = document.createElement( "div" );
        div.innerHTML = "<span>" + msg + "</span>";
        div.className = isError ? "my-alert alert-error" : "my-alert";
        document.body.appendChild( div );
        setTimeout( function () {
            div.className += " fade-out";
        }, isError ? 2000 : 1000 );
        setTimeout( function () {
            document.body.removeChild( div );
        }, isError ? 4000 : 3000 );
    }

    function getScoreMessage() {
        return "You found " + g.myWords.length + " words out of " + g.allWords.length +
            " <a id='btn-share'>(share)</a>.";
    }

    function setupLetters() {
        var i, btn, letters, allButtons, id, backspace;

        g.loading = false;
        document.getElementById( "message" ).innerText = "Press something to begin.";
        allButtons = document.querySelectorAll( "#letters .button" );
        allButtons.forEach( function ( element ) {
            element.onclick = letterClick;
        } );
        letters = document.getElementById( "letters" );
        backspace = document.getElementById( "btn-backspace" );
        for( i = 0; i < g.letters.length; i++ ) {
            btn = document.createElement( "input" );
            btn.type = "button";
            btn.value = g.letters[ i ];
            btn.className = "letter button";
            id = "btn-" + g.letters[ i ];
            if( document.getElementById( id ) ) {
                id = "btn-" + g.letters[ i ] + "2";
                if( document.getElementById( id ) ) {
                    id = "btn-" + g.letters[ i ] + "3";
                }
            }
            btn.id = id;
            btn.onclick = letterClick;
            letters.prepend( btn );
            letters.insertBefore( btn, backspace );
        }

        // Setup Keyboard
        if( g.isMobile ) {
            g.keyboard = new KEYBOARD( {
                "display": {
                    "{bksp}": "back",
                    "{enter}": "enter"
                },
                "layout": {
                    "default": [
                        "q w e r t y u i o p",
                        "a s d f g h j k l",
                        "z x c v b n m {bksp} {enter}"
                    ]
                },
                "onKeyPress": input => keydown( { "key": input } )
            } );
            document.getElementById( "btn-enter" ).className += " no-show";
            document.getElementById( "btn-backspace" ).className += " no-show";
        }
    }

    function hideLoadingScreen( skip ) {
        var loading;

        loading = document.getElementById( "loading" );
        loading.style.opacity = "0";
        document.getElementById( "letters" ).style.visibility = "visible";

        if( ! skip ) {
            setTimeout( function () {
                var startTime, interval;
                loading.style.display = "none";
                startTime = ( new Date() ).getTime();
                interval = setInterval( function () {
                    var t, timeRemaining;
                    t = ( new Date() ).getTime();
                    timeRemaining = g.time - ( t - startTime ) / 1000;
                    if( timeRemaining <= 0 ) {
                        timeRemaining = 0;
                        endGame();
                        document.getElementById( "letters" ).style.display = "none";
                        document.getElementById( "word" ).innerHTML = "<p>" + getScoreMessage() + "</p>";
                        document.getElementById( "timer" ).innerText = "0:00";
                        setupShareButton();
                        clearInterval( interval );
                        showAllWords();
                    } else {
                        document.getElementById( "timer" ).innerText = timeRemaining.toFixed( 2 ).replace( ".", ":" );
                    }
                }, 10 );
            }, 1000 );
        } else {
            loading.style.display = "none";
        }
    }

    function endGame() {
        g.gameOver = true;
        document.removeEventListener( "keydown", keydown );
        document.removeEventListener( "mousedown", mousedown );
        document.querySelector( ".simple-keyboard" ).style.display = "none";
    }

    function showAllWords() {
        var correctWords, i, word, j, letter, container, wordContainers, span;

        correctWords = document.getElementById( "words" );
        for( i = 0; i < g.allWords.length; i++ ) {
            if( ! g.used[ g.allWords[ i ] ] ) {
                word = g.allWords[ i ];
                container = document.createElement( "div" );
                container.dataset.word = word;
                correctWords.appendChild( container );
                word += ARROW_DOWN;
                for( j = 0; j < word.length; j++ ) {
                    letter = createLetter( word[ j ] );
                    letter.removeAttribute( "id" );
                    letter.className = letter.className + " not-guessed";
                    if( word[ j ] === ARROW_DOWN ) {
                        setDefinitionToggle( letter );
                    }
                    container.appendChild( letter );
                }
            } else {
                word = g.allWords[ i ];
                letter = createLetter( ARROW_DOWN );
                letter.removeAttribute( "id" );
                letter.className = "letter correct";
                setDefinitionToggle( letter );
                document.querySelector( "[data-word='" + word + "']" ).appendChild( letter );
            }
        }
        wordContainers = document.querySelectorAll( "#words div" );
        for( i in wordContainers ) {
            span = document.createElement( "span" );
            span.className = "definition definition-closed";
            if( wordContainers[ i ].dataset ) {
                span.innerText = g.dictionary[ wordContainers[ i ].dataset.word ];
                wordContainers[ i ].appendChild( span );
            }
        }
        if( ! g.isRandomGame ) {
            g.settings.words = g.myWords.slice();
            g.settings.letters = g.letters;
            localStorage.setItem( "settings", JSON.stringify( g.settings ) );
        }
    }

    function setDefinitionToggle( letter ) {
        letter.className += " letter-toggle";
        letter.addEventListener( "click", function () {
            var definition, definitionClass, text;
            text = this.innerText;
            definition = this.parentElement.querySelector( ".definition" );
            definitionClass = definition.className;
            if( definitionClass.indexOf( "definition-closed" ) === -1 ) {
                definition.className = ( definitionClass + " definition-closed" ).trim();
                text = ARROW_DOWN;
            } else {
                definition.className = definitionClass.replace( "definition-closed", "" ).trim();
                text = ARROW_UP;
            }
            this.innerText = text;
        } );
    }

    function keydown( e ) {
        var key, btn;

        if( g.gameOver ) {
            return;
        }

        checkHideInstructions();

        key = e.key.toLowerCase();
        if( SPECIAL_KEYS[ key ] ) {
            key = SPECIAL_KEYS[ key ];
        }
        btn = document.getElementById( "btn-" + key );
        if( btn && !btn.disabled ) {
            btn.click();
        } else {
            btn = document.getElementById( "btn-" + key + "2" );
            if( btn && !btn.disabled ) {
                btn.click();
            } else {
                btn = document.getElementById( "btn-" + key + "3" );
                if( btn && !btn.disabled ) {
                    btn.click();
                }
            }
        }
    }

    function mousedown( e ) {
        var hover;

        if( g.gameOver ) {
            return;
        }

        hover = document.elementFromPoint( e.pageX, e.pageY );
        if( hover && hover.id === "lightmode-toggle" ) {
            return;
        }
        checkHideInstructions();
    }

    function letterClick() {
        var val;

        if( g.gameOver ) {
            return;
        }

        if( this.disabled ) {
            return;
        }
        val = this.value;
        if( val.charAt( 0 ) === "←" ) {
            // BACKSPACE
            backspace();
        } else if( val.charAt( 0 ) === "↵" ) {
            // ENTER
            enterWord();
        } else {
            this.setAttribute( "disabled", true );
            document.getElementById( "word" ).appendChild( createLetter( this.value ) );
        }
    }

    function checkHideInstructions() {
        if( ! g.loading && g.showingInstructions ) {
            g.showingInstructions = false;
            hideLoadingScreen();
        }
    }

    function createLetter( letter ) {
        var elem;

        elem = document.createElement( "span" );
        elem.className = "letter";
        elem.innerText = letter;
        elem.id = "letter-" + letter;
        
        return elem;
    }

    function backspace() {
        var elem, btn;
        elem = document.querySelector( "#word span:last-child" );
        if( elem ) {
            btn = document.querySelector( "#btn-" + elem.innerText );
            if( !btn.disabled ) {
                btn = document.querySelector( "#btn-" + elem.innerText + "2" );
            }
            if( !btn.disabled ) {
                btn = document.querySelector( "#btn-" + elem.innerText + "3" );
            }
            btn.removeAttribute( "disabled" );
            elem.parentElement.removeChild( elem );
        }
    }

    function enterWord() {
        var word, spans, oldClassname, buttons, i, container;

        spans = document.querySelectorAll( "#word span" );
        word = "";
        spans.forEach( function ( elem ) {
            word += elem.innerText;
        } );
        if( ! g.dictionary[ word ] || g.used[ word ] ) {
            spans.forEach( function ( elem ) {
                oldClassname = elem.className;
                elem.className = oldClassname + " shaken";
            } );
            setTimeout( function () {
                spans.forEach( function ( elem ) {
                    elem.className = oldClassname;
                } );
            }, 500 );
        } else {
            container = insertWord( word );
            spans.forEach( function ( elem ) {
                elem.removeAttribute( "id" );
                elem.className = "letter correct";
                container.appendChild( elem );
            } );
            buttons = document.querySelectorAll( "#letters .button" );
            for( i = 0; i < buttons.length; i++ ) {
                buttons[ i ].removeAttribute( "disabled" );
            }
        }
    }

    function insertWord( word, createSpan ) {
        var correctWords, container, i, span;

        g.myWords.push( word );
        g.used[ word ] = 1;
        correctWords = document.getElementById( "words" );
        container = document.createElement( "div" );
        container.dataset.word = word;
        correctWords.prepend( container );
        if( createSpan ) {
            for( i = 0; i < word.length; i++ ) {
                span = document.createElement( "span" );
                span.className = "letter correct";
                span.innerText = word[ i ];
                container.appendChild( span );
            }
        }
        return container;
    }

} )();