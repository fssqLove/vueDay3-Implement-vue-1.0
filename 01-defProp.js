// 响应式
// const obj = {};

function defineReactive(obj, key, val) {
    observe(val);

    Object.defineProperty(obj, key, {
        get() {
            console.log('get ' + key);
            return val;
        },
        set(newVal) {
            if (newVal !== val) {
                console.log('set ' + key + ' :' + newVal);
                // 如果传入newVal依然是obj,需要做响应式
                observe(newVal);
                val = newVal;
            }
        }
    })
}

// defineReactive(obj, 'foo', 'foo');
// obj.foo
// obj.foo = 'foooooooooooo'


function observe(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return
    }


    Object.keys(obj).forEach(key => {
        defineReactive(obj, key, obj[key])
    })
}

function set(obj, key, value) {
    defineReactive(obj, key, value);
}

const obj = { foo: "foo", bar: "bar", baz: { a: 1 } }

observe(obj);

obj.foo
obj.foo = 'fooooooooooooooooo';

obj.bar
obj.bar = 'barrrrrrrrrrrrrrrrr';

// obj.baz.a
// obj.baz.a = 10;

obj.baz = { a: 10 };
obj.baz.a = 10000;


// obj.dong = 'dong'
// obj.dong

set(obj, "dong", 'dong')

obj.dong = 1111

// 改变数组的方法只有7个
// 替换数组示例的原型方法，在改变时提交响应
