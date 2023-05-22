const raiseHandSelector = '[aria-label="Raise hand (Ctrl + ⌘ + h)"]';
const sendReactionSelector = '[aria-label="Send a reaction"]';
const openReactionsSelector = '[aria-label="👍"]';

const RAISE_HAND_EVENT_TYPE = 'raiseHandStateChange';

const strToBool = (value) => value === 'true';

function waitForElement(selector) {
    return new Promise(resolve => {
        if (document.querySelector(selector)) {
            return resolve(document.querySelector(selector));
        }

        const observer = new MutationObserver(mutations => {
            if (document.querySelector(selector)) {
                resolve(document.querySelector(selector));
                observer.disconnect();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
}

const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        const event = new CustomEvent(RAISE_HAND_EVENT_TYPE, { detail: { pressed: strToBool(mutation.target.getAttribute('aria-pressed')) } });
        const raiseHandButton = document.querySelector(raiseHandSelector);
        if (raiseHandButton) {
            raiseHandButton.dispatchEvent(event);
        }
    });
});

function fixTheMeet() {
    const state = {
        handWasRaised: false,
        reactionsActive: !!document.querySelector(openReactionsSelector),
    }

    const reactionsButton = document.querySelector(sendReactionSelector);
    const raiseHandButton = document.querySelector(raiseHandSelector);

    const onHandRaise = (e) => {
        if (state.handWasRaised) {
            state.handWasRaised = false;
            return true;
        }

        if (state.reactionsActive) {
            return true;
        }


        if (confirm('Did you mean to raise the hand?')) {
            state.handWasRaised = true;
            return true;
        }

        e.stopImmediatePropagation();

        if (!state.reactionsActive && confirm("Did you mean to open 💖 👍 🎉 👏 😂 😮?")) {
            reactionsButton.click();
            return false;
        }

        return false;
    };

    const onHandRaiseStateChange = (handWasRaised) => {
        state.handWasRaised = handWasRaised;
    }

    raiseHandButton.addEventListener(RAISE_HAND_EVENT_TYPE, function (e) {
        if (typeof e.detail.pressed !== 'undefined') {
            onHandRaiseStateChange(e.detail.pressed);
        }
    });
    raiseHandButton.addEventListener('click', (e) => onHandRaise(e), false);
    reactionsButton.addEventListener('click', function () {
        state.reactionsActive = !state.reactionsActive;

        return true;
    });

    observer.observe(raiseHandButton, {
        attributes: true,
        attributeFilter: ['aria-pressed']
    });
}

function main() {
    waitForElement(raiseHandSelector).then(() => {
        fixTheMeet();
    });
}

window.addEventListener ("load", main, false);
