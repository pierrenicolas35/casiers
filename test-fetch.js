fetch('https://script.google.com/macros/s/AKfycbxJbRz5Ru4w1f7TSkL8Vi2owWELHNew11szMCuQMnVyioybZd75ScwqwQ662KZAiBn_/exec', {
    method: 'POST',
    body: JSON.stringify({id_casier: "C-1", statut_casier: "Libre", statut_occupant: "", nom_occupant: ""}),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }
}).then(r => console.log(r.status)).catch(e => console.error(e));
