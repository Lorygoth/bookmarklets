javascript: (function () {
    const verb = prompt('Enter word to search by duden:');
    window.location.href = `https://www.duden.de/rechtschreibung/${verb}`;
})();
