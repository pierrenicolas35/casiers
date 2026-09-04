async function testFormUrl() {
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxJbRz5Ru4w1f7TSkL8Vi2owWELHNew11szMCuQMnVyioybZd75ScwqwQ662KZAiBn_/exec', {
            method: 'POST',
            body: JSON.stringify({id_casier: "C-1", statut_casier: "Libre", statut_occupant: "", nom_occupant: ""}),
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            redirect: 'follow'
        });
        const text = await response.text();
        console.log("Response:", text.substring(0, 300));
    } catch(e) {
        console.error(e);
    }
}
testFormUrl();
