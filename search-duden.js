window.lorygoth = {
    ...(window.lorygoth || {}),
    goduden: () => {
        const verb = prompt('Enter word to search by duden:');
        if (!verb) return;
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
        .replace(/raw\.githubusercontent\.com\/(.*)\/[^\/]+\/([^\/]+\.js)$/, 'cdn.jsdelivr.net/gh/$1/$2');
    document.body.appendChild(script);
})();
*/
