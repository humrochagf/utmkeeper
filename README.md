# utmkeeper

It is a library built to persist the utm tracking codes throughout navigation across your landing pages.

It works by extracting them from the navigation url and applying it to all page links and forms.

## Usage

At the end of the html `<body>` add a reference to the script and then call the load function to let the magic begin:

```
<script src="path/to/utmkeeper.js" charset="utf-8"></script>
<script charset="utf-8">
  utmkeeper.load();
</script>
```
