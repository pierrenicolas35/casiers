const { performance } = require('perf_hooks');

async function run() {
    const start = performance.now();
    try {
        await fetch('https://script.google.com/macros/s/AKfycbxJbRz5Ru4w1f7TSkL8Vi2owWELHNew11szMCuQMnVyioybZd75ScwqwQ662KZAiBn_/exec', {
            method: 'POST',
            body: JSON.stringify({id_casier: "C-1", statut_casier: "Libre", statut_occupant: "", nom_occupant: ""}),
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        });
    } catch (e) {}
    console.log("Fetch with default (cors):", performance.now() - start);

    const start2 = performance.now();
    try {
        await fetch('https://script.google.com/macros/s/AKfycbxJbRz5Ru4w1f7TSkL8Vi2owWELHNew11szMCuQMnVyioybZd75ScwqwQ662KZAiBn_/exec', {
            method: 'POST',
            body: JSON.stringify({id_casier: "C-1", statut_casier: "Libre", statut_occupant: "", nom_occupant: ""}),
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8',
            }
        });
    } catch (e) {}
    console.log("Fetch with no-cors:", performance.now() - start2);
}
run();
