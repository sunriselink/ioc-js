const chai = require('chai');
const assert = chai.assert;
const strings = require('../lib/strings');
const utils = require('../lib/utils');
const ContainerModule = require('../lib/ioc');

describe('Without dependencies', () => {
    it('should be returned "Hello, World"', () => {
        let builder = new ContainerModule();

        builder
            .register('HelloWorldManager', () => 'Hello, World!')
            .init();

        assert.equal(builder.resolve('HelloWorldManager'), 'Hello, World!');
    });

    it('should be returned 2 managers', () => {
        let builder = new ContainerModule();

        builder
            .register('FirstManager', () => {
                return {get: () => 'I am first manager'};
            })
            .register('SecondManager', () => {
                return {get: () => 'I am second manager'}
            })
            .init();

        let firstManager = builder.resolve('FirstManager');
        let secondManager = builder.resolve('SecondManager');

        assert.equal(firstManager.get(), 'I am first manager');
        assert.equal(secondManager.get(), 'I am second manager');
    });
});

describe('With dependencies', () => {
    it('should be returned result from 2 managers', () => {
        let builder = new ContainerModule();

        builder
            .register('FirstModule', () => 'First Module')
            .register('SecondModule', ['FirstModule'], (FirstModule) => 'Second Module with ' + FirstModule)
            .init();

        assert.equal(builder.resolve('SecondModule'), 'Second Module with First Module');
    });

    it('should be returned correct object from manager with several dependencies', () => {
        let builder = new ContainerModule();

        builder
            .register('Application', ['Core', 'UI', 'Config'], (Core, UI, Config) => {
                return {
                    run: () => {
                        let core = new Core();
                        let size = UI.getSize();
                        let author = Config.author;

                        // I know, that drivel
                        return core.testAlert() + ' ' + size + ' ' + author;
                    }
                }
            })
            .register('Core', () => {
                return function () {
                    this.testAlert = () => 'This is test';
                }
            })
            .register('UI', ['Config'], (Config) => {
                return {getSize: () => Config.width + 'x' + Config.height}
            })
            .register('Config', () => {
                return {
                    width: 800,
                    height: 600,
                    author: 'sunriselink'
                }
            })
            .init();

        let app = builder.resolve('Application');

        assert.equal(app.run(), 'This is test 800x600 sunriselink');
    });

    it('should work with dependencies in function property', function () {
        let builder = new ContainerModule();

        let FirstModule = () => 'One';
        let SecondModule = () => 'Two';
        let ThirdModule = (one, two) => one + ' ' + two + ' Three!';
        
        ThirdModule.dependencies = ['SecondModule'];
        
        builder
            .register('FirstModule', FirstModule)
            .register('SecondModule', SecondModule)
            .register('ThirdModule', ['FirstModule'], ThirdModule)
            .init();
        
        assert.equal(builder.resolve('ThirdModule'), 'One Two Three!');
    });
});

describe('Errors', () => {
    it('all errors', () => {
        // Parameters
        chai.expect(() => new ContainerModule()
            .register())
            .to.throw(strings.ERROR_MODULE_NAME_INCORRECT);
        chai.expect(() => new ContainerModule()
            .register('Name'))
            .to.throw(strings.ERROR_PARAMETERS_INCORRECT);
        chai.expect(() => new ContainerModule()
            .register('Name', []))
            .to.throw(strings.ERROR_PARAMETERS_INCORRECT);

        // Resolve module
        chai.expect(() => new ContainerModule()
            .register('Name', () => 0)
            .register('Name', () => 0))
            .to.throw(utils.format(strings.ERROR_MODULE_ALREADY_DEFINED, ['Name']));
        chai.expect(() => new ContainerModule()
            .resolve('Name'))
            .to.throw(utils.format(strings.ERROR_MODULE_NOT_FOUND, ['Name']));
        chai.expect(() => new ContainerModule()
            .register('Name', () => 0)
            .resolve('Name'))
            .to.throw(utils.format(strings.ERROR_MODULE_NOT_INITIALIZED, ['Name']));

        // Init
        chai.expect(() => new ContainerModule()
            .register('Factory1', ['Factory2'], () => 0)
            .register('Factory2', ['Factory1'], () => 0)
            .init())
            .to.throw(utils.format(strings.ERROR_CIRCULAR_DEPENDENCY, ['Factory1']));
        chai.expect(() => new ContainerModule()
            .register('Factory1', ['Factory2'], () => 0)
            .init())
            .to.throw(utils.format(strings.ERROR_MODULE_NOT_FOUND, ['Factory2']));
        chai.expect(() => new ContainerModule()
            .register('Name', () => undefined)
            .init())
            .to.throw(utils.format(strings.ERROR_MODULE_INITIALIZE, ['Name']));
    });
});
