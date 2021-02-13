// 数据响应式
// 1.替换数组原型中的7个方法
const orginalProto = Array.prototype
// 2.备份一份，修改备份
const arrayProto = Object.create(orginalProto)
new Array(['push', 'pop', 'shift', 'unshift', 'slice', 'splice', 'reverse']).forEach(method => {
    arrayProto[method] = function () {
        // 原始操作
        orginalProto[method].apply(this, arguments)
        // 覆盖操作:通知更新

    }
})

// 劫持obj属性key的get和set,响应试的具体实现
function defineReactive(obj, key, val) {
    observe(val);

    const dep = new Dep();

    Object.defineProperty(obj, key, {
        get() {
            console.log('get ' + key);
            Dep.target && dep.addDep(Dep.target)
            return val;
        },
        set(newVal) {
            if (newVal !== val) {
                console.log('set ' + key + ' :' + newVal);
                // 如果传入newVal依然是obj,需要做响应式
                observe(newVal);
                val = newVal;

                // watchers.forEach(w => w.update())
                dep.notify()
            }
        }
    })
}

// 将数据变成响应式数据
function observe(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return
    }

    if (Array.isArray(obj)) {
        //  覆盖原型
        obj.__proto__ = arrayProto
    }

    new Observe(obj)
}


function proxy(vm, sourceKey) {
    Object.keys(vm[sourceKey]).forEach(key => {
        Object.defineProperty(vm, key, {
            get() {
                return vm[sourceKey][key]
            },
            set(newVal) {
                vm[sourceKey][key] = newVal;
            }
        })
    })
}

class Kvue {
    constructor(options) {
        // 保存选项
        this.$options = options;
        this.$data = options.data;

        // 响应化处理
        observe(this.$data)

        // 代理
        proxy(this, '$data')

        // 创建编译器
        new Compile(options.el, this)
    }


}


// 根据对应类型决定如何做相应话
class Observe {

    constructor(value) {


        if (typeof value === 'object') {
            this.walk(value)
        }
    }

    // 对象数据相应化
    walk(obj) {
        Object.keys(obj).forEach(key => {
            defineReactive(obj, key, obj[key])
        })
    }

    // 数组数据响应化

}

// 观察者
// const watchers = []
class Watcher {
    constructor(vm, key, undateFn) {
        this.vm = vm;
        this.key = key;
        this.undateFn = undateFn;

        // watchers.push(this)

        Dep.target = this;
        this.vm[this.key] // 读取触发getter 
        Dep.target = null
    }

    update() {
        this.undateFn.call(this.vm, this.vm[this.key])
    }
}

// Dep:依赖,管理某个key相关的watcher 所有实例
class Dep {
    constructor() {
        this.deps = []
    }

    addDep(dep) {
        this.deps.push(dep);
    }

    notify() {
        this.deps.forEach(dep => dep.update());
    }
}