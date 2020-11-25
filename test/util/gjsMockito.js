/**
 * Dummy implementation of mocks for gjsunit framework: https://github.com/philipphoffmann/gjsunit
 * NOTE: This is a dummy implementation just to satisfy my current testing needs, nothing generic nor serious.
 */

"use strict";

/**
 * @param {string} className the class name
 * @param {string[]} methodNames the list of method names as String
 */
/* exported mock */
var mock = (className, methodNames) => {
    return new Mock(className, methodNames);
};

/**
 *
 * @param {Mock} mock the mock object
 * @param {string} methodName the method name to mock
 */
/* exported when */
var when = (mock, methodName) => {
    return new When(mock, methodName);
};

/* exported verify */
var verify = (mock, methodName) => {
    return new Verify(mock, methodName);
};

class Mock {
    constructor(className, methodNames = []) {
        this.name = className;
        this.methods = methodNames;
        this.calls = {};
        this.asString = "Mock";

        this.methods.forEach((methodName) => {
            this.calls[methodName] = {
                count: 0,
                params: [],
            };
            this[methodName] = (...params) => {
                this.calls[methodName].params = params;
                this.calls[methodName].count += 1;
            };
        });
    }

    reset() {
        this.methods.forEach((methodName) => {
            this.calls[methodName].count = 0;
            this.calls[methodName].params = [];
        });
    }
}

class When {
    constructor(mock, methodName) {
        this._mock = mock;
        this._methodName = methodName;
    }

    thenReturn(returnValue) {
        this._mock[this._methodName] = (...params) => {
            this._mock.calls[this._methodName].params = params;
            this._mock.calls[this._methodName].count += 1;
            return returnValue;
        };
    }
}

class Verify {
    constructor(mock, methodName, never = false) {
        this._mock = mock;
        this._methodName = methodName;
        this.never = never;
        if (!never) {
            this.not = new Verify(mock, methodName, true);
        }
    }

    toHaveBeenCalled() {
        const count = this._mock.calls[this._methodName].count;
        if (this.never) {
            expect(count).toBe(0);
        } else {
            expect(count).toBeGreaterThan(0);
        }
    }

    toHaveBeenCalledTimes(number) {
        const count = this._mock.calls[this._methodName].count;
        if (this.never) {
            expect(count).not.toBe(number);
        } else {
            expect(count).toBe(number);
        }
    }

    toHaveBeenCalledWith(...params) {
        expect(this._mock.calls[this._methodName].params.length).toBe(
            params.length
        );
        for (var i = 0; i < params.length; i++) {
            const param = this._mock.calls[this._methodName].params[i];
            if (this.never) {
                expect(param).not.toBe(params[i]);
            } else {
                expect(param).toBe(params[i]);
            }
        }
    }
}
