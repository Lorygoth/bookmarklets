window.lorygoth = {
    ...(window.lorygoth || {}),
    goduden: () => {
        let verb = prompt('Enter word to search by duden:');
        if (!verb) return;
        const firstIsCapital = verb.charAt(0) === verb.charAt(0).toUpperCase();
        verb = verb.toLowerCase();
        const dict = {
            ü: 'ue',
            ö: 'oe',
            ä: 'ae',
            ß: 'sz'
        };
        for (key of Object.keys(dict)) {
            verb = verb.replace(key, dict[key]);
        }

        if (firstIsCapital) {
            verb = verb.charAt(0).toUpperCase() + verb.slice(1);
        }

        window.location.href = `https://www.duden.de/rechtschreibung/${verb}`;
    }
};

//example bookmarklet//

/*
javascript:(function(){
    const originalScriptUrl = 'https://raw.githubusercontent.com/Lorygoth/bookmarklets/main/search-duden.js';
    const scriptLoadedLogic = () => { window.lorygoth.goduden(); };

    if (window.lorygoth && window.lorygoth.goduden) {
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