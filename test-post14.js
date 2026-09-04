async function testFormUrl() {
    const data = new URLSearchParams();
    data.append('id_casier', 'C-1');
    data.append('statut_casier', 'Libre');

    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbxJbRz5Ru4w1f7TSkL8Vi2owWELHNew11szMCuQMnVyioybZd75ScwqwQ662KZAiBn_/exec', {
            method: 'POST',
            body: data,
            redirect: 'follow'
        });
        const text = await response.text();
        console.log("Response:", text.substring(0, 300));
    } catch(e) {
        console.error(e);
    }
}
testFormUrl();
