let thresholdValue = 80;

const buttons = ["left", "middle", "right", "backward", "forward"].map(
    (button) => ({
        name: button.charAt(0).toUpperCase() + button.slice(1),
        elements: {
            totalDown: document.querySelector(`.down > .${button}`),
            totalUp: document.querySelector(`.up > .${button}`),
            totalDoubleDown: document.querySelector(`.double > .${button}`),
            minDownDownDelta: document.querySelector(`.down-down-delta > .${button}`),
            minDownUpDelta: document.querySelector(`.down-up-delta > .${button}`),
        },
        totalDown: 0,
        totalUp: 0,
        totalDoubleDown: 0,
        minDownDownDelta: Infinity,
        minDownUpDelta: Infinity,
        lastDownTimeStamp: 0,
        first: true,
    })
);

function handleMousedown(ev) {
    const button = buttons[ev.button];

    if (!button.first) {
        const delta = ev.timeStamp - button.lastDownTimeStamp;

        if (delta < thresholdValue) {
            button.elements.totalDoubleDown.textContent = ++button.totalDoubleDown;

            if (button.totalDoubleDown === 1) {
                button.elements.totalDoubleDown.classList.add("warning");
            }
        }

        if (delta < button.minDownDownDelta) {
            button.elements.minDownDownDelta.textContent = delta.toFixed(1);
            button.minDownDownDelta = delta;
        }

        console.log(
            `%c${button.name.padEnd(8)} | Down - Down Δ | ${delta
                .toFixed(1)
                .padStart(7)} ms`,
            "color: black; background-color: white"
        );
    }

    button.first = false;

    button.elements.totalDown.textContent = ++button.totalDown;
    button.lastDownTimeStamp = ev.timeStamp;

    document.getElementById(`mouse-${ev.button}`).classList.add('active');
    document.getElementById(`mouse-${ev.button}`).classList.add('visited');
}

function handleMouseup(ev) {
    const button = buttons[ev.button];
    const delta = ev.timeStamp - button.lastDownTimeStamp;

    if (delta < button.minDownUpDelta) {
        button.elements.minDownUpDelta.textContent = delta.toFixed(1);
        button.minDownUpDelta = delta;
    }

    console.log(
        `%c${button.name.padEnd(8)} | Down - Up   Δ | ${delta
            .toFixed(1)
            .padStart(7)} ms`,
        "color: white; background-color: black"
    );

    button.elements.totalUp.textContent = ++button.totalUp;

    document.getElementById(`mouse-${ev.button}`).classList.remove('active');
    document.getElementById(`mouse-${ev.button}`).classList.add('visited');
}

interaction.addEventListener("mousedown", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    handleMousedown(ev);
});

interaction.addEventListener("mouseup", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    handleMouseup(ev);
});

interaction.addEventListener("auxclick", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (ev.button === 3 || ev.button === 4) {
        handleMousedown(ev);
        handleMouseup(ev);
    }
});

let totalScrollUp = 0;
let totalScrollDown = 0;

let wheelEvent;
interaction.addEventListener("wheel", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (ev.wheelDeltaY > 0) {
        scrollUp.textContent = ++totalScrollUp;
        document.getElementById('wheel-down').classList.add('visited');
        document.getElementById('wheel-down').classList.add('active');
    } else if (ev.wheelDeltaY < 0) {
        scrollDown.textContent = ++totalScrollDown;
        document.getElementById('wheel-up').classList.add('visited');
        document.getElementById('wheel-up').classList.add('active');
    }

    if (!wheelEvent) {
        wheelEvent = setTimeout(() => {
            document.getElementById('wheel-up').classList.remove('active');
            document.getElementById('wheel-down').classList.remove('active');
            wheelEvent = null;
        }, 200);
    }
});

let counts = 0;
let lastRefresh = performance.now();

interaction.addEventListener("pointermove", (ev) => {
    counts += ev.getCoalescedEvents().length;
    const delta = ev.timeStamp - lastRefresh;

    if (delta >= 1000) {
        pollingRate.textContent = Math.round((counts * 1000) / delta);
        counts = 0;
        lastRefresh = ev.timeStamp;
    }
});

window.addEventListener("contextmenu", (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    return false;
});

function resetTestData() {
    buttons.forEach((button) => {
        button.totalDown = 0;
        button.totalUp = 0;
        button.totalDoubleDown = 0;
        button.minDownDownDelta = Infinity;
        button.minDownUpDelta = Infinity;
        button.lastDownTimeStamp = 0;
        button.first = true;

        button.elements.totalDown.textContent = '0';
        button.elements.totalUp.textContent = '0';
        button.elements.totalDoubleDown.textContent = '0';
        button.elements.minDownDownDelta.textContent = '';
        button.elements.minDownUpDelta.textContent = '';
        button.elements.totalDoubleDown.classList.remove('warning');
    });

    totalScrollUp = 0;
    totalScrollDown = 0;
    scrollUp.textContent = '0';
    scrollDown.textContent = '0';
    pollingRate.textContent = '-';

    document.querySelectorAll('#mouse polygon, #mouse path').forEach(el => {
        el.classList.remove('active', 'visited');
    });
}

const testPage = document.getElementById('interaction');
const adPage = document.getElementById('ad-page');
const navItems = document.querySelectorAll('.nav-item');

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        const page = item.getAttribute('data-page');
        if (!page) return;

        e.preventDefault();

        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');

        if (page === 'test') {
            resetTestData();
            testPage.style.display = 'block';
            adPage.style.display = 'none';
        } else if (page === 'ad') {
            testPage.style.display = 'none';
            adPage.style.display = 'block';
        }
    });
});
