function find_next_guess(words) {
    // compute scores for the list of words
    let scores = {};
    for (let w = 0; w < words.length; ++w) {
        let word = words[w];
        for (let c = 0; c < word.length; ++c) {
            let char = word[c];
            if (!(char in scores)) {
                scores[char] = 0;
            }
            ++scores[word[c]];
        }
    }

    // find the word with the max score across all UNIQUE letters
    let max_score = 0;
    let max_score_word = "";
    for (let w = 0; w < words.length; ++w) {
        let word = words[w];
        let seen = {};
        let score = 0;
        for (let c = 0; c < word.length; ++c) {
            let char = word[c];
            if (!(char in seen)) {
                seen[char] = true;
                if (!(char in scores)) {
                    scores[char] = 0;
                }
                score += scores[char];
                // IDEA: add how many times the letter appears at that position and slightly tilt scores to split anagrams e.g. aeros vs arose
                // OR: keep individual scores by position?
            }
        }
        if (score > max_score) {
            max_score = score;
            max_score_word = word;
        }
    }

    return max_score_word;
}

function display_next_guess(word) {
    for (let c = 0; c < word.length; ++c) {
        document.getElementById("letter-" + c).innerHTML = word[c];
    }
}

function match_word(word, guess, result) {
    //console.log("trying to purge " + word + " with guess " + guess + " and result " + result);
    // figure all letters we must break on
    let greys = [];
    let yellows = [];
    for (let c = 0; c < guess.length; ++c) {
        if (result[c] == "-") {
            greys.push(guess[c]);
        }
        else if (result[c] == "?") {
            yellows.push(guess[c]);
        }
    }
    //console.log(greys);
    //console.log(yellows);

    for (let c = 0; c < word.length; ++c) {
        let char = word[c];
        //console.log("> " + char);
        if (result[c] == "?" && guess[c] == char) {
            //console.log(">> yellow match (purge)")
            // the word's character matches the guess character but it's yellow; bye word
            return false;
        }
        else if (result[c] == "!" && guess[c] == char) {
            //console.log(">> green match");
            // the letter is in the correct place
            continue;
        }
        else if (result[c] == "!" && guess[c] != char) {
            //console.log(">> green mismatch");
            // another character should be in this position; bye word
            return false;
        }
        else { // does it exist in yellows? if not, does it exist in greys? otherwise we just don't know
            let index = yellows.indexOf(char);
            if (index != -1) {
                //console.log(">> is a yellow");
                // found character in yellows, therefore the word is still valid
                yellows.splice(index, 1);
                //console.log(">>> " + yellows);
                continue;
            }
            if (greys.indexOf(char) != -1) {
                //console.log(">> is a grey");
                // wasn't in yellows but is in grey; bye word
                return false;
            }
            // character isn't in the right place, not in the place of another character, not yellow, not grey
            // we just don't know
            //console.log(">> we don't know");
            continue;
        }
    }
    // make sure we used up all yellows
    //console.log("yellows all used up? " + (yellows.length == 0));
    return yellows.length == 0;
}

function purge_words(words, guess, result) {
    purged = [];
    for (let w = 0; w < words.length; ++w) {
        let word = words[w];
        if (match_word(word, guess, result)) {
            purged.push(word);
        }
    }
    return purged;
}

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

    /*console.log("pre purge: " + words.length);
    words = purge_words(words);
    console.log("post purge: " + words.length);*/

    /*
    let guess =  "AABCD";
    let result = "?-!?-";
    let init = [
        "XABYC", // t
        "AXBYC", // f, A is yellow mismatch
        "BABXC", // t
    ]
    let purged = purge_words(init, guess, result);
    console.log(purged);
    console.log(match_word("XABCY", "AABCD", "?-!?-"));//*/
    //console.log(match_word("XABYC", ["A", "A", "B", "C", "D"], ["?", "-", "!", "?", "-"]));

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
        let custom_guess = prompt("Please enter a custom guess:").toLowerCase();

        if (ALLWORDS.indexOf(custom_guess) == -1) {
            alert("Please enter a valid 5-letter word.");
            return;
        }

        guess = custom_guess;
        display_next_guess(guess);
    }
}());
