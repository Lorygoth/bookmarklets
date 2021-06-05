# bookmarklets
Useful bookmarklets for (almost) everyday usage

# Scripts usage
1: Get github script raw url

2: Use it as a value for `originalScriptUrl` like this in your new bookmarklet:

```javascript
const originalScriptUrl = 'https://raw.githubusercontent.com/UserName/ProjectName/BranchName/script.js';
const script = document.createElement('script');
script.onload = () => { /*do things here*/ };
script.type="text/javascript";
script.src = 'https://cdn.jsdelivr.net/gh/Lorygoth/bookmarklets/search-duden.js'
  .replace('raw.githubusercontent.com', 'cdn.jsdelivr.net/gh')
  .replace(/\/\w+(\/\w+\.js)/, '$1');
document.body.appendChild(script);
```

Thanks for a solution: https://stackoverflow.com/a/18049842
