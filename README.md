# IoC-js

## Methods

```
/* Register module */
register(name, [dependencies,] constructor);

/* Initialize all registered modules */
init();

/* Get initialized module by name */
resolve(name);
```

## Example

```
var ContainerModule = require('ioc-js');
var builder = new ContainerModule();

builder
    .register('FirstModule', function() {
        return 'This is first module';
    })
    .register('SecondModule', ['FirstModule'], function(FirstModule) {
        return {
            test: function() {
                return FirstModule;
            }
        };
    });

builder.init();

var secondModule = builder.resolve('SecondModule');

console.log(secondModule.test()); // This is first module
```
