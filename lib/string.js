"use strict";

const replace_text = (message, words) => {

    let replaced = '';
    for(let word in words){
		var regex = new RegExp(word, "g");
		replaced = message.replace(regex, words[word]);
		message = replaced;
    }
    
    return message;
}

module.exports = {
    replace_text
}