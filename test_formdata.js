
const fs = require('fs');

// Mock FormData
class MockFormData {
    constructor() { this.data = new Map(); }
    append(k, v) { this.data.set(k, v); }
    get(k) { return this.data.get(k); }
    toString() { return '[object FormData]'; }
}
global.FormData = MockFormData;

// Mock Window and Environment
const windowMock = {
    location: { href: 'https://www.torn.com/loader.php?sid=russianRoulette', hash: '' },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    sessionStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    document: {
        body: { classList: { contains: () => false }, appendChild: () => {}, insertBefore: () => {} },
        createElement: () => ({
            style: {},
            classList: { add:()=>{}, remove:()=>{} },
            appendChild:()=>{},
            querySelector:()=>({addEventListener:()=>{}})
        }),
        querySelector: () => ({
            addEventListener: () => {},
            insertBefore: () => {},
            closest: () => null,
            hasAttribute: () => false,
            setAttribute: () => {},
            parentNode: { appendChild: () => {}, insertBefore: () => {} },
            nextSibling: null,
            classList: { contains: () => false }
        }),
        querySelectorAll: () => [],
        head: { appendChild: () => {} },
        contains: () => false,
        cookie: "",
        getElementById: () => {
            return {
                addEventListener: () => {},
                style: {},
                classList: { add:()=>{}, remove:()=>{} },
                querySelector: () => ({ addEventListener: () => {} }),
                appendChild: () => {},
                innerHTML: "" // allow writing
            };
        }
    },
    addEventListener: () => {},
    LabTrackRunning: false,
    XMLHttpRequest: class {
        open() {}
        send() { if(this.onload) this.onload(); }
        addEventListener(e, fn) { if(e==='load') this.onload=fn; }
    },
    WebSocket: class { constructor(){this.listeners={}} addEventListener(e,f){this.listeners[e]=f} },
    fetch: async () => ({ clone: () => ({ text: async () => "" }), text: async () => "" }),
    ltDevTool: null // Will be overwritten
};
windowMock.unsafeWindow = windowMock;
global.window = windowMock;
global.document = windowMock.document;
global.localStorage = windowMock.localStorage;
global.sessionStorage = windowMock.sessionStorage;
global.unsafeWindow = windowMock;
global.navigator = { clipboard: { writeText: () => {} } };
global.MutationObserver = class { observe() {} disconnect() {} };

// Load Script
const scriptContent = fs.readFileSync('LabTrack_Controller_V7.04.user.js', 'utf8');
try { eval(scriptContent); } catch (e) { console.error(e); }

async function runTest() {
    console.log("\n--- TEST: Fetch with FormData ---");
    const integration = window.LabTrackIntegration;
    if (!integration) { console.error("Integration fail"); return; }
    integration.myId = 12345;

    // Check DevTool Logs
    const checkLogs = () => {
        const logs = window.ltDevTool.netLogs;
        const lastLog = logs[0];
        console.log("Last Log:", lastLog ? `[${lastLog.tag}] ${lastLog.msg}` : "None");
        return logs.some(l => l.tag === 'RESET' && l.msg.includes('New Bet detected'));
    };

    const fd = new MockFormData();
    fd.append('sid', 'russianRouletteData');
    fd.append('amount', '2000000');

    console.log("Sending fetch with FormData...");
    await window.fetch('russianRouletteData.php', { body: fd });

    await new Promise(r => setTimeout(r, 100));

    if (checkLogs()) {
        console.log("PASS: Reset log found.");
    } else {
        console.log("FAIL: Reset log NOT found.");
    }
}

runTest();
