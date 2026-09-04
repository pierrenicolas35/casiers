const fetch = require('node-fetch'); // wait I can use node 22 fetch
async function testFormUrl() {
    console.log("Testing FormUrl...");
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxJbRz5Ru4w1f7TSkL8Vi2owWELHNew11szMCuQMnVyioybZd75ScwqwQ662KZAiBn_/exec', {
            method: 'POST',
            body: new URLSearchParams({id_casier: "C-1", statut_casier: "Libre", statut_occupant: "", nom_occupant: ""}),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        const text = await response.text();
        console.log("FormUrl response:", response.status, text.substring(0, 100));
    } catch(e) {
        console.error(e);
    }
}
testFormUrl();
