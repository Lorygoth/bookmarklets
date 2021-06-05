# bookmarklets
Useful bookmarklets for (almost) everyday usage

# Scripts usage
1: Get github script raw url

2: Use it as a value for `originalScriptUrl` like this in your new bookmarklet and define proper logic:

```javascript
javascript:(function(){
  const originalScriptUrl = 'https://raw.githubusercontent.com/UserName/ProjectName/BranchName/script.js';
  const scriptLoadedLogic = () => { /*do things here*/ };

  const script = document.createElement('script');
  script.onload = scriptLoadedLogic;
  script.type="text/javascript";
  script.src = originalScriptUrl
    .replace(/raw\.githubusercontent\.com\/(.*)\/[^\/]+\/([^\/]+\.js)$/, 'cdn.jsdelivr.net/gh/$1@latest/$2');
  document.body.appendChild(script);
})();
```

Thanks for a solution: https://stackoverflow.com/a/18049842
