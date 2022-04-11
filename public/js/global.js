const flashMessage = document.querySelector('.flash-message');

window.addEventListener('load', e=>{
    const qparams = new URLSearchParams(window.location.search);
    qparams.delete('no-cache');
    window.history.replaceState({}, 'REMOVE NO-CACHE PARAM', window.location.pathname+(qparams.toString()?('?'+qparams.toString()):''));
})

window.addEventListener('click', e => {
    if (e.target !== flashMessage && flashMessage.classList.contains('active')) {
        flashMessage.classList.remove('active');
    }
})

async function logOut(csrfToken) {
    try {
        const res = await fetch('/logout', {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'DELETE',
            body: JSON.stringify({csrfToken})
        });
        const json = await res.json();
        if ('error' in json) {
            flashMessage.textContent = json.error;
            flashMessage.classList.add('error');
            flashMessage.classList.add('active');
            return;
        }
        flashMessage.textContent = json.success;
        flashMessage.classList.add('success');
        flashMessage.classList.add('active');
        window.location.href = json.redirect + '?no-cache=' ;
    } catch (err) {
        console.error(err);
        alert('Terjadi Kesalahan.');
    }
}