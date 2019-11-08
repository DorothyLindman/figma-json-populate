var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import './ui.css';
// Setup
const delay = 2500;
let temp = null;
let buttons = document.getElementById('buttons');
let feedback = document.getElementById('feedback');
let input = document.getElementById('input');
let intro = document.getElementById('intro');
let loader = document.getElementById('loader');
let sortation = document.getElementById('sortation');
function init() {
    // Get stored URL
    parent.postMessage({ pluginMessage: { type: 'get-url' } }, '*');
}
onmessage = event => {
    const msg = event.data.pluginMessage;
    if (msg === 'no-url') {
        removeFeedback(0);
        intro.classList.remove('invisible');
        return;
    }
    if (msg === 'non-text') {
        toggleLoader(false);
        showFeedback(`You've selected one or more non-text nodes.`);
        // Remove feedback after 2,5s
        removeFeedback(delay);
        return;
    }
    if (msg === 'no-selection') {
        toggleLoader(false);
        showFeedback(`No text elements selected. Please select something`);
        // Remove feedback after 2,5s
        removeFeedback(delay);
        return;
    }
    if (msg != undefined) {
        // Set URL in input field
        input.value = msg;
        toggleIntro(false);
        getData(msg)
            .then(data => {
            // Send data to code
            parent.postMessage({ pluginMessage: { type: 'received-data', content: data } }, '*');
            //Reset buttons
            temp = null;
            // Get keys from data
            temp = Object.keys(data);
            // Generate buttons for all keys
            temp.forEach(generateButtons);
            // Remove the loader
            toggleLoader(false);
            // This button fills out the remaining space after rendering all the working buttons
            const btn = document.createElement('button');
            btn.className = 'buttons__filler';
            document.getElementById('buttons').appendChild(btn);
        })
            .catch(reason => {
            // Hide loader, intro and show feedback
            toggleLoader(false);
            showFeedback(`Can't show data. Check if URL is correct or if JSON has errors.`);
            // Remove feedback after 2,5s
            removeFeedback(delay);
            // Show intro
            setTimeout(() => {
                toggleIntro(true);
            }, delay);
        });
    }
};
function generateButtons(val) {
    // If not visible, make visible again
    buttons.classList.remove('invisible');
    // Create let that contains button, set some properties/attributes to this button
    let button = document.createElement('button');
    button.innerHTML = capFirstLetter(val);
    button.id = val;
    button.className = 'button button__main';
    // Onclick send a nmessage stating the value of the button
    button.onclick = () => {
        parent.postMessage({
            pluginMessage: {
                type: 'replace-text',
                content: val,
                sorting: sortation.value.toLowerCase()
            }
        }, '*');
    };
    // Place the button on a element with the id 'buttons'
    buttons.appendChild(button);
}
function getData(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = yield (yield fetch(url)).json();
        if (!data) {
            toggleLoader(false);
            showFeedback(`Error, couldn't retrieve data`);
        }
        else {
            return data;
        }
    });
}
function capFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function toggleLoader(show) {
    if (show === true) {
        loader.classList.remove('invisible');
    }
    else {
        loader.classList.add('invisible');
    }
}
// ToDo: Rewrite this stuff to 1 method for showing feedback
function showFeedback(str) {
    if (str) {
        feedback.innerHTML = str;
        buttons.classList.add('invisible');
        feedback.classList.remove('invisible');
    }
}
function removeFeedback(length) {
    setTimeout(function () {
        buttons.classList.remove('invisible');
        feedback.classList.add('invisible');
    }, length);
}
function toggleIntro(show) {
    intro.classList.toggle('invisible', !show);
}
// Close plugin when cancel is clicked
document.getElementById('cancel').onclick = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*');
};
// Save JSON url on click
document.getElementById('save').onclick = () => __awaiter(void 0, void 0, void 0, function* () {
    toggleIntro(false);
    // Clear buttons div
    buttons.innerHTML = '';
    if (input.value) {
        toggleLoader(true);
        parent.postMessage({ pluginMessage: { type: 'set-url', content: input.value } }, '*');
    }
    else {
        showFeedback('No URL entered');
        removeFeedback(1500);
    }
});
// Initialize plugin
init();
