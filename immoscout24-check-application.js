javascript: (function () {
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
		underline: s => !s ? s : [...s].join('\u0332') + '\u0332'
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
        formatDate: dt => `${dt[0]}.${dt[1]}.${dt[2]}`,
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
		
	/*************/
    /*COMPETITORS*/
    /*************/
	resultInfo.noChance = [...document.querySelectorAll('[class*=statsBoxAmount_1]')]
		.map(x => x.textContent)
		.filter(x => x.match(/^\d+$/))
		.map(x => Number(x))
		.some(x => x > 0);
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
    if (routeBtn)
        routeBtn.click();
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
        const dateRegexp = /(\d{2}).(\d{2}).(\d{4})/;
        const matches = availableFromText.match(dateRegexp).slice(1);
		const formatDate = arr => helpFuncs.formatDate(arr.reverse());
        if (matches.length != 3) {
            const shortDateRegexp = /(\d{2}).(\d{4})/;
            const shortMatches = availableFromText.match(shortDateRegexp).slice(1);
            if (matches.length != 2) {
                resultInfo.availability = `Не удалось распознать дату: ${availableFromText}`;
                return;
            }

            const shortDt = new Date(shortMatches[1], shortMatches[0], 1);
            if (shortDt.getTime() >= lookBeforeDate) {
				console.log(`dt1: ${shortMatches};;;${shortDt}`);
                resultInfo.skip = `Доступно только с ${formatDate([...shortMatches, '01'])}`;
                return;
            }
        }

        const dt = new Date(matches[2], matches[1], matches[0]);
        if (dt.getTime() >= lookBeforeDate) {
			console.log(`dt2: ${matches};;;${dt}`);
            resultInfo.skip = `Доступно только с ${formatDate(matches)}`;
            return;
        }

        resultInfo.availability = `Доступно с ${formatDate(matches)}`;
    })();
    /***************/
    /*~AVAILABILITY*/
    /***************/
})();
