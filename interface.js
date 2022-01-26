function get_result() {
    result = [];
    for (let l = 0; l < 5; ++l) {
        let radio = document.getElementsByName("radio-letter-" + l);
        for (let r = 0; r < radio.length; ++r) {
            if (radio[r].checked) {
                result.push(radio[r].value);
            }
        }
    }
    if (result.length < 5) {
        return [];
    }
    else {
        return result;
    }
}

function display_next_guess(word) {
    for (let c = 0; c < word.length; ++c) {
        document.getElementById("letter-" + c).innerHTML = word[c];
    }
}

var prepare = function(words) {
    let guess = find_next_guess(words);
    display_next_guess(guess);
    let radios = document.getElementsByTagName("input");
    for (let r = 0; r < radios.length; ++r) {
        radios[r].checked = false;
    }
    for (let l = 0; l < 5; ++l) {
        document.getElementById("letter-" + l).className = "";
    }
    document.getElementById("search-space").innerHTML = words.length;
    return guess;
};

(function() {
    var words = [];
    var guess = "";

    var reset = function() {
        words = [...ALLWORDS];
        guess = prepare(words);
    };
    reset();

    document.getElementById("next-guess").onclick = function() {
        let result = get_result();
        if (result.length < 5) {
            alert("Please enter the result for all 5 letters by clicking the coloured squares.");
            return;
        }

        // this will purge the words
        words = purge_words(words, guess, result);

        if (words.length == 0) {
            alert("No more words in search space.");
            document.getElementById("search-space").innerHTML = 0;
            return;
        }

        // prepare a new form a new guess with the purged list of words
        guess = prepare(words);
    };

    // assign radio buttons to control letter colours
    let colours = ["green", "yellow", "grey"];
    for (let i = 0; i < 5; ++i) {
        for (let c = 0; c < colours.length; ++c) {
            let colour = colours[c];
            document.getElementById("radio-letter-" + i + "-" + colour).oninput = function() {
                document.getElementById("letter-" + i).className = colour;
            };
        }
    }

    // assign Enter key to “Next guess”
    document.onkeyup = function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
            document.getElementById("next-guess").click();
        }
    };

    // program Reset button
    document.getElementById("reset").onclick = function() {
        reset();
    };

    // program Custom guess button
    document.getElementById("custom-guess").onclick = function() {
        let custom_guess = prompt("Please enter a custom guess:");
        if (custom_guess === null) {
            return;
        }
        custom_guess = custom_guess.toLowerCase();

        if (ALLWORDS.indexOf(custom_guess) == -1) {
            alert("Please enter a valid 5-letter word.");
            return;
        }

        guess = custom_guess;
        display_next_guess(guess);
    };

    document.getElementById("help").onclick = function() {
        document.getElementById("modal").className = "active";
    };

    document.getElementById("close").onclick = function() {
        document.getElementById("modal").className = "";
    }
}());
