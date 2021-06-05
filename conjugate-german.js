window.lorygoth = {
    ...(window.lorygoth || {}),
    goconjugator: () => {
        const verb = prompt('Enter german verb to conjugate:');
        if (!verb) return;
        window.location.href = `https://conjugator.reverso.net/conjugation-german-verb-${verb}.html`;
    }
};

//example bookmarklet//

/*
javascript:(function(){
    const originalScriptUrl = 'https://raw.githubusercontent.com/Lorygoth/bookmarklets/main/conjugate-german.js';
    const scriptLoadedLogic = () => { window.lorygoth.goconjugator(); };
    if (window.lorygoth && window.lorygoth.goconjugator) {
        scriptLoadedLogic();
        return;
    }
    
    const script = document.createElement('script');
    script.onload = scriptLoadedLogic;
    script.type="text/javascript";
    script.src = originalScriptUrl
        .replace(/raw\.githubusercontent\.com\/(.*)\/[^\/]+\/([^\/]+\.js)$/, 'cdn.jsdelivr.net/gh/$1@latest/$2');
    document.body.appendChild(script);
})();
*/
