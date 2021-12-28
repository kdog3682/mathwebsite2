function vuetify(x) {
    if (arguments.length == 2) {
        Vue.prototype[arguments[0]] = new arguments[1]()
        return 
    }
    return isDirective(x) ? vuetifyDirective(x) : vuetifyFunction(x)
}

function isDirective(x) {
    return getFirstParameter(x).startsWith('el')
}


function vuetifyDirective(fn) {

    function shortened(fn) {
        function directive(el, binding, node) {
            try {
                if (binding.value) {
                    fn(el, binding.value)
                }
            }
            catch(e) {
                console.log('error @ directive', e)
                console.log(binding)
            }
        }
        return directive
    }

    function create(fn) {
        return test(/^.*?binding/, fn.toString()) ? fn : shortened(fn)
    }
    
    const name = fn.name.replace(/^v/, '')

    if (fn.name.includes('onlyInserted')) {
        Vue.directive(name, {inserted: create(fn)})
        return 
    }

    const payload = {inserted: create(fn), update: create(fn)}
    Vue.directive(name, payload)
}

function vuetifyFunction(fn) {
    const payload = isClass(fn) ? new fn() : fn
    let name = test(/^\$?(?:toggle|to|is|has|get|set|aasfasdfsdf)/, fn.name) ? 
        fn.name : fn.name.toLowerCase()
    if (!name.startsWith('$')) name = '$' + name
    if (isClass(fn)) name = '$' + abbreviate(payload.constructor.name)
    Vue.prototype[name] = payload
}



// start of css

function createVue(component, id = 'vue') {
    createElement('div', {id, className: id + '-container'}, create('body'))
    return new Vue(component).$mount('#' + id)
}


function webloader(key) {

    const scriptlibrary = {
        'vue': ['vue.js', 'vuex.js', 'vuerouter.js'],
        'prettier': ['standalone.js', 'parser-html.js', 'parser-babel.js'],
        'katex': ['katex.min.js', 'katex.min.css'],
        'Vue': ['vue.js'],
        'codemirror': ['codemirror.js', 'codemirror.css', 'codemirror.docs.css'],
        'quill': ['quill.js'],
        'nerdamer': ['nerdamer.js'],
        'self': ['questiongenerator.js'],
        'jshint': ['jshint.js'],
        'controller': ['element-controller.js', 'ec.css'],
    }

    if (!window.hasOwnProperty(key)) {
        console.log('loading', key, scriptlibrary[key])
        return forEach(scriptlibrary[key], load)
    }

    function load(x) {
        switch (getExtension(x)) {
            case 'css': return createElement('link',   {href: x, rel: 'stylesheet'}, document.head)
            case 'js':  return createElement('script', {src: x, charset: 'utf8'},    document.head)
            default:    return createElement('script', {src: x, charset: 'utf8'},    document.head)
        }
    }
}



function create(key) {
    if (key == 'body') {
        if (document.body) {
             //console.log('hi doc body exists')
        }

        return document.body ? 
            document.body : 
            document.documentElement.appendChild(document.createElement('body'))
    }
}


function createElement(tag = 'div', options = null, parent = document.body) {
    const element = document.createElement(tag)
    if (options) Object.assign(element, options)
    parent.appendChild(element)
    return element
}




function download(file, content) {
    if (!exists(content)) return 

    if (isJson(file)) {
        content = stringify(content)
    }
    else {
        switch (typed(content)) {
            case 'Object': 
            case 'Storage': 
                content = joined(Object.values(content)); break;
            case 'Array': 
                content = joined(content); break;
        }
    }

    const element = createElement('a', {
        href: 'data:text/plain;charset=utf-8,' + encodeURIComponent(content),
        download: file,
    })

    element.click()
    element.remove()
}


function setStorage(key, value = '') {
    if (!exists(value)) return 
    console.log('setting storage', value)
    localStorage.setItem(key, stringify(value))
}


function getBoundingClientRect(element) {
    const {height, width, top, left} = element.getBoundingClientRect()
    return {
        height: height + 'px',
        width: width + 'px',
        left: left + 'px',
        top: top + 'px',
    }
}

function getKeyArg(e) {
    let key = e.key || e
    let arg = ''
    if (e.ctrlKey) arg += 'ctrl-'
    if (e.altKey) arg += 'alt-'
    arg += key
    return arg
}

function isTypable(e) {
    if (e.altKey || e.ctrlKey) return 
    let s = e.key
    return s.length == 1 || s == ''
}



function prettify(s) {

    webloader('prettier')

    const prettierRef = {
        js: {
            parser: 'babel',
            plugins: prettierPlugins,
            arrowParens: 'always',
            bracketSpacing: true,
            printWidth: 100,
            tabWidth: 4,
            semi: false,
            singleQuote: true,
        },
        html: {
            parser: 'html',
            plugins: prettierPlugins,
        }
    }

    return prettier.format(s, prettierRef[inferlang(s)])
}


function getWindowFunctions(fn = identity) {
    const asArray = getParameters(fn.toString()).length == 2
    const filtration = asArray ? (x) => fn(...x) : (x) => fn(x[0])
    return Object.entries(window).filter(filtration).map((item, i) => item[1])
}



function preventDefaultFactory() {
    
    let shiftKey
    let ctrlKey

    function preventDefault(e) {
        if (e.shiftKey && e.key == '') {
            shiftKey = true
            return 
        }

        if (e.ctrlKey && e.key == '') {
            ctrlKey = true
            return 
        }

        if (e.shiftKey && e.ctrlKey) {
            return 
        }

        if (isString(e)) return 
        if (ctrlKey && test(/[abcdefg]/, e.key)) e.preventDefault()
        if (ctrlKey && test(/[i-+]/, e.key)) {
            return 
        }

        ctrlKey = false
        shiftKey = false
        if (e.srcElement != document.body) return 
        const allowDefault = ['F5', 'r', 'F1', 'F2']
        if (allowDefault.includes(e.key)) return 
        e.preventDefault()
    }
    return preventDefault
}




function clearStorage(key) {
    
    if (!key) {
        console.log('clearing all storage items')
        localStorage.clear()
    }
    else {
        console.log('clearing storage', key)
        delete localStorage[key]
    }
}


function setupDirectives() {
    const dollarFunctions = getWindowFunctions((x) => x.startsWith('$'))
    console.log('dollarfuncs', dollarFunctions)
    dollarFunctions.forEach(vuetify)
}

async function getClipboard() {
    return navigator.clipboard.readText()
}


function setClipboard(s) {
    navigator.clipboard.writeText(stringify(s))
}


function loadcss(s) {
    if (s.length < 20) s = getStorage(s)
    if (s.length < 5) throw new Error("")
    return createElement('style', {innerHTML: s}, document.head)
}


function setupFade() {
    const fadestring = '.fade-enter-active { transition: opacity 1s } .fade-leave-active { transition: opacity 0.75s; } .fade-enter, .fade-leave-to { opacity: 0;}'
    loadcss(fadestring)
}

function setupController(vueApp, target) {
    webloader('controller')
    setTimeout(() => {
        window.controller = new ElementController(null, vueApp, target)
        window.vue = window.controller.vue
    }, 250)
}

function setupVue(component) {
    window.vue = createVue(component)
}


function createListener(state, ref, enterRef) {

    state.keyhandler = keyhandler
    window.addEventListener('keydown', keyhandler)
    const preventDefault = preventDefaultFactory()
    

    function run(ref, key, ...args) {
        let item = ref[key]

        if (isString(item)) {
            switch (item) {
                case 'toggle': return state[key] = !state[key]
                default: return state[key] = item
            }
        }

        else {
            item(state, ...args)
        }

        state.display = ''
    }

    function keyhandler(e) {
        preventDefault(e)
        let key = getKeyArg(e)
        console.log('adasdfadf')
        console.log(key)
        let display = state.display


        if (display == '' && ref.onEmpty(state, e)) {
            return 
        }

        if (key == 'Enter') {
            const [a,b] = test(/^[^\w\s]/, display) ? 
                search(/^([^\w\s]+)(.*)/, display) :
                search(/^(\w+) ?(.*)/, display)

            if (enterRef && a in enterRef) {
                run(enterRef, a, b)
            }
            else {
                run(ref, key, display)
            }

            return 
        }

        if (key == 'Escape') {
            state.display = ''
            return 
        }

        if (key == 'Backspace') {
            state.display = backspaced(display)
            return 
        }

        if (key in ref) {
            run(ref, key)
            return 
        }


        if (display && !display.includes(' ') && (ref.hasOwnProperty(display + e.key))) {
            run(ref, display + e.key)
            return 
        }

        if (isTypable(e)) {
            state.display += e.key
        }
    }
}

function animated(el, key, start, end, options = 1000) {
    el.style[key] = start
    const animation = el.animate([{[key]: start}, {[key]: end}], options)
    return animation.finished.then(() => el.style[key] = end)
}


function appeardisappear(el, duration = 2000) {
    el.style.opacity = 0
    const keyframes = [
        {opacity : 0, offset: 0},
        {opacity : 1, offset: 0.1},
        {opacity : 1, offset: 0.9},
        {opacity : 0, offset: 1},
    ]
    const options = {
        duration,
        fill: 'forwards',
    }

    return el.animate(keyframes, options).finished.then((x) => el.style.opacity = 0)
}

function setAttribute(element, key, value) {
    if (value == null) value = true
    element.setAttribute(key, value)
}


function scrollToTop(element) {
    element.scrollTop = 0
}

function scrollToBottom(element) {
    setTimeout(() => element.scrollTop = element.scrollHeight , 100)
}

function getStylesheets(selectors) {
    const store = new Storage(Object)
    const stylesheets = filtered(document.styleSheets, (x) => x.cssRules.length > 0)

    stylesheets.forEach((item, i) => {
        for (let {cssText, selectorText} of item.cssRules) {
            let obj = toCssObject(cssText)
            store.add(selectorText, obj)
        }
    })

    const output = store.entries.reduce((acc, [a,b]) => {
        return acc += '\n' + cssBracket(a, reduceCSS(b)) + '\n'
    }, '').trim()
    console.log(output)
    return output
}

function ecRemoveStylesheets(ec) {
    const stylesheets = filtered(document.styleSheets, (x, i) => i > 0 && x.cssRules.length > 0)

    stylesheets.forEach((sheet, i) => {
        for (const {cssText, selectorText} of item.cssRules) {
            const name = selectorText.replace(/^\./, '')

            let obj = toCssObject(cssText)
            store.add(selectorText, obj)
        }

        sheet.disabled = true
        sheet.parentNode.removeChild(sheet)
    })

    const output = store.entries.reduce((acc, [a,b]) => {
        return acc += '\n' + cssBracket(a, reduceCSS(b)) + '\n'
    }, '').trim()
    console.log(output)
    //
    // as the events ramp up more and more ... 
    // 
    return output
}


// start css


function aggregateCSS(s) {
    const regex = /^(.*?) {\n([^]+?)\n}/gm
    const storage = aggregate(regex, s, (x) => runner(trimmed(dedent(x))))

    function runner(s) {
        return splitmapfilter(s, /;?\s*$/m, split, / *: */)
    }

    function parse(a, b) {
        const payload = reduceCss(toDictionary(b), String)
        return cssBracket(toCssClassName(a), payload)
    }

    const p = storage.entries.reduce((acc, [a,b]) => acc += '\n' + parse(a,b), '')
    return p
        //const ignore = ['unset', 'initial', 'none']
        //b = b.filter((x) => !ignore.includes(x[1]))
    //return p.replace(/.*?(?:unset|initial|none).+\n?
}


function cssValueParser(a, b) { /* marked */
    let key = cssattrmap[a]

    if (!b) return [key, 0]
    b = b.replace(/\$[a-zA-Z]+/, (x) => 'var' + parens('--' + x.slice(1)))
    const initials = ['none', 'transparent', 'unset', 'initial', 'auto']

    if (b == 'u' || b == 'n') return [key, 'unset']
    if (b == 'random') return [key, randomColor()]
    if (initials.includes(b)) return [key, b]
    if (b.startsWith('calc')) return [key, cssCalc(b.slice(4))]

    switch (a) {
        case 'a':
            return [key, cssAnimation(b)]
        case 'mc':
            return cssColorMatch(b)
        case 'pcal':
            return cssPcal(b)
        case 'bs':
            return [key, cssBoxShadow(b)]
        case 'br':
            if (b.length < 2 || isNumber(b)) break
        case 'bl':
        case 'bt':
        case 'bb':
        case 'b':
        case 'border':
            return cssBorder(b, key)
        case 'z':
        case 'offset':
        case 'scale':
        case 'fw':
        case 'o':
            return [key, b]
        case 'grid':
            throw ""
        case 'pos':
            let translateX
            let translateY

            let [posX, posY] = b.length == 2 ? 
                b.split('').map((x) => Number(x) * 10) : 
                b.split(/(?=\w\w$)/).map(Number)

            return [
                ['position', 'absolute'],
                ['top', posX + '%'],
                ['left', posY + '%'],
            ]

    }

    if (test(/color|background/, key)) {
        return [key, cssColor(b)]
    }

    b = cssUnit(b, key)

    switch (a) {
        case 'tx':
        case 'ty':
        case 'r':
            return ['transform', key + parens(doublequote(b))]
        case 'mwh':
            return [['min-width', b], ['min-height', b]]

        case 'wh':
            return [['width', b], ['height', b]]
        case 'px':
        case 'py':
        case 'mx':
        case 'my':
            let $key = cssattrmap[a[0]]
            let $dirs = a[1] == 'x' ? ['left', 'right'] : ['top', 'bottom']
            return $dirs.map(($dir) => [$key + '-' + $dir, b])
    }

    return [key, b]
}


function getCssItems(s) {
    const regex = aggregateRegexFromHashmap(cssattrmap)

    return s.trim().split(/,? +/).reduce((acc, x) => {
        if (x in cabmap) {
            acc.push(...cabmap[x])
        } else if (match = search(regex, x)) {
            let value = cssValueParser(...match)
            isNestedArray(value) ? acc.push(...value) : acc.push(value)
        }
        else {
            console.log('error', [x])
        }
        return acc
    }, [])
}

function cssParser(name, value) {
    if (!value) return
    if (isObject(value)) return cssBracket(toCssClassName(name), reduceCss(value))
    if (test(/^.*?{/, value)) return value
    return cssBracket(toCssClassName(name), reduceCss(getCssItems(value)))
}


function reduceCss(css, mode, delimiter = '\n') {
    if (mode == Object) {
        return reduce(css, (a, b) => [toCamelCase(a), b])
    }
    return prepareIterable(css, 'entries').reduce((acc, [a,b]) => {
        return acc += cssEntry(a,b, delimiter)
    }, '').trimEnd()
}

function cssEntry(a, b, delimiter = '\n') {
    return a + ': ' + b + ';' + delimiter
}

function addCssPeriod(s) {
    return test(/^\./, s) ? s : '.' + s
}

function toCssClassName(s) {
    if (test(/hot/, s)) {
        console.log('hiii')
    }
    if (test(/-/, s)) return addCssPeriod(s)
    if (test(ncg('^(?:$1)\\b', htmlElements), s)) return s
    if (test(/hot/, s)) {
        console.log('hiii2')
    }
    return addCssPeriod(s)
}


function cssBracket(key, value) {
    return '\n' + key + ' ' + '{' + newlineIndent(value.trimEnd()) + '}' + '\n'
}


function aggregateRegexFromHashmap(map, regexTemplate = '^($1)(\\S+)') {

    const storage = new Storage()
    const store = []

    for (let item of sorted(Object.keys(map))) {
        storage.add(item[0], item)
    }

    sortEach(storage, true)

    storage.forEach((k, v) => {
        v.length == 1 ? 
            store.push(v[0]) :
            store.push(k + ncg('(?:$1)', v.map((x) => x.slice(1))))
    })

    return ncg(regexTemplate, store)
}


const cabmap = { /* marked */

  gradient: [
    ['-webkit-background-clip', 'text'],
    ['-webkit-text-fill-color', 'transparent'],
    //['display', 'inline-block'],
    ['background-image', 'linear-gradient(to right, #1de9b6, #2979ff)']
  ],

  content: [['content', '']],
  pseudo: [['content', '']],
  //ofh: [['overflow-x', 'hidden'], ['overflow-y', 'hidden']],
  ilb: [['display', 'inline-block']],
  inline: [['display', 'inline']],
  span: [['display', 'inline']],
  block: [['display', 'block']],
  ofh: [['overflow', 'hidden']],
  ttc: [['text-transform', 'capitalize']],
  ttuc: [['text-transform', 'uppercase']],
  ttlc: [['text-transform', 'lowercase']],
  ofs: [['overflow', 'scroll']],
  ofx: [['overflow-x', 'hidden']],
  ofy: [['overflow-y', 'hidden']],
  bebas: [ ['font-family', 'bebas']],
  pre: [
        ['font-family', "'Courier New', monospace"],
        ['whitespace', 'pre']
  ],

  whitespace: [
        ['font-family', "'Courier New', monospace"],
        ['whitespace', 'pre']
  ],
  perspect: [ [ 'perspective', '50%' ], [ 'transform', 'translate(-50%, -50%)' ] ],
  card: [ [ 'backface-visibility', 'hidden' ], [ 'transform', 'translate(-50%, -50%)' ] ],
  grid: [ [ 'backface-visibility', 'hidden' ], [ 'transform', 'translate(-50%, -50%)' ] ],
  grid: [ [ 'backface-visibility', 'hidden' ], [ 'transform', 'translate(-50%, -50%)' ] ],
  grid: [ [ 'display', 'grid' ] ],

  '3d': [ [ 'left', '50%' ], [ 'transform', 'translate(-50%, -50%)' ] ],

  absu:
   [ [ 'left', 'unset' ],
     [ 'right', 'unset' ],
     [ 'bottom', 'unset' ],
     [ 'top', 'unset' ],
     [ 'position', 'unset' ],
     [ 'transform', 'unset']
   ],

  origin:
   [ [ 'left', '50%' ],
     [ 'position', 'absolute' ],
     [ 'top', '50%' ],
     [ 'transform', 'translate(-50%, -50%)' ] ],
  east:
   [ 
     [ 'left', 'unset' ],
     [ 'right', '0' ],
     [ 'top', '50%' ],
     [ 'transform', 'translateY(-50%)' ] ],
  b0: [ ['bottom', '0'], ['position', 'absolute']],
  l0: [ ['left', '0'], ['position', 'absolute']],
  t0: [ ['top', '0'], ['position', 'absolute']],
  r0: [ ['right', '0'], ['position', 'absolute']],

  right: [ ['right', '0']],
  top: [ ['top', '0']],
  left: [ ['left', '0']],
  bottom: [ ['bottom', '0']],
  se: [ [ 'bottom', '0' ], [ 'right', '0' ] ],
  south:
   [ [ 'bottom', '0' ],
     [ 'left', '50%' ],
     [ 'transform', 'translateX(-50%)' ] ],
  sw: [ [ 'bottom', '0' ], [ 'left', '0' ] ],
  west:
   [ [ 'top', '50%' ],
     [ 'transform', 'translateY(-50%)' ],
     [ 'right', 'unset' ],
     [ 'left', '0' ] ],
  nw: [ [ 'left', '0' ], [ 'top', '0' ] ],
  north:
   [ [ 'top', '0' ],
     [ 'left', '50%' ],
     [ 'transform', 'translateX(-50%)' ] ],

  "code": [
    [ 'font-family', 'source-code-pro, Menlo, Monaco, Consolas, \'Courier New\', monospace' ]
  ],

  "alwayse": [
    [ "min-width", "100%" ], 
    [ "min-height", "50px" ], 
  ],

  "middleright": [
    //[ "position", "absolute" ], [ "top", "50%" ], ["right", "-50%"],
    //[ "transform", "translateY(50%)"],
  ],

  "topleft": [
    [ "position", "absolute" ], [ "top", "0" ], ["left", "0"],
  ],

  "full": [
    [ "width", "100vw" ],
    [ "height", "100vh" ],
  ],
  "reset": [
    [
      "box-sizing",
      "border-box"
    ],

    [ 'font-family', '-apple-system, BlinkMacSystemFont, \'Segoe UI\', \'Roboto\', \'Oxygen\',\n\'Ubuntu\', \'Cantarell\', \'Fira Sans\', \'Droid Sans\', \'Helvetica Neue\',\nsans-serif' ],
    [ '-webkit-font-smoothing', 'antialiased' ],
    [ '-moz-osx-font-smoothing', 'grayscale' ],

    [
      "padding",
      "0"
    ],

    [
      "margin",
      "0"
    ],
  ],

  "middlerighsfdgt": [
    [
      "position",
      "absolute"
    ],

    [
      "top",
      "50%"
    ],

    [
      "right",
      "0"
    ],

    [
      "transform",
      "translateY(50%)"
    ],
  ],

  "cabtac": [
    [
      "text-align",
      "center"
    ]
  ],
  "serrat": [
    [
      "font-family",
      "\"Montserrat Alternates\""
    ],
    [
      "font-weight",
      "700"
    ]
  ],
  "centered": [
    [
      "display",
      "flex"
    ],
    [
      "align-items",
      "center"
    ],
    [
      "justify-content",
      "center"
    ],
  ],
  "ch": [
    [
      "display",
      "flex"
    ],
    [
      "align-items",
      "center"
    ],
    [
      "justify-content",
      "center"
    ]
  ],

  "c": [
    [
      "flex-direction",
      "column",
    ],

    [
      "display",
      "flex"
    ],
    [
      "align-items",
      "center"
    ],
    [
      "justify-content",
      "center"
    ]
  ],

  "center": [
    [
      "display",
      "flex"
    ],
    [
      "align-items",
      "center"
    ],
    [
      "justify-content",
      "center"
    ]
  ],
  "jcse": [
    [
      "justify-content",
      "space-evenly"
    ]
  ],
  "spacebetween": [
    [
      "justify-content",
      "space-between"
    ]
  ],

  "se": [
    [
      "justify-content",
      "space-evenly"
    ]
  ],

  "sa": [
    [
      "justify-content",
      "space-between"
    ]
  ],

  "sb": [
    [
      "justify-content",
      "space-between"
    ]
  ],

  "jcsb": [
    [
      "justify-content",
      "space-between"
    ]
  ],
  "jcc": [
    [
      "justify-content",
      "center"
    ]
  ],
  "shadow": [
    [
      "box-shadow",
      "rgba(17, 17, 26, 0.05) 0px 4px 16px, rgba(17, 17, 26, 0.05) 0px 8px 32px"
    ]
  ],
  "shadow1": [
    [
      "0px 4px 10px rgba(0, 0, 0, 0.25)"
    ]
  ],
  "shadow2": [
    [
      "0px 4px 10px rgba(0, 0, 0, 0.1)"
    ]
  ],
  "tall": [
    [
      "transition",
      "all 1s ease-out"
    ]
  ],
  "gaa": [
    [
      "grid-area",
      "a"
    ]
  ],
  "gab": [
    [
      "grid-area",
      "b"
    ]
  ],
  "gac": [
    [
      "grid-area",
      "c"
    ]
  ],
  "gad": [
    [
      "grid-area",
      "d"
    ]
  ],
  "gae": [
    [
      "grid-area",
      "e"
    ]
  ],
  "halfscreen": [
    [
      "position",
      "absolute"
    ],
    [
      "width",
      "35%"
    ],
    [
      "right",
      "0"
    ],
    [
      "height",
      "90%"
    ]
  ],
  "xcenter": [
    [
      "position",
      "absolute"
    ],
    [
      "transform",
      "translateX(-50%)"
    ],
    [
      "left",
      "50%"
    ]
  ],
  "ycenter": [
    [
      "position",
      "absolute"
    ],
    [
      "transform",
      "translateY(-50%)"
    ],
    [
      "top",
      "50%"
    ]
  ],
  "space-between": [
    [
      "justify-content",
      "space-between"
    ]
  ],
  "jcbtwn": [
    [
      "justify-content",
      "space-between"
    ]
  ],
  "jcspc": [
    [
      "justify-content",
      "space-evenly"
    ]
  ],
  "abscenter": [
    [
      "position",
      "absolute"
    ],
    [
      "top",
      "0"
    ],
    [
      "left",
      "0"
    ],
    [
      "right",
      "0"
    ],
    [
      "bottom",
      "0"
    ],
    [
      "margin",
      "auto"
    ]
  ],
  "shadow-lg": [
    [
      "box-shadow",
      "rgba(0, 0, 0, 0.1) 0px 4px 12px"
    ]
  ],
  "shadow-sm": [
    [
      "box-shadow",
      "rgba(0, 0, 0, 0.08) 0px 4px 12px"
    ]
  ],
  "rounded": [
    [
      "border-radius",
      "5px"
    ]
  ],
  "times": [
    [
      "font-family",
      "Times"
    ]
  ],
  "georgia": [
    [
      "font-family",
      "Georgia"
    ]
  ],
  "mhauto": [
    [
      "margin",
      "0 auto"
    ]
  ],
  "mauto": [
    [
      "margin",
      "0 auto"
    ]
  ],
  "posa": [
    [
      "position",
      "absolute"
    ]
  ],
  "posr": [
    [
      "position",
      "relative"
    ]
  ],
  "fullscreen": [
    [
      "width",
      "100vw"
    ],
    [
      "height",
      "100vh"
    ]
  ],
  "full": [
    [
      "width",
      "100vw"
    ],
    [
      "height",
      "100vh"
    ]
  ],
  "caps": [
    [
      "text-transform",
      "uppercase"
    ]
  ],
  "underline": [
    [
      "border-bottom",
      "1px solid currentColor"
    ]
  ],
  "lh": [
    [
      "line-height",
      "1.4"
    ]
  ],
  "bold": [
    [
      "font-weight",
      "700"
    ]
  ],
  "superbold": [
    [
      "font-weight",
      "900"
    ]
  ],
  "flex": [
    [
      "display",
      "flex"
    ]
  ],
  "flexc": [
    [
      "display",
      "flex"
    ],
    [
      "flex-direction",
      "column"
    ]
  ],
  "unflex": [
    [
      "display",
      "unset"
    ],
    [
      "flex-direction",
      "unset",
    ],

    [
      "align-items",
      "unset",
    ],

    [
      "justify-content",
      "unset",
    ],
   ],

  "flexcol": [
    [
      "display",
      "flex"
    ],
    [
      "flex-direction",
      "column",
    ],

    [
      "align-items",
      "center",
    ],

    [
      "justify-content",
      "center",
    ],
  ],
  "gmail": [
    [
      "font",
      "small/ 1.5 Arial,Helvetica,sans-serif"
    ]
  ],
  "geist": [
    [
      "flex",
      "1"
    ],
    [
      "justify-content",
      "flex-start"
    ],
    [
      "align-items",
      "stretch"
    ]
  ],
  "antialiased": [
    [
      "text-rendering",
      "optimizeLegibility"
    ],
    [
      "-webkit-font-smoothing",
      "asdflxxanzztzzizzzaliased"
    ]
  ],
  "ol": [
    [
      "text-rendering",
      "optimizeLegibility"
    ],
    [
      "-webkit-font-smoothing",
      "antialiased"
    ]
  ],
  "round": [
    [
      "border-radius",
      "50%"
    ]
  ],
  "bsa": [
    [
      "box-shadow",
      "0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)"
    ]
  ],
  "bsb": [
    [
      "box-shadow",
      "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)"
    ]
  ],
  "bsc": [
    [
      "box-shadow",
      "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)"
    ]
  ],
  "bsd": [
    [
      "box-shadow",
      "0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)"
    ]
  ],
  "bse": [
    [
      "box-shadow",
      "0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)"
    ]
  ],
  "shadow-md": [
    [
      "box-shadow",
      "0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)"
    ]
  ],
  "gridpre": [
    [
      "display",
      "grid"
    ],
    [
      "grid-template-columns",
      "repeat(3, 1fr)"
    ]
  ],
  "grid2": [
    [
      "display",
      "grid"
    ]
  ],
  "transparent": [
    [
      "background",
      "transparent"
    ]
  ],
  "tac": [
    [
      "text-align",
      "center"
    ]
  ],
  "ta": [
    [
      "text-align",
      "center"
    ]
  ],
  "ilb": [
    [
      "display",
      "inline-block"
    ]
  ],
  "block": [
    [
      "display",
      "block"
    ]
  ],
  "radial": [
    [
      "border-radius",
      "50%"
    ]
  ],
  "absolute": [
    [
      "position",
      "absolute"
    ]
  ],

  "blue": [ [ "color", "tailwind-blue" ] ],
  "white": [ [ "color", "white" ] ],
  "black": [ [ "color", "#333" ] ],
  "green": [ [ "color", "tailwind-green" ] ],

  "font16": [
    [ "font-size", "24px" ],
    [ "font-weight", "600" ],
  ],

  "smf": [
    [ "font-size", "24px" ],
    [ "font-weight", "500" ],
  ],

  "sm": [
    [ "font-size", "24px" ],
    [ "font-weight", "500" ],
  ],

  "medf": [
    [ "font-size", "36px" ],
    [ "font-weight", "650" ],
  ],

  "med": [
    [ "font-size", "36px" ],
    [ "font-weight", "650" ],
  ],

  "lgf": [
    [ "font-size", "48px" ],
    [ "font-weight", "650" ],
  ],

  "lg": [
    [ "font-size", "48px" ],
    [ "font-weight", "650" ],
  ],

  "vlg": [
    [ "font-size", "72px" ],
    [ "font-weight", "800" ],
  ],

  "abs": [
    [
      "position",
      "absolute"
    ]
  ],
  "rel": [
    [
      "position",
      "relative"
    ]
  ],
  "sans": [
    [
      "font-family",
      "-apple-system,BlinkMacSystemFont,\"Segoe UI\",Roboto,Oxygen-Sans,Ubuntu,Cantarell,\"Helvetica Neue\",sans-serif"
    ],
    [ '-webkit-font-smoothing', 'antialiased' ],
    [ '-moz-osx-font-smoothing', 'grayscale' ],
  ],
  "serif": [
    [
      "font-family",
      "Georgia"
    ]
  ],
  "garamond": [
    [
      "font-family",
      "Garamond"
    ]
  ],
  "monospace": [
    [
      "font-family",
      "monospace"
    ]
  ],
  "codestack": [
    [
      "font-family",
      "\"Source Code Pro\", Consolas, Monaco, Menlo, Consolas, monospace"
    ]
  ],
  "mono": [
    [
      "font-family",
      "Menlo,Monaco,Lucida Console,Liberation Mono,DejaVu Sans Mono,Bitstream Vera Sans Mono,Courier New,monospace"
    ]
  ],
  "code": [
    [
      "font-family",
      "monospace"
    ]
  ],
  "hidden": [
    [
      "overflow",
      "hidden"
    ]
  ],
  "cursive": [
    [
      "font-family",
      "relative"
    ]
  ],
  "mathfont": [
    [
      "font-family",
      "relative"
    ]
  ],
  "flatwhite": [
    [
      "color",
      "#EAEAEA"
    ]
  ],
  "flatblack": [
    [
      "color",
      "#333"
    ]
  ],
  "flatblacksocketio": [
    [
      "color",
      "#555"
    ]
  ],
  "flatblack2d": [
    [
      "color",
      "#2d2d2d"
    ]
  ],
  "flatblack24": [
    [
      "color",
      "#242424"
    ]
  ],
  "charcoal": [
    [
      "color",
      "#333"
    ]
  ],
  "gtc": [
    [
      "grid-template-columns",
      "repeat(3, 1fr)"
    ]
  ],
  "gtr": [
    [
      "grid-template-rows",
      "repeat(3, 1fr)"
    ]
  ]
}

const cssattrmap = { /* marked */
    con: 'content',
    mc: '',
    mwh: '',
    wh: '',
    pcal: '',
    px: '',
    py: '',
    mx: '',
    my: '',
    offset: 'offset',
    border: '',
    ls: 'letter-spacing',
    hsla: 'hsla',
    a: 'animation',
    kf: '',
    bottom: 'bottom',
    bot: 'bottom',
    top: 'top',
    left: 'left',
    right: 'right',
    pos: 'position',
    cgap: 'column-gap',
    rgap: 'row-gap',
    gap: 'grid-gap',
    bs: 'box-shadow',
    'ai': 'align-items',
    'jc': 'justify-content',
    gc: 'grid-column',
    gr: 'grid-row',
    b: 'border',
    bb: 'border-bottom',
    bl: 'border-left',
    br: 'border-right',
    bt: 'border-top',
    z: 'z-index',
    o: 'opacity',
    fw: 'font-weight',
    br: 'border-radius',
    bw: 'border-weight',
    lh: 'line-height',
    gg: 'grid-gap',
    ggx: 'row-gap',
    border: 'border',
    ggy: 'column-gap',
    lg: 'linear-gradient',
    bg: 'background',
    bc: 'border-color',
    bb: 'border-bottom',
    fc: 'color',
    fs: 'font-size',
    mw: 'min-width',
    mh: 'min-height',
    minw: 'min-width',
    minh: 'min-height',
    maxw: 'max-width',
    maxh: 'max-height',
    gtc: 'grid-template-columns',
    gtr: 'grid-template-rows',
    w: 'width',
    h: 'height',
    p: 'padding',
    m: 'margin',
    pb: 'padding-bottom',
    pt: 'padding-top',
    pl: 'padding-left',
    pr: 'padding-right',
    mb: 'margin-bottom',
    mt: 'margin-top',
    ml: 'margin-left',
    mr: 'margin-right',
    l: 'left',
    t: 'top',
    right: 'right',
    r: 'rotate',
    ta: 'text-align',
    s: 'scale',
    tx: 'transform',
    ty: 'transform',
    tr: 'transform',
}




function cssCalc(b) {
    const expr = b.replace(/\dp/g, (x) => x[0] + '%').replace(/\d(?=$|[ -])/g, (x) => x + 'px')
    return stringCall('calc', expr)
}


function cssAnimation(b) {
    let items = b.split(/(\d)/)
    let animation
    let duration = '1s'
    let easing = 'ease-in-out'
    let iterations = 1
    let delay = 0
    switch (items.length) {
        case 1:
            animation = items[0]

        case 2:
            animation = items[0]
            duration = items[1] + 's'

        case 3:
            animation = items[0]
            duration = items[1] + 's'
            iterations = 'infinite'
    }
    return joined(animation, duration, easing, delay, iterations, ' ')
}

function cssColorMatch(b) {
    let [color, fontNumber] = hasNumber(b) ? b.split(/(\d+)/).map(atSecond(Number)) : [b, 5]
    let bgNumber = 9 - fontNumber || 1

    if (color.length < 3) color = roygbiv.find((y) => color == y[0])

    let fontColor = tailwind[color + fontNumber]
    let bgColor = tailwind[color + bgNumber]
    return [
        ['color', fontColor],   
        ['background', bgColor],   
    ]

}



const roygbiv = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet']

function cssPcal(s) {
    let options

    ;[s, options] = getOptions(s)
    let ref = ['bl', 'br', 'b', 'tl', 'tr', 't']
    let [A,B] = argsplit(s, ref)
    let k = 1
    let margin = 50
    let bottomMargin = margin
    let rightMargin = margin

    if (options.bottom) bottomMargin += Number(options.bottom)
    if (options.right) rightMargin += Number(options.right)

    margin += 'px'
    bottomMargin += 'px'
    rightMargin += 'px'

    switch (A) {
        case 'bl':
        case 'br':
            return [
                ['width', B + '%'],
                ['right', rightMargin],
                ['bottom', bottomMargin],
            ]
        case 'b':
        case 'tl':
        case 'b':
        case 'b':
            return 
    }

    throw ""

    if (options.half) {
        k = 0.5
        return [
            ['width', `calc(${k} * (100% - 2 * ${b})`],
        ]
    }
    else {
        return [
            ['width', `calc(100% - 2 * ${b})`],
            ['height', `calc(100% - 2 * ${b})`],
            ['margin', b]
        ]
    }
}

function cssBoxShadow(b) {
    return "0px 4px 10px rgba(0, 0, 0, 0.25)"
}

function cssBorder(s, key) {
    let match = search(/(-?[\d.]+(?:px)?)(\w+)/, s)
    if (!match) {
        if (isNumber(s)) {
            return [key + '-' + 'width', s + 'px']
        }
        else {
            return ['border-color', cssColor(s)]
        }
    }

    let [a,b] = match
    
    let dashed = ' solid '
    if (isNumber(a)) a += 'px'
    b = cssColor(b)
    return [key, a + dashed + b]
}

function cssColor(b) {
    if (b.length < 3) b = b.replace(/\w/, (x) => roygbiv.find((y) => x == y[0]))
    if (!test(/\d$/, b)) b += 5
    return tailwind[b]
}

function cssUnit(b, key = 'width') {
    if (b.endsWith('p')) {
        return b.replace(/p$/, '%')
    } else if (b != 0 && test(/\d$/, b)) {
        let unit = cssunitmap[search(/\w+/, key)] || 'px'
        return b + unit
    }
    return b
}

const cssunitmap = {
    'rotate': 'deg',
    'scale': '',
    'translate': '%',
}

const tailwind = {
    charcoal: '#36454f',
    none: 'transparent',
    olive: '',
    strawberry: '',
    tomato: '',
    black1: 'asd',
    black2: 'asd',
    black3: 'asd',
    black4: 'asd',
    black5: 'asd',
    black: '#111',
    black6: 'asd',
    black7: 'asd',
    black8: '#111',
    black9: 'asd',
    gray1: '#f7fafc',
    gray2: '#edf2f7',
    gray3: '#e2e8f0',
    gray4: '#cbd5e0',
    gray5: '#a0aec0',
    gray: '#a0aec0',
    gray6: '#718096',
    gray7: '#4a5568',
    gray8: '#2d3748',
    gray9: '#1a202c',
    red1: '#fff5f5',
    red2: '#fed7d7',
    red3: '#feb2b2',
    red4: '#fc8181',
    red5: '#f56565',
    red6: '#e53e3e',
    red7: '#c53030',
    red8: '#9b2c2c',
    red9: '#742a2a',
    orange1: '#fffaf0',
    orange2: '#feebc8',
    orange3: '#fbd38d',
    orange4: '#f6ad55',
    orange5: '#ed8936',
    orange: '#ed8936',
    orange6: '#dd6b20',
    orange7: '#c05621',
    orange8: '#9c4221',
    orange9: '#7b341e',
    yellow1: '#fffff0',
    yellow2: '#fefcbf',
    yellow3: '#faf089',
    yellow4: '#f6e05e',
    yellow5: '#ecc94b',
    yellow: '#ecc94b',
    yellow6: '#d69e2e',
    yellow7: '#b7791f',
    yellow8: '#975a16',
    yellow9: '#744210',
    green1: '#f0fff4',
    green2: '#c6f6d5',
    green3: '#9ae6b4',
    green4: '#68d391',
    green5: '#48bb78',
    green: '#48bb78',
    green6: '#38a169',
    green7: '#2f855a',
    green8: '#276749',
    green9: '#22543d',
    teal1: '#e6fffa',
    teal2: '#b2f5ea',
    teal3: '#81e6d9',
    teal4: '#4fd1c5',
    teal5: '#38b2ac',
    teal: '#38b2ac',
    teal6: '#319795',
    teal7: '#2c7a7b',
    teal8: '#285e61',
    teal9: '#234e52',
    blue1: '#ebf8ff',
    blue2: '#bee3f8',
    blue3: '#90cdf4',
    blue4: '#63b3ed',
    blue5: '#4299e1',
    blue: '#4299e1',
    blue6: '#3182ce',
    blue7: '#2b6cb0',
    blue8: '#2c5282',
    blue9: '#2a4365',
    indigo1: '#ebf4ff',
    indigo2: '#c3dafe',
    indigo3: '#a3bffa',
    indigo4: '#7f9cf5',
    indigo5: '#667eea',
    indigo: '#667eea',
    indigo6: '#5a67d8',
    indigo7: '#4c51bf',
    indigo8: '#434190',
    indigo9: '#3c366b',
    purple1: '#faf5ff',
    purple2: '#e9d8fd',
    purple3: '#d6bcfa',
    purple4: '#b794f4',
    purple5: '#9f7aea',
    purple: '#9f7aea',
    purple6: '#805ad5',
    purple7: '#6b46c1',
    purple8: '#553c9a',
    purple9: '#44337a',
    violet1: '#fff5f7',
    violet2: '#fed7e2',
    violet3: '#fbb6ce',
    violet4: '#f687b3',
    violet5: '#ed64a6',
    violet: '#ed64a6',
    violet6: '#d53f8c',
    violet7: '#b83280',
    violet8: '#97266d',
    violet9: '#702459',

    pink1: '#fff5f7',
    pink2: '#fed7e2',
    pink3: '#fbb6ce',
    pink4: '#f687b3',
    pink5: '#ed64a6',
    pink: '#ed64a6',
    pink6: '#d53f8c',
    pink7: '#b83280',
    pink8: '#97266d',
    pink9: '#702459',
}




function cshpos(a, b, mode) {
    const ref = {
        'p': '%',
        'e': 'em',
        'x': 'px',
    }

    const unit = ref[mode] || 'px'

    return {
        top: a + unit,
        left: b + unit,
    }
}

function csho(a, n) {
    const ref = {
        o: 'opacity',
        d: 'delayAfter',
        d: 'delay',
        db: 'delayBefore',
        t: 'duration',
    }
    const key = ref[a]
    return {
        [key]: n
    }
}

function cshcolor(mode, color, shade, thickness) {

    const colorName = roygbiv.find((x) => color == x[0])
    const colorValue = tailwind[colorName + (shade || 5)]
    const ref = {
        t: 10,
        s: 3,
    }
    const stroke = ref[thickness] || 5

    if (mode == 'b') return {background: colorValue}
    if (mode == 'u') return {borderBottom: stroke + ' px solid ' + colorValue}
                     return {color: colorValue}
}

function cssShorthand(s) {
    const ref = [
        [/^([od])(\d+\.?\d*)/, csho],        // opacity  and delay
        [/^(\d+)[,-](\d+)(pex)?/, cshpos], // position
        [/^([bu]?)([roygbiv])(\d*)([st])?/, cshcolor], // color
    ]

    const items = s.trim().split(/ +/)
    const store = {}
    //console.log(items)
    for (let item of items) {
        for (let [k, v] of ref) {
            if (test(k, item)) {
                Object.assign(store, v(...search(k, item)))
                break
            }
        }
    }
    return store
}


function cshkf(s) {
    const keyframes = s.trim().split(/\n\n+/).map((item, i) => {
        return item.split('\n').map(cssShorthand)
    })

    // an array of arrays
    const p = keyframes
    console.log(p)
    return p
}

function cshclasses() {
    
    const classStyles = s.trim().split(/\n+/).map((item, i) => {
        let [a,b] = splitonce(item)
        return cssParser(a, b)
    })
    const s = joined(classStyles)
    logged(s)
    loadcss(s)
}


class StandardObject {
    constructor(store) {
        this.store = store || {}
    }

    get keys()    { return Object.keys(this.store) }
    get values()  { return Object.values(this.store) }
    get entries() { return Object.entries(this.store) }
    has(key)      { return this.store.hasOwnProperty(key) }
    reset() {
         this.store = {}
    }
}

function dreplace(s, dict, regexTemplate = '\\b(?:$1)\\b', flags = 'g') {
    let escape
    if (flags.includes('e')) {
        escape = true
        flags = flags.replace('e', '')
    }
    const regex = ncg(regexTemplate, dict, escape)
    function fix(x) {
        if (x.startsWith('\\')) return '\\' + x
        return x
    }
    const parser = hasCaptureGroup(regexTemplate) ? (_, x) => dict[fix(x)] : (x) => dict[fix(x)]
    return replace(regex, parser, s, flags)
}

function ncg(template, ref, escape) {

    if (template === '') template = '(?:$1)'

    if (!ref && isIterable(template)) {
        return '\\b(?:' + ncgRunner(template, escape) + ')\\b'
    }

    else if (!isPrimitive(ref) && ref[0] && !isPrimitive(ref[0])) {
        return templater(template, ref.map((el) => ncgRunner(el, escape)))
    }

    else {
        return templater(template, ncgRunner(ref, escape))
    }
}

function isIterable(x) {
    return isArray(x) || isObject(x)
}

function isArray(a) {
    return Array.isArray(a)
}

function isObject(x) {
    return type(x) == 'Object'
}

function type(x) {
    return search(/object (\w+)/, Object.prototype.toString.call(x))
}

function search(regex, s, flags = '') {
    if (isString(regex)) regex = RegExp(regex, flags)

    const match = s.match(regex)
    return matchgetter(match)

}

function isString(s) {
    return typeof s === 'string'
}

function matchgetter(match) {
    return !match ? 
        null :
        match.length == 1 ?
        match[0] :
        match.length == 2 ?
        match[1] :
        match.slice(1)
}

function ncgRunner(ref, escape) {
    return escape ? prepareIterable(ref, 'keys').map(rescape).join('|') :
                    prepareIterable(ref, 'keys').join('|')
}

function prepareIterable(data, mode) {

    if (isNumber(data)) {
        return range(1, data)
    }
    if (isString(data)) {
        return [data]
    }
    if (isObject(data)) {
        if (mode == Array) mode == 'values'
        if (mode == Object) mode == 'entries'
        return Object[mode](data)
    }
    return data
}


function notNone(s) {
    return s !== null
}
function isNumber(s) {
    return typeof s == 'number' || test('^-?\\d+(?:\\.\\d+)?$', s)
}

function test(regex, s, flags = '') {
    return RegExp(regex, flags).test(s)
}

function range(...args) {
    let a
    let b
    let c
    if (!isPrimitive(args[args.length - 1])) {
        c = args.pop()
    }
    if (args.length == 1) {
        b = args[0]
        a = 1
    }
    else {
        ;[a, b] = args
    }

    if (isArray(b)) {
        b = b.length - 1
        a = 0
    }

    const store = []
    for (let i = a; i <= b ; i++) {
        if (c) {
            if (c.toString() == [].toString()) store.push([])
            else if (c.toString() == {}.toString()) store.push({})
        }
        else {
            store.push(i)
        }
    }
    return store
}

function isPrimitive(value) {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        typeof value === 'symbol' ||
        typeof value === 'boolean'
    )
}

function rescape(s) {
    const rescapeRE = /[.\\[*+?()|^${}\[\]]/g
    return s.replace(rescapeRE, '\\$&')
}

function templater(s, ref) {
    if (!s.includes('$')) return s

    let regex = /\$(\w)/g
    if (isPrimitive(ref)) {
        ref = [ref]
    }
    else {
        regex = /\$(\w+)/g
    }

    return s.replace(regex, (_, x) => {
        return isArray(ref) ? ref[Number(x) - 1] : ref[x]
    })
}

function hasCaptureGroup(s) {
    return test(/[^\\]\((?!\?)/, s)
}

function replace(regex, replacement, s, flags = 'gm') {
    if (isString(regex)) regex = RegExp(regex, flags)
    return s.replace(regex, replacement)
}



function getIndent(s) {
    if (isNumber(s)) return s
    return getSpaces(s).length
}






function evalClock(clock, timeline, vue, duration = 20) {
    if (!clock) clock = new Clock()
    const length = timeline.length

    clock.onTick = (timeLeft, count) => {
        const item = timeline[count]

        let value
        if (isString(item)) {
            value = tryval(item)
        }
        else if (isFunction(item)) {
             value = item()
        }

        else if (isObject(item)) {
             Object.assign(vue, item)
        }

        console.log(timeLeft, count, value)

        if (count == length) {
            return true
        }
    }

    clock.onFinish = function(timeLeft, count) {
        console.log('done!')
    }

    return clock.start(duration)
}

function createConfigCss(s) {
    const regex = /([\w-]+) *[:=] *(.*?)(?= *\w+[:=]|$)/g
    const items = toDictionary(findall(regex, s).map(atFirst((x) => cssattrmap[x] || x)))
    return items
}

function atFactory(n) {
    return (...fns) => {
        const fn = pipe(...fns)
        
        function runner(item, i) {
            if (isArray(item)) {
                item[n - 1] = fn(item[n - 1])
                return item
            }
            else {
                return i == n - 1? fn(item) : item
            }
        }

        return runner
    }
}

const atFirst = atFactory(1)


function filtered(items, fn) {
    if (isObject(items)) {
        return reduce(items, (k, v) => fn(k,v) ? v : null)
    }

    items = Array.from(items)
    if (isString(fn)) return items.filter((x) => exists(x) && test(fn, x, 'i'))
    if (isFunction(fn)) return items.filter(fn)
    if (isArray(fn)) return items.filter(x => !fn.includes(x))
}


function fixSpaceLength(n) {
    switch (n) {
        case 1: return 0
        case 2: return 4
        case 3: return 4
        case 4: return 4
        case 5: return 4
        case 6: return 8
        case 7: return 8
        case 8: return 8
        case 10: return 12
        case 11: return 12
    }
    return n
}

function getIndentAndLine(s) {
    return [getIndent(s), s.trim()]
}


function argsplit(s, ref, regex = '($1)(\\w+)') {
    let match = search(ncg(regex, ref), s)
    return match ? match : [null, null]
}







function delta(a, b) {
    return Math.abs(a - b)
}





function consoleThrow(s) {
    console.log(s)
}

function coinflip(n = 0.5) {
    return Math.random() > 1 - n
}






function asdfmapConditional(a, b, c) {
    const parser = (fn) => (x) => isString(fn) ? templater(fn, x) : fn(x)
    return (x, i) => {
        if (isRegExp(a)) {
            let match = x.match(a)
        }
    }
}

function mapConditional(a, b, c) {
    return (x, i) => {
        if (isRegExp(a)) {
            let match = x.match(a)
            if (match) {
                if (match.length == 2) {
                    if (isString(b)) {
                        return templater(b, match[1])
                    }
                    return b(match[1])
                }
                else {
                    if (isString(b)) {
                        return templater(b, x)
                    }
                    return b(x)
                }
            }
            else if (c) {
                if (isString(c)) {
                    return templater(c, x)
                }
                return c(x)
            }
            else {
                return x
            }
        }

        if (isFunction(a)) {
            if (a(x)) {
                if (isString(b)) {
                    return templater(b, x)
                }
                return b(x)
            }
            else if (c) {
                if (isString(c)) {
                    return templater(c, x)
                }
                return c(x)
            }
            else {
                return x
            }
        }

        if (isString(a)) {
            throw new Error("must be regex or function for mapconditional")
        }
    }
}



function dedentPre(s) {
    return s.replace(/^    /gm, '')
}






function getFunctionName(s) {
    if (isFunction(s)) return s.name
    return search(/^(?:class|(?:async )?function) (\w+)/, s)
}


function merge(...args) {
    let first = args[0]

    if (isObject(first)) {
        const store = {}
        for (let arg of args) {
            Object.assign(store, arg)
        }
        return store
    }

    if (isArray(first)) {
        const store = []
        for (let arg of args) {
            store.push(...arg)
        }
        return store
    }

    if (isString(first)) {
        if (first.includes('\n')) return args.join('\n')
        if (first.includes(' ')) return args.join(' ')
        return args.join('\n')
    }

    if (isNumber(first)) {
        return sum(args.map(Number))
    }
}


function getLast(arr, n = -1) {
    return arr[arr.length + n]
}







function tryval(s) {
    try {
        return {
            input: s,
            value: eval(s)
        }
    }

    catch(e) {
        return {
            input: s,
            error: e.toString()
        }
    }
}


function abbreviate(s) {
    let start = test(/[A-Z]/, s[0]) ? '' : s[0]
    let abrev = start + s.replace(/[\da-z]+/g, '').toLowerCase()
    return abrev
}

const catpics = [
  //'dancing.jpg',
  'fist on chin.jpg',
  'flying.jpg',
  'like a boss.jpg',
  'ocean sunset.jpg',
  'pose f.jpg',
]

function counted(regex, s, flags = 'g') {
    if (isArray(s)) return s.filter(regex).length

    if (isString(regex)) {
        regex = rescape(regex)
        if (isWord(regex)) regex = '\\b' + regex + '\\b'
        regex = RegExp(regex, flags)
    }

    const matches = s.match(regex)
    return matches ? matches.length : 0
}


function hasMultipleVariables(s) {
    return counted(/\b[abcde]\b/g, s) > 1
}

function shuffle(arr) {
    const ref = Array.from(arr)
    let m = arr.length
    while (m) {
        let i = ~~(Math.random() * m--)
        let t = ref[m]
        ref[m] = ref[i]
        ref[i] = t
    }
    return ref
}

function isBoolean(x) {
    return x === true || x === false
}


class Clock {
    constructor(options) {
        this.increment = 1000
        this.speed = 1

        if (isObject(options)) {
            if (options.duration) this.duration = options.duration
            if (options.increment) this.increment = options.increment
            if (options.steps) this.increment = this.duration / options.steps
        }
        else {
            this.duration = options
        }
    }

    async start(duration) {
        if (duration) this.duration = duration
        if (this.duration <= 10) this.duration *= 1000

        this.count = 0
        this._stop = false
        await this.runner()
    }

    stop() {
        this._stop = true
    }

    pause() {
        this.stop()
    }

    async resume() {
        this._stop = false
        await this.runner()
    }

    runner() {

        if (this._onTick) this._onTick()

        return new Promise((resolve) => {
            const runner = () => {

                if (this.isDone()) {
                    clearTimeout(this.timerID)
                    if (this._onFinish) {
                        this._onFinish()
                    }
                    resolve()
                }

                else {
                    this.count += 1
                    this.timerID = setTimeout(() => {
                        if (this._onTick) this._onTick()
                        runner()
                    }, Math.floor(this.increment / this.speed))
                }
            }

            runner()
        })
    }

    at(n, fn) {
        let current = this._onTick
        this._onTick = () => this.count == n * this.increment ? this.handle(fn()) : current()
    }

    set onTick(fn) {
        this._onTick = () => this.handle(fn(this.timeLeft, this.count, this.duration))
    }

    set onFinish(fn) {
        this._onFinish = () => fn(this.timeLeft, this.count, this.duration)
    }

    isDone() { return this.count >= this.duration || this._stop }
    get timeLeft() { 
        //console.log(this.duration)
        //console.log(this.count)
        //console.log(this.increment)
        return Math.round((this.duration - this.count) / this.increment) 
    }

    handle(result) {
        if (result === true) this._stop = true
        else if (isNumber(result)) this.duration += result
    }
}


function isFirst(key, state = $$) {
    if (!state[key]) {
        state[key] = true
        return true
    }
    return false
}

function coerceError(arg) {
    if (!exists(arg)) throw new Error('coercing error')
}

function toArgument(s) {
    s = s.trim()

    if (isNumber(s)) return Number(s)
    if (s == 'false') return false
    if (s == 'true') return true
    if (s == 'null') return null
    if (s == 'Number') return Number
    if (s == 'String') return String 
    return s
}

function randomPick(items) {
    if(!isArray(items)) return items
    return items[Math.floor(Math.random() * items.length)]
}

function isWord(s) {
    return test(/^[a-zA-Z]+$/, s)
}

function createConfig(s) {
    if (isWord(s)) return s
    if (s == '') return s
    const regex = /(.*?) *[:=] *(.*?)(?:$|, ?|  )/g
    return reduce(findall(regex, s), (k,v) => [k.trim(), v ? toArgument(v) : true])
}

function isPromise(x) {
    return x.constructor.name == 'Promise'
}

function getExtension(file) {
    return search(/\.(\w+)$/, file)
}

function rng(min = 2, max = 10, negative = null, boundary = null) {
    if (isFunction(min)) {
        while (true) {
            let n = negative ? rng(max, negative) : rng()
            if (min(n)) return n
        }
    }

    if (isArray(min)) {
        return randomPick(min)
    }

    min = Math.ceil(min)
    max = Math.floor(max)
    let value = Math.floor(Math.random() * (max - min + 1)) + min
    if (negative) value = Math.abs(value) * -1
    if (boundary) value = roundToNearest(value, boundary) + boundary
    return value
}

function rng(min = 1, max = 10) {
    return Math.floor(Math.random() * (max - min + 1)) + min
}

function sorted(items, fn, reverse = false) {

    const defaultObjectSort = (s) => s[1]
    const defaultNumberSort = (s) => s

    if (items.store) {
        items = Object.entries(items.store) 
    } else if (isObject(items)) {
        items = Object.entries(items)
    }
    
    if (!fn) fn = isDoubleIterable(items) ? 
        defaultObjectSort : 
        isNumber(items[0]) ?
        defaultNumberSort :
        char2n

    function runner(a, b) {
        if (reverse) return Number(fn(b)) - Number(fn(a))
        return Number(fn(a)) - Number(fn(b))
    }

    items.sort(runner)
    return items
}

function isDoubleIterable(items) {
    return isObject(items) || isNestedArray(items)
}

function isNestedArray(x) {
    return isArray(x) && isArray(x[0])
}

function char2n(ch) {
    return ch.toLowerCase().charCodeAt(0) - 97
}

function datestamp(date) {
    const [m, d, y] = getMDY(date)
    return m.toString().padStart(2, 0) + '-' + d.toString().padStart(2, 0) + '-' + y
}

function getMDY(date) {
    if (!date) date = new Date()
    else if (isString(date)) {
        date = new Date(date)
    }
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return [month, day, year]
}

function newlineIndent(s, n) {
    return '\n' + indent(isArray(s) ? s.join('\n') : s, n) + '\n'
}

function indent(s, n = 4) {
    return replace('^', toSpaces(n), s, 'gm')
}

function toSpaces(n = 4) {
    return isNumber(n) ? ' '.repeat(n) : n
}

function iterate(items, fn, ...args) {
    const store = []
    if (isNumber(items)) {
        items = range(1, items)
    }
    else {
        items = toArray(items)
    }

    for (let i = 0; i < items.length; i++) {
        store.push(fn(items[i], ...args))
    }
    return store
}

function toArray(val) {
  return isArray(val) ? val : [val]
}

function sortStorage() {
    return reduce(sorted(this.store, zoop(fn)), (k,v) => [k,v])
}
class Storage {
    constructor(mode = Array) { 
        this.store = {}; 
        this._mode = mode
    }
    delete(k)            { delete this.store[k] }
    get value()          { return this.store }
    get keys()           { return Object.keys(this.store) }
    get values()         { return Object.values(this.store) }
    get entries()         { return Object.entries(this.store) }
    get(k)               { return this.store[k] }
    set(k, v)            { this.store[k] = v; return v }
    has(k)               { return this.store.hasOwnProperty(k) }
    forEach(fn)          { return Object.entries(this.store).forEach(([k,v]) => fn(k,v)) }
    reset(k) {
        if (!k) { this.store = {}; return }

        switch (this._mode) {
            case Array: this.store[k] = []; break;
            case Number: this.store[k] = 0; break;
            case String: this.store[k] = ''; break;
            case Object: this.store[k] = {}; break;
            case null: this.store[k] = null; break;
        }
    }

    add(k, v) {
        if (k == null) return 

        switch (this._mode) {
            case Array:  this.addArray(k, v) ; break;
            case Object: this.addObject(k, v); break;
            case String: this.addString(k, v); break;
            case Number: return this.addNumber(k, v); break;
            default: this.set(k, v)          ; break;
        }

        return this.get(k)
    }

    addNumber(k, v) {
        v = v == null ? 1 : Number(v)
        return this.store[k] ? (this.store[k] += v) : (this.store[k] = v)
    }

    addString(k, v, delimiter = '') {
        this.store[k] ? (this.store[k] += delimiter + v) : (this.store[k] = v)
    }

    addArray(k, v) {
        if (isArray(v))  {
            this.store[k]? this.store[k].push(...v) : this.store[k] = v
        } else {
            this.store[k]? this.store[k].push(v) : this.store[k] = [v]
        }
    }

    addObject(k, v) {
        this.store[k] ? 
            Object.assign(this.store[k], v) :
            this.store[k] = v
    }
}

function reduce(items, fn = (k,v) => [k,v]) {
   if (!exists(items)) return {}
   items = prepareIterable(items, 'entries')

   const store = {}
   const doublet = isDoubleIterable(items)


   for (let i = 0; i < items.length; i++) {
       const item = items[i]
       
       const value = doublet ? fn(...item, i) : fn(item, i)
       if (!exists(value)) continue
       if (isArray(value) && value.length == 2) {
          store[value[0]] = value[1]
       } else {
          if (doublet) store[item[0]] = value
          else {
              store[item] = value
          }
       }
   }
   return store
}

function exists(input) {
    if (input == null) return false
    if (isString(input)) return input.trim().length > 0
    if (isArray(input)) return input.filter(exists).length > 0
    if (isObject(input)) return Object.keys(input).length > 0
    return true
}

function remove(arr, index) {
    return arr.splice(index, 1)[0]
}

function modularIncrement(arr, item, increment = 1) {
    if (increment == '+') increment = 1
    else if (increment == '-') increment = -1

    if (isObject(arr)) {
        arr = Object.keys(arr)
    }

    if (!item) return arr[0]
    const i = arr.indexOf(item)
    if (i < 0) return arr[0]


    let newIndex

    if (i + increment < 0) {
        newIndex = arr.length - 1
    }
    else  {
        newIndex = (i + increment) % arr.length
    }
    
    const p = arr[newIndex]
    return p
}

function mreplace(regex, replacement, s, flags = 'g', singular = false) {
    if (arguments.length == 2) {
        replacement = ''
        s = arguments[1]
    }

    if (arguments.length == 3 && arguments[2] == true) {
        replacement = ''
        s = arguments[1]
        singular = arguments[2]
    }

    const store = []
    const sliceBy = hasCaptureGroup(regex) ? 1 : 0

    function parser(...args) {
        args = args.slice(sliceBy, -2).filter((x) => x != null)
        store.push(smallify(args))
        return isString(replacement) ? replacement : replacement(...args)
    }

    const text = replace(regex, parser, s.trim(), flags).replace(/^\n+/, '').trimEnd()
    if (singular) return [text, smallify(store)]
    return [text, store]
}

function smallify(x) {
    return x.length == 0 ?
        null :
        x.length == 1 ?
        x[0] :
        x
}

function sleep(delay = 3000) {
    if (delay < 100) delay *= 1000
    return new Promise((resolve) => setTimeout(resolve, delay))
}

function parens(s) {
    return '(' + s + ')'
}

function unique(a, b) {

    if (isNestedArray(a)) {
        const seen = []
        const store = a.filter(x => {
            if (seen.includes(x[0])) return false
            seen.push(x[0])
            return true
        })
        return store
    }

    if (b) return a.filter((item) => !b.includes(item))
    return isArray(a) && a.length > 1 ? Array.from(new Set(a)) : a
}

function stringify(s) {
    return isPrimitive(s) ? s : JSON.stringify(s, null, 2)
}

function getStorage(key, placeholder = null) {
    return key in localStorage ? parseJSON(localStorage.getItem(key)) : placeholder
}

function parseJSON(s) {
    if (/^[\d/]+$/.test(s)) {
        return Number(s)
    } 
    return /^[{\[]/.test(s) ? JSON.parse(s) : s
}

function splitonce(s, delimiter = '\\s') {
   if (isRegExp(delimiter)) delimiter = delimiter.source
   let regex = '^(.*?)' + delimiter + '([^]+)$'

   return search(regex, s) || [s, '']
}

function isRegExp(x) {
    return x.constructor.name == 'RegExp'
}

function pop(arr, key, fallback) {
    if (isObject(arr)) {
        let value = arr[key]
        delete arr[key]
        return value
    }

    if (isArray(arr)) {
        const index = isFunction(key) ? 
            arr.findIndex(key) : 
            isNumber(key) ? key : arr.indexOf(key)
        if (index < 0) {
            if (fallback) {
                return pop(arr, fallback)
            }
            else {
                return 
            }
        }
        else {
            return remove(arr, index)
        }
    }
}

function isFunction(x) {
    return typeof x === 'function'
}

function fill(arr, n) {
    while (arr.length <= n) {
        arr.push(null)
        counter()
    }
}

function counter(n) {
    if (typeof __count__ == 'undefined') __count__ = 0
    __count__++
    if (__count__ == 1000) throw ""
    if (n && __count__ == n) throw ""
    return __count__
}

function joined(arr) {
    if (arguments.length > 1) {
        arr = Array.from(arguments).filter(exists).map(String)
        if (test(/^[, .] *$/, getLast(arr))) {
            delimiter = arr.pop()
            return arr.join(delimiter)
        }
    }

    let s = ''
    for (let item of arr) {
        s += item
        s += item.includes('\n') ? '\n\n' : '\n'
    }
    return s
}

function assign(obj, key, items) {
    if (obj[key] && items) Object.assign(obj[key], items)
    else if (items) obj[key] = items
}

function findall(regex, s, flags = 'g', filtered = false) {
    if (isString(regex)) regex = RegExp(regex, flags)

    let store = []
    let match
    s = s.trim()

    while (exists(match = regex.exec(s))) {
        if (match.length == 1) {
            store.push(match[0])
        }

        else if (filtered) {
            store.push(smallify(match.slice(1).filter(exists)))
        }
        else if (match.length == 2) {
            store.push(match[1])
        }
        else {
            store.push(match.slice(1))
        }
    }
    return store
}

function divify(tag, attrs, children) {
    if (tag == 'img' && isString(attrs)) return divify('img', {class: 'img', src: attrs}, '')


    if (children == null) {
        console.log(attrs)
        throw new Error("")
    }

    let s = toOpeningTag(tag, attrs)
    let indentation = 4

    if (isArray(children)) {
        s += newlineIndent(children.map(x => {
            if (isArray(x)) {
                return divify(x)
            }
            
            if (!x) {
                console.log(children)
                throw "ummmmmm not sure but x doesnt exist"
            }

            if (isObject(x)) {
                console.log(children)
                throw "ummmmmm not sure why its an object"
            }

            if (isNumber(x)) x = String(x)
                
            return x.includes('\n')  && !x.startsWith('<') ? newlineIndent(x) : x 
        }), indentation)
    }

    else if (isDefined(children)) {
        if (isNumber(children)) children = String(children)
        s += children.includes('\n') ? newlineIndent(children, indentation) : children
    }

    s += toClosingTag(tag)
    return s
}

function toOpeningTag(el, attrs = '', props = '') {
    if (el == 'html') return '<!doctype html><html>'
    
    if (attrs) {
        if (isString(attrs)) attrs = ' class=' + doublequote(attrs)
        else if (isObject(attrs)) {
            attrs = Object.entries(attrs).reduce((acc, [a,b]) => acc += ` ${a}="${b}"`, '')
        }
    }
    else {
        attrs = ''
    }

    if (props) attrs = ' ' + props

    const suffix = hasHtmlSuffix(el) ? '>' : '/>'
    return '<' + el + attrs + suffix
}

function doublequote(s) {
    return '"' + s + '"'
}

function hasHtmlSuffix(el) {
    const items = ['style', 'pre', 'script', 'body', 'ul', 'li', 'p', 'textarea', 'button', 'section', 'div', 'h1', 'h2', 'h3', 'main', 'blockquote', 'span', 'article', 'body', 'html']
    return items.includes(el)
}

function isDefined(x) {
    return x != null
}

function toClosingTag(el) {
    const noclosers = ['input', 'hr', 'br', 'link', 'img']
    if (noclosers.includes(el)) return ''
    return '</' + el + '>'
}

function toString(x) {
    if (isObject(x)) return JSON.stringify(x, null, 2)
    if (isArray(x)) joined(x)
    if (isRegExp(x)) return x.source
    return x.toString()
}

function split(s, regex = / +/) {
    if (isNumber(regex)) return [s.slice(0, regex), s.slice(regex)]
    return s.trim().split(regex)
}

function matchall(regex, s) {
    const match = s.match(regex, s)
    return match ? match : []
}

class AnimationState {
    constructor() {
        this.store = {}
        this.fill = 'forwards'
        this.easing = 'linear'
        this.iterations = 1
        this.delay = 0
        this.duration = 750
    }

    export() {
        return {
            animate: this.animate.bind(this),
        }
    }

    register(key, options) {
        this.store[key] = options 
    }

    animate(element, key) {
        const ref = this.store[key]
        
        element.style.background = 'white'
        const options = {
            fill: ref.fill ? 'forwards' : this.fill,
            duration: ref.duration || this.duration,
            delay: ref.delay || this.delay,
            iterations: ref.iterations || this.iterations,
            easing: this.easing,
        }

        let keyframes

        if (ref.background) {
            keyframes = [
                {offset: 0, background: 'red'},
                {offset: 1, background: ref.background}
            ]
            keyframes = [
                {offset: 1, background: ref.background},
            ],
            console.log(keyframes)
        }
        else {
            console.log(ref)
            throw "@animate not done yet"
        }
        
        return element.animate(keyframes, options).finished
    }

    get options() {
        return {
            duration: this.duration,
            fill: this.fill,
            delay: this.delay,
        }
    }
}

class GlobalState {
    constructor() {
        this.store = {}
    }

    export() {
        return {
            createVar: this.createVar.bind(this),
            incrementVar: this.incrementVar.bind(this),
            resetVar: this.resetVar.bind(this),
            getVar: this.getVar.bind(this),
            setVar: this.setVar.bind(this),
        }
    }
    getVar(key) {
        return this.store[key]
    }

    setVar(key, value) {
        if (!this.store.hasOwnProperty(key)) {
            this.store[key] = key.endsWith('s') ? [] : ''
        }

        if (isArray(this.store[key])) {
            this.store[key].push(value)
        }

        else {
            this.store[key] = value
        }
    }

    createVar(key, value) {
        if (!this.store.hasOwnProperty(key)) {
            this.store[key] = value || 0
        }
    }

    incrementVar(key) {
        this.createVar(key)
        this.store[key] += 1
        return this.store[key]
    }

    resetVar(key) {
        this.createVar(key)
        this.store[key] = 0
    }

}

function toCamelCase(s) {
    return s.replace(/-\w/g, (x) => x.slice(1).toUpperCase())
}

function modularIncrementFn(arr, index, fn) {

    index = arr.indexOf(index)
    if (index == -1) {
        throw new Error("")
    }

    for (let i = index; i < arr.length; i++) {
        let item = arr[i]
        if (fn(item)) return item
    }

    for (let i = 0; i < index; i++) {
        let item = arr[i]
        if (fn(item)) return item
    }

    return null
}

function randomColor() {
    return randomPick(['red', 'blue', 'green'])
}

function getNumbers(s) {
    const regex = /-?\d+\.?\d*/g
    const match = s.match(regex)
    return match ? match.map(Number) : []
}

function flat(arr) {
    const store = []
    for (let item of arr) {
        if (isArray(item)) store.push(...item)
        else store.push(item)
    }
    return store
}

function sum(items, fn) {
    return items.reduce((acc, item, i) => (acc += fn ? fn(item, i) : item), 0)
}

function isOdd(n) {
    return n % 2 == 1
}

function getOptions(s) {

     if (test(/:\w/, s)) {
         let [a,b] = mreplace(/:(\w+)/g, '', s)
         return [a, reduce(b, (x) => [x, true])]
     }

     if (test(/=/, s)) {
         let [a,b] = mreplace(/(\w+)=(\w+)/g, '', s)
         const p = [a, reduce(b, (k, v) => [k, v])]
         return p
     }

     else {
         let [a,b] = mreplace(/[;@](\w+)/g, '', s)
         return [a, reduce(b, (x) => [x, true])]
     }
}

function hasNumber(x) {
    return isString(x) && test(/\d/, x) || typeof x == 'number'
}

function len(x) {
    if (isNumber(x)) return x.toString().length
    return x.length || Object.keys(x).length || 0
}

function isTrue(x) {
    return x === true
}

function sortEach(storage, reverse) {
    storage.forEach((k, v) => {
        storage.store[k] = sorted(v, len, reverse)
    })
}

function stringCall(fn, ...args) {
    return fn + parens(args.join(', '))
}

function pipe(...a) {
    if (isArray(a[0])) a = a[0]
    if (isFunction(a)) {
        return a
    }
    return (...args) => a.filter(x => x).reduce((y, f) => isArray(y) ? f(...y) : f(y), args)
    return (x) => a.filter(x => x).reduce((y, f) => f(y), x)
}

function isClassObject(x) {
    const natives = ['String', 'Function', 'Number', 'Object', 'Array', 'Set', 'Promise']
    return x && !natives.includes(x.constructor.name)
}

function logged(...args) {
    console.log(stringify(args))
}

function forEach(items, fn, delayFn) {
    let index = 0
    let defaultDelay = 100
    let delay

    if (isNumber(delayFn)) {
        delay = delayFn
        delayFn = null
    }

    return new Promise(resolve => {
        function runner() {
            let isLast = index == items.length - 1
            let item = items[index]
            //if (delayFn) delay = delayFn(item, defaultDelay, index, isLast) || defaultDelay

            if (item.delayAfter) {
                delay = item.delayAfter    
            }

            let action = isLast ? resolve : runner
            let value = fn(item)
            index++

            if (isPromise(value)) {
                value.then(() => action())
            }

            else {
                setTimeout(action, delay)
            }
        }
        runner()
    })
}

function toggle(state, key, from, to, duration = 750) {
    if (arguments.length == 2) {
        if (isBoolean(state[key])) state[key] = !state[key]
        return 
    }

    if (arguments.length == 3) {
        if (isBoolean(state[key])) {
            from = state[key]
            to = !state[key]
            duration = arguments[2]
        }
        else {
            to = from
            from = state[key]
        }
    }

    state[key] = to
    setTimeout(() => {
        state[key] = from
    }, duration)
}

function isStandardHtml(s) {
    return htmlElements.includes(s)
}

const htmlElements = [
    'template',
    'transition',
    'transition-group',
    'style', 'script', 'body', 'ul', 'li', 'p', 'textarea', 'button', 'section', 'div', 'h1', 'h2', 'h3', 'main', 'blockquote', 'span', 'article', 'body', 'html',
    'button',
    'textarea',
    'slideshow',
    'td',
    'table',
    'tr',
    'td',
    'title',
    'input',
    'h1',
    'h2',
    'h3',
    'hr', 'br', 'link', 'img',
    'h4',
    'h5',
    'h6',
    'code',
    'pre',
    'img',
    'li',
    'ul',
    'p',
    'div',
    'h',
    'main',
    'section',
    'span',
    'a',
]

function isNode() {
    return typeof window === 'undefined' || window.isNodeWindow
}

function indexgetter(arr, index) {
    if (!index) return 0
    if (!isNumber(index)) index = arr.indexOf(index)
    return index
}

function insert(arr, item, index) {
    index = indexgetter(arr, index)
    arr.splice(index, 0, item)
    return arr
}

function getSpaces(s) {
    return search(/^ */, s) || ''
}

function dedent(s) {
    s = s.trimEnd().replace(/^\n+/, '')
    const spaces = getSpaces(s)
    return replace('^' + spaces, '', s)
}

function identity(...args) {
    return args.length == 1 ? args[0] : args
}

function trimmed(s) {
    if (s.trim().length == '') return s
    return s.trim()
}

function throwError(s) {
    throw new Error(s)
}

function inferlang(s) {
    const dict = {
        '<': 'html',
        'function': 'js',
        'def': 'py',
        '.': 'css',
    }

    let match = s.match(/^\.|<|function|def/)
    return dict[match] || 'js'
}

function aggregate(regex, s, fn = identity) {
    const storage = new Storage(Array)
    const matches = findall(regex, s)
    for (let [a, b] of matches) {
        console.log([a,b])
        const value = fn(b)
        storage.add(a, value)
    }
    return storage
}

function paired(list, mode = Array) {
    const store = mode == Object ? {} : []

    for (let i = 0; i < list.length - 1; i += 2) {
        if (mode == Object) store[list[i]] = list[i + 1]
        else {
            store.push([list[i], list[i + 1]])
        }
    }
    return store
}

function toDictionary(items) {
    if (!isNestedArray(items)) items = paired(items)
    return reduce(items, (k,v) => [k, v])
}

function isJson(x) {
    return x.endsWith('.json')
}

function typed(x) {
    return search(/object (\w+)/, Object.prototype.toString.call(x))
}

function splitmapfilter(s, regex, fn, ...args) {
    const runner = (x, i, arr) => fn(x, ...args, i)
    return s.trim().split(regex).filter(exists).map(runner).filter(exists)
}

function isClass(x) {
    if (!x) return false
    return isFunction(x) && test(/^class|^\[ *?native/i, x.toString())
}

function getFirstParameter(fn) {
    return search(/\((\w+)/, String(fn))
}

function itersearch(s, ...regexes) {
    for (let regex of regexes) {
        let flag = search(/\/(\w+)$/, regex.toString())
        let fn = flag && flag.includes('g') ? findall : search
        if (!s) return 
        s = fn(regex, s)
    }
    return s
}

function getParameters(s) {
    return itersearch(s, /\(([^]+?)\)/, /(?:\.\.\.)?(\w+)(?:,|$)/g) || []
}

function backspaced(s) {
    return s ? s.slice(0, -1) : ''
}

function isElement(s) {
    return s.constructor.name.startsWith('HTML')
}

function allEqual(arr) {
    return arr.every(x => x == arr[0])
}

function getFirst(x, mode) {
    if (isObject(x)) {
        return Object[mode](x)[0]
    }
    if (mode == String) {
        return search(/^\S+/, x)
    }
    if (isString(x)) {
        return search(/[\w-]+/, x)
    }

    if (isArray(x)) {
        return x[0]
    }
}

function hasComma(s) {
    return s.includes(',')
}

function toLiteralArray(s) {
    return s.slice(1, -1).split(',')
}

class Cache extends StandardObject {
    constructor() {
        super()
    }

    get(key, fallback) {
        if (!this.has(key)) {
            this.store[key] = isFunction(fallback) ? fallback() : fallback
        }
        return this.store[key]
    }

    set(key, value) {
        if (isObject(key)) {
            this.store = key
            // resetting the cache essentially
        }
        else {
            this.store[key] = value
            return value
        }
    }

}

class UniqueGenerator {
    constructor(items) {
        this.items = items
        this.index = 0
    }

    generate() {
        return this.items[this.index++]
    }

    reset() {
        this.items = shuffle(this.items)
        this.index = 0
    }
}

class UniqueStorage {
    constructor(condition) {
        this.condition = condition
        this.reset()
    }

    reset() {
        this.store = []
    }
    add(fn, ...args) {
        let value
        let count = 0
        if (this.store.length > 5) {
            this.reset()
        }
        while (++count < 50) {
            value = fn(...args)
            if (this.store.includes(value)) {
                continue
            }
            if (this.condition && !this.condition(value)) {
                console.log('failed condition', value)
                continue
            }
            this.store.push(value)
            return value
        }
        throw ""
    }
}

class Watcher {
    constructor(fn = identity) {
        this.fn = fn
        this.seen = []
    }
    isFresh(item) {
        let value = this.fn(item)
        if (this.seen.includes(value)) return false
        this.seen.push(value)
        return true
    }

}

class Indexed extends StandardObject {
    constructor(store = {}, modulus = false) {
        super(store)
        this.tracker = exists(store) ? reduce(store, (k, v) => [k, {index: 0, done: false}]) : {}
        this.done = {}
        this.key = this.keys[0]
        this.modulus = modulus
    }


    get(index) {
        return this.store[this.key][index]
    }

    get index() {
        return this.tracker[this.key].index
    }

    set index(val) {
        if (this.get(val)) {
            this.tracker[this.key].index = val
        }
        else {
            this.tracker[this.key].done = true
            const done = this.incrementKey(this.key)
            if (done) {
                this.finished = true
            }
        }
    }

    get value() {
        return this.store[this.key][this.index]
    }
    get length() {
        return this.store[this.key].length
    }

    incrementKey(key) {
        let count = 0
        while (count++ < this.keys.length) {
             key = modularIncrement(this.keys, key)
             if (this.tracker[key].done === false) {
                 this.key = key
                 return false
             }
        }
        return true
    }

    set(key) {
        this.key = key
    }

    isDone(key) {
        console.throw('in prog?')
        console.log([key, this.index], 'needs', this.length)
        const done = this.index == this.length
        if (done) {
            this.tracker[this.key].done = true
        }
        return done
    }
}



function toUpperCase(s) {
    return s.toUpperCase()
}

function hasEquals(s) {
    return test(/=/, s)
}

function hasVariableX(s) {
    return test(/x/, s)
}


function hasNaN(s) {
    return s.toString().includes('NaN')
}

function isNiceAnswer(n) {
    return n > 0 && isInteger(n) && n <= 10
}


function wordToNumber(s) {
    return numberWords.indexOf(s.toLowerCase())
}

function hasTerminatingDecimal(s) {
    return len(s) < 6 || isRepeatingDecimal(s)
}

function getprimefactors(n) {
    return getFactors(n).filter(isPrime)
}

function getdigits(x) {
    return String(x).split('').map(Number)
}

function numbersort(arr) {
    arr.sort((a,b) => (a - b))
    return arr
}



function notPrime(n) {
    return !isPrime(n)
}

function power10(n) {
    return Math.pow(10, n)
}

function getDecimalLength(n) {
    return search(/\.(.+)/, n).length || 0
}

function hasLetter(s) {
    return test(/[a-zA-Z]/, s)
}


function subtractALittle(n) {
    let offset = rng(0.25 * n, 0.75 * n)
    return [offset, n - offset]
}

function endsWithNumber(s) {
    return test(/\d+$/, s)
}

function depluralize(s) {
    if (!s.endsWith('s')) return s
    return s.plural(true)
}





















function getOperators(s) {
    return s.match(/[\+\-\*]/g)
}


function hasMathOperator(x) {
    return test(/[^*+-]/, x)
}

function isNegativeAnswer(s) {
    return String(s).trim().startsWith('-')
}

function isLatexOperator(s) {
    const r = /[\+\-\*]/
    return test(r, s)
}

function isLatexFraction(s) {
    return test('frac', s)
}

function isLatexExponent(s) {
    return /^\w+\^/.test(s)
}



function simplifyRatio(a,b) {
    let g = gcd(a,b)
    return [a,b].map(x => x/g)
}




function hasDecimal(x, n = 0) {
    return test('\\.' + '\\d'.repeat(n), String(x))
}

function isSquare(x) {
    return !hasDecimal(Math.sqrt(x))
}

function isCube(x) {
    return !hasDecimal(Math.cbrt(x))
}










function fractionToPercent(a, b) {
    return 100 * (a/b) + '%'
}


function hasWord(s) {
    return /[a-zA-Z]{3,}/.test(s)
}

function getWords(s, min = 2, max = 100) {
    const regex = RegExp(`[a-zA-Z]{${min},${max}}`, 'g')
    return s.match(regex)
}

function shared(a, b) {
    return a.filter(x => b.includes(x))
}



function copy(x) {
    return JSON.parse(JSON.stringify(x))
}


function getVariables(s) {
    return s.match(/[a-z]/g)
}


function hasVariable(s) {
    return test(/\b[abcde]\b/, s)
}

function isTerminating(a, b) {
    if (isPrime(b)) return false
    return true
}


function isInteger(n) {
   return Number.isInteger(Number(n))
}


function isPositive(n) {
    return n >= 0
}


function lcm(a, b) {
    return (a * b) / gcd(a, b);
}


function countDecimalPlaces(n) {
    return (n.toString().split('.')[1] || '').length
}

function divmod(n, d) {
    return [ Math.floor (n / d), Math.floor (n % d) ]
}


function toRatio(a, b) {
    return simplifyRatio(a,b).join(':')
}

function hasLookAround(s) {
    return test(/\(\?\</, s.toString())
}

function isPercentage(s) {
    return s.toString().endsWith('%')
}


function toInteger(x) {
    return Math.round(x)
}


function isCapitalized(s) {
    return /^[A-Z]/.test(s)
}


function zeroPad(x) {
    return String(x).length == 1 ? '0' + x : x
}

function changeDate(s, increment) {
   return s.replace(/-\d+/, (x) => '-' + zeroPad(Number(x.slice(1)) + increment))
}

function isYesterday(date) {
    return changeDate(datestamp(), -1) == date
}

function isToday(date) {
    return datestamp() == date
}


function isRepeatingDecimal(s) {
    s = s.toString()
    if (!s.includes('.')) return 
    const decimal = s.split('.')[1]
    return decimal[0] == decimal[1] == decimal[2] == decimal[5] == decimal[6]
}

function getFactors(number) {
    const factors = [];
    for (var i = 1; i <= number; i++) {
        if (number % i == 0) {
           factors.push(i)
        }
    }

    return factors
}

function gcd(a, b, ...args) {
    if (args.length > 0) {
        return [a, b, ...args].reduce((acc, item) => gcd(acc, item))
    }
    if (a == 0)
        return b;

    while (b != 0) {
        if (a > b)
            a = a - b;
        else {
            b = b - a;
        }
    }
    return a;
}

const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty'
]

function autoAction(state, key, callback, options) {
    if (!options) options = {duration: 100, steps: 5}

    const clock = new Clock(options)

    clock.onTick = (timeLeft) => {
        //console.log('||', 'timeLeft' , timeLeft, '||')
        if (state.hasOwnProperty(key)) {
            return true
        }

        if (timeLeft == 0) {
            //console.log('auto-initialization commenced')
            callback(state)

            if (!state.hasOwnProperty(key)) {
                state[key] = 200
            }

            return true
        }
        if (timeLeft < 1) {
            throw new Error("yeah...rrrrerror")
        }
    }

    clock.start()
}



function hasHtmlSuffix(el) {
    const items = ['style', 'pre', 'script', 'body', 'ul', 'li', 'p', 'textarea', 'button', 'section', 'div', 'h1', 'h2', 'h3', 'main', 'blockquote', 'span', 'article', 'body', 'html', 'head']
    return items.includes(el)
}



// ------------------------------------------ css

function aggregateCSS(s) {
    const regex = /^(.*?) {\n([^]+?)\n}/gm
    const storage = aggregate(regex, s, (x) => runner(trimmed(dedent(x))))

    function runner(s) {
        return splitmapfilter(s, /;?\s*$/m, split, / *: */)
    }

    function parse(a, b) {
        const payload = reduceCss(toDictionary(b), String)
        return cssBracket(toCssClassName(a), payload)
    }

    const p = storage.entries.reduce((acc, [a,b]) => acc += '\n' + parse(a,b), '')
    return p
        //const ignore = ['unset', 'initial', 'none']
        //b = b.filter((x) => !ignore.includes(x[1]))
    //return p.replace(/.*?(?:unset|initial|none).+\n?
}


function cssValueParser(a, b) { /* marked */
    let key = cssattrmap[a]

    if (!b) return [key, 0]
    b = b.replace(/\$[a-zA-Z]+/, (x) => 'var' + parens('--' + x.slice(1)))
    const initials = ['none', 'transparent', 'unset', 'initial', 'auto']

    if (b == 'u' || b == 'n') return [key, 'unset']
    if (b == 'random') return [key, randomColor()]
    if (initials.includes(b)) return [key, b]
    if (b.startsWith('calc')) return [key, cssCalc(b.slice(4))]

    switch (a) {
        case 'a':
            return [key, cssAnimation(b)]
        case 'mc':
            return cssColorMatch(b)
        case 'pcal':
            return cssPcal(b)
        case 'bs':
            return [key, cssBoxShadow(b)]
        case 'br':
            if (b.length < 2 || isNumber(b)) break
        case 'bl':
        case 'bt':
        case 'bb':
        case 'b':
        case 'border':
            return cssBorder(b, key)
        case 'z':
        case 'offset':
        case 'scale':
        case 'fw':
        case 'o':
            return [key, b]
        case 'grid':
            throw ""
        case 'pos':
            let translateX
            let translateY

            let [posX, posY] = b.length == 2 ? 
                b.split('').map((x) => Number(x) * 10) : 
                b.split(/(?=\w\w$)/).map(Number)

            return [
                ['position', 'absolute'],
                ['top', posX + '%'],
                ['left', posY + '%'],
            ]

    }

    if (test(/color|background/, key)) {
        return [key, cssColor(b)]
    }

    b = cssUnit(b, key)

    switch (a) {
        case 'tx':
        case 'ty':
        case 'r':
            return ['transform', key + parens(doublequote(b))]
        case 'wh':
            return [['width', b], ['height', b]]
        case 'px':
        case 'py':
        case 'mx':
        case 'my':
            let $key = cssattrmap[a[0]]
            let $dirs = a[1] == 'x' ? ['left', 'right'] : ['top', 'bottom']
            return $dirs.map(($dir) => [$key + '-' + $dir, b])
    }

    return [key, b]
}


function getCssItems(s) {
    const regex = aggregateRegexFromHashmap(cssattrmap)

    return s.trim().split(/,? +/).reduce((acc, x) => {
        if (x in cabmap) {
            acc.push(...cabmap[x])
        } else if (match = search(regex, x)) {
            let value = cssValueParser(...match)
            isNestedArray(value) ? acc.push(...value) : acc.push(value)
        }
        else {
            console.log('error', [x])
        }
        return acc
    }, [])
}

function cssParser(name, value) {
    if (!value) return
    if (isObject(value)) return cssBracket(toCssClassName(name), reduceCss(value))
    if (test(/^.*?{/, value)) return value
    return cssBracket(toCssClassName(name), reduceCss(getCssItems(value)))
}


function reduceCss(css, mode, delimiter = '\n') {
    if (mode == Object) {
        return reduce(css, (a, b) => [toCamelCase(a), b])
    }
    return prepareIterable(css, 'entries').reduce((acc, [a,b]) => {
        return acc += cssEntry(a,b, delimiter)
    }, '').trimEnd()
}

function cssEntry(a, b, delimiter = '\n') {
    return a + ': ' + b + ';' + delimiter
}

function addCssPeriod(s) {
    return test(/^\./, s) ? s : '.' + s
}

function toCssClassName(s) {
    if (test(/hot/, s)) {
        console.log('hiii')
    }
    if (test(/-/, s)) return addCssPeriod(s)
    if (test(ncg('^(?:$1)\\b', htmlElements), s)) return s
    if (test(/hot/, s)) {
        console.log('hiii2')
    }
    return addCssPeriod(s)
}


function cssBracket(key, value) {
    return '\n' + key + ' ' + '{' + newlineIndent(value.trimEnd()) + '}' + '\n'
}


function aggregateRegexFromHashmap(map, regexTemplate = '^($1)(\\S+)') {

    const storage = new Storage()
    const store = []

    for (let item of sorted(Object.keys(map))) {
        storage.add(item[0], item)
    }

    sortEach(storage, true)

    storage.forEach((k, v) => {
        v.length == 1 ? 
            store.push(v[0]) :
            store.push(k + ncg('(?:$1)', v.map((x) => x.slice(1))))
    })

    return ncg(regexTemplate, store)
}







function cssCalc(b) {
    const expr = b.replace(/\dp/g, (x) => x[0] + '%').replace(/\d(?=$|[ -])/g, (x) => x + 'px')
    return stringCall('calc', expr)
}


function cssAnimation(b) {
    let items = b.split(/(\d)/)
    let animation
    let duration = '1s'
    let easing = 'ease-in-out'
    let iterations = 1
    let delay = 0
    switch (items.length) {
        case 1:
            animation = items[0]

        case 2:
            animation = items[0]
            duration = items[1] + 's'

        case 3:
            animation = items[0]
            duration = items[1] + 's'
            iterations = 'infinite'
    }
    return joined(animation, duration, easing, delay, iterations, ' ')
}

function cssColorMatch(b) {
    let [color, fontNumber] = hasNumber(b) ? b.split(/(\d+)/).map(atSecond(Number)) : [b, 5]
    let bgNumber = 9 - fontNumber || 1

    if (color.length < 3) color = roygbiv.find((y) => color == y[0])

    let fontColor = tailwind[color + fontNumber]
    let bgColor = tailwind[color + bgNumber]
    return [
        ['color', fontColor],   
        ['background', bgColor],   
    ]

}



function cssPcal(s) {
    let options

    ;[s, options] = getOptions(s)
    let ref = ['bl', 'br', 'b', 'tl', 'tr', 't']
    let [A,B] = argsplit(s, ref)
    let k = 1
    let margin = 50
    let bottomMargin = margin
    let rightMargin = margin

    if (options.bottom) bottomMargin += Number(options.bottom)
    if (options.right) rightMargin += Number(options.right)

    margin += 'px'
    bottomMargin += 'px'
    rightMargin += 'px'

    switch (A) {
        case 'bl':
        case 'br':
            return [
                ['width', B + '%'],
                ['right', rightMargin],
                ['bottom', bottomMargin],
            ]
        case 'b':
        case 'tl':
        case 'b':
        case 'b':
            return 
    }

    throw ""

    if (options.half) {
        k = 0.5
        return [
            ['width', `calc(${k} * (100% - 2 * ${b})`],
        ]
    }
    else {
        return [
            ['width', `calc(100% - 2 * ${b})`],
            ['height', `calc(100% - 2 * ${b})`],
            ['margin', b]
        ]
    }
}

function cssBoxShadow(b) {
    return "0px 4px 10px rgba(0, 0, 0, 0.25)"
}

function cssBorder(s, key) {
    let match = search(/(-?[\d.]+(?:px)?)(\w+)/, s)
    if (!match) {
        if (isNumber(s)) {
            return [key + '-' + 'width', s + 'px']
        }
        else {
            return ['border-color', cssColor(s)]
        }
    }

    let [a,b] = match
    
    let dashed = ' solid '
    if (isNumber(a)) a += 'px'
    b = cssColor(b)
    return [key, a + dashed + b]
}

function cssColor(b) {
    if (b.length < 3) b = b.replace(/\w/, (x) => roygbiv.find((y) => x == y[0]))
    if (!test(/\d$/, b)) b += 5
    return tailwind[b]
}

function cssUnit(b, key = 'width') {
    if (b.endsWith('p')) {
        return b.replace(/p$/, '%')
    } else if (b != 0 && test(/\d$/, b)) {
        let unit = cssunitmap[search(/\w+/, key)] || 'px'
        return b + unit
    }
    return b
}






function cshpos(a, b, mode) {
    const ref = {
        'p': '%',
        'e': 'em',
        'x': 'px',
    }

    const unit = ref[mode] || 'px'

    return {
        top: a + unit,
        left: b + unit,
    }
}

function csho(a, n) {
    const ref = {
        o: 'opacity',
        d: 'delayAfter',
        d: 'delay',
        db: 'delayBefore',
        t: 'duration',
    }
    const key = ref[a]
    return {
        [key]: n
    }
}

function cshcolor(mode, color, shade, thickness) {

    const colorName = roygbiv.find((x) => color == x[0])
    const colorValue = tailwind[colorName + (shade || 5)]
    const ref = {
        t: 10,
        s: 3,
    }
    const stroke = ref[thickness] || 5

    if (mode == 'b') return {background: colorValue}
    if (mode == 'u') return {borderBottom: stroke + ' px solid ' + colorValue}
                     return {color: colorValue}
}

function cssShorthand(s) {
    const ref = [
        [/^([odt])(\d+\.?\d*)/, csho],        // opacity  and delay
        [/^(\d+)[,-](\d+)(pex)?/, cshpos], // position
        [/^([bu]?)([roygbiv])(\d*)([st])?/, cshcolor], // color
    ]

    const items = s.trim().split(/ +/)
    const store = {}
    //console.log(items)
    for (let item of items) {
        for (let [k, v] of ref) {
            if (test(k, item)) {
                Object.assign(store, v(...search(k, item)))
                break
            }
        }
    }
    return store
}


function cshkf(s) {
    const keyframes = s.trim().split(/\n\n+/).map((item, i) => {
        return item.split('\n').map(cssShorthand)
    })

    return keyframes
}

function cshclasses() {
    
    const classStyles = s.trim().split(/\n+/).map((item, i) => {
        let [a,b] = splitonce(item)
        return cssParser(a, b)
    })
    const s = joined(classStyles)
    logged(s)
    loadcss(s)

}

function kfcalcDuration(items) {
    return sum(items, (row) => {
        return sum(row, (x) => ~~x.delay + ~~x.delayBefore + ~~x.delayAfter + ~~x.duration)
    })
}



var kf = `
50-50 r1 o1 d1000  t500 
o0 0-0 d1000 t1000
50-100 b1 o1 d1000  t500 
`






var styles = `
    .animation-item abs fw600 fs64 span
    .animation-container rel wh100p bgy2
`

//shuntpoint





var kf = `
50-50 br3 o1 d1000  t500 
o0 0-0 d1000 t1000
50-100 bb3 o1 d1000  t500 
100-100 br3 o1 d1000  t500 
`






var styles = `
    .animation-item abs fw600 fs64 span
    .animation-container rel wh100p bgy2
`


function cshtimeline() {
    const p = cshkf(kf)
    consoleThrow(p)
    return p
}

function kfnormalizeTiming(style, duration, delay) {
    let newDuration = duration + delay
    let offsetPercentage = (1 - (duration / newDuration)).toFixed(2)

    let keyframes = [
        {...style, offset: offsetPercentage},
        {...style, offset: 1},
    ]


    let options = {
        duration: newDuration,
        fill: 'forwards',
    }

    return [keyframes, options]
}


//cshtimeline()
function toNerdamerFraction(a, b) {
    return `((${a})/(${b}))`
}

function toLatexFraction(a, b) {
    return `\\frac{${a}}{${b}}`
}
function toLatexFromVeryRaw(s) {
    const dictA = {
        '=': '=',
        'gte': '≥',
        'lte': '≤',
        'gt': '>',
        'lt': '<',
        'd': '÷',
        '+': '+',
        'p': '+',
        '-': '-',
        't': '\\cdot',
    }

    const dictB = {
        sqrt: '\\sqrt{$1}',
        e: '^{$1}',
    }

    const regex = ' ?[dtp\\-\\=] ?(?!ne)| *[lg]te? *|' + ncg('(?:$1)\\S+', dictB)
    const r2 = ncg('($1)(\\S+)', dictB)
    return replace(regex, parser, s, 'g')

    function parser(x) {
        x = x.trim()
        console.log(x)
        if (x in dictA) return ' ' + dictA[x] + ' '
        let match = search(r2, x)
        if (!match) {
            console.log(r2, x)
            console.log([x])
            throw "erroadfr"
        }
        let [a,b] = match
        return templater(dictB[a], b)
    }
}

function toMixedMath(s) {
    const items = s.trim().split(' ')
}
function toMath(s) {
    const dictA = {
        'p': '+',
        't': '\\cdot',
        'm': '-',
        '=': '=',
    }

    const regex = / *[mpt=] *|e(-?[abcxyz\d]+)|sqrt(\w+)|([abcdxyz\d]\/[abcdxyz\d]+)/g
    return replace(regex, parser, s, 'g')

    function parser(x, exp, sqrt, frac) {
        x = x.trim()

        if (x in dictA) {
            return ' ' + dictA[x] + ' '
        }

        if (exp) {
            return '^{' + exp + '}'
        }

        if (sqrt) {
            return '\\sqrt{' + exp + '}'
        }

        if (frac) {
            let [a,b] = splitonce(frac, '/')
            return '\\frac{' + a + '}' + '{' + b + '}'
        }

    }
}


function toNerdamerRunner(s) {
    const dictA = {
        'p': '+',
        't': '*',
        'm': '-',
        '=': '=',
    }

    const regex = / *[mpt=] *|e(-?[abcxyz\d]+)|sqrt(\w+)|([abcdxyz\d]\/[abcdxyz\d]+)/g
    return replace(regex, parser, s, 'g')

    function parser(x, exp, sqrt, frac) {
        x = x.trim()

        if (x in dictA) {
            return ' ' + dictA[x] + ' '
        }

        if (exp) {
            return '^(' + exp + ')'
        }

        if (sqrt) {
            return 'sqrt(' + exp + ')'
        }

        if (frac) {
            let [a,b] = splitonce(frac, '/')
            return '(' + a + '/' + b + ')'
        }

    }
}


function toMath2(s) {

    const items = split(s, ' ').map((item, i) => {
        
    })
    console.log(items)
    return 

    let output = ''
    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        let next = items[i + 1]
        if (next == '/') {
            output += toLatexFraction(item, items[i + 2])
            i += 2
            continue
        }
        else {
            output += ' ' + item
        }
    }

    return output.trim()
}


function toNerdamer(s) {
    const dictA = {
        'p': '+',
        't': '*',
        'm': '-',
    }

    const items = split(s, ' ').map(toNerdamerRunner)

    let output = ''
    for (let i = 0; i < items.length; i++) {
        let item = items[i]
        let next = items[i + 1]
        if (next == '/') {
            output += toNerdamerFraction(item, items[i + 2])
            i += 2
            continue
        }
        else {
            output += ' ' + item
        }
    }

    return output.trim()
}

//console.log(toLatexFromVeryRaw('2p5-3e2-2/3'))
//console.log(toMath('2p5-3e2-2/3'))
//console.log(toMath('2pa-be2-c/d=3/4p4/5'))

s = `
large-font
bolded
highlighted
`
s = `

math-thread
    math-work-container
    child-expression
        history-expression
        math-step
    active-expression
    primary-expression
    answer-input

floating-notes
    info-item
    data-item

`

class LineEdit {
    static html(s) {
        const editor = new LineEdit(htmlparser)
        const value = editor.run(s).getValue()
        return value
    }
    
    insertLineBelow(index, content) {
        this.getset(index, (line, spaces) => {
           const spacing = isEnterBlock(line) ? 4 : 0
           return indent(content, spacing) + '\n' + line 
        })
    }
    
    insertLineAbove(index, content) {
        this.getset(index, (line, spaces) => {
           return content + '\n' + line
        })
    }
    
    get(n) {
        return this.lines[n]
    }

    set(val, n = this.index) {
        this.lines[n] = val
    }

    delete(n) {
        this.lines[n] = null
    }


    get prev() {
        return this.lines[this.index - 1]
    }

    get next() {
        let count = this.index + 1
        let line = this.get(count)
        while (!exists(line)) {
            line = this.get(count++)
        }
        return line
    }

    get isLast() {
        return this.index == this.lines.length - 1
    }
    get last() {
        return this.lines[this.lines.length - 1]
    }
    
    getset(index, fn, ...args) {
        let line = this.get(index)
        let spaces = getSpaces(line)
        let payload = fn(line, spaces.length, ...args)
        this.set(payload)
    }

    find(regex, n = -1) {
        let a = this.index - 1
        let match
        let line
        let count = 0

        do {
            line = this.getLine(a)
            match = search(regex, line)
            a += n
        } while (!match || count++ < 100)
        return match
    }

    peek() {
        return this.lines[this.index + 1]
    }

    getValue() {
        return joined(filtered(this.store, notNone))
    }
    
    deleteRange(range) {
        let [from, to] = range
        for (let i = from; i < to; i++) {
            this.deleteLine(i)
        }
    }
    
    replaceRange(range, fn) {
        const block = this.getRange(...range)
        this.deleteRange(range)
        const replacement = fn(block)
        this.setLine(range[0], replacement)
        this.lastIndex = range[1]
    }
    
    getRange(from, to) {
        return this.lines.slice(from, (to || this.lines.length)).join('\n')
    }
    
    constructor(parser) {
        this.tracker = {}
        this.store = []
        this.tabWidth = 4
        this.index = 0
        this.parser = parser.bind(this)
    }

    run(s) {
        this.lines = s.trim().split('\n')

        for (let i = 0; i < this.lines.length; i++) {
            const [indentation, line] = getIndentAndLine(this.lines[i])
            this.spaces = indentation
            this.index = i 
            this.parser(line, indentation, i)
        }

        return this
    }

    insert(index, value) {
        let [spaces, line] = getSpacesAndLine(this.get(index))
        const payload = spaces + (isFunction(value) ? value(line) : value)
        insert(this.lines, payload, index)
    }

    set (value, spaces) {
        const payload = indent(value, spaces == null ? this.spaces : spaces)
        this.store.push(payload)
    }

}


function htmlparser(line, spaces, i) {

    const parserA = (line) => divify('div', line, '')
    const parserB = (line) => toOpeningTag('div', line)

    if (!line) {
        this.store.push('')
        return 
    }

    if (this.isLast) {
        const ref = Object.entries(this.tracker).find(([a,b]) => b != null)
        const payload = toClosingTag(ref[1])
        this.set(payload, ref[0])
        return 
    }

    const nextSpaces = fixSpaceLength(getIndent(this.peek()))

    if (nextSpaces == spaces) {
        this.set(parserA(line))
        return 
    }

    if (nextSpaces > spaces) {
        const value = parserB(line)
        this.set(value)
        this.tracker[spaces] = search(/[\w-]+/, value)
        return 
    }

    if (nextSpaces < spaces) {
        this.set(parserA(line))
        const memory = this.tracker[nextSpaces]
        this.tracker[nextSpaces] = null
        this.set(toClosingTag(memory), nextSpaces)
        return 
    }
}



function divifyn(arr, ...classNames) {
    let s = ''
    for (let i = 0; i < arr.length; i++) {
        let className = classNames[i]
        let value = arr[i]
        s += runner(className, value) + '\n'
    }

    return s.trim()

    function runner(name, value) {
        if (isClassObject(value)) {
            const grandchildren = Object.entries(value).map(([a,b]) => {
                const children = divifyn([a, String(b)], 'class-object-k-item', 'class-object-v-item')
                return divify('div', 'class-object-row', children)
            })

            return divify('div', name, grandchildren)
        }

        if (isObject(value)) {
            const grandchildren = Object.entries(value).map((x) => {
                const children = divifyn(x, 'object-k-item', 'object-v-item')
                return divify('div', 'object-row', children)
            })

            return divify('div', name, grandchildren)
        }

        if (isArray(value)) {
            return divify('div', name, value.map((x) => divify('li', 'list-item', x)))
        }

        if (test(/<\w/, value)) {
            return dedentPre(divify('pre', name + ' as-html', dedent(encodeHtml(value))))
        }

        if (test(/\n/, value)) {
            return dedentPre(divify('pre', name + ' as-pre', dedent(value)))
        }

        return divify('div', name, value)
    }
}


function modalitemcparser(args) {
    let classNames

    if (args.length == 1) classNames = ['modal-singleton']
    if (args.length == 2) classNames = ['modal-label', 'modal-value']
    if (args.length == 3) classNames = ['modal-key', 'modal-label', 'modal-value']

    try {
        const value = divifyn(args, ...classNames)
        return value
    }
    catch(e) {
        console.log(e)
        return 
    }

    //return {
        //type: 'html',
        //value: value,
    //}
}

//console.log(modalitemcparser(['foo', 'boo']))
//console.log(toMixedMath('hi i like shoes. 2p3=5. mmm tastse good'))
//console.log(toMath('a = 234 b=234, c=123%'))
//console.log(isClassObject(new LineEdit(identity)))
//console.log(ecInitialize(4))
//console.log(dedentPre(divify('pre', 'adf', 'foo\nbye')))
//console.log(modalitemcparser(['foo']))





function mathsolver(s) {
    //s = '3/4 / (3/5 / 4/8)'
    //s = '1/2 / 1/2 - 1/1 / 5/4*4/5'
    //runner(s)
    s = toNerdamer(s)
    //console.log(s)
    const answer = nerdamer(s).evaluate().toString()
    return answer
    //console.log(toMath2(s))
}





function createComponent(...args) {

    const options = {
        props: [],
        template: `
            <div>
                <div class="message">{{message}}</div>
            </div>
        `,
        data() {
            return {
                message: 'hiya'
            }
        },
    }

    function parse(arg) {
        const name = getFunctionName(arg)
        const keys = ['created', 'mounted', 'render']
        for (let key of keys) {
            if (test('^' + key, name)) {
                options[key] = arg
                break
            }
        }

    }

    args.forEach(parse)
    return options
}

function mounted1() {
    console.log('adfasdfadsfad')
    this.socket = new SocketService(this)
    setTimeout(() => this.$send({message: 'asdfasdf'}) , 2000)
    setTimeout(() => this.$send({message: 'asdfasdasdaasdf'}) , 3000)
    setTimeout(() => this.$send({message: 'asdfasdasdf'}) , 4000)
}

function $send(value) {
    this.socket.emit('data', value)
    // anywhere you want to use this.socket, you will have to define the service to point at it.
}


class SocketService {
    constructor(vue) {
        this.socket = io()

        assignAliases(this, this.socket, 'emit')

        this.socket.on('data', (data) => {
            Object.assign(vue, data)
        })
    }
}

function assignAliases(state, ref, ...keys) {
    for (let key of keys) {
        state[key] = ref[key].bind(ref)
    }
}

function setup() {
    vuetify($send)
    const main = createComponent(mounted1)
    console.log(main)
    return main
}

