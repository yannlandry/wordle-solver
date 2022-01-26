function log_result(html, p_class = "") {
    let results = document.getElementById("benchmark-results");
    let p = document.createElement("p");
    p.className = p_class;
    p.innerHTML = html;
    results.appendChild(p);
}

function compute_result(guess, word) {
    let result = ["-", "-", "-", "-", "-"];

    // mark green characters
    for (let g = 0; g < guess.length; ++g) {
        if (guess[g] == word[g]) {
            result[g] = "!";
        }
    }

    // extract yellow characters where the result isn't already green
    let letters = [];
    for (let r = 0; r < result.length; ++r) {
        if (result[r] != "!") {
            letters.push(word[r]);
        }
    }

    // iterate over guess letters
    for (let g = 0; g < guess.length; ++g) {
        if (result[g] == "!") {
            continue;
        }
        let index = letters.indexOf(guess[g]);
        if (index != -1) {
            result[g] = "?";
            letters.splice(index, 1);
        }
    }

    return result;
}

function verify_result(result) {
    if (result.length != 5) {
        return false;
    }

    for (r = 0; r < result.length; ++r) {
        if (result[r] != "!") {
            return false;
        }
    }

    return true;
}

function simulate(word) {
    let wordlist = [...ALLWORDS];
    let guesses = 0;

    while (guesses <= 50) {
        ++guesses;
        let guess = find_next_guess(wordlist);
        let result = compute_result(guess, word);
        if (verify_result(result)) {
            break;
        }
        wordlist = purge_words(wordlist, guess, result);
        if (wordlist.length == 0) {
            return 0;
        }
    }

    return guesses;
}

function run_benchmark(wordset) {
    let stats = {};

    for (let w = 0; w < wordset.length; ++w) {
        if (w % 200 == 0) {
            console.log("Running word #" + w);
        }
        let word = wordset[w];
        log_result("Testing against <code>" + word + "</code>.");

        let tries = simulate(wordset[w]);
        let outcome = "win";
        let message = "Found word after " + tries + " tries.";
        if (tries > 6) {
            outcome = "loss";
            message += " (loss)";
        }
        else if (tries == 0) {
            outcome = "fail";
            message = "FAIL: Search space emptied.";
        }
        log_result(message, "benchmark-" + outcome);

        if (!(tries in stats)) {
            stats[tries] = 0;
        }
        stats[tries] += 1;
    }

    return stats;
}

function select_wordset() {
    let wordset = "all";

    let radios = document.getElementsByName("use-wordset");
    for (let r = 0; r < radios.length; ++r) {
        if (radios[r].checked) {
            wordset = radios[r].value;
        }
    }

    if (wordset == "answers") {
        return [...ANSWERS];
    }
    return [...ALLWORDS];
}

(function() {
    document.getElementById("benchmark-button").onclick = function() {
        document.getElementById("benchmark-results").innerHTML = "";

        let wordset = select_wordset();
        let stats = run_benchmark(wordset);

        let total = 0;
        let guesses = 0;
        for (s in stats) {
            let stat = stats[s];
            let tag = s + " guesses"
            if (s == 0) {
                tag = "Failures"
            }
            let percent = Math.round((stat / wordset.length) * 1000) / 10;
            if (s >= 1 && s <= 6) {
                total += stat;
            }
            guesses += s * stat;
            log_result("<strong>" + tag + ":</strong> " + stat + " (" + percent + "%)");
        }

        let percent = Math.round((total / wordset.length) * 1000) / 10;
        log_result("<strong>Overall wins:</strong> " + total + " (" + percent + "%)");
        log_result("<strong>Average guesses:</strong> " + (Math.round(guesses / wordset.length * 10) / 10));
    }
}());
