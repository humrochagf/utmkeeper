var utmkeeper = {};

(function(context) {
  var config = {
    // override page utms with the url utms
    forceOriginUTM: true,
    // fill page forms with the url utms
    fillForms: true,
    // starting utm object to start the parsing with a custom set of utms
    utmObject: {},
    // extra parameters to be persisted across requests, not only "utm_*"
    extraParameters: [],
    // post load function that receives a object as parameter
    // to run custom logic after utm processing. Example:
    // function(utms) {
    //   console.log(utms);
    // }
    postLoad: null,
  };

  context.extractUrlParams = function(url='', prefix='') {
    // get query string from url (optional) or window
    var queryString = '';

    if (url) {
      var urlSplit = url.split('?');

      if (urlSplit.length > 1) {
        queryString = url.split('?')[1];
      } else {
        queryString = url.split('?')[0];
      }
    } else {
      queryString = window.location.search.slice(1);
    }

    // take `extraParameters` from config
    var extraParameters = config.extraParameters;

    // we'll store the parameters here
    var obj = {};

    // if query string exists
    if (queryString) {
      // stuff after # is not part of query string, so get rid of it
      queryString = queryString.split('#')[0];

      // split our query string into its component parts
      var arr = queryString.split('&');

      for (var i=0; i<arr.length; i++) {
        // separate the keys and the values
        var a = arr[i].split('=');

        // in case params look like: list[]=thing1&list[]=thing2
        var paramNum = undefined;
        var paramName = a[0].replace(/\[\d*\]/, function(v) {
          paramNum = v.slice(1,-1);
          return '';
        });

        // set parameter value (use 'true' if empty)
        var paramValue = typeof a[1] ==='undefined' ? true : a[1];

        // (optional) keep case consistent
        if (typeof paramName === 'string') {
          paramName = paramName.toLowerCase();
        }

        if (typeof paramValue === 'string') {
          paramValue = unescape(paramValue).toLowerCase();
        }

        // extract only if matches the filter and has value
        if (
          paramValue &&
          // start with `prefix` or one of `extraParameters`
          (paramName.startsWith(prefix) || extraParameters.includes(paramName))
        ) {
          // if parameter name already exists
          if (obj[paramName]) {
            // convert value to array (if still string)
            if (typeof obj[paramName] === 'string') {
              obj[paramName] = [obj[paramName]];
            }
            // if no array index number specified...
            if (typeof paramNum === 'undefined') {
              // put the value on the end of the array
              obj[paramName].push(paramValue);
            }
            // if array index number specified...
            else {
              // put the value at that index number
              obj[paramName][paramNum] = paramValue;
            }
          }
          else {
            // if param name doesn't exist yet, set it
            obj[paramName] = paramValue;
          }
        }
      }
    }

    return obj;
  }

  context.toUrlSearch = function(obj) {
    var searchUrl = '';

    for (var key in obj) {
      if (searchUrl != '') {
        searchUrl += '&';
      }

      // if its string set the parameter
      if (typeof obj[key] === 'string') {
        searchUrl += key + '=' + encodeURIComponent(obj[key]);
      }
      // if not string serialize as url array
      else {
        for (var i=0; i<obj[key].length; i++) {
          if (i > 0) {
            searchUrl += '&';
          }

          searchUrl += key + '[' + i.toString() + ']=' + encodeURIComponent(obj[key][i]);
        }
      }
    }

    return searchUrl;
  }

  context.load = function(customConfig) {
    // set custom config
    if (typeof customConfig === 'object') {
      config = Object.assign(config, customConfig);
    }

    // stores current location search
    var originSearchObj = Object.assign(
      config.utmObject,
      context.extractUrlParams(null, 'utm_')
    );

    // for each link at the page
    for (var link of document.querySelectorAll('a')) {
      var base = '';
      var search = '';
      var hash = '';
      var href = '';
      // extract its search parameters to an object
      var linkSearchObj = context.extractUrlParams(link.getAttribute('href'));

      // extract it hash block
      var hrefSplit = link.getAttribute('href').split('#');

      if (hrefSplit.length > 1) {
        hash = hrefSplit[1];
      }

      // extract search block
      hrefSplit = hrefSplit[0].split('?');

      if (hrefSplit.length > 1) {
        search = hrefSplit[1];
      }

      // extract the base url to the href
      base = hrefSplit[0];

      // skip link update on same page hash navigation
      if (base) {
        href = base;

        // merge the two search contents
        // if forceOriginUTM is true, any utm at the links will be overrided
        var mergedSearchObj = null;
        if (config.forceOriginUTM) {
          mergedSearchObj = Object.assign(linkSearchObj, originSearchObj);
        } else {
          mergedSearchObj = Object.assign(originSearchObj, linkSearchObj);
        }
        // transform it back in to a GET url
        search = context.toUrlSearch(mergedSearchObj);

        // append the search url to the base url
        if (search) {
          href += '?' + search;
        }

        // append the hash at the end
        if (hash) {
          href += '#' + hash;
        }

        link.setAttribute('href', href);
      }
    }

    // add the utm values to the forms
    if (config.fillForms) {
      for (var form of document.querySelectorAll('form')) {
        for (var key in originSearchObj) {
          var input = form.querySelector('input[name="' + key + '"]');

          if (input) {
            // override existing input value
            if (config.forceOriginUTM || !input.value) {
              input.value = originSearchObj[key];
            }
          } else {
            // create a new input
            input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = originSearchObj[key];
            form.appendChild(input);
          }
        }
      }
    }

    if (typeof config.postLoad === 'function') {
      config.postLoad(originSearchObj);
    }
  }
})(utmkeeper);
