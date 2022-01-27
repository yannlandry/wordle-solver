// improvement #1: prioritize words with overall more common letters when the search space is small
var tiebreaker = {};

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

    if (Object.keys(tiebreaker).length == 0) {
        // compute the tiebreaker
        // useful towards the end when we have multiple words with 1 letter difference
        // the logic is answers have more common letters than just plain allowed guesses
        let letters = [...Object.keys(scores)];
        letters.sort((a, b) => { return scores[a] - scores[b]; });
        for (let l = 0; l < letters.length; ++l) {
            tiebreaker[letters[l]] = l;
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
                // IDEA: add how many times the letter appears at that position and slightly tilt scores to split
                //       anagrams e.g. aeros vs arose
                // OR: keep individual scores by position?
            }
            if (words.length <= 7) {
                // apply tiebreaking balances
                score += tiebreaker[char];
            }
        }
        if (score > max_score) {
            max_score = score;
            max_score_word = word;
        }
    }

    return max_score_word;
}

function match_word(word, guess, result) {
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

    for (let c = 0; c < word.length; ++c) {
        let char = word[c];
        if (result[c] == "?" && guess[c] == char) {
            // the word's character matches the guess character but it's yellow; bye word
            return false;
        }
        else if (result[c] == "!" && guess[c] == char) {
            // the letter is in the correct place
            continue;
        }
        else if (result[c] == "!" && guess[c] != char) {
            // another character should be in this position; bye word
            return false;
        }
        else { // does it exist in yellows? if not, does it exist in greys? otherwise we just don't know
            let index = yellows.indexOf(char);
            if (index != -1) {
                // found character in yellows, therefore the word is still valid
                yellows.splice(index, 1);
                continue;
            }
            if (greys.indexOf(char) != -1) {
                // wasn't in yellows but is in grey; bye word
                return false;
            }
            // character isn't in the right place, not in the place of another character, not yellow, not grey
            // we just don't know
            continue;
        }
    }
    // make sure we used up all yellows
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
