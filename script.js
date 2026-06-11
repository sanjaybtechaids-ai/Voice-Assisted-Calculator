const display = document.getElementById("display");
const statusText = document.getElementById("status");
const voiceButton = document.getElementById("voiceButton");

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

const numberWords = {
    zero: "0",
    one: "1",
    two: "2",
    three: "3",
    four: "4",
    five: "5",
    six: "6",
    seven: "7",
    eight: "8",
    nine: "9",
    ten: "10"
};

function setStatus(message, isError = false) {
    statusText.textContent = message;
    statusText.style.color = isError ? "#b42318" : "#64748b";
}

function appendToDisplay(value) {
    display.value += value;
    display.focus();
}

function clearDisplay() {
    display.value = "";
    setStatus("Cleared. Type or say a new calculation.");
    display.focus();
}

function backspace() {
    display.value = display.value.slice(0, -1);
    display.focus();
}

function normalizeExpression(input) {
    return input
        .toLowerCase()
        .replace(/\b(zero|one|two|three|four|five|six|seven|eight|nine|ten)\b/g, (word) => numberWords[word])
        .replace(/\b(calculate|what is|what's|solve|answer|equals|equal to|please)\b/g, " ")
        .replace(/\bplus\b/g, "+")
        .replace(/\bminus\b/g, "-")
        .replace(/\btimes\b|\bmultiplied by\b|\bmultiply by\b|\binto\b/g, "*")
        .replace(/\bdivided by\b|\bdivide by\b|\bover\b/g, "/")
        .replace(/\bpoint\b|\bdot\b/g, ".")
        .replace(/\bopen bracket\b|\bopen parenthesis\b/g, "(")
        .replace(/\bclose bracket\b|\bclose parenthesis\b/g, ")")
        .replace(/\s+x\s+|(?<=\d)x(?=\d)/g, "*")
        .replace(/[^0-9+\-*/().\s]/g, "")
        .replace(/\s+/g, "")
        .trim();
}

function isValidExpression(expression) {
    return expression.length > 0 && /^[0-9+\-*/().\s]+$/.test(expression);
}

function calculateExpression(expression) {
    if (!isValidExpression(expression)) {
        throw new Error("Enter a valid calculation.");
    }

    const result = Function(`"use strict"; return (${expression})`)();

    if (!Number.isFinite(result)) {
        throw new Error("That calculation has no finite answer.");
    }

    return Number.isInteger(result) ? result.toString() : Number(result.toFixed(10)).toString();
}

function calculateResult(sourceText = display.value) {
    const expression = normalizeExpression(sourceText);

    try {
        const result = calculateExpression(expression);
        display.value = result;
        setStatus(`${expression} = ${result}`);
    } catch (error) {
        setStatus(error.message, true);
    }

    display.focus();
}

function handleVoiceResult(transcript) {
    const expression = normalizeExpression(transcript);

    if (!expression) {
        setStatus(`Heard "${transcript}", but no calculation was found.`, true);
        return;
    }

    display.value = expression;
    calculateResult(expression);
}

function startVoiceCommand() {
    if (!recognition) {
        setStatus("Voice input is not supported in this browser. Try Chrome or Edge.", true);
        return;
    }

    recognition.start();
}

display.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        calculateResult();
    }

    if (event.key === "Escape") {
        clearDisplay();
    }
});

voiceButton.addEventListener("click", startVoiceCommand);

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.addEventListener("start", () => {
        voiceButton.classList.add("listening");
        setStatus('Listening... say "calculate 2 plus 2".');
    });

    recognition.addEventListener("result", (event) => {
        const transcript = event.results[0][0].transcript;
        setStatus(`Heard: ${transcript}`);
        handleVoiceResult(transcript);
    });

    recognition.addEventListener("error", (event) => {
        setStatus(`Voice error: ${event.error}.`, true);
    });

    recognition.addEventListener("end", () => {
        voiceButton.classList.remove("listening");
    });
} else {
    voiceButton.disabled = true;
    voiceButton.title = "Voice input is not supported in this browser";
    setStatus("Typing works here. Voice needs Chrome or Edge with microphone permission.");
}
