const chai = require('chai');
const assert = chai.assert;
const strings = require('../lib/strings');
const utils = require('../lib/utils');
const ContainerModule = require('../lib/ioc');

describe('Utils tests', () => {
    let string = 'String';
    let number = 1;
    let func = () => 0;
    let array = [];
    let undef = undefined;

    it('isString()', () => {
        assert.isTrue(utils.isString(string));
        assert.isFalse(utils.isString(number));
        assert.isFalse(utils.isString(func));
        assert.isFalse(utils.isString(array));
        assert.isFalse(utils.isString(undef));
    });

    it('isFunction()', () => {
        assert.isTrue(utils.isFunction(func));
        assert.isFalse(utils.isFunction(string));
        assert.isFalse(utils.isFunction(number));
        assert.isFalse(utils.isFunction(array));
        assert.isFalse(utils.isFunction(undef));
    });

    it('isArray()', () => {
        assert.isTrue(utils.isArray(array));
        assert.isFalse(utils.isArray(string));
        assert.isFalse(utils.isArray(number));
        assert.isFalse(utils.isArray(func));
        assert.isFalse(utils.isArray(undef));
    });

    it('isDefined', () => {
        assert.isTrue(utils.isDefined(array));
        assert.isTrue(utils.isDefined(string));
        assert.isTrue(utils.isDefined(number));
        assert.isTrue(utils.isDefined(func));
        assert.isFalse(utils.isDefined(undef));
    });

    it('format()', () => {
        assert.equal(utils.format('Text {0}', []), 'Text undefined');
        assert.equal(utils.format('Text {0}', ['text']), 'Text text');
        assert.equal(utils.format('Text {0} {1} smth {0}', ['text', 'foo']), 'Text text foo smth text');
    });

    it('extend()', () => {
        let obj1 = {
            testProp1: 1
        };
        let obj2 = {
            testProp2: {
                subProp: 'string'
            }
        };
        let obj3 = {
            testProp1: true
        };
        
        let result = utils.extend(obj1, obj2, obj3);
        
        assert.deepEqual(result, obj1);
        assert.typeOf(obj1.testProp1, 'boolean');
    });
});

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
            .to.throw(strings.ERROR_MODULE_ALREADY_DEFINED);
        chai.expect(() => new ContainerModule()
            .resolve('Name'))
            .to.throw(utils.format(strings.ERROR_MODULE_NOT_FOUND, ['Name']));
        chai.expect(() => new ContainerModule()
            .register('Name', () => 0)
            .resolve('Name'))
            .to.throw(strings.ERROR_MODULE_NOT_INITIALIZED);

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
            .to.throw(strings.ERROR_MODULE_INITIALIZE);
    });
});
