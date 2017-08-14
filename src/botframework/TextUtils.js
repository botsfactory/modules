class TextUtils {

}

TextUtils.split = (text, maxChars) => {
    let splitText = text.split('. ');

    let texts = [];
    let tmpText = splitText[0];

    splitText.forEach((element, index) => {
        let trimmed = element.trim();
        if (index == 0) return;
        if (tmpText.length + trimmed.length <= maxChars) {
            tmpText += '. ' + trimmed;
        }
        else {
            texts.push(tmpText + '.');
            tmpText = trimmed;
        }
    });

    if (tmpText.trim().length > 0) {
        texts.push(tmpText.trim());
    }

    return texts;
}

module.exports.TextUtils = TextUtils;