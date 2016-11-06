# IoC-js

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

## Methods

```register(name, [dependencies,] constructor);```

```init();```

```resolve(name);```
