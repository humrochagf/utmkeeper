# utmkeeper

It is a library built to persist the utm tracking codes throughout navigation across your landing pages.

It works by extracting them from the navigation url and applying it to all page links and forms.

## Usage

At the end of the html `<body>` add a reference to the script and then call the load function to let the magic begin:

```html
<script src="path/to/utmkeeper.js" charset="utf-8"></script>
<script charset="utf-8">
  utmkeeper.load();
</script>
```

The `load` function starts **utmkeeper** and makes all the magic and it can receive a configuration parameter:

```javascript
{
  forceOriginUTM: true,
  fillForms: true,
  utmObject: {},
  extraParameters: [],
  postLoad: null,
}
```

- **forceOriginUTM**: if `true` the url utms of the page will override any utm present at the links and forms
- **fillForms**: if `true` all forms will be added the utms, if it does not have the inputs for that hidden ones will be created
- **utmObject**: an `object` where the utms will be stored, you can use it to send initial utm values to the **utmkeeper**, if it collides with a url UTM it will be overridden 
- **extraParameters**: an `array` where extra parameters to be persisted across requests, not only "utm_*"
- **postLoad**: receives a function with one parameter, that function will be runned at the end of load passing an `object` with the parsed utms of the url to run any custom logic

One example of calling `load` with the post load function will be like this:

```javascript
utmkeeper.load({
  forceOriginUTM: true,
  fillForms: true,
  utmObject: {
    utm_test: 'test',
    parameterA: 'extra-test',
  },
  extraParameters: ['parameterA', 'parameterB'],
  postLoad: function(utms){console.log(utms);}
});
```
