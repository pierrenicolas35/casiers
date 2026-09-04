async function run() {
    const names = ['sheet', 'sheetName', 'sheet_name', 'nom_feuille', 'feuille', 'tab', 'nomFeuille', 'SheetName', 'Sheet'];
    for (const name of names) {
        const payload = {
            id_casier: "C-1",
            statut_casier: "Libre",
            statut_occupant: "",
            nom_occupant: ""
        };
        payload[name] = "Listing casier";

        const response = await fetch('https://script.google.com/macros/s/AKfycbxJbRz5Ru4w1f7TSkL8Vi2owWELHNew11szMCuQMnVyioybZd75ScwqwQ662KZAiBn_/exec', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            redirect: 'follow'
        });
        const text = await response.text();
        if (!text.includes('TypeError')) {
            console.log("SUCCESS with property:", name);
            console.log(text.substring(0, 100));
            return;
        }
    }
    console.log("All failed.");
}
run();
