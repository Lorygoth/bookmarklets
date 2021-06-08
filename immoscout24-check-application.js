window.lorygoth = {
    ...(window.lorygoth || {}),
    checkImmoscoutApplication: () => {
        const enableLogging = false;
        const log = msg => enableLogging && console.log(msg);
        const textFormat = {
            bold: s => !s ? s : [...s]
                .map(x =>
                    /[A-Z]/.test(x) && [x, "𝗔", "A"] ||
                    /[a-z]/.test(x) && [x, "𝗮", "a"] ||
                    /\d/.test(x) && [x, "𝟬", "0"] ||
                    [x, x, x])
                .map(x => x.map(s => s.codePointAt(0)))
                .map(x => String.fromCodePoint(x[0] + x[1] - x[2]))
                .join(''),
            underline: s => !s ? s : [...s].join('\u0332') + '\u0332',
            zeroPad: (value, places) => String(value).padStart(places, '0')
        /* underline('hello world') => "h̲e̲l̲l̲o̲ ̲w̲o̲r̲l̲d̲" */
        };
        const abortDict = {};
        const helpFuncs = {
        doOnCondition: (conditionCheckAction, action, checkEveryMs = 100, abortAction = null, abortAfterMs = 1000) => {
            log(`dooncondition for: ${conditionCheckAction}`);
            if (!(conditionCheckAction in abortDict)) {
                abortDict[conditionCheckAction] = new Date().getTime();
            } else {
            if (new Date().getTime() - abortDict[conditionCheckAction] >= abortAfterMs) {
                log(`dooncondition abort for: ${conditionCheckAction}`);
                if (abortAction)
                abortAction();
                return;
            }
            }

            log(`${JSON.stringify(resultInfo, null, 2)}`);
            if (conditionCheckAction() == false) {
            log(`dooncondition reschedule action for: ${conditionCheckAction}`);
            window.setTimeout(
                () => helpFuncs.doOnCondition(conditionCheckAction, action, checkEveryMs, abortAction, abortAfterMs),
                checkEveryMs);
            } else {
            log(`dooncondition action for: ${conditionCheckAction}`);
            action();
            }
        },
        formatDate: dt => `${dt.getYear() + 1900}.${textFormat.zeroPad(dt[1], 2)}.${textFormat.zeroPad(dt[2], 2)}`,
        };

        const resultInfo = {
        skip: false,
        route: false,
        availability: false,
            address: false,
            noChance: false,
        };
        helpFuncs.doOnCondition(
            () => resultInfo.route && resultInfo.availability && resultInfo.address || resultInfo.skip,
            () => {
                    if (resultInfo.skip) {
                        alert(`Не подходит: ${textFormat.underline(resultInfo.skip)}`);
                        return;
                    }

                    const hours = Math.floor(resultInfo.route / 60);
                    const minutes = resultInfo.route % 60;
                    const timeArr = [];
                    if (hours) {
                        timeArr.push(`${hours}ч`);
                    }
                    if (minutes) {
                        timeArr.push(`${minutes}мин`);
                    }
                    const output = [
                        `Самый долгий маршрут: ${timeArr.join(' ')}`,
                        `${resultInfo.availability}`,
                        `Адрес: ${resultInfo.address}`
                    ];

                    if (resultInfo.noChance) output.push(textFormat.underline('Уже много кто посмотрел'));
                    alert(output.join('\r'));
                },
            100,
            () => {
                alert(`timeout ${JSON.stringify(resultInfo, null, 2)}`);
            },
        5000);
		
        /* add this page as already viewed to collapse it in the search result list */
        const lsDataKey = 'resultlist';
        const data = JSON.parse(localStorage[lsDataKey] || JSON.stringify({ hiddenEntries: [] }))
        const applicationId = Number(window.location.href.match(/\/(\d+)\?/)[1]);
        if (!data.hiddenEntries.includes(applicationId)) data.hiddenEntries.push(applicationId);
        localStorage[lsDataKey] = JSON.stringify(data);

        /*************/
        /*COMPETITORS*/
        /*************/
        // we have to scroll to the element, because it won't load required data before user sees the html element
        document.querySelector('[class*=premiumStatsFixedHeight]').scrollIntoView();
        helpFuncs.doOnCondition(
            () => document.querySelector('[class*=recommendationBarNew]'),
            () => {
                resultInfo.noChance = [...document.querySelectorAll('[class*=statsBoxAmount_1]')]
                    .map(x => x.textContent)
                    .filter(x => x.match(/^\d+$/))
                    .map(x => Number(x))
                    .some(x => x > 0);
                window.scrollTo(0, 0);
            },
            50, null, 2000);
        /**************/
        /*~COMPETITORS*/
        /**************/


        /*********/
        /*ADDRESS*/
        /*********/
        const addressBlock = document.querySelector('[class*=address-block]>div>span');
        const notDefinedAddressClass = 'zip-region-and-country';
        if (!addressBlock || addressBlock.className == notDefinedAddressClass) {
            resultInfo.address = textFormat.underline('Указан не полностью');
        }
        else {
            resultInfo.address = addressBlock.textContent.trim().replace(/^,/g, '').replace(/,$/g, '');
        }
        /**********/
        /*~ADDRESS*/
        /**********/

        /*******/
        /*ROUTE*/
        /*******/
        const routeBtn = document
            .querySelector('[class*=travelTimeRecalculateContainer]>button');
        if (routeBtn) routeBtn.click();
        helpFuncs.doOnCondition(
            () => !document.querySelector('[class*=travelTimeRecalculateContainer_]'),
            () => {
                const routeDurations = [...document.querySelectorAll('[class*=address_]')]
                    .map(x => x.childNodes[1].textContent.trim());
                /* format is 'Nh N min.'*/
                const regexp = /(\d+\s?h)?\s?(\d+)\smin\./;
                const maxDuration = routeDurations
                    .map(d => d.match(regexp).slice(1))
                    .map(arr => {
                        let hours = 0;
                        if (arr[0]) {
                           hours = Number(arr[0].substr(0, arr[0].length - 1).trim());
                        }
                        let minutes = Number(arr[1]) + 60 * hours;
                        return minutes;
                    })
                    .reduce((p, n) => n > p ? n : p);
                if (maxDuration > 70) resultInfo.skip = 'Слишком долгий маршрут.'; 
                    resultInfo.route = maxDuration;
        });
        /********/
        /*~ROUTE*/
        /********/

        /**************/
        /*AVAILABILITY*/
        /**************/
        const availableFrom_Name = 'Bezugsfrei ab';
        const availableFromParentEl = [...document.querySelectorAll('[class*=criteria-group--two-columns]>dl')]
            .map(x => [...x.childNodes])
            .find(x => {
                const dt = x.find(node => node.tagName == 'DT');
                return dt && dt.textContent == availableFrom_Name;
        });
        (() => {
            if (!availableFromParentEl || !availableFromParentEl
                .find(x => x.tagName == 'DD')) {
                resultInfo.availability = 'Не найден раздел с датой въезда';
                return;
            }

            const availableFrom = availableFromParentEl
                .find(x => x.tagName == 'DD');
            const availableFromText = (availableFrom.textContent || '').trim().toLowerCase();
            const okTexts = ['sofor'];
            if (availableFromText in okTexts || okTexts.some(x => availableFromText.includes(x))) {
                resultInfo.availability = 'Доступна сейчас';
                return;
            }

            const lookBeforeDate = new Date(2021, 8, 1).getTime();
            const monthsDict = {
                January: 1,
                Januar: 1,
                February: 2,
                Februar: 2,
                March: 3,
                März: 3,
                April: 4,
                May: 5,
                Mai: 5,
                June: 6,
                Juni: 6,
                July: 7,
                Juli: 7,
                August: 8,
                September: 9,
                October: 10,
                Oktober: 10,
                November: 11,
                December: 12,
                Dezember: 12
            };
            const regexToTest = [
                {
                    expression: /(\d{2}).(\d{2}).(\d{4})/,
                    callback: matches => new Date(Number(matches[2]), Number(matches[1]), Number(matches[0]))
                },
                {
                    expression: /(\d{2}).(\d{4})/,
                    callback: matches => new Date(Number(matches[1]), Number(matches[0]), 1)
                },
                {
                    expression: /(\d{2}).(\d{2}).(\d{2})/,
                    callback: matches => new Date(Number(matches[2]) + 2000, Number(matches[1]), Number(matches[0]))
                },
                {
                    expression: /(\d{1}).(\d{1}).(\d{2})/,
                    callback: matches => new Date(Number(matches[2]) + 2000, Number(matches[1]), Number(matches[0]))
                },
                {
                    expression: /(\d{1}).(\d{2}).(\d{2})/,
                    callback: matches => new Date(Number(matches[2]) + 2000, Number(matches[1]), Number(matches[0]))
                },
                {
                    expression: /(\d{2}).(\d{1}).(\d{2})/,
                    callback: matches => new Date(Number(matches[2]) + 2000, Number(matches[1]), Number(matches[0]))
                },
                {
                    expression: /(\w+)\s+(\d{4})/gi,
                    callback: matches => {
                        if (!(matches[0] in monthsDict)) return null;
                        return new Date(Number(matches[1]), monthsDict[matches[0]], 1);
                    }
                },
                {
                    expression: /(\w+)\s+(\d{2})/gi,
                    callback: matches => {
                        if (!(matches[0] in monthsDict)) return null;
                        return new Date(Number(matches[1]) + 2000, monthsDict[matches[0]], 1);
                    }
                }
            ];

            let result = null;
            for (const value of regexToTest){
                let matches = availableFromText.match(value.expression);
                if (matches === null) continue;

                result = value.callback.output(matches.slice(1));
            }

            if (!result) {
                resultInfo.availability = `Не удалось распознать дату: ${availableFromText}`;
                return;
            }

            if (result.getTime() >= lookBeforeDate) {
                resultInfo.skip = `Доступно только с ${helpFuncs.formatDate(result)}`;
                return;
            }

            resultInfo.availability = `Доступно с ${formatDate(matches)}`;
        })();
        /***************/
        /*~AVAILABILITY*/
        /***************/
    }
};

//example bookmarklet//

/*
javascript:(function(){
    const originalScriptUrl = 'https://raw.githubusercontent.com/Lorygoth/bookmarklets/main/immoscout24-check-application.js';
    const scriptLoadedLogic = () => { window.lorygoth.checkImmoscoutApplication(); };
    if (window.lorygoth && window.lorygoth.checkImmoscoutApplication) {
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
